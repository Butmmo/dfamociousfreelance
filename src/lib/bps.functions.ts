// The Blazer Productivity Scheme — server-side pieces only. Daily 1/0
// checks stay plain client-side RLS calls (own row only, same pattern as
// profile.tsx and dfy.tsx) — nothing here duplicates that. What genuinely
// needs a server function: the Three Goals System's scoring
// (bps_monthly_goals grants SELECT only to authenticated — the fixed,
// non-improvised remark language is a real doctrinal requirement, must be
// computed here, never typed by the client) and the daily tracker's
// activities themselves, which are auto-derived from the Belief Goal's
// action items rather than typed in by hand.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  affirmationRemark, evaluationRemark, computeEffortScore, deriveActivityLabels,
  MLM_DEFAULT_GOAL,
} from "@/lib/bps";

const goalItemSchema = z.object({ text: z.string().trim().min(1).max(300), done: z.boolean().default(false) });
const customPillarSchema = z.object({
  key: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(120),
  goal: z.string().trim().max(500).default(""),
  items: z.array(goalItemSchema).default([]),
});

const beliefSchema = z.object({
  target_month: z.string(), // YYYY-MM-01
  finance_goal: z.string().trim().max(500).default(""),
  finance_items: z.array(goalItemSchema).default([]),
  finance_leads_target: z.number().int().min(0).optional().nullable(),
  finance_messages_target: z.number().int().min(0).optional().nullable(),
  finance_new_clients_target: z.number().int().min(0).optional().nullable(),
  finance_returning_clients_target: z.number().int().min(0).optional().nullable(),
  finance_avg_price_usd: z.number().min(0).optional().nullable(),
  self_dev_goal: z.string().trim().min(1).max(500),
  self_dev_items: z.array(goalItemSchema).min(1),
  mlm_goal: z.string().trim().max(500).default(MLM_DEFAULT_GOAL),
  mlm_items: z.array(goalItemSchema).default([]),
  relationship_goal: z.string().trim().min(1).max(500),
  relationship_items: z.array(goalItemSchema).min(1),
  custom_pillars: z.array(customPillarSchema).default([]),
});

/** Replaces this goal's tracked activities with one per non-empty action item — never a manually-typed activity. */
async function deriveActivitiesForGoal(supabaseAdmin: any, userId: string, goalId: string, labels: string[]) {
  await supabaseAdmin.from("bps_activities").delete().eq("goal_id", goalId);
  if (labels.length === 0) return;
  const rows = labels.map((label, i) => ({ user_id: userId, goal_id: goalId, label, sort_order: i, active: true }));
  const { error } = await supabaseAdmin.from("bps_activities").insert(rows);
  if (error) throw error;
}

export const submitBeliefGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => beliefSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("bps_monthly_goals")
      .upsert(
        {
          user_id: context.userId,
          target_month: data.target_month,
          finance_goal: data.finance_goal,
          finance_items: data.finance_items,
          finance_leads_target: data.finance_leads_target ?? null,
          finance_messages_target: data.finance_messages_target ?? null,
          finance_new_clients_target: data.finance_new_clients_target ?? null,
          finance_returning_clients_target: data.finance_returning_clients_target ?? null,
          finance_avg_price_usd: data.finance_avg_price_usd ?? null,
          self_dev_goal: data.self_dev_goal,
          self_dev_items: data.self_dev_items,
          mlm_goal: data.mlm_goal || MLM_DEFAULT_GOAL,
          mlm_items: data.mlm_items,
          relationship_goal: data.relationship_goal,
          relationship_items: data.relationship_items,
          custom_pillars: data.custom_pillars,
          belief_submitted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,target_month" },
      )
      .select("id")
      .single();
    if (error) throw error;

    const labels = deriveActivityLabels({
      finance_items: data.finance_items, self_dev_items: data.self_dev_items,
      mlm_items: data.mlm_items, relationship_items: data.relationship_items,
      custom_pillars: data.custom_pillars,
    });
    await deriveActivitiesForGoal(supabaseAdmin, context.userId, row.id, labels);

    return { ok: true, id: row.id, activityCount: labels.length };
  });

async function computeEffortForWindow(supabaseAdmin: any, goalId: string, from: Date, windowDays: number) {
  const to = new Date(from);
  to.setDate(to.getDate() + windowDays);
  const { data: activities } = await supabaseAdmin
    .from("bps_activities").select("id").eq("goal_id", goalId).eq("active", true);
  const activityIds = (activities ?? []).map((a: any) => a.id);
  if (activityIds.length === 0) return computeEffortScore([], 0, windowDays);
  const { data: checks } = await supabaseAdmin
    .from("bps_daily_checks")
    .select("done,check_date")
    .in("activity_id", activityIds)
    .gte("check_date", from.toISOString().slice(0, 10))
    .lt("check_date", to.toISOString().slice(0, 10));
  return computeEffortScore((checks ?? []) as { done: boolean }[], activityIds.length, windowDays);
}

const cycleIdSchema = z.object({ goal_id: z.string().uuid() });

export const submitAffirmationGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cycleIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: goal } = await supabaseAdmin
      .from("bps_monthly_goals").select("user_id,belief_submitted_at,affirmation_submitted_at")
      .eq("id", data.goal_id).maybeSingle();
    if (!goal) throw new Error("Not found.");
    if (goal.user_id !== context.userId) throw new Error("Forbidden.");
    if (!goal.belief_submitted_at) throw new Error("Submit your Belief Goal first.");
    if (goal.affirmation_submitted_at) throw new Error("Affirmation Goal already submitted for this cycle.");

    const { score, total, percent } = await computeEffortForWindow(
      supabaseAdmin, data.goal_id, new Date(goal.belief_submitted_at), 14,
    );
    const remark = affirmationRemark(percent);
    const { error } = await supabaseAdmin.from("bps_monthly_goals").update({
      affirmation_submitted_at: new Date().toISOString(),
      affirmation_score: score, affirmation_total: total, affirmation_percent: percent, affirmation_remark: remark,
    }).eq("id", data.goal_id);
    if (error) throw error;
    return { ok: true, score, total, percent, remark };
  });

export const submitEvaluationGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cycleIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: goal } = await supabaseAdmin
      .from("bps_monthly_goals").select("user_id,belief_submitted_at,evaluation_submitted_at")
      .eq("id", data.goal_id).maybeSingle();
    if (!goal) throw new Error("Not found.");
    if (goal.user_id !== context.userId) throw new Error("Forbidden.");
    if (!goal.belief_submitted_at) throw new Error("Submit your Belief Goal first.");
    if (goal.evaluation_submitted_at) throw new Error("Evaluation Goal already submitted for this cycle.");

    const { score, total, percent } = await computeEffortForWindow(
      supabaseAdmin, data.goal_id, new Date(goal.belief_submitted_at), 40,
    );
    const remark = evaluationRemark(percent);
    const { error } = await supabaseAdmin.from("bps_monthly_goals").update({
      evaluation_submitted_at: new Date().toISOString(),
      evaluation_score: score, evaluation_total: total, evaluation_percent: percent, evaluation_remark: remark,
    }).eq("id", data.goal_id);
    if (error) throw error;
    return { ok: true, score, total, percent, remark };
  });

/** DSE Rep oversight: a beneficiary's BPS cadence, reviewed on the weekly rhythm bps-cadence.md describes. */
export const getBpsSnapshotForBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ beneficiary_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin && data.beneficiary_id !== context.userId) throw new Error("Forbidden.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: goals } = await supabaseAdmin
      .from("bps_monthly_goals").select("*").eq("user_id", data.beneficiary_id).order("target_month", { ascending: false }).limit(6);
    const currentGoal = (goals ?? [])[0] ?? null;
    const { data: activities } = currentGoal
      ? await supabaseAdmin.from("bps_activities").select("*").eq("goal_id", currentGoal.id).eq("active", true).order("sort_order", { ascending: true })
      : { data: [] as any[] };
    const activityIds = (activities ?? []).map((a: any) => a.id);
    const since = new Date(); since.setDate(since.getDate() - 7);
    const { data: recentChecks } = activityIds.length
      ? await supabaseAdmin.from("bps_daily_checks").select("*").in("activity_id", activityIds).gte("check_date", since.toISOString().slice(0, 10))
      : { data: [] as any[] };
    const last7 = computeEffortScore((recentChecks ?? []) as any[], activityIds.length, 7);
    return { activities: activities ?? [], goals: goals ?? [], last7 };
  });
