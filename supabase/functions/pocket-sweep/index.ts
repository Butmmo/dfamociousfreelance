// Daily sweep covering the Pocket System's three periodic mechanics —
// nothing here needs a request from the beneficiary:
//   Investments — releases whatever's still locked once a full year has
//     passed since the last release (or since first funded, if never
//     released) — the ceiling on how long a mentor may withhold it.
//   Emergency — every March and October, 40% of the current balance
//     releases automatically, in each beneficiary's own local calendar
//     month (profiles.timezone), same as the BPS due-date gates.
//   Savings — once a 3-year cycle completes, issues a withdrawal permit
//     for what accrued during it and starts the next cycle.
// Mirrors mentorship-escalation-notify / pocket-emergency-notify's shape.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INVESTMENT_ANNUAL_SAFEGUARD_DAYS = 365;
const EMERGENCY_AUTO_RELEASE_MONTHS = [3, 10];
const EMERGENCY_AUTO_RELEASE_RATE = 0.40;
const SAVINGS_CYCLE_YEARS = 3;

function localDateStrInTimeZone(d: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date();
  const results: any[] = [];

  // Every beneficiary with at least one pocket_allocations row is a
  // candidate for all three mechanics below.
  const { data: allocations } = await supa.from("pocket_allocations").select("user_id,investments_usd,emergency_usd,savings_usd,target_month");
  const userIds = Array.from(new Set((allocations ?? []).map((a: any) => a.user_id)));
  if (userIds.length === 0) {
    return new Response(JSON.stringify({ ok: true, count: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const { data: profiles } = await supa.from("profiles").select("id,timezone,pocket_savings_started_at").in("id", userIds);
  const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  for (const userId of userIds) {
    const profile = profileById.get(userId);
    const tz = profile?.timezone ?? "Africa/Lagos";
    const myAllocations = (allocations ?? []).filter((a: any) => a.user_id === userId);

    // ── Investments: annual safeguard ──────────────────────────
    const fundedInvestments = myAllocations.reduce((s: number, a: any) => s + Number(a.investments_usd), 0);
    const { data: unlocks } = await supa.from("investment_unlocks").select("*").eq("user_id", userId).order("unlocked_at", { ascending: false });
    const unlockedTotal = (unlocks ?? []).reduce((s: number, u: any) => s + Number(u.amount_usd), 0);
    const locked = Math.max(0, fundedInvestments - unlockedTotal);
    if (locked > 0) {
      const lastReleaseAt = unlocks?.[0]?.unlocked_at ? new Date(unlocks[0].unlocked_at) : null;
      const firstFundedAt = myAllocations.map((a: any) => new Date(a.target_month)).sort((a: Date, b: Date) => a.getTime() - b.getTime())[0] ?? null;
      const since = lastReleaseAt ?? firstFundedAt;
      const daysSince = since ? (now.getTime() - since.getTime()) / 86_400_000 : Infinity;
      if (daysSince >= INVESTMENT_ANNUAL_SAFEGUARD_DAYS) {
        const { error } = await supa.from("investment_unlocks").insert({
          user_id: userId, amount_usd: locked, unlocked_by: null, is_annual_safeguard: true,
          note: "Annual safeguard — released in full; a mentor had not released it within the past year.",
        });
        if (!error) {
          await sendWebPush(supa, {
            user_ids: [userId], category: "pocket",
            title: "Investment Pocket released in full",
            body: `$${locked.toFixed(2)} unlocked automatically — a full year passed without a mentor release.`,
            url: "/bps",
          });
          results.push({ userId, mechanic: "investment_safeguard", amount: locked });
        }
      }
    }

    // ── Emergency: biannual automatic release ──────────────────
    const today = localDateStrInTimeZone(now, tz);
    const [todayYear, todayMonth] = today.split("-").map(Number);
    if (EMERGENCY_AUTO_RELEASE_MONTHS.includes(todayMonth)) {
      const period = `${todayYear}-${String(todayMonth).padStart(2, "0")}`;
      const { data: already } = await supa
        .from("emergency_withdrawal_requests").select("id").eq("user_id", userId).eq("auto_release_period", period).maybeSingle();
      if (!already) {
        const emergencyFunded = myAllocations.reduce((s: number, a: any) => s + Number(a.emergency_usd), 0);
        const { data: approvedPrior } = await supa
          .from("emergency_withdrawal_requests").select("amount_usd").eq("user_id", userId).eq("status", "approved");
        const spent = (approvedPrior ?? []).reduce((s: number, r: any) => s + Number(r.amount_usd), 0);
        const balance = Math.max(0, emergencyFunded - spent);
        const releaseAmount = balance * EMERGENCY_AUTO_RELEASE_RATE;
        if (releaseAmount > 0) {
          const { error } = await supa.from("emergency_withdrawal_requests").insert({
            user_id: userId, amount_usd: releaseAmount,
            reason: "Biannual automatic release (March/October) — no request required.",
            status: "approved", escalation_level: "rep", decided_at: now.toISOString(),
            decision_note: "Automatic — BEF Pocket Policy's twice-yearly Emergency release.",
            auto_release_period: period,
          });
          if (!error) {
            await sendWebPush(supa, {
              user_ids: [userId], category: "pocket",
              title: "Emergency Pocket — automatic release",
              body: `$${releaseAmount.toFixed(2)} (40% of your balance) is now available — no request needed.`,
              url: "/bps",
            });
            results.push({ userId, mechanic: "emergency_auto_release", amount: releaseAmount, period });
          }
        }
      }
    }

    // ── Savings: 3-year cycle rollover ──────────────────────────
    const cycleStartedAt = profile?.pocket_savings_started_at ? new Date(profile.pocket_savings_started_at) : null;
    if (cycleStartedAt) {
      const unlockDate = new Date(cycleStartedAt.getFullYear() + SAVINGS_CYCLE_YEARS, cycleStartedAt.getMonth(), cycleStartedAt.getDate());
      if (now >= unlockDate) {
        const cycleSavings = myAllocations
          .filter((a: any) => new Date(a.target_month) >= cycleStartedAt && new Date(a.target_month) < unlockDate)
          .reduce((s: number, a: any) => s + Number(a.savings_usd), 0);
        const { error: permitError } = await supa.from("savings_withdrawal_permits").insert({
          user_id: userId, cycle_started_at: cycleStartedAt.toISOString(), cycle_ended_at: unlockDate.toISOString(), amount_usd: cycleSavings,
        });
        if (!permitError) {
          await supa.from("profiles").update({ pocket_savings_started_at: unlockDate.toISOString() }).eq("id", userId);
          await sendWebPush(supa, {
            user_ids: [userId], category: "pocket",
            title: "Savings Pocket — 3-year cycle complete",
            body: `$${cycleSavings.toFixed(2)} is now withdrawable. A new 3-year cycle has started.`,
            url: "/bps",
          });
          results.push({ userId, mechanic: "savings_permit", amount: cycleSavings });
        }
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
