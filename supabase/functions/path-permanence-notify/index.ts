// Fires exactly once per beneficiary, the moment their one-time 48h
// path-revision window closes: a "your path is now permanent" notice, plus
// a nudge to set next month's BPS goals by the 1st. Runs every 15 minutes,
// checking every beneficiary with an open, unfired window against the
// clock — path_permanence_notified_at is stamped immediately after firing
// so this never repeats for the same beneficiary.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const REVISION_WINDOW_HOURS = 48;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function nextMonthFirstLabel(now: Date): string {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profiles } = await supa
    .from("profiles")
    .select("id,path_first_chosen_at")
    .not("path_key", "is", null)
    .not("path_first_chosen_at", "is", null)
    .is("path_permanence_notified_at", null);

  const now = new Date();
  const due = ((profiles ?? []) as any[]).filter((p) => {
    const closesAt = new Date(p.path_first_chosen_at).getTime() + REVISION_WINDOW_HOURS * 3_600_000;
    return now.getTime() >= closesAt;
  });

  const results: any[] = [];
  for (const p of due) {
    await sendWebPush(supa, {
      user_ids: [p.id], category: "bps",
      title: "Your path is now permanent",
      body: "The 48-hour revision window has closed. Your chosen path is locked in for the rest of your run in the Citadel.",
      url: "/dashboard",
    });
    await sendWebPush(supa, {
      user_ids: [p.id], category: "bps",
      title: "Set your BPS goals",
      body: `Set your Belief Goal for next month by ${nextMonthFirstLabel(now)} — the Productivity Scheme runs on it from day one.`,
      url: "/bps",
    });
    await supa.from("profiles").update({ path_permanence_notified_at: now.toISOString() }).eq("id", p.id);
    results.push({ userId: p.id });
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
