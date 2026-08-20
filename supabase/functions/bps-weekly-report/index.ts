// The Blazer Productivity Scheme's weekly auto-report — bps-cadence.md's
// weekly rhythm made real: fired every Monday by pg_cron, this scores the
// Monday-Sunday week that just ended against each beneficiary's currently
// active Belief Goal activities, writes one bps_weekly_reports row per
// beneficiary (the only writer that table has — never the client), and
// emails the beneficiary's mentor, sponsor (if the sponsor's name matches
// a registered profile), and DSE Rep — or the founder/super admin if no
// Rep is assigned yet. The report itself lives on the beneficiary's own
// BPS tracker page the moment this insert lands; nothing here is manual.
// Same fire-and-forget net.http_post + Resend pattern as citadel-report
// and mentorship-escalation-notify.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday-Sunday of the week that ended most recently before `now`. */
function lastCompletedWeek(now: Date): { start: Date; end: Date } {
  const day = now.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const daysSinceMonday = (day + 6) % 7;
  const thisMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  const start = new Date(thisMonday); start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date(thisMonday); end.setUTCDate(end.getUTCDate() - 1);
  return { start, end };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const RESEND = Deno.env.get("RESEND_API_KEY");
  const FROM = Deno.env.get("MAIL_FROM") ?? "DBI Citadel <onboarding@resend.dev>";
  const sendEmail = async (to: string[], subject: string, html: string) => {
    if (!RESEND || to.length === 0) return { skipped: true };
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return { ok: r.ok, status: r.status };
  };

  const wrap = (title: string, accent: string, body: string) => `
    <div style="font-family:Inter,system-ui,sans-serif;background:#F8F5EE;padding:32px;color:#201A16">
      <div style="max-width:640px;margin:auto;background:#fff;border:1px solid ${accent};border-radius:16px;padding:32px">
        <div style="font-family:'Cinzel',serif;font-size:22px;color:#7A5A00;letter-spacing:2px">DBI CITADEL</div>
        <h1 style="font-family:'Cinzel',serif;margin:12px 0 4px;color:${accent}">${title}</h1>
        <div style="color:#6E6459;font-size:13px;margin-bottom:24px">Blazer Productivity Scheme • weekly cadence</div>
        ${body}
        <hr style="border:none;border-top:1px solid #EDE7DA;margin:24px 0"/>
        <div style="font-size:12px;color:#8A7C6D">Every Monday, automatically — nothing here was typed in by hand.</div>
      </div>
    </div>`;

  const cadenceNote = (percent: number) => {
    if (percent >= 80) return "Excellent cadence — the binary tracker shows a beneficiary who is doing the work.";
    if (percent >= 50) return "Steady but inconsistent cadence — worth a check-in on what's slipping.";
    return "Weak cadence this week — this beneficiary likely needs support or a direct conversation.";
  };

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore, cron sends no body */ }

  const now = new Date();
  const { start, end } = payload?.week_start
    ? { start: new Date(payload.week_start), end: (() => { const d = new Date(payload.week_start); d.setUTCDate(d.getUTCDate() + 6); return d; })() }
    : lastCompletedWeek(now);
  const weekStart = isoDate(start);
  const weekEnd = isoDate(end);
  const rangeEndExclusive = isoDate(new Date(end.getTime() + 86_400_000));

  const results: any[] = [];

  // Every beneficiary with at least one currently-active tracked activity.
  const { data: activeActivities } = await supa
    .from("bps_activities").select("user_id, goal_id").eq("active", true);
  const userIds = Array.from(new Set((activeActivities ?? []).map((a: any) => a.user_id).filter(Boolean)));

  for (const userId of userIds) {
    const { data: existing } = await supa
      .from("bps_weekly_reports").select("id").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
    if (existing) { results.push({ userId, skipped: "already reported" }); continue; }

    const { data: goal } = await supa
      .from("bps_monthly_goals").select("id").eq("user_id", userId).order("target_month", { ascending: false }).limit(1).maybeSingle();
    if (!goal) { results.push({ userId, skipped: "no goal" }); continue; }

    const { data: activities } = await supa
      .from("bps_activities").select("id").eq("goal_id", goal.id).eq("active", true);
    const activityIds = (activities ?? []).map((a: any) => a.id);
    const activitiesTotal = activityIds.length * 7;

    let activitiesDone = 0;
    if (activityIds.length > 0) {
      const { data: checks } = await supa
        .from("bps_daily_checks").select("done")
        .in("activity_id", activityIds).eq("done", true)
        .gte("check_date", weekStart).lt("check_date", rangeEndExclusive);
      activitiesDone = (checks ?? []).length;
    }
    const percent = activitiesTotal > 0 ? (activitiesDone / activitiesTotal) * 100 : 0;

    const { data: beneficiary } = await supa
      .from("profiles").select("id,full_name,email,sponsor_name").eq("id", userId).maybeSingle();

    const recipientEmails = new Set<string>();
    const recipientIds = new Set<string>();

    const { data: mentorship } = await supa
      .from("mentorships").select("mentor_id").eq("mentee_id", userId).eq("status", "active").maybeSingle();
    if (mentorship?.mentor_id) {
      const { data: mentor } = await supa.from("profiles").select("id,email").eq("id", mentorship.mentor_id).maybeSingle();
      if (mentor?.email) recipientEmails.add(mentor.email);
      if (mentor?.id) recipientIds.add(mentor.id);
    }

    if (beneficiary?.sponsor_name) {
      const { data: sponsorMatch } = await supa
        .from("profiles").select("id,email").ilike("full_name", beneficiary.sponsor_name).maybeSingle();
      if (sponsorMatch?.email) recipientEmails.add(sponsorMatch.email);
      if (sponsorMatch?.id) recipientIds.add(sponsorMatch.id);
    }

    let notifiedRep = false;
    const { data: assignment } = await supa
      .from("admin_assignments").select("admin_id").eq("beneficiary_id", userId).maybeSingle();
    if (assignment?.admin_id) {
      const { data: rep } = await supa.from("profiles").select("id,email").eq("id", assignment.admin_id).maybeSingle();
      if (rep?.email) { recipientEmails.add(rep.email); notifiedRep = true; }
      if (rep?.id) recipientIds.add(rep.id);
    } else {
      recipientEmails.add(SUPER_ADMIN_EMAIL);
      const { data: superAdmin } = await supa.from("profiles").select("id").eq("email", SUPER_ADMIN_EMAIL).maybeSingle();
      if (superAdmin?.id) recipientIds.add(superAdmin.id);
      notifiedRep = true;
    }

    // Report channel order: self-generated chat message first, then the
    // mentee's activity feed, then email last — never email-only.
    const reportTitle = `Weekly BPS cadence — ${percent.toFixed(0)}%`;
    const reportBody = `${beneficiary?.full_name ?? "This beneficiary"}'s week (${weekStart} to ${weekEnd}): ${activitiesDone}/${activitiesTotal} activities (${percent.toFixed(1)}%).\n${cadenceNote(percent)}`;
    const chatRecipientIds = Array.from(recipientIds);
    if (chatRecipientIds.length > 0) {
      await supa.from("direct_messages").insert(
        chatRecipientIds.map((recipient_id: string) => ({
          sender_id: userId, recipient_id, body: `📊 ${reportTitle}\n\n${reportBody}`,
        })),
      );
    }
    await supa.from("mentee_activity_feed").insert({
      mentee_id: userId, kind: "bps_weekly_report", title: reportTitle, body: reportBody,
    });

    const html = wrap(
      `${beneficiary?.full_name ?? "A beneficiary"}'s week: ${activitiesDone}/${activitiesTotal} (${percent.toFixed(1)}%)`,
      "#B8860B",
      `<p>Belief Goal cadence for <b>${weekStart}</b> through <b>${weekEnd}</b>.</p>
       <p style="color:#6E6459">${cadenceNote(percent)}</p>
       <p>Full detail is on their BPS tracker page — nothing to file, this posted itself.</p>`,
    );
    const emailResult = await sendEmail(Array.from(recipientEmails), `BPS weekly cadence — ${beneficiary?.full_name ?? "beneficiary"} (${percent.toFixed(0)}%)`, html);
    recipientIds.add(userId);
    const pushResult = await sendWebPush(supa, {
      user_ids: Array.from(recipientIds),
      category: "bps",
      title: `Weekly cadence: ${percent.toFixed(0)}%`,
      body: `${beneficiary?.full_name ?? "Beneficiary"} — ${activitiesDone}/${activitiesTotal} for ${weekStart} to ${weekEnd}.`,
      url: "/bps",
    });

    const { error: insertError } = await supa.from("bps_weekly_reports").insert({
      user_id: userId,
      goal_id: goal.id,
      week_start: weekStart,
      week_end: weekEnd,
      activities_done: activitiesDone,
      activities_total: activitiesTotal,
      percent,
      notified_mentor: !!mentorship?.mentor_id,
      notified_rep: notifiedRep,
    });
    if (insertError) { results.push({ userId, error: insertError.message }); continue; }

    results.push({ userId, activitiesDone, activitiesTotal, percent, email: emailResult, push: pushResult });
  }

  return new Response(JSON.stringify({ weekStart, weekEnd, count: userIds.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
