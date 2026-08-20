// One-way sync (DBI Citadel -> Google Calendar), first pass. Scoped to
// the dates that exist as real, unambiguous rows in the database:
// Affirmation/Evaluation Goal due dates and the TPE weekly requirement.
// The 45-Day Plan's day-by-day task content lives only in the frontend
// bundle (playbooks/plan.tsx's WEEKS data), not in any table, so it isn't
// duplicated into this Deno function in this pass — extending sync to
// individual plan days would need that data moved server-side first.
//
// Idempotent via each event's extendedProperties.private.dbi_key: a
// second sync updates the same Google event instead of creating a
// duplicate, and a satisfied checkpoint (goal submitted) removes its event.
//
// Called with { user_id } to sync one beneficiary right after they
// connect, or with no body to sweep every connected account (the nightly
// cron does this).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CAL_BASE = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: "refresh_token",
    }),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json.error_description ?? "token refresh failed");
  return json.access_token;
}

async function findEventByKey(accessToken: string, key: string): Promise<any | null> {
  const params = new URLSearchParams({ privateExtendedProperty: `dbi_key=${key}`, maxResults: "1" });
  const res = await fetch(`${CAL_BASE}?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const json: any = await res.json();
  return (json.items ?? [])[0] ?? null;
}

async function upsertEvent(accessToken: string, key: string, event: any) {
  const existing = await findEventByKey(accessToken, key);
  const body = { ...event, extendedProperties: { private: { dbi_key: key } } };
  const url = existing ? `${CAL_BASE}/${existing.id}` : CAL_BASE;
  await fetch(url, {
    method: existing ? "PATCH" : "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function deleteEventByKey(accessToken: string, key: string) {
  const existing = await findEventByKey(accessToken, key);
  if (existing) {
    await fetch(`${CAL_BASE}/${existing.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
  }
}

async function syncOneUser(supa: any, clientId: string, clientSecret: string, profile: any) {
  const accessToken = await refreshAccessToken(profile.google_refresh_token, clientId, clientSecret);

  const { data: goal } = await supa
    .from("bps_monthly_goals")
    .select("id,belief_submitted_at,affirmation_submitted_at,evaluation_submitted_at")
    .eq("user_id", profile.id).order("target_month", { ascending: false }).limit(1).maybeSingle();

  if (goal?.belief_submitted_at) {
    const affirmationDue = new Date(goal.belief_submitted_at); affirmationDue.setDate(affirmationDue.getDate() + 14);
    const evaluationDue = new Date(goal.belief_submitted_at); evaluationDue.setDate(evaluationDue.getDate() + 40);
    const dateOnly = (d: Date) => d.toISOString().slice(0, 10);
    const nextDay = (d: Date) => { const n = new Date(d); n.setDate(n.getDate() + 1); return dateOnly(n); };

    if (goal.affirmation_submitted_at) {
      await deleteEventByKey(accessToken, `bps-affirmation-${goal.id}`);
    } else {
      await upsertEvent(accessToken, `bps-affirmation-${goal.id}`, {
        summary: "DBI — Affirmation Goal due",
        description: "Day 14 of your Financial Goal cycle — submit it in the BPS Monthly Goals tab.",
        start: { date: dateOnly(affirmationDue) }, end: { date: nextDay(affirmationDue) },
      });
    }
    if (goal.evaluation_submitted_at) {
      await deleteEventByKey(accessToken, `bps-evaluation-${goal.id}`);
    } else {
      await upsertEvent(accessToken, `bps-evaluation-${goal.id}`, {
        summary: "DBI — Evaluation Goal due",
        description: "Day 40 of your Financial Goal cycle — submit it in the BPS Monthly Goals tab.",
        start: { date: dateOnly(evaluationDue) }, end: { date: nextDay(evaluationDue) },
      });
    }
  }

  // Standing weekly commitment — one recurring event, never deleted while connected.
  await upsertEvent(accessToken, "tpe-weekly", {
    summary: "DBI — TPE weekly session",
    description: "The Practise of Enterprise: at least one session per week, Monday to Sunday.",
    start: { date: new Date().toISOString().slice(0, 10) },
    end: { date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10) },
    recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"],
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response(JSON.stringify({ ok: false, skipped: "Google OAuth not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore, cron sends no body */ }

  const query = supa.from("profiles").select("id,google_refresh_token").eq("google_calendar_connected", true);
  const { data: profiles } = payload?.user_id ? await query.eq("id", payload.user_id) : await query;

  const results: any[] = [];
  for (const profile of (profiles ?? []) as any[]) {
    if (!profile.google_refresh_token) continue;
    try {
      await syncOneUser(supa, CLIENT_ID, CLIENT_SECRET, profile);
      results.push({ userId: profile.id, ok: true });
    } catch (err: any) {
      results.push({ userId: profile.id, ok: false, error: err?.message });
    }
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
