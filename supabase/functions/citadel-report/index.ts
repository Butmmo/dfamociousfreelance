// Weekly & monthly DBI reports.
// Trigger via pg_cron or manual invocation with { period: "weekly" | "monthly" }.
// Emails are sent via Resend if RESEND_API_KEY is set; otherwise the report is
// written to public.weekly_reports for admin review.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";
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

  let period: "weekly" | "monthly" = "weekly";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.period === "monthly") period = "monthly";
  } catch { /* ignore */ }

  const sinceDays = period === "weekly" ? 7 : 30;
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await supa.from("profiles").select("id,email,full_name,rank,xp");
  const { data: progress } = await supa
    .from("task_progress").select("user_id, playbook_id, completed_at, done")
    .gte("updated_at", since);
  const { data: adminRoles } = await supa.from("user_roles").select("user_id").eq("role", "admin");
  const { data: assignments } = await supa.from("admin_assignments").select("admin_id, beneficiary_id");
  const { data: escalations } = await supa.from("escalations").select("beneficiary_id, level").neq("level", "resolved");

  const adminIds = new Set((adminRoles ?? []).map((r: any) => r.user_id));
  const byBen: Record<string, { done: number; playbooks: Set<string> }> = {};
  for (const row of progress ?? []) {
    if (!row.done) continue;
    const b = (byBen[row.user_id] ||= { done: 0, playbooks: new Set() });
    b.done += 1; b.playbooks.add(row.playbook_id);
  }

  const beneficiaries = (profiles ?? []).filter((p: any) => !adminIds.has(p.id) && (p.email ?? "").toLowerCase() !== SUPER_ADMIN_EMAIL);
  const escLevelByBen: Record<string, string> = {};
  for (const e of escalations ?? []) escLevelByBen[e.beneficiary_id] = e.level;

  const RESEND = Deno.env.get("RESEND_API_KEY");
  const FROM = Deno.env.get("MAIL_FROM") ?? "DBI Citadel <onboarding@resend.dev>";
  const sendEmail = async (to: string, subject: string, html: string) => {
    if (!RESEND) return { skipped: true };
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return { ok: r.ok, status: r.status };
  };

  const wrap = (title: string, body: string) => `
    <div style="font-family:Inter,system-ui,sans-serif;background:#F8F5EE;padding:32px;color:#201A16">
      <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #D4AF37;border-radius:16px;padding:32px">
        <div style="font-family:'Cinzel',serif;font-size:22px;color:#7A5A00;letter-spacing:2px">DBI CITADEL</div>
        <h1 style="font-family:'Cinzel',serif;margin:12px 0 4px">${title}</h1>
        <div style="color:#6E6459;font-size:13px;margin-bottom:24px">${period === "weekly" ? "Weekly" : "Monthly"} report • ${new Date().toDateString()}</div>
        ${body}
        <hr style="border:none;border-top:1px solid #EDE7DA;margin:24px 0"/>
        <div style="font-size:12px;color:#8A7C6D">D'Famocious Business Incubator — Ascend the Ranks.</div>
      </div>
    </div>`;

  const results: any[] = [];

  // 1. Individual beneficiary emails
  for (const b of beneficiaries) {
    const stats = byBen[b.id] ?? { done: 0, playbooks: new Set() };
    const flag = escLevelByBen[b.id];
    const html = wrap(`Your ${period} progress, ${b.full_name ?? "Beneficiary"}`, `
      <p>Here is your snapshot from the last ${sinceDays} days:</p>
      <ul>
        <li><b>Rank:</b> ${b.rank ?? "Recruit"}</li>
        <li><b>Total XP:</b> ${b.xp ?? 0}</li>
        <li><b>Tasks completed this ${period}:</b> ${stats.done}</li>
        <li><b>Playbooks touched:</b> ${stats.playbooks.size}</li>
        ${flag ? `<li><b>Status flag:</b> <span style="color:#B33A3A">${flag}</span> — your DSE Rep will reach out.</li>` : ""}
      </ul>
      <p>Keep the cadence. Small daily reps compound into rank.</p>
    `);
    if (b.email) {
      const r = await sendEmail(b.email, `DBI ${period} report — ${b.full_name ?? "Beneficiary"}`, html);
      results.push({ to: b.email, ...r });
    }
    await supa.from("weekly_reports").insert({
      user_id: b.id, period, payload: { done: stats.done, playbooks: [...stats.playbooks], rank: b.rank, xp: b.xp, flag: flag ?? null },
    });
  }

  // 2. Admin cohort reports (their assigned beneficiaries)
  const admins = (profiles ?? []).filter((p: any) => adminIds.has(p.id));
  const byAdmin: Record<string, any[]> = {};
  for (const a of assignments ?? []) (byAdmin[a.admin_id] ||= []).push(a.beneficiary_id);
  for (const admin of admins) {
    const menteeIds = byAdmin[admin.id] ?? [];
    if (menteeIds.length === 0) continue;
    const rows = menteeIds.map((id) => {
      const p = beneficiaries.find((x: any) => x.id === id);
      const s = byBen[id] ?? { done: 0, playbooks: new Set() };
      return `<tr><td style="padding:8px;border-top:1px solid #EDE7DA">${p?.full_name ?? p?.email ?? id.slice(0,8)}</td><td style="padding:8px;border-top:1px solid #EDE7DA">${p?.rank ?? "—"}</td><td style="padding:8px;border-top:1px solid #EDE7DA">${p?.xp ?? 0}</td><td style="padding:8px;border-top:1px solid #EDE7DA">${s.done}</td><td style="padding:8px;border-top:1px solid #EDE7DA">${escLevelByBen[id] ?? ""}</td></tr>`;
    }).join("");
    const html = wrap(`Your cohort — ${period} snapshot`, `
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr style="text-align:left;color:#6E6459;font-size:12px;text-transform:uppercase;letter-spacing:1px"><th style="padding:8px">Beneficiary</th><th style="padding:8px">Rank</th><th style="padding:8px">XP</th><th style="padding:8px">Done</th><th style="padding:8px">Flag</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px">Reach out to anyone flagged; log a check-in inside the Council console.</p>
    `);
    if (admin.email) results.push({ to: admin.email, ...(await sendEmail(admin.email, `DBI ${period} cohort report`, html)) });
  }

  // 3. Super admin — full citadel roll-up
  const totalDone = Object.values(byBen).reduce((n, x) => n + x.done, 0);
  const flagged = Object.keys(escLevelByBen).length;
  const superHtml = wrap(`Citadel ${period} roll-up`, `
    <ul>
      <li><b>Total beneficiaries:</b> ${beneficiaries.length}</li>
      <li><b>Active this ${period}:</b> ${Object.keys(byBen).length}</li>
      <li><b>Tasks completed:</b> ${totalDone}</li>
      <li><b>Open escalations:</b> ${flagged}</li>
      <li><b>Admins:</b> ${admins.length}</li>
    </ul>
    <p>Full breakdown available in the Council console.</p>
  `);
  results.push({ to: SUPER_ADMIN_EMAIL, ...(await sendEmail(SUPER_ADMIN_EMAIL, `DBI ${period} Citadel roll-up`, superHtml)) });

  // 4. Auto-escalate silent beneficiaries (weekly only)
  if (period === "weekly") {
    for (const b of beneficiaries) {
      const stats = byBen[b.id];
      if ((!stats || stats.done === 0) && !escLevelByBen[b.id]) {
        await supa.from("escalations").insert({
          beneficiary_id: b.id, level: "at_risk",
          reason: `No completions in the last ${sinceDays} days (auto-flagged by weekly report).`,
        });
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, period, sent: results.length, resend_configured: !!RESEND }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
