// Same four daily slots as bps-daily-checkin (7am/1pm/7:30pm/10pm, each
// user's own local time) but for a different audience and purpose: anyone
// with a chosen path gets a nudge about that day's 45/60-day implementation
// playbook tasks, independent of whether they've even started tracking a
// BPS Belief Goal yet. Runs every 15 minutes; at most one slot fires per
// user per tick, and only while they're inside their playbook's active run
// (day 1 through day 60 from profiles.start_date).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLOTS = [
  { name: "morning", startMin: 7 * 60, endMin: 7 * 60 + 14 },
  { name: "midday", startMin: 13 * 60, endMin: 13 * 60 + 14 },
  { name: "evening", startMin: 19 * 60 + 30, endMin: 19 * 60 + 44 },
  { name: "final", startMin: 22 * 60, endMin: 22 * 60 + 14 },
];

const MAX_DAY = 60;

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

/** Whole days between two YYYY-MM-DD local date strings (start counts as day 1). */
function dayNumber(startDateStr: string, todayStr: string): number {
  const start = new Date(startDateStr + "T00:00:00Z").getTime();
  const today = new Date(todayStr + "T00:00:00Z").getTime();
  return Math.floor((today - start) / 86_400_000) + 1;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profiles } = await supa
    .from("profiles")
    .select("id,start_date,created_at,timezone")
    .not("path_key", "is", null);

  const now = new Date();
  const results: any[] = [];

  for (const p of (profiles ?? []) as any[]) {
    const tz = p.timezone ?? "Africa/Lagos";
    const today = localDateStr(now, tz);
    const startStr = (p.start_date ?? p.created_at ?? today).slice(0, 10);
    const day = dayNumber(startStr, today);
    if (day < 1 || day > MAX_DAY) continue;

    const localMinutes = localMinutesOfDay(now, tz);
    const slot = SLOTS.find((s) => localMinutes >= s.startMin && localMinutes < s.endMin);
    if (!slot) continue;

    const result = await sendWebPush(supa, {
      user_ids: [p.id], category: "general",
      title: `Day ${day} — your playbook tasks are up`,
      body: "Open your Calendar to check off today's 45/60-day implementation tasks before the day locks.",
      url: "/calendar",
    });
    results.push({ userId: p.id, day, slot: slot.name, ...result });
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
