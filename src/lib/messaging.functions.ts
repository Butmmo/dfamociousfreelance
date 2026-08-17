// Server functions backing the general/cohort chat member directories and
// the private-conversation request flow. Beneficiaries can't see each
// other's profiles under plain RLS (self-or-admin only), so any "who's in
// this chat" listing goes through supabaseAdmin the same way
// listAvailableMentees does in mentorship.functions.ts. Writes to
// message_requests go through supabaseAdmin too, mirroring how
// mentorships keeps RLS read-only for participants and enforces the
// state machine here instead.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Everyone in the caller's own cohort, for the cohort-chat member list. */
export const listCohortMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: me } = await supabaseAdmin
      .from("profiles").select("cohort_id").eq("id", context.userId).maybeSingle();
    if (!me?.cohort_id) return [];
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,avatar_url,email")
      .eq("cohort_id", me.cohort_id)
      .order("full_name", { ascending: true });
    if (error) throw error;
    return (data ?? []).filter((p: any) => p.id !== context.userId);
  });

/** Every authenticated member, for the general DBI chat's member list. */
export const listGeneralMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,avatar_url,email")
      .order("full_name", { ascending: true });
    if (error) throw error;
    return (data ?? []).filter((p: any) => p.id !== context.userId);
  });

const requestSchema = z.object({
  recipient_id: z.string().uuid(),
  message: z.string().trim().max(500).optional(),
});
export const requestConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => requestSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (data.recipient_id === context.userId) throw new Error("You can't message yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: alreadyConnected } = await supabaseAdmin.rpc("can_message", {
      _a: context.userId, _b: data.recipient_id,
    });
    if (alreadyConnected) return { ok: true, alreadyConnected: true };

    const { data: existing } = await supabaseAdmin
      .from("message_requests")
      .select("id,status,requester_id")
      .or(
        `and(requester_id.eq.${context.userId},recipient_id.eq.${data.recipient_id}),` +
        `and(requester_id.eq.${data.recipient_id},recipient_id.eq.${context.userId})`,
      )
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      // They already asked to message us — requesting back just confirms theirs.
      if (existing.requester_id === data.recipient_id) {
        const { error } = await supabaseAdmin
          .from("message_requests")
          .update({ status: "accepted", responded_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
        return { ok: true, accepted: true };
      }
      throw new Error("You already have a pending request with this person.");
    }

    const { error } = await supabaseAdmin.from("message_requests").insert({
      requester_id: context.userId, recipient_id: data.recipient_id, message: data.message ?? null,
    });
    if (error) throw error;
    return { ok: true };
  });

const respondSchema = z.object({ request_id: z.string().uuid(), accept: z.boolean() });
export const respondToMessageRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => respondSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("message_requests").select("recipient_id,status").eq("id", data.request_id).maybeSingle();
    if (!row) throw new Error("Not found.");
    if (row.recipient_id !== context.userId) throw new Error("Forbidden: not your request to answer.");
    if (row.status !== "pending") throw new Error("This request was already answered.");
    const { error } = await supabaseAdmin.from("message_requests").update({
      status: data.accept ? "accepted" : "declined", responded_at: new Date().toISOString(),
    }).eq("id", data.request_id);
    if (error) throw error;
    return { ok: true };
  });

/** Both directions at once: requests I sent and requests sent to me. */
export const listMyMessageRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("message_requests")
      .select("*")
      .or(`requester_id.eq.${context.userId},recipient_id.eq.${context.userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const peopleIds = new Set<string>();
    for (const r of (rows ?? []) as any[]) {
      peopleIds.add(r.requester_id === context.userId ? r.recipient_id : r.requester_id);
    }
    const { data: people } = peopleIds.size
      ? await supabaseAdmin.from("profiles").select("id,full_name,avatar_url").in("id", Array.from(peopleIds))
      : { data: [] as any[] };
    const byId = new Map<string, any>((people ?? []).map((p: any) => [p.id, p]));
    return ((rows ?? []) as any[]).map((r) => ({
      ...r,
      direction: r.requester_id === context.userId ? "outgoing" : "incoming",
      counterpart: byId.get(r.requester_id === context.userId ? r.recipient_id : r.requester_id) ?? null,
    }));
  });

/** Anyone the caller can already DM purely via an accepted message_request (not a Rep/mentor relationship). */
export const listMyRequestedContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: accepted } = await supabaseAdmin
      .from("message_requests")
      .select("requester_id,recipient_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${context.userId},recipient_id.eq.${context.userId}`);
    const ids = new Set<string>();
    for (const r of (accepted ?? []) as any[]) {
      ids.add(r.requester_id === context.userId ? r.recipient_id : r.requester_id);
    }
    if (ids.size === 0) return [];
    const { data: people, error } = await supabaseAdmin
      .from("profiles").select("id,full_name,avatar_url").in("id", Array.from(ids));
    if (error) throw error;
    return people ?? [];
  });
