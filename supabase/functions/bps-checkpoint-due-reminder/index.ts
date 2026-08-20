// Tells a beneficiary — at 9am their own local time, not one global UTC
// hour — the day their Affirmation or Evaluation Goal is actually due, if
// they haven't submitted it yet. Runs every 15 minutes; only fires for
// users whose local wall-clock time is currently in the 09:00-09:14
// window AND whose local calendar date has reached the fixed due date.
//
// Due dates are fixed to the calendar (see src/lib/bps.ts's
// beliefDueDate/affirmationDueDate/evaluationDueDate, mirrored here since
// edge functions can't import from src/): the 1st of the month before
// target_month (Belief), the 15th of that same month (Affirmation), and
// the 10th of target_month itself (Evaluation) — never a day-count from
// whenever the Belief Goal happened to be submitted, which drifts the
// moment a Belief Goal is submitted late.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const START_MIN = 9 * 60;
const END_MIN = 9 * 60 + 14;

function localMinutesOfDay(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false, hour: "2-digit", minute: "2-digit",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/** The user's local calendar date (YYYY-MM-DD) at this instant, in `tz`. */
function localDateStr(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

/** Formats an abstract calendar Date (no timezone attached — pure year/month/day arithmetic) as YYYY-MM-DD. */
function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseTargetMonth(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}
function affirmationDueDate(targetMonth: Date): Date {
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 15);
}
function evaluationDueDate(targetMonth: Date): Date {
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: goals } = await supa
    .from("bps_monthly_goals")
    .select("user_id,target_month,belief_submitted_at,affirmation_submitted_at,evaluation_submitted_at")
    .not("belief_submitted_at", "is", null);

  const candidateGoals = (goals ?? []) as any[];
  if (candidateGoals.length === 0) {
    return new Response(JSON.stringify({ ok: true, count: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const userIds = Array.from(new Set(candidateGoals.map((g) => g.user_id)));
  const { data: profiles } = await supa.from("profiles").select("id,timezone").in("id", userIds);
  const tzById = new Map((profiles ?? []).map((p: any) => [p.id, p.timezone ?? "Africa/Lagos"]));

  const now = new Date();
  const results: any[] = [];
  for (const g of candidateGoals) {
    const tz = tzById.get(g.user_id) ?? "Africa/Lagos";
    const localMinutes = localMinutesOfDay(now, tz);
    if (localMinutes < START_MIN || localMinutes >= END_MIN) continue;

    const today = localDateStr(now, tz);
    const targetMonth = parseTargetMonth(g.target_month);

    if (!g.affirmation_submitted_at && today === dateStr(affirmationDueDate(targetMonth))) {
      const r = await sendWebPush(supa, {
        user_ids: [g.user_id], category: "bps",
        title: "Affirmation Goal due today",
        body: "Submit it in BPS and your finance checkpoint reports automatically.",
        url: "/bps",
      });
      results.push({ userId: g.user_id, checkpoint: "affirmation", ...r });
    } else if (!g.evaluation_submitted_at && today === dateStr(evaluationDueDate(targetMonth))) {
      const r = await sendWebPush(supa, {
        user_ids: [g.user_id], category: "bps",
        title: "Evaluation Goal due today",
        body: "Submit it in BPS and your finance checkpoint reports automatically.",
        url: "/bps",
      });
      results.push({ userId: g.user_id, checkpoint: "evaluation", ...r });
    }
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
