// Paystack's confirmation of a successful charge — the only payment this
// ever handles is the further-subsidized ₦75,000 NBO DSE entry fee (see
// src/lib/payments.ts). Verifies the x-paystack-signature header
// (HMAC-SHA512 of the raw body, keyed with the Paystack secret) before
// trusting anything in the body. Mirrors stripe-webhook's shape.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const SITE_URL = "https://dfamociousincubator.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

async function verifyPaystackSignature(payload: string, sigHeader: string | null, secret: string): Promise<boolean> {
  if (!sigHeader) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expectedHex = Array.from(new Uint8Array(sigBytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return expectedHex === sigHeader;
}

/**
 * A paid public signup: no auth.users row exists yet, only a
 * signup_requests row (see src/lib/signup.functions.ts). Payment is what
 * turns the application into a real account — invites the email (which
 * synchronously creates auth.users + profiles via handle_new_user, same
 * trigger the admin-invite flow uses), then backfills the identification
 * fields and dse_entry_paid_at onto the profile it just created. Returns
 * the new user id, or null if this signup was already provisioned
 * (webhook redelivery). Duplicated from stripe-webhook — edge functions
 * can't import from each other's directories any more than from src/.
 */
async function provisionFromSignup(supa: any, tx: any): Promise<string | null> {
  const { data: signup } = await supa.from("signup_requests").select("*").eq("id", tx.signup_request_id).maybeSingle();
  if (!signup || signup.status !== "pending") return null;

  await supa.from("invitations").insert({
    email: signup.email, full_name: signup.full_name, role: "beneficiary",
    cohort_id: signup.cohort_id, sponsor_name: signup.sponsor_name, entry_channel: signup.entry_channel,
  });

  const { data: invited, error } = await supa.auth.admin.inviteUserByEmail(signup.email, {
    data: { full_name: signup.full_name },
    redirectTo: `${SITE_URL}/accept-invite`,
  });
  if (error || !invited?.user?.id) return null;
  const newUserId = invited.user.id as string;

  await supa.from("profiles").update({
    bef_number: signup.bef_number, nbo_id_card_number: signup.nbo_id_card_number,
    nigeria_id_type: signup.nigeria_id_type, nigeria_id_number: signup.nigeria_id_number,
    dse_entry_paid_at: new Date().toISOString(),
  }).eq("id", newUserId);

  await supa.from("payment_transactions").update({ user_id: newUserId }).eq("id", tx.id);
  await supa.from("signup_requests").update({ status: "provisioned", user_id: newUserId }).eq("id", signup.id);

  const { data: admins } = await supa.from("user_roles").select("user_id").eq("role", "admin");
  await sendWebPush(supa, {
    user_ids: (admins ?? []).map((a: any) => a.user_id), category: "admin",
    title: "New DSE entry — beneficiary provisioned",
    body: `${signup.full_name} paid and was added to the cohort.`,
    url: "/council-payments",
  });
  await supa.from("mentee_activity_feed").insert({
    mentee_id: newUserId, kind: "payment_confirmed", title: "DSE Entry — payment confirmed",
    body: `₦${Number(tx.charged_amount).toLocaleString()} received via Paystack.`,
  });

  return newUserId;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  const rawBody = await req.text();

  if (secret) {
    const ok = await verifyPaystackSignature(rawBody, req.headers.get("x-paystack-signature"), secret);
    if (!ok) return new Response(JSON.stringify({ error: "invalid signature" }), { status: 400, headers: corsHeaders });
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: corsHeaders }); }

  if (event.event !== "charge.success") {
    return new Response(JSON.stringify({ ok: true, ignored: event.event }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const txId = event.data?.reference;
  if (!txId) return new Response(JSON.stringify({ error: "no reference" }), { status: 400, headers: corsHeaders });

  const { data: tx } = await supa.from("payment_transactions").select("*").eq("id", txId).maybeSingle();
  if (!tx) return new Response(JSON.stringify({ error: "transaction not found" }), { status: 404, headers: corsHeaders });
  if (tx.status === "succeeded") return new Response(JSON.stringify({ ok: true, already: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  await supa.from("payment_transactions").update({
    status: "succeeded", paid_at: new Date().toISOString(), provider_reference: String(event.data.id),
  }).eq("id", txId);

  let userId = tx.user_id as string | null;
  if (!userId && tx.signup_request_id) {
    userId = await provisionFromSignup(supa, tx);
  } else if (userId) {
    // Paystack only ever carries dse_entry — no need for the general purpose-switch stripe-webhook has.
    await supa.from("profiles").update({ dse_entry_paid_at: new Date().toISOString() }).eq("id", userId);
  }
  if (!userId) return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  await sendWebPush(supa, {
    user_ids: [userId], category: "admin",
    title: "DSE Entry payment confirmed",
    body: `₦${Number(tx.charged_amount).toLocaleString()} received via Paystack.`,
    url: "/payments",
  });
  if (tx.user_id) {
    // The signup-provisioning path above already logs its own activity-feed
    // entry (it needs the freshly created user id, which doesn't exist yet
    // when this file's mentee_activity_feed insert would otherwise fire).
    await supa.from("mentee_activity_feed").insert({
      mentee_id: userId, kind: "payment_confirmed", title: "DSE Entry — payment confirmed",
      body: `₦${Number(tx.charged_amount).toLocaleString()} received via Paystack.`,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
