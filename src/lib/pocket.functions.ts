// The NBO Pocket System — server-side pieces. Allocations themselves are
// created by submitEvaluationGoal (bps.functions.ts) the moment a BPS
// Month's revenue is final; this file covers reading that history, logging
// actual MLM spend against the pocket, and the Emergency Pocket's
// Rep -> Sponsor/Mentor -> Founder withdrawal-request workflow.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Sum of an allocation column across every row for a user — used for both the running Emergency balance and lifetime totals per pocket. */
function sumCol(rows: any[], col: string): number {
  return rows.reduce((acc, r) => acc + Number(r[col] ?? 0), 0);
}

/** Everything the Pocket System page needs for the signed-in beneficiary: allocation history, the running Emergency Pocket balance, the Savings unlock date, and their own withdrawal requests. */
export const getMyPocketSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: allocations } = await supabaseAdmin
      .from("pocket_allocations").select("*").eq("user_id", context.userId).order("target_month", { ascending: false });
    const { data: requests } = await supabaseAdmin
      .from("emergency_withdrawal_requests").select("*").eq("user_id", context.userId).order("requested_at", { ascending: false });
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("pocket_savings_started_at").eq("id", context.userId).maybeSingle();

    const rows = allocations ?? [];
    const emergencyFunded = sumCol(rows, "emergency_usd");
    const emergencySpent = (requests ?? [])
      .filter((r: any) => r.status === "approved")
      .reduce((acc: number, r: any) => acc + Number(r.amount_usd), 0);

    return {
      allocations: rows,
      requests: requests ?? [],
      emergencyBalanceUsd: Math.max(0, emergencyFunded - emergencySpent),
      lifetimeUpkeepUsd: sumCol(rows, "upkeep_usd"),
      lifetimeSavingsUsd: sumCol(rows, "savings_usd"),
      lifetimeInvestmentsUsd: sumCol(rows, "investments_usd"),
      lifetimeMlmUsd: sumCol(rows, "mlm_usd"),
      lifetimeMlmActualSpendUsd: sumCol(rows, "mlm_actual_spend_usd"),
      savingsStartedAt: profile?.pocket_savings_started_at ?? null,
    };
  });

const mlmSpendSchema = z.object({
  allocation_id: z.string().uuid(),
  actual_spend_usd: z.number().min(0),
});

/** The beneficiary logs what they actually spent on Neolife product against a given month's MLM pocket — the unspent balance rolls into Savings by default (see pocket.ts's mlmRollover). */
export const logMlmActualSpend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => mlmSpendSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: allocation } = await supabaseAdmin
      .from("pocket_allocations").select("user_id").eq("id", data.allocation_id).maybeSingle();
    if (!allocation) throw new Error("Not found.");
    if (allocation.user_id !== context.userId) throw new Error("Forbidden.");
    const { error } = await supabaseAdmin
      .from("pocket_allocations").update({ mlm_actual_spend_usd: data.actual_spend_usd }).eq("id", data.allocation_id);
    if (error) throw error;
    return { ok: true };
  });

const withdrawalSchema = z.object({
  amount_usd: z.number().positive(),
  reason: z.string().trim().min(1).max(1000),
});

/** Proposes an Emergency Pocket withdrawal to the Rep — the first rung of the doctrine's Rep -> Sponsor/Mentor -> Founder escalation ladder. */
export const requestEmergencyWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => withdrawalSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: allocations } = await supabaseAdmin
      .from("pocket_allocations").select("emergency_usd").eq("user_id", context.userId);
    const { data: prior } = await supabaseAdmin
      .from("emergency_withdrawal_requests").select("amount_usd").eq("user_id", context.userId).eq("status", "approved");
    const funded = sumCol(allocations ?? [], "emergency_usd");
    const spent = (prior ?? []).reduce((acc: number, r: any) => acc + Number(r.amount_usd), 0);
    const available = Math.max(0, funded - spent);
    if (data.amount_usd > available) {
      throw new Error(`That exceeds your available Emergency Pocket balance ($${available.toFixed(2)}).`);
    }

    const { data: row, error } = await supabaseAdmin
      .from("emergency_withdrawal_requests")
      .insert({ user_id: context.userId, amount_usd: data.amount_usd, reason: data.reason })
      .select("id").single();
    if (error) throw error;
    return { ok: true, id: row.id };
  });

const decideSchema = z.object({
  request_id: z.string().uuid(),
  decision: z.enum(["approved", "denied"]),
  decision_note: z.string().trim().max(1000).optional(),
});

/** The Council console's decide action — any admin can act on a pending request regardless of which rung it's currently escalated to, same single-tier authority model council-escalations.tsx already uses; escalation_level exists to route notifications and show urgency, not to gate who's allowed to decide. */
export const decideEmergencyWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => decideSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reqRow } = await supabaseAdmin
      .from("emergency_withdrawal_requests").select("status").eq("id", data.request_id).maybeSingle();
    if (!reqRow) throw new Error("Not found.");
    if (reqRow.status !== "pending") throw new Error("Already decided.");
    const { error } = await supabaseAdmin.from("emergency_withdrawal_requests").update({
      status: data.decision,
      decided_at: new Date().toISOString(),
      decided_by: context.userId,
      decision_note: data.decision_note ?? null,
    }).eq("id", data.request_id);
    if (error) throw error;
    return { ok: true };
  });

/** Council console: every pending/recent Emergency withdrawal request, with the beneficiary's name and how far up the ladder it's escalated. */
export const listWithdrawalRequestsForReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("emergency_withdrawal_requests").select("*").order("requested_at", { ascending: false }).limit(200);
    const userIds = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
    const { data: people } = userIds.length
      ? await supabaseAdmin.from("profiles").select("id,full_name,email").in("id", userIds)
      : { data: [] as any[] };
    const byId = new Map((people ?? []).map((p: any) => [p.id, p]));
    return (rows ?? []).map((r: any) => ({ ...r, beneficiary: byId.get(r.user_id) ?? null }));
  });
