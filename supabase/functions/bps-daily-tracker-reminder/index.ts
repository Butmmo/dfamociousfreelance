// Fires once daily at 7:30pm WAT (18:30 UTC) — a push reminder to mark
// the Financial Goal's daily tracker before bed, for every beneficiary
// with an active 40-day finance cycle who hasn't logged today's entry
// yet. The entry becomes impossible to record once the day turns over
// (bps_finance_daily_entries' same-day-only DB trigger), so this is the
// last real nudge before that window closes.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const FINANCE_CYCLE_DAYS = 40;
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

  const today = new Date().toISOString().slice(0, 10);
  const { data: goals } = await supa
    .from("bps_monthly_goals")
    .select("id,user_id,belief_submitted_at")
    .not("finance_leads_target", "is", null)
    .not("belief_submitted_at", "is", null);

  const now = Date.now();
  const active = (goals ?? []).filter((g: any) => {
    const daysSince = Math.floor((now - new Date(g.belief_submitted_at).getTime()) / 86_400_000) + 1;
    return daysSince >= 1 && daysSince <= FINANCE_CYCLE_DAYS;
  });

  const results: any[] = [];
  for (const g of active as any[]) {
    const { data: entry } = await supa
      .from("bps_finance_daily_entries").select("id").eq("goal_id", g.id).eq("entry_date", today).maybeSingle();
    if (entry) { results.push({ userId: g.user_id, skipped: "already marked" }); continue; }
    const result = await sendWebPush(supa, {
      user_ids: [g.user_id],
      category: "bps",
      title: "Mark today's financial tracker",
      body: "Before bed — a day not marked can't be marked tomorrow.",
      url: "/bps",
    });
    results.push({ userId: g.user_id, ...result });
  }

  return new Response(JSON.stringify({ today, count: active.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
