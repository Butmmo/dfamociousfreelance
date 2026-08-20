// Emergency Pocket withdrawal requests — the Rep -> Sponsor/Mentor ->
// Founder escalation ladder. Two invocation shapes:
//   { reason: "raised", request_id }  — fired instantly by the
//     notify_pocket_withdrawal trigger the moment a beneficiary proposes one.
//   { reason: "sweep" }               — fired hourly by pg_cron; escalates
//     anything still pending 48h at "rep" to "sponsor_mentor", and anything
//     still pending 48h after that to "founder". Idempotent by construction:
//     once a row's escalation_level changes it stops matching the query for
//     the level it just left.
// Emails via Resend if RESEND_API_KEY is set, same as citadel-report;
// otherwise this still runs and just skips sending.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";
const SLA_HOURS = 48;
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
        <div style="color:#6E6459;font-size:13px;margin-bottom:24px">NBO Pocket System • Emergency Pocket • ${new Date().toDateString()}</div>
        ${body}
        <hr style="border:none;border-top:1px solid #EDE7DA;margin:24px 0"/>
        <div style="font-size:12px;color:#8A7C6D">The Emergency Pocket — short-term, Rep-approved, escalating to Sponsor/Mentor then Founder if stalled.</div>
      </div>
    </div>`;

  const superAdminId = async () => {
    const { data } = await supa.from("profiles").select("id").eq("email", SUPER_ADMIN_EMAIL).maybeSingle();
    return data?.id ?? null;
  };

  /** Rep = the beneficiary's assigned admin_assignments row, falling back to the founder. */
  const resolveRep = async (userId: string) => {
    const { data: assignment } = await supa.from("admin_assignments").select("admin_id").eq("beneficiary_id", userId).maybeSingle();
    const founder = await superAdminId();
    const ids = new Set<string>();
    if (assignment?.admin_id) ids.add(assignment.admin_id); else if (founder) ids.add(founder);
    ids.delete(userId);
    return Array.from(ids);
  };

  /** Sponsor (fuzzy name match) + active mentor. */
  const resolveSponsorMentor = async (userId: string) => {
    const ids = new Set<string>();
    const { data: mentorship } = await supa.from("mentorships").select("mentor_id").eq("mentee_id", userId).eq("status", "active").maybeSingle();
    if (mentorship?.mentor_id) ids.add(mentorship.mentor_id);
    const { data: profile } = await supa.from("profiles").select("sponsor_name").eq("id", userId).maybeSingle();
    if (profile?.sponsor_name) {
      const { data: sponsorMatch } = await supa.from("profiles").select("id").ilike("full_name", profile.sponsor_name).maybeSingle();
      if (sponsorMatch?.id) ids.add(sponsorMatch.id);
    }
    ids.delete(userId);
    return Array.from(ids);
  };

  const resolveFounder = async (userId: string) => {
    const founder = await superAdminId();
    return founder && founder !== userId ? [founder] : [];
  };

  const emailsFor = async (ids: string[]) => {
    if (ids.length === 0) return [];
    const { data } = await supa.from("profiles").select("email").in("id", ids);
    return (data ?? []).map((p: any) => p.email).filter(Boolean);
  };

  const notify = async (ids: string[], title: string, body: string, url: string, subject: string, html: string) => {
    const emails = await emailsFor(ids);
    const results: any[] = [];
    results.push(await sendEmail(emails, subject, html));
    results.push(await sendWebPush(supa, { user_ids: ids, category: "pocket", title, body, url }));
    return results;
  };

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }
  const reason = payload?.reason === "sweep" ? "sweep" : "raised";
  const results: any[] = [];

  const describeBeneficiary = async (userId: string) => {
    const { data } = await supa.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
    return data;
  };

  if (reason === "raised") {
    const { data: reqRow } = await supa.from("emergency_withdrawal_requests").select("*").eq("id", payload.request_id).maybeSingle();
    if (reqRow) {
      const beneficiary = await describeBeneficiary(reqRow.user_id);
      const repIds = await resolveRep(reqRow.user_id);
      const html = wrap("Emergency Withdrawal Requested", "#B8860B", `
        <p><b>${beneficiary?.full_name ?? "A beneficiary"}</b> is requesting <b>$${Number(reqRow.amount_usd).toFixed(2)}</b> from their Emergency Pocket.</p>
        <blockquote style="border-left:3px solid #B8860B;padding-left:12px;color:#6E6459;margin:16px 0">${reqRow.reason}</blockquote>
        <p>As their Rep, please review within ${SLA_HOURS} hours — after that it escalates to their Sponsor/Mentor.</p>
      `);
      results.push(...await notify(
        repIds, "Emergency Pocket withdrawal requested",
        `${beneficiary?.full_name ?? "A beneficiary"} requested $${Number(reqRow.amount_usd).toFixed(2)} from their Emergency Pocket.`,
        "/council-escalations", "Emergency Pocket withdrawal requested", html,
      ));
    }
  } else {
    const cutoff = new Date(Date.now() - SLA_HOURS * 3_600_000).toISOString();

    const { data: stalledAtRep } = await supa
      .from("emergency_withdrawal_requests").select("*")
      .eq("status", "pending").eq("escalation_level", "rep").lte("requested_at", cutoff);
    for (const reqRow of stalledAtRep ?? []) {
      const beneficiary = await describeBeneficiary(reqRow.user_id);
      const sponsorMentorIds = await resolveSponsorMentor(reqRow.user_id);
      const html = wrap("Emergency Withdrawal Escalated to You", "#D97706", `
        <p>Their Rep hasn't acted within ${SLA_HOURS} hours on <b>${beneficiary?.full_name ?? "a beneficiary"}</b>'s Emergency Pocket
        request for <b>$${Number(reqRow.amount_usd).toFixed(2)}</b> — it now needs Sponsor/Mentor review.</p>
        <blockquote style="border-left:3px solid #D97706;padding-left:12px;color:#6E6459;margin:16px 0">${reqRow.reason}</blockquote>
        <p>If this also stalls ${SLA_HOURS} hours, it escalates to the Founder.</p>
      `);
      results.push(...await notify(
        sponsorMentorIds, "Emergency Pocket request escalated to you",
        `${beneficiary?.full_name ?? "A beneficiary"}'s $${Number(reqRow.amount_usd).toFixed(2)} request needs Sponsor/Mentor review — the Rep didn't act in time.`,
        "/council-escalations", "Emergency Pocket withdrawal escalated to Sponsor/Mentor", html,
      ));
      await supa.from("emergency_withdrawal_requests").update({
        escalation_level: "sponsor_mentor", rep_escalated_at: new Date().toISOString(),
      }).eq("id", reqRow.id);
    }

    const { data: stalledAtSponsorMentor } = await supa
      .from("emergency_withdrawal_requests").select("*")
      .eq("status", "pending").eq("escalation_level", "sponsor_mentor").lte("rep_escalated_at", cutoff);
    for (const reqRow of stalledAtSponsorMentor ?? []) {
      const beneficiary = await describeBeneficiary(reqRow.user_id);
      const founderIds = await resolveFounder(reqRow.user_id);
      const html = wrap("SLA BREACHED — Escalated to Founder", "#8B0000", `
        <p><b>Neither the Rep nor Sponsor/Mentor acted on ${beneficiary?.full_name ?? "a beneficiary"}'s Emergency Pocket
        request for $${Number(reqRow.amount_usd).toFixed(2)} — this now needs your direct attention.</b></p>
        <blockquote style="border-left:3px solid #8B0000;padding-left:12px;color:#6E6459;margin:16px 0">${reqRow.reason}</blockquote>
      `);
      results.push(...await notify(
        founderIds, "SLA BREACHED — Emergency Pocket request needs Founder review",
        `${beneficiary?.full_name ?? "A beneficiary"}'s $${Number(reqRow.amount_usd).toFixed(2)} request stalled twice — needs Founder attention.`,
        "/council-escalations", "SLA BREACHED — Emergency Pocket withdrawal needs Founder review", html,
      ));
      await supa.from("emergency_withdrawal_requests").update({
        escalation_level: "founder", second_escalated_at: new Date().toISOString(),
      }).eq("id", reqRow.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, reason, sent: results.length, resend_configured: !!RESEND }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
