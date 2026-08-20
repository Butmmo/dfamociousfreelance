// The other three daily check-in slots — 7am (load in today's targets),
// 1pm (midday check), 10pm (final call) — alongside the existing 7:30pm
// "finish up" reminder in bps-daily-tracker-reminder. Same eligibility
// logic as that function (an active 40-day finance cycle, today not yet
// marked); only the copy differs per slot. Invoked with { slot }.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const FINANCE_CYCLE_DAYS = 40;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Slot = "morning" | "midday" | "final";

const COPY: Record<Slot, { title: string; body: string }> = {
  morning: {
    title: "Today's financial tracker is loaded in",
    body: "Leads, messages, new and returning clients, revenue — mark them as the day happens, not all at once tonight.",
  },
  midday: {
    title: "Midday check — how's today's tracker?",
    body: "Halfway through the day. Log what's happened so far, or plan the rest of it around what's still open.",
  },
  final: {
    title: "Last call — mark today's tracker",
    body: "A day not marked by midnight can never be marked afterward. A few minutes now closes it out.",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }
  const slot: Slot = payload?.slot === "morning" || payload?.slot === "midday" || payload?.slot === "final" ? payload.slot : "morning";

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

  const { title, body } = COPY[slot];
  const results: any[] = [];
  for (const g of active as any[]) {
    const { data: entry } = await supa
      .from("bps_finance_daily_entries").select("id").eq("goal_id", g.id).eq("entry_date", today).maybeSingle();
    if (entry) { results.push({ userId: g.user_id, skipped: "already marked" }); continue; }
    const result = await sendWebPush(supa, { user_ids: [g.user_id], category: "bps", title, body, url: "/bps" });
    results.push({ userId: g.user_id, ...result });
  }

  return new Response(JSON.stringify({ slot, today, count: active.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
