// Cohorts, the general DBI room, the member directory and message requests.
// Same pattern as mentorship.functions.ts: createServerFn + requireSupabaseAuth,
// with supabaseAdmin used only after the caller has been authorised, because
// profiles RLS is self-or-admin only and members need to see each other's names.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Cohort-00001, Cohort-00002 … always the next free number. */
function cohortLabel(n: number) {
  return `Cohort-${String(n).padStart(5, "0")}`;
}

export const listCohorts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cohorts, error } = await supabaseAdmin
      .from("cohorts").select("id,name,start_date,description,created_at").order("created_at", { ascending: true });
    if (error) throw error;
    const { data: members } = await supabaseAdmin.from("profiles").select("id,cohort_id");
    return (cohorts ?? []).map((c: any) => ({
      ...c,
      member_count: (members ?? []).filter((m: any) => m.cohort_id === c.id).length,
    }));
  });

/**
 * Only the founder forms a cohort. Creating one immediately opens its group
 * chat (the chat is just messages scoped to the cohort id) and enrols every
 * member who is not yet in a cohort — everyone on the app sits in one cohort.
 */
export const createCohort = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ description: z.string().trim().max(500).optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
    if (!isSuper) throw new Error("Forbidden: only the super admin may form a cohort.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("cohorts").select("id", { count: "exact", head: true });
    const { data: created, error } = await supabaseAdmin
      .from("cohorts")
      .insert({ name: cohortLabel((count ?? 0) + 1), description: data.description ?? null })
      .select("id,name")
      .single();
    if (error) throw error;
    const { error: enrolErr } = await supabaseAdmin
      .from("profiles").update({ cohort_id: created.id }).is("cohort_id", null);
    if (enrolErr) throw enrolErr;
    return created;
  });

/** Move every member into one cohort (used by the founder to consolidate). */
export const enrolEveryoneInCohort = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ cohort_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
    if (!isSuper) throw new Error("Forbidden: only the super admin may move members between cohorts.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles").update({ cohort_id: data.cohort_id }).neq("cohort_id", data.cohort_id);
    if (error) throw error;
    const { error: nullErr } = await supabaseAdmin
      .from("profiles").update({ cohort_id: data.cohort_id }).is("cohort_id", null);
    if (nullErr) throw nullErr;
    return { ok: true };
  });

/** Everyone visible in the rooms — used for starting a private conversation. */
export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,email,avatar_url,path_key,cohort_id")
      .order("full_name", { ascending: true });
    if (error) throw error;
    return (data ?? []).filter((p: any) => p.id !== context.userId);
  });

export const listMessageRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("message_requests")
      .select("*")
      .or(`requester_id.eq.${context.userId},recipient_id.eq.${context.userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const ids = new Set<string>();
    for (const r of (rows ?? []) as any[]) ids.add(r.requester_id === context.userId ? r.recipient_id : r.requester_id);
    const { data: profiles } = ids.size
      ? await supabaseAdmin.from("profiles").select("id,full_name,email,avatar_url").in("id", Array.from(ids))
      : { data: [] as any[] };
    const byId = new Map<string, any>((profiles ?? []).map((p: any) => [p.id, p]));
    return ((rows ?? []) as any[]).map((r) => ({
      ...r,
      direction: r.requester_id === context.userId ? "outgoing" : "incoming",
      partner: byId.get(r.requester_id === context.userId ? r.recipient_id : r.requester_id) ?? null,
    }));
  });

export const sendMessageRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ recipient_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.recipient_id === context.userId) throw new Error("You cannot message yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // If they already asked you, accepting is the right move — open it straight away.
    const { data: reverse } = await supabaseAdmin
      .from("message_requests").select("id,status")
      .eq("requester_id", data.recipient_id).eq("recipient_id", context.userId).maybeSingle();
    if (reverse) {
      if (reverse.status !== "accepted") {
        await supabaseAdmin.from("message_requests")
          .update({ status: "accepted", responded_at: new Date().toISOString() }).eq("id", reverse.id);
      }
      return { ok: true, status: "accepted" as const };
    }
    const { error } = await supabaseAdmin.from("message_requests").upsert(
      { requester_id: context.userId, recipient_id: data.recipient_id, status: "pending", responded_at: null },
      { onConflict: "requester_id,recipient_id" },
    );
    if (error) throw error;
    return { ok: true, status: "pending" as const };
  });

export const respondToMessageRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ request_id: z.string().uuid(), accept: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("message_requests").select("recipient_id,status").eq("id", data.request_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    if (row.recipient_id !== context.userId) throw new Error("Forbidden: not your request.");
    const { error } = await supabaseAdmin.from("message_requests").update({
      status: data.accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    }).eq("id", data.request_id);
    if (error) throw error;
    return { ok: true };
  });
