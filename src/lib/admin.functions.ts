import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
      .select("id,email,full_name,rank,xp,country,niche,created_at,path_key,path_chosen_at,path_deadline,path_auto_assigned")
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
    await requireAdmin(context);
    if (data.user_id === context.userId) throw new Error("Admins cannot remove themselves.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Check target — admins can remove beneficiaries only; super admin can remove admins too
    const { data: target } = await supabaseAdmin
      .from("profiles").select("email").eq("id", data.user_id).maybeSingle();
    if (target && (target.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL)
      throw new Error("The super admin cannot be removed.");
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", data.user_id);
    const isTargetAdmin = (targetRoles ?? []).some((r: any) => r.role === "admin");
    if (isTargetAdmin) await requireSuperAdmin(context);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
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

// ── Path assignment ─────────────────────────────────────────────────────────
const PATH_KEYS = ["smb", "ascent", "revenue", "carebridge", "ministry", "broadcast", "authority"] as const;

export const setBeneficiaryPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ beneficiary_id: z.string().uuid(), path_key: z.enum(PATH_KEYS) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        path_key: data.path_key,
        path_chosen_at: new Date().toISOString(),
        path_auto_assigned: true,
      } as never)
      .eq("id", data.beneficiary_id);
    if (error) throw error;
    return { ok: true };
  });
