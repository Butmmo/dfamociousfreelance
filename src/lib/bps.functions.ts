// The Blazer Productivity Scheme — server-side pieces only. Daily activity
// CRUD and daily 1/0 checks are plain client-side RLS calls (own row only,
// same pattern as profile.tsx and dfy.tsx) — nothing here duplicates that.
// What genuinely needs a server function is the Three Goals System's
// scoring: bps_monthly_goals grants SELECT only to authenticated (see the
// migration), because the fixed, non-improvised remark language is a real
// doctrinal requirement, not a UI nicety — it must be computed here, never
// typed by the client.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  affirmationRemark, evaluationRemark, computeEffortScore,
  PILLAR_ITEM_COUNT, MLM_DEFAULT_GOAL,
} from "@/lib/bps";

const goalItemSchema = z.object({ text: z.string().trim().min(1).max(300), done: z.boolean().default(false) });

const beliefSchema = z.object({
  target_month: z.string(), // YYYY-MM-01
  finance_goal: z.string().trim().min(1).max(500),
  finance_items: z.array(goalItemSchema).length(PILLAR_ITEM_COUNT),
  self_dev_goal: z.string().trim().min(1).max(500),
  self_dev_items: z.array(goalItemSchema).length(PILLAR_ITEM_COUNT),
  mlm_goal: z.string().trim().max(500).default(MLM_DEFAULT_GOAL),
  mlm_items: z.array(goalItemSchema).max(PILLAR_ITEM_COUNT).default([]),
  relationship_goal: z.string().trim().min(1).max(500),
  relationship_items: z.array(goalItemSchema).length(PILLAR_ITEM_COUNT),
});

export const submitBeliefGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => beliefSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // "Daily binary tracking begun" is a hard prerequisite for a real Belief Goal.
    const { count: activeActivities } = await supabaseAdmin
      .from("bps_activities").select("id", { count: "exact", head: true })
      .eq("user_id", context.userId).eq("active", true);
    if (!activeActivities) {
      throw new Error("Set up at least one daily tracked activity before submitting a Belief Goal.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("bps_monthly_goals")
      .upsert(
        {
          user_id: context.userId,
          target_month: data.target_month,
          finance_goal: data.finance_goal,
          finance_items: data.finance_items,
          self_dev_goal: data.self_dev_goal,
          self_dev_items: data.self_dev_items,
          mlm_goal: data.mlm_goal || MLM_DEFAULT_GOAL,
          mlm_items: data.mlm_items,
          relationship_goal: data.relationship_goal,
          relationship_items: data.relationship_items,
          belief_submitted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,target_month" },
      )
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: row.id };
  });

async function computeEffortForWindow(supabaseAdmin: any, userId: string, from: Date, windowDays: number) {
  const to = new Date(from);
  to.setDate(to.getDate() + windowDays);
  const { data: activities } = await supabaseAdmin
    .from("bps_activities").select("id").eq("user_id", userId).eq("active", true);
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
      supabaseAdmin, context.userId, new Date(goal.belief_submitted_at), 14,
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
      supabaseAdmin, context.userId, new Date(goal.belief_submitted_at), 40,
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
    const [{ data: activities }, { data: goals }] = await Promise.all([
      supabaseAdmin.from("bps_activities").select("*").eq("user_id", data.beneficiary_id).eq("active", true).order("sort_order", { ascending: true }),
      supabaseAdmin.from("bps_monthly_goals").select("*").eq("user_id", data.beneficiary_id).order("target_month", { ascending: false }).limit(6),
    ]);
    const activityIds = (activities ?? []).map((a: any) => a.id);
    const since = new Date(); since.setDate(since.getDate() - 7);
    const { data: recentChecks } = activityIds.length
      ? await supabaseAdmin.from("bps_daily_checks").select("*").in("activity_id", activityIds).gte("check_date", since.toISOString().slice(0, 10))
      : { data: [] as any[] };
    const last7 = computeEffortScore((recentChecks ?? []) as any[], activityIds.length, 7);
    return { activities: activities ?? [], goals: goals ?? [], last7 };
  });
