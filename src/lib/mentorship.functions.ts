// Leadership by Influence — beneficiary-callable server functions.
// Mirrors admin.functions.ts's pattern (createServerFn + requireSupabaseAuth
// middleware + supabaseAdmin for elevated reads/writes), but these are
// open to any authenticated beneficiary, not admin-gated — the marketplace,
// requesting/accepting a mentorship, weekly check-ins, and checkpoint
// reviews are all self-service. supabaseAdmin is used wherever a caller
// needs to see another user's profile (mentee pool, a matched partner's
// name) since plain profiles RLS is self-or-admin only.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listAvailableMentees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: taken } = await supabaseAdmin
      .from("mentorships").select("mentee_id").in("status", ["pending", "active"]);
    const takenIds = new Set<string>((taken ?? []).map((r: any) => r.mentee_id));
    takenIds.add(context.userId);
    const { data: admins } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    for (const a of admins ?? []) takenIds.add((a as any).user_id);
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,avatar_url,path_key,rank,xp,cohort_id,created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (profiles ?? []).filter((p: any) => !takenIds.has(p.id));
  });

const menteeIdSchema = z.object({ mentee_id: z.string().uuid() });
export const requestMentee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => menteeIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (data.mentee_id === context.userId) throw new Error("You cannot mentor yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("mentorships").select("id").eq("mentee_id", data.mentee_id).in("status", ["pending", "active"]).maybeSingle();
    if (existing) throw new Error("That beneficiary already has an open mentorship.");
    const { error } = await supabaseAdmin.from("mentorships").insert({
      mentor_id: context.userId, mentee_id: data.mentee_id, mentor_confirmed: true, mentee_confirmed: false,
    });
    if (error) throw error;
    return { ok: true };
  });

const respondSchema = z.object({ mentorship_id: z.string().uuid(), accept: z.boolean() });
export const respondToMentorshipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => respondSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("mentorships").select("mentee_id,status").eq("id", data.mentorship_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    if (row.mentee_id !== context.userId) throw new Error("Forbidden: not your mentorship request.");
    if (row.status !== "pending") throw new Error("This request is no longer pending.");
    const patch = data.accept
      ? { mentee_confirmed: true }
      : { ended_at: new Date().toISOString(), ended_reason: "declined by mentee" };
    const { error } = await supabaseAdmin.from("mentorships").update(patch).eq("id", data.mentorship_id);
    if (error) throw error;
    return { ok: true };
  });

const endSchema = z.object({ mentorship_id: z.string().uuid(), reason: z.string().trim().max(2000).optional() });
export const endMentorship = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => endSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("mentorships").select("mentor_id,mentee_id").eq("id", data.mentorship_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (row.mentor_id !== context.userId && row.mentee_id !== context.userId && !isAdmin)
      throw new Error("Forbidden.");
    const { error } = await supabaseAdmin.from("mentorships").update({
      ended_at: new Date().toISOString(), ended_reason: data.reason ?? null,
    }).eq("id", data.mentorship_id);
    if (error) throw error;
    return { ok: true };
  });

export const listMyMentorships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("mentorships")
      .select("*")
      .or(`mentor_id.eq.${context.userId},mentee_id.eq.${context.userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const partnerIds = new Set<string>();
    for (const r of (rows ?? []) as any[]) partnerIds.add(r.mentor_id === context.userId ? r.mentee_id : r.mentor_id);
    const { data: partners } = partnerIds.size
      ? await supabaseAdmin.from("profiles").select("id,full_name,avatar_url,vetted_dse_certified_at").in("id", Array.from(partnerIds))
      : { data: [] as any[] };
    const byId = new Map<string, any>((partners ?? []).map((p: any) => [p.id, p]));
    return ((rows ?? []) as any[]).map((r) => {
      const isMentor = r.mentor_id === context.userId;
      const partner: any = byId.get(isMentor ? r.mentee_id : r.mentor_id) ?? null;
      return {
        ...r,
        role: isMentor ? "mentor" : "mentee",
        partner,
        menteeDfyComplete: isMentor ? !!partner?.vetted_dse_certified_at : undefined,
      };
    });
  });

const checkinSchema = z.object({
  mentorship_id: z.string().uuid(),
  week_of: z.string(),
  happened: z.boolean(),
  note: z.string().trim().max(1000).optional(),
});
export const logMentorshipCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => checkinSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("mentorships").select("mentor_id,mentee_id,status").eq("id", data.mentorship_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    if (row.mentor_id !== context.userId && row.mentee_id !== context.userId) throw new Error("Forbidden.");
    if (row.status !== "active") throw new Error("This mentorship isn't active.");
    const { error } = await supabaseAdmin.from("mentorship_checkins").upsert(
      { mentorship_id: data.mentorship_id, logged_by: context.userId, week_of: data.week_of, happened: data.happened, note: data.note ?? null },
      { onConflict: "mentorship_id,week_of,logged_by" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const listMentorshipCheckins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ mentorship_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("mentorships").select("mentor_id,mentee_id").eq("id", data.mentorship_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (row.mentor_id !== context.userId && row.mentee_id !== context.userId && !isAdmin) throw new Error("Forbidden.");
    const { data: rows, error } = await supabaseAdmin
      .from("mentorship_checkins").select("*").eq("mentorship_id", data.mentorship_id).order("week_of", { ascending: false }).limit(20);
    if (error) throw error;
    return rows ?? [];
  });

const reviewSchema = z.object({
  mentorship_id: z.string().uuid(),
  mentee_progress_note: z.string().trim().max(4000).optional(),
  rep_support_assessment: z.string().trim().max(4000).optional(),
  flag_raised: z.boolean().default(false),
  flag_note: z.string().trim().max(2000).optional(),
});
export const logMentorshipReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("mentorships").select("mentor_id").eq("id", data.mentorship_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    if (row.mentor_id !== context.userId) throw new Error("Forbidden: only the mentor logs a checkpoint review.");
    const { count } = await supabaseAdmin
      .from("mentorship_reviews").select("id", { count: "exact", head: true }).eq("mentorship_id", data.mentorship_id);
    const nextCheckpoint = (count ?? 0) + 1;
    const { error } = await supabaseAdmin.from("mentorship_reviews").insert({
      mentorship_id: data.mentorship_id,
      checkpoint_number: nextCheckpoint,
      mentee_progress_note: data.mentee_progress_note ?? null,
      rep_support_assessment: data.rep_support_assessment ?? null,
      flag_raised: data.flag_raised,
      flag_note: data.flag_note ?? null,
      created_by: context.userId,
    });
    if (error) throw error;
    return { ok: true, checkpoint_number: nextCheckpoint };
  });

export const listMentorshipReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ mentorship_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("mentorships").select("mentor_id,mentee_id").eq("id", data.mentorship_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (row.mentor_id !== context.userId && row.mentee_id !== context.userId && !isAdmin) throw new Error("Forbidden.");
    const { data: rows, error } = await supabaseAdmin
      .from("mentorship_reviews").select("*").eq("mentorship_id", data.mentorship_id).order("checkpoint_number", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

/** The beneficiary's assigned DSE Rep, resolved server-side since plain
 * profiles RLS won't let a beneficiary see another user's row directly. */
export const getMyRep = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: assignment } = await context.supabase
      .from("admin_assignments").select("admin_id").eq("beneficiary_id", context.userId).maybeSingle();
    if (!assignment?.admin_id) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rep } = await supabaseAdmin
      .from("profiles").select("id,full_name,avatar_url,email").eq("id", assignment.admin_id).maybeSingle();
    return rep ?? null;
  });
