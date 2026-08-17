// Member directory and message requests. Cohort creation/listing lives in
// admin.functions.ts (createCohort/listCohorts) — kept together with the
// rest of the super-admin-gated Council actions rather than duplicated
// here.
//
// Same pattern as mentorship.functions.ts: createServerFn + requireSupabaseAuth,
// with supabaseAdmin used only after the caller has been authorised, because
// profiles RLS is self-or-admin only and members need to see each other's names.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
      .from("message_requests")
      .select("id,status")
      .eq("requester_id", data.recipient_id)
      .eq("recipient_id", context.userId)
      .maybeSingle();
    if (reverse) {
      if (reverse.status !== "accepted") {
        await supabaseAdmin
          .from("message_requests")
          .update({ status: "accepted", responded_at: new Date().toISOString() })
          .eq("id", reverse.id);
      }
      return { ok: true, status: "accepted" as const };
    }
    const { error } = await supabaseAdmin
      .from("message_requests")
      .upsert(
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
      .from("message_requests")
      .select("recipient_id,status")
      .eq("id", data.request_id)
      .maybeSingle();
    if (!row) throw new Error("Not found.");
    if (row.recipient_id !== context.userId) throw new Error("Forbidden: not your request.");
    const { error } = await supabaseAdmin
      .from("message_requests")
      .update({
        status: data.accept ? "accepted" : "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("id", data.request_id);
    if (error) throw error;
    return { ok: true };
  });
