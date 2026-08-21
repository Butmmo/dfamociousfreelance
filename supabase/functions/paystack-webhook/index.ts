// Paystack's confirmation of a successful charge — the only payment this
// ever handles is the further-subsidized ₦75,000 NBO DSE entry fee (see
// src/lib/payments.ts). Verifies the x-paystack-signature header
// (HMAC-SHA512 of the raw body, keyed with the Paystack secret) before
// trusting anything in the body. Mirrors stripe-webhook's shape.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

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

  // Paystack only ever carries dse_entry — no need for the general purpose-switch stripe-webhook has.
  await supa.from("profiles").update({ dse_entry_paid_at: new Date().toISOString() }).eq("id", tx.user_id);

  await sendWebPush(supa, {
    user_ids: [tx.user_id], category: "admin",
    title: "DSE Entry payment confirmed",
    body: `₦${Number(tx.charged_amount).toLocaleString()} received via Paystack.`,
    url: "/payments",
  });
  await supa.from("mentee_activity_feed").insert({
    mentee_id: tx.user_id, kind: "payment_confirmed", title: "DSE Entry — payment confirmed",
    body: `₦${Number(tx.charged_amount).toLocaleString()} received via Paystack.`,
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
