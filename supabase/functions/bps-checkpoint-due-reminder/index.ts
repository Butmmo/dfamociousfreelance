// Tells a beneficiary — at 9am their own local time, not one global UTC
// hour — the day their Affirmation (day 14) or Evaluation (day 40) Goal is
// actually due, if they haven't submitted it yet. Runs every 15 minutes;
// only fires for users whose local wall-clock time is currently in the
// 09:00-09:14 window.

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: goals } = await supa
    .from("bps_monthly_goals")
    .select("user_id,belief_submitted_at,affirmation_submitted_at,evaluation_submitted_at")
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

    const daysSince = Math.floor((now.getTime() - new Date(g.belief_submitted_at).getTime()) / 86_400_000) + 1;
    if (daysSince === 14 && !g.affirmation_submitted_at) {
      const r = await sendWebPush(supa, {
        user_ids: [g.user_id], category: "bps",
        title: "Affirmation Goal due today",
        body: "Day 14 of this cycle — submit it in BPS and your finance checkpoint reports automatically.",
        url: "/bps",
      });
      results.push({ userId: g.user_id, checkpoint: "affirmation", ...r });
    } else if (daysSince === 40 && !g.evaluation_submitted_at) {
      const r = await sendWebPush(supa, {
        user_ids: [g.user_id], category: "bps",
        title: "Evaluation Goal due today",
        body: "Day 40 of this cycle — submit it in BPS and your finance checkpoint reports automatically.",
        url: "/bps",
      });
      results.push({ userId: g.user_id, checkpoint: "evaluation", ...r });
    }
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
