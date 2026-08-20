// Four daily check-in slots, each fired at that literal local time for
// every user individually — 7am (load today's targets in), 1pm (midday
// check), 7:30pm (finish up), 10pm (final call) — regardless of what UTC
// offset that happens to be for them. Runs every 15 minutes; each tick,
// every eligible user's own wall-clock time (via their stored
// profiles.timezone) is checked against the four slot windows, and at
// most one fires per user per tick.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const FINANCE_CYCLE_DAYS = 40;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLOTS = [
  {
    name: "morning", startMin: 7 * 60, endMin: 7 * 60 + 14,
    title: "Today's financial tracker is loaded in",
    body: "Leads, messages, new and returning clients, revenue — mark them as the day happens, not all at once tonight.",
  },
  {
    name: "midday", startMin: 13 * 60, endMin: 13 * 60 + 14,
    title: "Midday check — how's today's tracker?",
    body: "Halfway through the day. Log what's happened so far, or plan the rest of it around what's still open.",
  },
  {
    name: "evening", startMin: 19 * 60 + 30, endMin: 19 * 60 + 44,
    title: "Mark today's financial tracker",
    body: "Before bed — a day not marked can't be marked tomorrow.",
  },
  {
    name: "final", startMin: 22 * 60, endMin: 22 * 60 + 14,
    title: "Last call — mark today's tracker",
    body: "A day not marked by midnight can never be marked afterward. A few minutes now closes it out.",
  },
];

/** Minutes since local midnight, in `tz`, for the given instant. */
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: goals } = await supa
    .from("bps_monthly_goals")
    .select("id,user_id,belief_submitted_at")
    .not("finance_leads_target", "is", null)
    .not("belief_submitted_at", "is", null);

  const now = new Date();
  const active = (goals ?? []).filter((g: any) => {
    const daysSince = Math.floor((now.getTime() - new Date(g.belief_submitted_at).getTime()) / 86_400_000) + 1;
    return daysSince >= 1 && daysSince <= FINANCE_CYCLE_DAYS;
  });
  if (active.length === 0) {
    return new Response(JSON.stringify({ ok: true, count: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const userIds = Array.from(new Set(active.map((g: any) => g.user_id)));
  const { data: profiles } = await supa.from("profiles").select("id,timezone").in("id", userIds);
  const tzById = new Map((profiles ?? []).map((p: any) => [p.id, p.timezone ?? "Africa/Lagos"]));

  const results: any[] = [];
  for (const g of active as any[]) {
    const tz = tzById.get(g.user_id) ?? "Africa/Lagos";
    const localMinutes = localMinutesOfDay(now, tz);
    const slot = SLOTS.find((s) => localMinutes >= s.startMin && localMinutes < s.endMin);
    if (!slot) continue;

    const today = localDateStr(now, tz);
    const { data: entry } = await supa
      .from("bps_finance_daily_entries").select("id").eq("goal_id", g.id).eq("entry_date", today).maybeSingle();
    if (entry) { results.push({ userId: g.user_id, slot: slot.name, skipped: "already marked" }); continue; }

    const result = await sendWebPush(supa, { user_ids: [g.user_id], category: "bps", title: slot.title, body: slot.body, url: "/bps" });
    results.push({ userId: g.user_id, slot: slot.name, ...result });
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
