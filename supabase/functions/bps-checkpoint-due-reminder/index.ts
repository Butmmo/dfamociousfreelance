// Once daily: tells a beneficiary the day their Affirmation (day 14) or
// Evaluation (day 40) Goal is actually due, if they haven't submitted it
// yet — the same due dates already shown on the Calendar page, pushed
// proactively instead of waiting for them to look.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  const now = Date.now();
  const results: any[] = [];
  for (const g of (goals ?? []) as any[]) {
    const daysSince = Math.floor((now - new Date(g.belief_submitted_at).getTime()) / 86_400_000) + 1;
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
