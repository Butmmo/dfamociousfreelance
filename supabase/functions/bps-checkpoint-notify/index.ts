// The third of the three required report channels for a BPS Financial
// Goal checkpoint (day 14 / Affirmation, day 40 / Evaluation) — the chat
// message and mentee-activity-feed entry are already written directly by
// submitAffirmationGoal/submitEvaluationGoal (src/lib/bps.functions.ts)
// before this fires; this is email plus push, never email-only. Same
// fire-and-forget fetch pattern every other notification-worthy trigger
// in this app already uses.

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

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }
  const { checkpoint, title, body, recipient_ids } = payload ?? {};
  const recipientIds: string[] = Array.isArray(recipient_ids) ? recipient_ids : [];
  if (recipientIds.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: "no recipients" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

  const { data: recipients } = await supa.from("profiles").select("email").in("id", recipientIds);
  const emails = (recipients ?? []).map((r: any) => r.email).filter(Boolean);

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;background:#F8F5EE;padding:32px;color:#201A16">
      <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #B8860B;border-radius:16px;padding:32px">
        <div style="font-family:'Cinzel',serif;font-size:22px;color:#7A5A00;letter-spacing:2px">DBI CITADEL</div>
        <h1 style="font-family:'Cinzel',serif;margin:12px 0 4px;color:#B8860B">${title}</h1>
        <div style="color:#6E6459;font-size:13px;margin-bottom:24px">Blazer Productivity Scheme — ${checkpoint ?? ""} checkpoint</div>
        <p style="white-space:pre-line;color:#201A16">${body}</p>
        <hr style="border:none;border-top:1px solid #EDE7DA;margin:24px 0"/>
        <div style="font-size:12px;color:#8A7C6D">Already posted as a message and to the mentee's activity feed — this email is the third channel, not the only one.</div>
      </div>
    </div>`;

  const [emailResult, pushResult] = await Promise.all([
    sendEmail(emails, title, html),
    sendWebPush(supa, { user_ids: recipientIds, category: "bps", title, body, url: "/bps" }),
  ]);

  return new Response(JSON.stringify({ ok: true, email: emailResult, push: pushResult }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
