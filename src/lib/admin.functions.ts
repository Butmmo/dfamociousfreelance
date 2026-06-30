import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
    const { data: isAdmin } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const origin = process.env.SITE_URL || "";

    // Record the invitation (gives founder full audit trail)
    const { error: invErr } = await supabaseAdmin.from("invitations").insert({
      email: data.email,
      full_name: data.full_name ?? null,
      role: data.role,
      cohort_id: data.cohort_id ?? null,
      invited_by: context.userId,
    });
    if (invErr && !invErr.message.includes("duplicate")) throw invErr;

    // Send the magic invite link via Supabase Auth admin API
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
    const { data: isAdmin } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id,email,full_name,rank,xp,country,niche,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("invitations")
      .select("id,email,full_name,role,status,created_at,expires_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  });
