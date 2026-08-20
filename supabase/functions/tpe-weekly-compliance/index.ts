// Weekly sweep, same Monday-morning rhythm as bps-weekly-report: at least
// one TPE session (playbook = "tpe" in task_progress) must be listened
// per Mon-Sun week, compulsory as of the week of 2026-08-24. A beneficiary
// who misses a week gets flagged — profiles.tpe_defaulting_since/until —
// for 12 months. This is a visibility signal, not a fine: no score change,
// no suspension, per the same BEF-framework reasoning that removed the
// escalation fines. Once flagged, the 12-month window isn't reset by
// further missed weeks while it's still active.
//
// Reports through all three required channels, same order as every other
// beneficiary-facing report in this app: a self-generated chat message,
// then the mentee's activity feed, then email — plus push.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";
const COMPULSORY_FROM = "2026-08-24"; // the first Monday this requirement applies to
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday-Sunday of the week that ended most recently before `now`. */
function lastCompletedWeek(now: Date): { start: Date; end: Date } {
  const day = now.getUTCDay();
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

  const now = new Date();
  const { start, end } = lastCompletedWeek(now);
  const weekStart = isoDate(start);
  const weekEnd = isoDate(end);

  if (weekStart < COMPULSORY_FROM) {
    return new Response(JSON.stringify({ ok: true, skipped: `week ${weekStart} is before the ${COMPULSORY_FROM} compulsory start` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: adminRoles } = await supa.from("user_roles").select("user_id").eq("role", "admin");
  const adminIds = new Set((adminRoles ?? []).map((r: any) => r.user_id));
  const { data: allProfiles } = await supa.from("profiles").select("id,full_name,sponsor_name,tpe_defaulting_until");
  const beneficiaries = (allProfiles ?? []).filter((p: any) => !adminIds.has(p.id));

  const results: any[] = [];

  for (const b of beneficiaries) {
    const { data: heard } = await supa
      .from("task_progress").select("id")
      .eq("user_id", b.id).eq("playbook", "tpe").eq("completed", true)
      .gte("completed_at", start.toISOString()).lte("completed_at", new Date(end.getTime() + 86_399_999).toISOString())
      .limit(1);
    if ((heard ?? []).length > 0) { results.push({ userId: b.id, ok: true }); continue; }

    const alreadyFlagged = b.tpe_defaulting_until && new Date(b.tpe_defaulting_until) >= now;
    if (alreadyFlagged) { results.push({ userId: b.id, skipped: "already flagged" }); continue; }

    const until = new Date(now); until.setFullYear(until.getFullYear() + 1);
    await supa.from("profiles").update({
      tpe_defaulting_since: isoDate(now), tpe_defaulting_until: isoDate(until),
    }).eq("id", b.id);

    // Same recipient resolution as bps-weekly-report: active mentor, fuzzy-matched sponsor, DSE Rep or founder fallback.
    const recipientIds = new Set<string>();
    const recipientEmails = new Set<string>();
    const { data: mentorship } = await supa.from("mentorships").select("mentor_id").eq("mentee_id", b.id).eq("status", "active").maybeSingle();
    if (mentorship?.mentor_id) {
      const { data: mentor } = await supa.from("profiles").select("id,email").eq("id", mentorship.mentor_id).maybeSingle();
      if (mentor?.id) { recipientIds.add(mentor.id); if (mentor.email) recipientEmails.add(mentor.email); }
    }
    if (b.sponsor_name) {
      const { data: sponsor } = await supa.from("profiles").select("id,email").ilike("full_name", b.sponsor_name).maybeSingle();
      if (sponsor?.id) { recipientIds.add(sponsor.id); if (sponsor.email) recipientEmails.add(sponsor.email); }
    }
    const { data: assignment } = await supa.from("admin_assignments").select("admin_id").eq("beneficiary_id", b.id).maybeSingle();
    if (assignment?.admin_id) {
      const { data: rep } = await supa.from("profiles").select("id,email").eq("id", assignment.admin_id).maybeSingle();
      if (rep?.id) { recipientIds.add(rep.id); if (rep.email) recipientEmails.add(rep.email); }
    } else {
      const { data: superAdmin } = await supa.from("profiles").select("id,email").eq("email", SUPER_ADMIN_EMAIL).maybeSingle();
      if (superAdmin?.id) { recipientIds.add(superAdmin.id); if (superAdmin.email) recipientEmails.add(superAdmin.email); }
    }

    const title = "The Practise of Enterprise — weekly session missed";
    const body = `${b.full_name ?? "This beneficiary"} did not listen to a TPE session for the week of ${weekStart} to ${weekEnd}. Flagged as defaulting until ${isoDate(until)} — visible to you, not a fine.`;

    if (recipientIds.size > 0) {
      await supa.from("direct_messages").insert(
        Array.from(recipientIds).map((recipient_id) => ({ sender_id: b.id, recipient_id, body: `📊 ${title}\n\n${body}` })),
      );
    }
    await supa.from("mentee_activity_feed").insert({ mentee_id: b.id, kind: "tpe_default", title, body });

    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;background:#F8F5EE;padding:32px;color:#201A16">
        <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #8B0000;border-radius:16px;padding:32px">
          <div style="font-family:'Cinzel',serif;font-size:22px;color:#7A5A00;letter-spacing:2px">DBI CITADEL</div>
          <h1 style="font-family:'Cinzel',serif;margin:12px 0 4px;color:#8B0000">${title}</h1>
          <p style="color:#201A16">${body}</p>
          <hr style="border:none;border-top:1px solid #EDE7DA;margin:24px 0"/>
          <div style="font-size:12px;color:#8A7C6D">Already posted as a message and to the mentee's activity feed — this email is the third channel, not the only one.</div>
        </div>
      </div>`;
    const [emailResult, pushResult] = await Promise.all([
      sendEmail(Array.from(recipientEmails), title, html),
      sendWebPush(supa, { user_ids: Array.from(recipientIds), category: "admin", title, body, url: "/bps" }),
    ]);

    results.push({ userId: b.id, flagged: true, email: emailResult, push: pushResult });
  }

  return new Response(JSON.stringify({ weekStart, weekEnd, count: beneficiaries.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
