// Stripe's confirmation of a completed Checkout Session — the only place a
// payment_transactions row actually gets marked succeeded from the Stripe
// side (src/lib/payments.functions.ts only ever creates it pending).
// Verifies Stripe's own HMAC signature scheme (t=...,v1=...) before
// trusting anything in the body. Mirrors pocket-emergency-notify's shape.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

async function verifyStripeSignature(payload: string, sigHeader: string | null, secret: string): Promise<boolean> {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=") as [string, string]));
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expectedHex = Array.from(new Uint8Array(sigBytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return expectedHex === signature;
}

/** Same "mark succeeded, update the linked record" logic as the manual-override path in payments.functions.ts — duplicated here since edge functions can't import from src/. */
async function applyPaymentSuccess(supa: any, tx: any) {
  if (tx.purpose === "dse_entry") {
    await supa.from("profiles").update({ dse_entry_paid_at: new Date().toISOString() }).eq("id", tx.user_id);
  } else if (tx.purpose === "dfy_remittance" && tx.purpose_ref_id) {
    await supa.from("dfy_months").update({ remittance_paid: true, remittance_paid_at: new Date().toISOString() }).eq("id", tx.purpose_ref_id);
  } else if (tx.purpose === "suc_entry") {
    await supa.from("profiles").update({
      suc_entry_paid_at: new Date().toISOString(), suc_entry_tier: tx.metadata?.suc_tier ?? null,
    }).eq("id", tx.user_id);
  }
}

const PURPOSE_LABELS: Record<string, string> = {
  dse_entry: "DSE Entry", dfy_remittance: "DFY Remittance", suc_entry: "SUC Entry",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const rawBody = await req.text();

  if (webhookSecret) {
    const ok = await verifyStripeSignature(rawBody, req.headers.get("stripe-signature"), webhookSecret);
    if (!ok) return new Response(JSON.stringify({ error: "invalid signature" }), { status: 400, headers: corsHeaders });
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: corsHeaders }); }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ ok: true, ignored: event.type }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const session = event.data?.object;
  const txId = session?.client_reference_id;
  if (!txId) return new Response(JSON.stringify({ error: "no client_reference_id" }), { status: 400, headers: corsHeaders });

  const { data: tx } = await supa.from("payment_transactions").select("*").eq("id", txId).maybeSingle();
  if (!tx) return new Response(JSON.stringify({ error: "transaction not found" }), { status: 404, headers: corsHeaders });
  if (tx.status === "succeeded") return new Response(JSON.stringify({ ok: true, already: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  await supa.from("payment_transactions").update({
    status: "succeeded", paid_at: new Date().toISOString(), provider_reference: session.id,
  }).eq("id", txId);
  await applyPaymentSuccess(supa, tx);

  const label = PURPOSE_LABELS[tx.purpose] ?? tx.purpose;
  await sendWebPush(supa, {
    user_ids: [tx.user_id], category: "admin",
    title: `${label} payment confirmed`,
    body: `$${Number(tx.amount_usd).toFixed(2)} received via Stripe.`,
    url: "/payments",
  });
  await supa.from("mentee_activity_feed").insert({
    mentee_id: tx.user_id, kind: "payment_confirmed", title: `${label} — payment confirmed`,
    body: `$${Number(tx.amount_usd).toFixed(2)} received via Stripe.`,
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
