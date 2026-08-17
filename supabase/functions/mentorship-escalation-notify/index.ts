// Mentor-reported "structural shock" escalations — the 48-72h SLA
// notification layer. Two invocation shapes:
//   { reason: "raised", escalation_id }  — fired instantly by the
//     notify_mentorship_escalation trigger the moment a mentor raises one.
//   { reason: "sweep" }                  — fired hourly by pg_cron; finds
//     every unacknowledged escalation and sends the 48h reminder or 72h
//     breach alert exactly once each, guarded by reminder_48h_sent_at /
//     breach_72h_sent_at so the hourly sweep never repeats itself.
// Emails via Resend if RESEND_API_KEY is set, same as citadel-report;
// otherwise this still runs and just skips sending.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";
const SLA_REMINDER_HOURS = 48;
const SLA_BREACH_HOURS = 72;
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
        <div style="color:#6E6459;font-size:13px;margin-bottom:24px">Mentorship escalation • ${new Date().toDateString()}</div>
        ${body}
        <hr style="border:none;border-top:1px solid #EDE7DA;margin:24px 0"/>
        <div style="font-size:12px;color:#8A7C6D">Leadership by Influence — the mentor's structural-shock reporting channel.</div>
      </div>
    </div>`;

  const getAdminEmails = async () => {
    const { data: adminRoles } = await supa.from("user_roles").select("user_id").eq("role", "admin");
    const ids = (adminRoles ?? []).map((r: any) => r.user_id);
    if (ids.length === 0) return [SUPER_ADMIN_EMAIL];
    const { data: admins } = await supa.from("profiles").select("email").in("id", ids);
    const emails = new Set((admins ?? []).map((a: any) => a.email).filter(Boolean));
    emails.add(SUPER_ADMIN_EMAIL);
    return Array.from(emails);
  };

  const describeEscalation = async (esc: any) => {
    const { data: mentorship } = await supa
      .from("mentorships").select("mentor_id,mentee_id").eq("id", esc.mentorship_id).maybeSingle();
    const ids = [esc.raised_by, mentorship?.mentor_id, mentorship?.mentee_id].filter(Boolean);
    const { data: people } = await supa.from("profiles").select("id,full_name,email").in("id", ids);
    const byId = new Map((people ?? []).map((p: any) => [p.id, p]));
    return {
      mentor: byId.get(mentorship?.mentor_id),
      mentee: byId.get(mentorship?.mentee_id),
      reporter: byId.get(esc.raised_by),
    };
  };

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }
  const reason = payload?.reason === "sweep" ? "sweep" : "raised";
  const results: any[] = [];

  if (reason === "raised") {
    const { data: esc } = await supa
      .from("mentorship_escalations").select("*").eq("id", payload.escalation_id).maybeSingle();
    if (esc) {
      const { mentor, mentee, reporter } = await describeEscalation(esc);
      const admins = await getAdminEmails();
      const html = wrap("New Escalation Raised", "#B8860B", `
        <p><b>${reporter?.full_name ?? "A mentor"}</b> flagged a support-chain problem for the mentorship between
        <b>${mentor?.full_name ?? "mentor"}</b> and <b>${mentee?.full_name ?? "mentee"}</b>.</p>
        <blockquote style="border-left:3px solid #B8860B;padding-left:12px;color:#6E6459;margin:16px 0">${esc.description}</blockquote>
        <p>Standard: acknowledge within ${SLA_REMINDER_HOURS}-${SLA_BREACH_HOURS} hours, then classify as Acceptable, Correctable, or
        Disciplinary before deciding next steps. Reassigning the mentee to a different Rep is always available regardless
        of classification.</p>
        <p>Open the Council's Mentorship console to acknowledge this now.</p>
      `);
      results.push(await sendEmail(admins, "New mentorship escalation raised", html));
    }
  } else {
    const cutoffReminder = new Date(Date.now() - SLA_REMINDER_HOURS * 3_600_000).toISOString();
    const cutoffBreach = new Date(Date.now() - SLA_BREACH_HOURS * 3_600_000).toISOString();
    const admins = await getAdminEmails();

    const { data: dueReminder } = await supa
      .from("mentorship_escalations").select("*")
      .is("acknowledged_at", null).is("reminder_48h_sent_at", null).lte("raised_at", cutoffReminder);
    for (const esc of dueReminder ?? []) {
      const { mentor, mentee } = await describeEscalation(esc);
      const html = wrap("Escalation Awaiting Acknowledgment", "#D97706", `
        <p>An escalation between <b>${mentor?.full_name ?? "mentor"}</b> and <b>${mentee?.full_name ?? "mentee"}</b>
        has gone ${SLA_REMINDER_HOURS} hours without acknowledgment.</p>
        <blockquote style="border-left:3px solid #D97706;padding-left:12px;color:#6E6459;margin:16px 0">${esc.description}</blockquote>
        <p>Please acknowledge and classify it in the Council's Mentorship console — ${SLA_BREACH_HOURS - SLA_REMINDER_HOURS} hours remain before this breaches SLA.</p>
      `);
      results.push(await sendEmail(admins, "Reminder: escalation awaiting acknowledgment", html));
      await supa.from("mentorship_escalations").update({ reminder_48h_sent_at: new Date().toISOString() }).eq("id", esc.id);
    }

    const { data: dueBreach } = await supa
      .from("mentorship_escalations").select("*")
      .is("acknowledged_at", null).is("breach_72h_sent_at", null).lte("raised_at", cutoffBreach);
    for (const esc of dueBreach ?? []) {
      const { mentor, mentee } = await describeEscalation(esc);
      const html = wrap("SLA BREACHED — Escalation Unacknowledged", "#8B0000", `
        <p><b>This escalation has now gone ${SLA_BREACH_HOURS} hours without acknowledgment — the SLA is breached.</b></p>
        <p>Between <b>${mentor?.full_name ?? "mentor"}</b> and <b>${mentee?.full_name ?? "mentee"}</b>:</p>
        <blockquote style="border-left:3px solid #8B0000;padding-left:12px;color:#6E6459;margin:16px 0">${esc.description}</blockquote>
        <p>This needs immediate attention in the Council's Mentorship console.</p>
      `);
      results.push(await sendEmail(admins, "SLA BREACHED — mentorship escalation unacknowledged", html));
      await supa.from("mentorship_escalations").update({ breach_72h_sent_at: new Date().toISOString() }).eq("id", esc.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, reason, sent: results.length, resend_configured: !!RESEND }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
