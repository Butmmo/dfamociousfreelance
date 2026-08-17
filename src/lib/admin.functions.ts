import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { pickWeightedMentor, MENTOR_SOFT_CAP, AUTO_ASSIGN_AFTER_DAYS } from "@/lib/mentorship";

const SUPER_ADMIN_EMAIL = "boluwatifefamokunwa@gmail.com";

async function requireAdmin(context: any) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden: admin only");
}
async function requireSuperAdmin(context: any) {
  const { data: isSuper } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
  if (!isSuper) throw new Error("Forbidden: super admin only");
}

const inviteSchema = z.object({
  email: z.string().trim().email().max(255),
  full_name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["admin", "beneficiary"]).default("beneficiary"),
  cohort_id: z.string().uuid().optional().nullable(),
});

export const inviteBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    // Only super admin can invite admins
    if (data.role === "admin") await requireSuperAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const origin = process.env.SITE_URL || "";

    const { error: invErr } = await supabaseAdmin.from("invitations").insert({
      email: data.email, full_name: data.full_name ?? null, role: data.role,
      cohort_id: data.cohort_id ?? null, invited_by: context.userId,
    });
    if (invErr && !invErr.message.includes("duplicate")) throw invErr;

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.full_name ?? null, invited_role: data.role },
      redirectTo: origin ? `${origin}/accept-invite` : undefined,
    });
    if (error && !error.message.toLowerCase().includes("already")) throw error;
    return { ok: true, email: data.email };
  });

export const listBeneficiaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id,email,full_name,rank,xp,country,niche,created_at,path_key,path_chosen_at,path_deadline,path_auto_assigned,suspended,suspended_at,suspension_reason,reinstatement_fee_usd,start_date,vetted_dse_certified_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });


export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles").select("user_id").eq("role", "admin");
    const ids = (roleRows ?? []).map((r: any) => r.user_id);
    if (ids.length === 0) return [];
    const { data: profiles } = await supabaseAdmin
      .from("profiles").select("id,email,full_name,created_at").in("id", ids);
    return (profiles ?? []).map((p: any) => ({
      ...p, is_super_admin: (p.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL,
    }));
  });

export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("invitations")
      .select("id,email,full_name,role,status,created_at,expires_at")
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return data ?? [];
  });

const userIdSchema = z.object({ user_id: z.string().uuid() });

export const removeBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Deletion is a founder-only prerogative; ordinary admins may only suspend.
    await requireSuperAdmin(context);
    if (data.user_id === context.userId) throw new Error("Admins cannot remove themselves.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("profiles").select("email").eq("id", data.user_id).maybeSingle();
    if (target && (target.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL)
      throw new Error("The super admin cannot be removed.");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw error;
    return { ok: true };
  });

/* ── Suspension ──────────────────────────────────────────── */

const suspendSchema = z.object({
  user_id: z.string().uuid(),
  reason: z.string().trim().max(2000).optional(),
});

export const suspendBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => suspendSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.user_id === context.userId) throw new Error("You cannot suspend yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("profiles").select("email").eq("id", data.user_id).maybeSingle();
    if (target && (target.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL)
      throw new Error("The super admin cannot be suspended.");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_by: context.userId,
        suspension_reason: data.reason ?? null,
      } as never)
      .eq("id", data.user_id);
    if (error) throw error;
    return { ok: true };
  });

export const reinstateBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ user_id: z.string().uuid(), fee_settled: z.boolean().default(false) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: isSuper } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
    // Only the founder may waive the $10 reinstatement fee.
    if (!isSuper && !data.fee_settled)
      throw new Error("The $10 reinstatement fee must be settled before an admin can lift a suspension.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        suspended: false,
        suspended_at: null,
        suspended_by: null,
        suspension_reason: null,
      } as never)
      .eq("id", data.user_id);
    if (error) throw error;
    return { ok: true };
  });


export const promoteToAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    if (data.user_id === context.userId) throw new Error("Self-promotion is not permitted.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles")
      .insert({ user_id: data.user_id, role: "admin" });
    if (error && !error.message.includes("duplicate")) throw error;
    return { ok: true };
  });

export const demoteFromAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    if (data.user_id === context.userId) throw new Error("You cannot demote yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("profiles").select("email").eq("id", data.user_id).maybeSingle();
    if (target && (target.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL)
      throw new Error("The super admin cannot be demoted.");
    const { error } = await supabaseAdmin.from("user_roles")
      .delete().eq("user_id", data.user_id).eq("role", "admin");
    if (error) throw error;
    return { ok: true };
  });

const assignSchema = z.object({
  beneficiary_id: z.string().uuid(),
  admin_id: z.string().uuid().nullable(),
});
export const assignAdminToBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => assignSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.admin_id === null) {
      const { error } = await supabaseAdmin.from("admin_assignments")
        .delete().eq("beneficiary_id", data.beneficiary_id);
      if (error) throw error;
      return { ok: true };
    }
    const { error } = await supabaseAdmin.from("admin_assignments")
      .upsert({ beneficiary_id: data.beneficiary_id, admin_id: data.admin_id, assigned_by: context.userId },
        { onConflict: "beneficiary_id" });
    if (error) throw error;
    return { ok: true };
  });

export const listAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("admin_assignments")
      .select("beneficiary_id, admin_id, assigned_by, notes, created_at");
    if (error) throw error;
    return data ?? [];
  });

// Escalation workflow
const escalationSchema = z.object({
  beneficiary_id: z.string().uuid(),
  level: z.enum(["watch", "at_risk", "critical", "resolved"]),
  reason: z.string().trim().max(2000).optional(),
});
export const openEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => escalationSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.level === "resolved") {
      const { error } = await supabaseAdmin.from("escalations").update({
        level: "resolved", resolved_by: context.userId, resolved_at: new Date().toISOString(),
      }).eq("beneficiary_id", data.beneficiary_id).neq("level", "resolved");
      if (error) throw error;
      return { ok: true };
    }
    const { error } = await supabaseAdmin.from("escalations").insert({
      beneficiary_id: data.beneficiary_id, level: data.level, reason: data.reason ?? null, opened_by: context.userId,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listEscalations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("escalations").select("*").neq("level", "resolved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

// Manual check-ins
const checkinSchema = z.object({
  beneficiary_id: z.string().uuid(),
  mood: z.enum(["green", "yellow", "red"]).optional(),
  summary: z.string().trim().min(2).max(4000),
  next_action: z.string().trim().max(2000).optional(),
  next_action_due: z.string().optional().nullable(),
});
export const logCheckIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => checkinSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("check_ins").insert({
      beneficiary_id: data.beneficiary_id, admin_id: context.userId,
      mood: data.mood ?? null, summary: data.summary,
      next_action: data.next_action ?? null,
      next_action_due: data.next_action_due || null,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listCheckIns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ beneficiary_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const isSelf = data.beneficiary_id === context.userId;
    if (!isSelf) await requireAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("check_ins").select("*").eq("beneficiary_id", data.beneficiary_id)
      .order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return rows ?? [];
  });

/* ── Weekly reports (admin view) ─────────────────────────── */

export const listAllWeeklyReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data: reports, error } = await context.supabase
      .from("weekly_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("id,email,full_name,rank");
    const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (reports ?? []).map((r: any) => ({
      ...r,
      profile: byId.get(r.user_id) ?? null,
    }));
  });

/* ── DFY (D'Famocious Year) verification ─────────────────── */
// The clerical/tracking layer counts qualified months and computes
// remittance automatically (dfy_months' own DB trigger). What still needs
// a human is verification — turning a beneficiary's self-reported month
// into a confirmed one — and the eventual V. DsE. certification. Any admin
// can do both for now; a distinct Auditor role (kept apart from the DSE
// Rep who mentors the same beneficiary) is future staffing, not built yet.

export const listAllDfyMonths = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data: months, error } = await context.supabase
      .from("dfy_months")
      .select("*")
      .order("period_month", { ascending: false });
    if (error) throw error;
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("id,email,full_name,start_date,vetted_dse_certified_at");
    const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (months ?? []).map((m: any) => ({ ...m, profile: byId.get(m.user_id) ?? null }));
  });

const verifyDfySchema = z.object({
  dfy_month_id: z.string().uuid(),
  status: z.enum(["submitted", "remittance_paid", "verified", "disputed"]),
});
export const verifyDfyMonth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => verifyDfySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("dfy_months")
      .update({
        status: data.status,
        verified_by: data.status === "verified" ? context.userId : null,
        verified_at: data.status === "verified" ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.dfy_month_id);
    if (error) throw error;
    return { ok: true };
  });

export const certifyVettedDse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        vetted_dse_certified_at: new Date().toISOString(),
        vetted_dse_certified_by: context.userId,
      } as never)
      .eq("id", data.user_id);
    if (error) throw error;
    return { ok: true };
  });

/* ── Leadership by Influence: admin oversight ────────────── */

export const listAllMentorships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("mentorships").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const ids = new Set<string>();
    for (const r of (rows ?? []) as any[]) { ids.add(r.mentor_id); ids.add(r.mentee_id); }
    const { data: profiles } = ids.size
      ? await context.supabase.from("profiles").select("id,full_name,email,vetted_dse_certified_at").in("id", Array.from(ids))
      : { data: [] as any[] };
    const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const { data: flagged } = await context.supabase
      .from("mentorship_reviews").select("mentorship_id").eq("flag_raised", true);
    const flaggedIds = new Set((flagged ?? []).map((f: any) => f.mentorship_id));
    return ((rows ?? []) as any[]).map((r) => ({
      ...r,
      mentor: byId.get(r.mentor_id) ?? null,
      mentee: byId.get(r.mentee_id) ?? null,
      hasFlag: flaggedIds.has(r.id),
    }));
  });

// No mentee goes more than AUTO_ASSIGN_AFTER_DAYS unmatched — past that
// window this assigns a weighted-random mentor (favoring stronger verified
// track records without concentrating everyone onto whoever's best right
// now). The mentee still confirms afterward like any other request; this
// only skips the browse-and-choose step, it doesn't skip consent.
export const runAutoAssignMentees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profiles } = await supabaseAdmin.from("profiles").select("id,created_at,vetted_dse_certified_at");
    const { data: adminRows } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = new Set((adminRows ?? []).map((r: any) => r.user_id));
    const beneficiaries = (profiles ?? []).filter((p: any) => !adminIds.has(p.id));
    const certById = new Map(beneficiaries.map((p: any) => [p.id, !!p.vetted_dse_certified_at]));

    const { data: allMentorships } = await supabaseAdmin.from("mentorships").select("*");
    const byMentee = new Map<string, any[]>();
    for (const m of (allMentorships ?? []) as any[]) {
      const arr = byMentee.get(m.mentee_id) ?? [];
      arr.push(m);
      byMentee.set(m.mentee_id, arr);
    }

    const now = Date.now();
    const overdue: string[] = [];
    for (const b of beneficiaries as any[]) {
      const rows = (byMentee.get(b.id) ?? []).sort(
        (a, b2) => new Date(b2.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const latest = rows[0];
      if (latest && (latest.status === "pending" || latest.status === "active")) continue;
      const since = latest ? new Date(latest.ended_at ?? latest.created_at) : new Date(b.created_at);
      const days = Math.floor((now - since.getTime()) / 86_400_000);
      if (days >= AUTO_ASSIGN_AFTER_DAYS) overdue.push(b.id);
    }

    const loadByMentor = new Map<string, number>();
    const verifiedByMentor = new Map<string, number>();
    for (const m of (allMentorships ?? []) as any[]) {
      if (m.status === "active" || m.status === "pending") {
        loadByMentor.set(m.mentor_id, (loadByMentor.get(m.mentor_id) ?? 0) + 1);
      }
      if (certById.get(m.mentee_id)) {
        verifiedByMentor.set(m.mentor_id, (verifiedByMentor.get(m.mentor_id) ?? 0) + 1);
      }
    }

    let assigned = 0;
    for (const menteeId of overdue) {
      const candidates = (beneficiaries as any[])
        .filter((b) => b.id !== menteeId && (loadByMentor.get(b.id) ?? 0) < MENTOR_SOFT_CAP)
        .map((b) => ({ mentorId: b.id as string, verifiedCompletions: verifiedByMentor.get(b.id) ?? 0 }));
      const chosen = pickWeightedMentor(candidates);
      if (!chosen) continue;
      const { error } = await supabaseAdmin.from("mentorships").insert({
        mentor_id: chosen, mentee_id: menteeId, mentor_confirmed: true, mentee_confirmed: false,
      });
      if (!error) {
        assigned++;
        loadByMentor.set(chosen, (loadByMentor.get(chosen) ?? 0) + 1);
      }
    }
    return { ok: true, overdueCount: overdue.length, assigned };
  });

/* ── Mentor-reported escalations: 48-72h SLA workflow ────── */

export const listAllEscalations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("mentorship_escalations").select("*").order("raised_at", { ascending: false });
    if (error) throw error;
    const escRows = (rows ?? []) as any[];
    const mentorshipIds = Array.from(new Set(escRows.map((r) => r.mentorship_id)));
    const { data: mentorships } = mentorshipIds.length
      ? await context.supabase.from("mentorships").select("id,mentor_id,mentee_id").in("id", mentorshipIds)
      : { data: [] as any[] };
    const mById = new Map<string, any>((mentorships ?? []).map((m: any) => [m.id, m]));
    const peopleIds = new Set<string>();
    for (const r of escRows) {
      peopleIds.add(r.raised_by);
      const m = mById.get(r.mentorship_id);
      if (m) { peopleIds.add(m.mentor_id); peopleIds.add(m.mentee_id); }
    }
    const { data: people } = peopleIds.size
      ? await context.supabase.from("profiles").select("id,full_name,email").in("id", Array.from(peopleIds))
      : { data: [] as any[] };
    const pById = new Map<string, any>((people ?? []).map((p: any) => [p.id, p]));
    return escRows.map((r) => {
      const m = mById.get(r.mentorship_id);
      return {
        ...r,
        reporter: pById.get(r.raised_by) ?? null,
        mentor: m ? pById.get(m.mentor_id) ?? null : null,
        mentee: m ? pById.get(m.mentee_id) ?? null : null,
        mentee_id: m?.mentee_id ?? null,
      };
    });
  });

export const acknowledgeEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ escalation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("mentorship_escalations").update({
      acknowledged_at: new Date().toISOString(), acknowledged_by: context.userId,
    }).eq("id", data.escalation_id).is("acknowledged_at", null);
    if (error) throw error;
    return { ok: true };
  });

const classifySchema = z.object({
  escalation_id: z.string().uuid(),
  classification: z.enum(["acceptable", "correctable", "disciplinary"]),
  classification_note: z.string().trim().max(2000).optional(),
});
export const classifyEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => classifySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("mentorship_escalations").update({
      classification: data.classification, classification_note: data.classification_note ?? null,
    }).eq("id", data.escalation_id);
    if (error) throw error;
    return { ok: true };
  });

const resolveSchema = z.object({
  escalation_id: z.string().uuid(),
  resolution_note: z.string().trim().max(2000).optional(),
  reassigned: z.boolean().default(false),
});
export const resolveEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resolveSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("mentorship_escalations").update({
      resolved_at: new Date().toISOString(), resolved_by: context.userId,
      resolution_note: data.resolution_note ?? null, reassigned: data.reassigned,
    }).eq("id", data.escalation_id);
    if (error) throw error;
    return { ok: true };
  });

// ── Path assignment ─────────────────────────────────────────────────────────
const PATH_KEYS = ["smb", "ascent", "revenue", "carebridge", "ministry", "broadcast", "authority"] as const;

export const setBeneficiaryPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ beneficiary_id: z.string().uuid(), path_key: z.enum(PATH_KEYS) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Reassigning a path wipes the beneficiary's record — founder only.
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: current } = await supabaseAdmin
      .from("profiles").select("path_key").eq("id", data.beneficiary_id).maybeSingle();
    const changing = !!current?.path_key && current.path_key !== data.path_key;

    if (changing) {
      // A new path means a fresh start: all prior progress is destroyed.
      await supabaseAdmin.from("task_progress").delete().eq("user_id", data.beneficiary_id);
      await supabaseAdmin.from("weekly_reports").delete().eq("user_id", data.beneficiary_id);
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        path_key: data.path_key,
        path_chosen_at: new Date().toISOString(),
        path_auto_assigned: true,
        ...(changing ? { xp: 0, rank: "recruit" } : {}),
      } as never)
      .eq("id", data.beneficiary_id);
    if (error) throw error;
    return { ok: true, wiped: changing };
  });

