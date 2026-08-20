// The NBO Pocket System — server-side pieces. Allocations themselves are
// created by submitEvaluationGoal (bps.functions.ts) the moment a BPS
// Month's revenue is final; this file covers reading that history, BPN
// (Blazer People Network) enrollment, logging actual MLM spend, mentor
// release of the Investments Pocket, and the Emergency Pocket's
// Rep -> Sponsor/Mentor -> Founder withdrawal-request workflow.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { bpnEligible, investmentLockedUsd, MLM_BALANCE_CAP_USD } from "@/lib/pocket";

/** Sum of an allocation column across every row for a user — used for both the running Emergency balance and lifetime totals per pocket. */
function sumCol(rows: any[], col: string): number {
  return rows.reduce((acc, r) => acc + Number(r[col] ?? 0), 0);
}

/** Everything the Pocket System page needs for the signed-in beneficiary: allocation history, running balances for every gated pocket, BPN status, and their own requests. */
export const getMyPocketSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: allocations }, { data: requests }, { data: profile }, { data: unlocks }, { data: permits }, { data: dfyMonths }] = await Promise.all([
      supabaseAdmin.from("pocket_allocations").select("*").eq("user_id", context.userId).order("target_month", { ascending: false }),
      supabaseAdmin.from("emergency_withdrawal_requests").select("*").eq("user_id", context.userId).order("requested_at", { ascending: false }),
      supabaseAdmin.from("profiles").select("pocket_savings_started_at,bpn_enrolled_at").eq("id", context.userId).maybeSingle(),
      supabaseAdmin.from("investment_unlocks").select("*").eq("user_id", context.userId).order("unlocked_at", { ascending: false }),
      supabaseAdmin.from("savings_withdrawal_permits").select("*").eq("user_id", context.userId).order("cycle_ended_at", { ascending: false }),
      supabaseAdmin.from("dfy_months").select("net_income_usd").eq("user_id", context.userId),
    ]);

    const rows = allocations ?? [];
    const emergencyFunded = sumCol(rows, "emergency_usd");
    const emergencySpent = (requests ?? [])
      .filter((r: any) => r.status === "approved")
      .reduce((acc: number, r: any) => acc + Number(r.amount_usd), 0);

    const lifetimeInvestmentsUsd = sumCol(rows, "investments_usd");
    const investmentUnlockedUsd = sumCol(unlocks ?? [], "amount_usd");
    const lifetimeMlmUsd = sumCol(rows, "mlm_usd");
    const lifetimeMlmActualSpendUsd = sumCol(rows, "mlm_actual_spend_usd");
    const cumulativeNetIncomeUsd = (dfyMonths ?? []).reduce((acc: number, m: any) => acc + Number(m.net_income_usd), 0);

    return {
      allocations: rows,
      requests: requests ?? [],
      unlocks: unlocks ?? [],
      permits: permits ?? [],
      emergencyBalanceUsd: Math.max(0, emergencyFunded - emergencySpent),
      lifetimeUpkeepUsd: sumCol(rows, "upkeep_usd"),
      lifetimeSavingsUsd: sumCol(rows, "savings_usd"),
      lifetimeInvestmentsUsd,
      investmentUnlockedUsd,
      investmentLockedUsd: investmentLockedUsd(lifetimeInvestmentsUsd, investmentUnlockedUsd),
      lifetimeMlmUsd,
      lifetimeMlmActualSpendUsd,
      mlmBalanceUsd: Math.max(0, lifetimeMlmUsd - lifetimeMlmActualSpendUsd),
      mlmBalanceCapUsd: MLM_BALANCE_CAP_USD,
      lifetimeMlmDivertedUsd: sumCol(rows, "mlm_diverted_usd"),
      savingsStartedAt: profile?.pocket_savings_started_at ?? null,
      bpnEnrolledAt: profile?.bpn_enrolled_at ?? null,
      bpnEligible: bpnEligible(cumulativeNetIncomeUsd),
      cumulativeNetIncomeUsd,
    };
  });

/** Enrolls the signed-in beneficiary in BPN — gated on the $1,000 cumulative-net-income readiness bar, since BPN itself requires ongoing product spend. */
export const enrollInBpn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin.from("profiles").select("bpn_enrolled_at").eq("id", context.userId).maybeSingle();
    if (profile?.bpn_enrolled_at) throw new Error("Already enrolled in BPN.");
    const { data: dfyMonths } = await supabaseAdmin.from("dfy_months").select("net_income_usd").eq("user_id", context.userId);
    const cumulativeNetIncomeUsd = (dfyMonths ?? []).reduce((acc: number, m: any) => acc + Number(m.net_income_usd), 0);
    if (!bpnEligible(cumulativeNetIncomeUsd)) {
      throw new Error(`BPN needs $1,000 in cumulative net income first — you're at $${cumulativeNetIncomeUsd.toFixed(2)}.`);
    }
    const { error } = await supabaseAdmin.from("profiles").update({ bpn_enrolled_at: new Date().toISOString() }).eq("id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

const releaseSchema = z.object({
  beneficiary_id: z.string().uuid(),
  amount_usd: z.number().positive(),
  note: z.string().trim().max(500).optional(),
});

/** A mentor unlocks part of their mentee's Investments Pocket when there's something concrete it's needed for — capped at whatever's currently locked. Any admin can act too, matching the single-tier Council authority model used elsewhere; the mentor is the expected everyday caller. */
export const releaseInvestmentFunds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => releaseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) {
      const { data: mentorship } = await supabaseAdmin
        .from("mentorships").select("id").eq("mentor_id", context.userId).eq("mentee_id", data.beneficiary_id).eq("status", "active").maybeSingle();
      if (!mentorship) throw new Error("Forbidden.");
    }
    const { data: allocations } = await supabaseAdmin
      .from("pocket_allocations").select("investments_usd").eq("user_id", data.beneficiary_id);
    const { data: unlocks } = await supabaseAdmin
      .from("investment_unlocks").select("amount_usd").eq("user_id", data.beneficiary_id);
    const funded = (allocations ?? []).reduce((s: number, a: any) => s + Number(a.investments_usd), 0);
    const unlocked = (unlocks ?? []).reduce((s: number, u: any) => s + Number(u.amount_usd), 0);
    const locked = investmentLockedUsd(funded, unlocked);
    if (data.amount_usd > locked) {
      throw new Error(`That exceeds what's currently locked ($${locked.toFixed(2)}).`);
    }
    const { error } = await supabaseAdmin.from("investment_unlocks").insert({
      user_id: data.beneficiary_id, amount_usd: data.amount_usd, unlocked_by: context.userId, note: data.note ?? null,
    });
    if (error) throw error;

    const base = process.env.SUPABASE_URL;
    if (base) {
      fetch(`${base}/functions/v1/send-push`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: [data.beneficiary_id], category: "pocket",
          title: "Investment Pocket funds released",
          body: `$${data.amount_usd.toFixed(2)} unlocked by your mentor${data.note ? ` — ${data.note}` : ""}.`,
          url: "/bps",
        }),
      }).catch(() => {});
    }
    return { ok: true };
  });

const menteeIdSchema = z.object({ mentee_id: z.string().uuid() });

/** What a mentor needs to decide an Investments Pocket release for one mentee — funded/unlocked/locked totals, narrower than the beneficiary's own full Pocket summary since a mentor's business here is Investments specifically. */
export const getMenteeInvestmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => menteeIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) {
      const { data: mentorship } = await supabaseAdmin
        .from("mentorships").select("id").eq("mentor_id", context.userId).eq("mentee_id", data.mentee_id).eq("status", "active").maybeSingle();
      if (!mentorship) throw new Error("Forbidden.");
    }
    const { data: allocations } = await supabaseAdmin
      .from("pocket_allocations").select("investments_usd,target_month").eq("user_id", data.mentee_id).order("target_month", { ascending: true });
    const { data: unlocks } = await supabaseAdmin
      .from("investment_unlocks").select("*").eq("user_id", data.mentee_id).order("unlocked_at", { ascending: false });
    const funded = (allocations ?? []).reduce((s: number, a: any) => s + Number(a.investments_usd), 0);
    const unlockedTotal = (unlocks ?? []).reduce((s: number, u: any) => s + Number(u.amount_usd), 0);
    return {
      fundedUsd: funded,
      unlockedUsd: unlockedTotal,
      lockedUsd: investmentLockedUsd(funded, unlockedTotal),
      unlocks: unlocks ?? [],
      firstFundedAt: (allocations ?? [])[0]?.target_month ?? null,
    };
  });

const mlmSpendSchema = z.object({
  allocation_id: z.string().uuid(),
  actual_spend_usd: z.number().min(0),
});

/** The beneficiary logs what they actually spent on Neolife product against a given month's MLM pocket — unspent balance stays in the pocket (up to its $1,500 cap) for future months, it doesn't flush out automatically. */
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
