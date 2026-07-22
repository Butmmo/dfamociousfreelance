import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function requireSuperAdmin(context: any) {
  const { data: isSuper } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
  if (!isSuper) throw new Error("Forbidden: super admin only");
}
async function requireAdmin(context: any) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden: admin only");
}

const userIdSchema = z.object({ user_id: z.string().uuid() });

export const listAscentAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("ascent_access")
      .select("user_id, granted_at, granted_by, note");
    if (error) throw error;
    return data ?? [];
  });

export const checkMyAscentAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isSuper } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
    if (isSuper) return { hasAccess: true, superAdmin: true };
    const { data } = await context.supabase
      .from("ascent_access")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { hasAccess: !!data, superAdmin: false };
  });

export const grantAscent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ascent_access")
      .upsert({ user_id: data.user_id, granted_by: context.userId }, { onConflict: "user_id" });
    if (error) throw error;
    return { ok: true };
  });

export const revokeAscent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ascent_access")
      .delete()
      .eq("user_id", data.user_id);
    if (error) throw error;
    return { ok: true };
  });
