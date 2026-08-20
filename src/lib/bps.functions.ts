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
  MLM_DEFAULT_GOAL, computeFinanceCycleTargets, financeExpectationForDays, sumFinanceEntries,
  beliefDueDate, affirmationDueDate, evaluationDueDate, bpsMonthWindowDays, FINANCE_CHECKPOINT_DAYS,
  type FinanceMetrics,
} from "@/lib/bps";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";

/** Mentor (active mentorship), sponsor (fuzzy name match), and DSE Rep (assignment or founder fallback) — same resolution bps-weekly-report uses. */
async function resolveReportRecipients(supabaseAdmin: any, userId: string, sponsorName: string | null) {
  const ids = new Set<string>();

  const { data: mentorship } = await supabaseAdmin
    .from("mentorships").select("mentor_id").eq("mentee_id", userId).eq("status", "active").maybeSingle();
  if (mentorship?.mentor_id) ids.add(mentorship.mentor_id);

  if (sponsorName) {
    const { data: sponsorMatch } = await supabaseAdmin
      .from("profiles").select("id").ilike("full_name", sponsorName).maybeSingle();
    if (sponsorMatch?.id) ids.add(sponsorMatch.id);
  }

  const { data: assignment } = await supabaseAdmin
    .from("admin_assignments").select("admin_id").eq("beneficiary_id", userId).maybeSingle();
  if (assignment?.admin_id) {
    ids.add(assignment.admin_id);
  } else {
    const { data: superAdmin } = await supabaseAdmin.from("profiles").select("id").eq("email", SUPER_ADMIN_EMAIL).maybeSingle();
    if (superAdmin?.id) ids.add(superAdmin.id);
  }

  ids.delete(userId);
  return Array.from(ids);
}

function formatFinanceLine(m: FinanceMetrics, decimals = 0): string {
  const f = (n: number) => n.toFixed(decimals);
  return `${f(m.leads)} leads, ${f(m.messages)} messages, ${f(m.newClients)} new clients, ${f(m.returningClients)} returning clients, $${m.revenueUsd.toFixed(2)} revenue`;
}

/**
 * Posts the checkpoint report through the first two of the three required
 * channels — a self-generated chat message to each recipient, then a
 * descriptive entry in the mentee's activity feed — and fires the
 * bps-checkpoint-notify edge function for the third (email) plus push.
 * Never email-only.
 */
async function postFinanceCheckpointReport(
  supabaseAdmin: any,
  userId: string,
  beneficiaryName: string,
  checkpoint: "Affirmation (day 15)" | "Evaluation (day 10)",
  actual: FinanceMetrics,
  expected: FinanceMetrics,
  recipientIds: string[],
) {
  const title = `Financial Goal — ${checkpoint} checkpoint`;
  const body =
    `${beneficiaryName}'s ${checkpoint} financial goal checkpoint.\n\n` +
    `Actual: ${formatFinanceLine(actual)}\n` +
    `Expected by now: ${formatFinanceLine(expected, 1)}`;

  if (recipientIds.length > 0) {
    const messages = recipientIds.map((recipientId) => ({
      sender_id: userId,
      recipient_id: recipientId,
      body: `📊 ${title}\n\n${body}`,
    }));
    await supabaseAdmin.from("direct_messages").insert(messages);
  }

  await supabaseAdmin.from("mentee_activity_feed").insert({
    mentee_id: userId,
    kind: "bps_finance_checkpoint",
    title,
    body,
  });

  if (recipientIds.length > 0) {
    const base = process.env.SUPABASE_URL;
    if (base) {
      fetch(`${base}/functions/v1/bps-checkpoint-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, checkpoint, title, body, recipient_ids: recipientIds }),
      }).catch(() => {});
    }
  }
}

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
  relationship_goal: z.string().trim().max(500).default(""),
  relationship_items: z.array(goalItemSchema).default([]),
  custom_pillars: z.array(customPillarSchema).default([]),
  hidden_pillars: z.array(z.string().max(60)).default([]),
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
          hidden_pillars: data.hidden_pillars,
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

/** Sums the fixed calendar window's daily finance entries against the pro-rated target, persists the snapshot, and reports it — unless the beneficiary hid the finance pillar. */
async function computeAndReportFinanceCheckpoint(
  supabaseAdmin: any,
  goalId: string,
  userId: string,
  targetMonth: Date,
  from: Date,
  windowDays: number,
  columnPrefix: "finance_checkpoint" | "finance_final",
  checkpointLabel: "Affirmation (day 15)" | "Evaluation (day 10)",
) {
  const { data: goal } = await supabaseAdmin
    .from("bps_monthly_goals")
    .select("finance_leads_target,finance_messages_target,finance_new_clients_target,finance_returning_clients_target,finance_avg_price_usd,hidden_pillars")
    .eq("id", goalId).maybeSingle();
  if (!goal) return;

  const to = new Date(from);
  to.setDate(to.getDate() + windowDays);
  const { data: entries } = await supabaseAdmin
    .from("bps_finance_daily_entries")
    .select("leads_contacted,messages_sent,new_clients_closed,returning_clients_closed,revenue_usd")
    .eq("goal_id", goalId)
    .gte("entry_date", from.toISOString().slice(0, 10))
    .lt("entry_date", to.toISOString().slice(0, 10));

  const actual = sumFinanceEntries((entries ?? []) as any[]);
  const targets = computeFinanceCycleTargets(goal, targetMonth);
  const expected = financeExpectationForDays(targets, windowDays);

  await supabaseAdmin.from("bps_monthly_goals").update({
    [`${columnPrefix}_leads_actual`]: Math.round(actual.leads),
    [`${columnPrefix}_messages_actual`]: Math.round(actual.messages),
    [`${columnPrefix}_new_clients_actual`]: Math.round(actual.newClients),
    [`${columnPrefix}_returning_clients_actual`]: Math.round(actual.returningClients),
    [`${columnPrefix}_revenue_actual`]: Math.round(actual.revenueUsd * 100) / 100,
  }).eq("id", goalId);

  // The beneficiary always sees their own result on their own report page
  // — the hidden_pillars privacy toggle only controls what sponsor/mentor/
  // rep see, never the beneficiary's own view of their own numbers.
  const base = process.env.SUPABASE_URL;
  if (base) {
    fetch(`${base}/functions/v1/send-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_ids: [userId],
        category: "bps",
        title: `Financial Goal — ${checkpointLabel} results are in`,
        body: `${formatFinanceLine(actual)} — posted to your report page.`,
        url: "/report",
      }),
    }).catch(() => {});
  }

  const hiddenPillars: string[] = goal.hidden_pillars ?? [];
  if (hiddenPillars.includes("finance")) return;

  const { data: beneficiary } = await supabaseAdmin
    .from("profiles").select("full_name,sponsor_name").eq("id", userId).maybeSingle();
  const recipientIds = await resolveReportRecipients(supabaseAdmin, userId, beneficiary?.sponsor_name ?? null);
  await postFinanceCheckpointReport(
    supabaseAdmin, userId, beneficiary?.full_name ?? "A beneficiary", checkpointLabel, actual, expected, recipientIds,
  );
}

const cycleIdSchema = z.object({ goal_id: z.string().uuid() });

export const submitAffirmationGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cycleIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: goal } = await supabaseAdmin
      .from("bps_monthly_goals").select("user_id,target_month,belief_submitted_at,affirmation_submitted_at")
      .eq("id", data.goal_id).maybeSingle();
    if (!goal) throw new Error("Not found.");
    if (goal.user_id !== context.userId) throw new Error("Forbidden.");
    if (!goal.belief_submitted_at) throw new Error("Submit your Belief Goal first.");
    if (goal.affirmation_submitted_at) throw new Error("Affirmation Goal already submitted for this cycle.");

    const targetMonth = new Date(goal.target_month);
    const beliefDue = beliefDueDate(targetMonth);
    const affirmationDue = affirmationDueDate(targetMonth);
    if (new Date() < affirmationDue) {
      throw new Error(`Affirmation Goal isn't due yet — it opens on ${affirmationDue.toLocaleDateString()}.`);
    }

    const { score, total, percent } = await computeEffortForWindow(
      supabaseAdmin, data.goal_id, beliefDue, FINANCE_CHECKPOINT_DAYS,
    );
    const remark = affirmationRemark(percent);
    const { error } = await supabaseAdmin.from("bps_monthly_goals").update({
      affirmation_submitted_at: new Date().toISOString(),
      affirmation_score: score, affirmation_total: total, affirmation_percent: percent, affirmation_remark: remark,
    }).eq("id", data.goal_id);
    if (error) throw error;

    try {
      await computeAndReportFinanceCheckpoint(
        supabaseAdmin, data.goal_id, context.userId, targetMonth, beliefDue, FINANCE_CHECKPOINT_DAYS, "finance_checkpoint", "Affirmation (day 15)",
      );
    } catch { /* the affirmation submission itself already succeeded — never fail it over the finance report */ }

    return { ok: true, score, total, percent, remark };
  });

export const submitEvaluationGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cycleIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: goal } = await supabaseAdmin
      .from("bps_monthly_goals").select("user_id,target_month,belief_submitted_at,evaluation_submitted_at")
      .eq("id", data.goal_id).maybeSingle();
    if (!goal) throw new Error("Not found.");
    if (goal.user_id !== context.userId) throw new Error("Forbidden.");
    if (!goal.belief_submitted_at) throw new Error("Submit your Belief Goal first.");
    if (goal.evaluation_submitted_at) throw new Error("Evaluation Goal already submitted for this cycle.");

    const targetMonth = new Date(goal.target_month);
    const beliefDue = beliefDueDate(targetMonth);
    const evaluationDue = evaluationDueDate(targetMonth);
    if (new Date() < evaluationDue) {
      throw new Error(`Evaluation Goal isn't due yet — it opens on ${evaluationDue.toLocaleDateString()}.`);
    }
    const cycleDays = bpsMonthWindowDays(targetMonth);

    const { score, total, percent } = await computeEffortForWindow(
      supabaseAdmin, data.goal_id, beliefDue, cycleDays,
    );
    const remark = evaluationRemark(percent);
    const { error } = await supabaseAdmin.from("bps_monthly_goals").update({
      evaluation_submitted_at: new Date().toISOString(),
      evaluation_score: score, evaluation_total: total, evaluation_percent: percent, evaluation_remark: remark,
    }).eq("id", data.goal_id);
    if (error) throw error;

    try {
      await computeAndReportFinanceCheckpoint(
        supabaseAdmin, data.goal_id, context.userId, targetMonth, beliefDue, cycleDays, "finance_final", "Evaluation (day 10)",
      );
    } catch { /* the evaluation submission itself already succeeded — never fail it over the finance report */ }

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
