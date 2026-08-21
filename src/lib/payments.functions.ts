// Payments — server-side pieces. Checkout creation calls Stripe or
// Paystack directly (both are just signed HTTPS calls, same pattern
// bps.functions.ts already uses for calling its own edge functions) and
// returns a hosted-checkout redirect URL; the two webhook edge functions
// (stripe-webhook, paystack-webhook) are what actually mark a transaction
// succeeded once the provider confirms payment — this file never marks a
// transaction paid itself, except through the admin manual-override path.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  dseEntryAmountUsd, DSE_ENTRY_NGN_NBO, SUC_ENTRY_TIERS,
  type EntryChannel, type SucEntryTier,
} from "@/lib/payments";

export const SITE_URL = "https://dfamociousincubator.lovable.app";

/** Everything the beneficiary's /payments page needs. */
export const getMyPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profile }, { data: transactions }, { data: dfyMonths }] = await Promise.all([
      supabaseAdmin.from("profiles").select(
        "entry_channel,dse_entry_paid_at,suc_entry_paid_at,suc_entry_tier,bef_number,nbo_id_card_number,nigeria_id_type,nigeria_id_number",
      ).eq("id", context.userId).maybeSingle(),
      supabaseAdmin.from("payment_transactions").select("*").eq("user_id", context.userId).order("created_at", { ascending: false }),
      supabaseAdmin.from("dfy_months").select("*").eq("user_id", context.userId).eq("qualified", true).eq("remittance_paid", false).order("period_month", { ascending: true }),
    ]);
    return {
      entryChannel: (profile?.entry_channel ?? "direct") as EntryChannel,
      dseEntryPaidAt: profile?.dse_entry_paid_at ?? null,
      sucEntryPaidAt: profile?.suc_entry_paid_at ?? null,
      sucEntryTier: profile?.suc_entry_tier ?? null,
      befNumber: profile?.bef_number ?? null,
      nboIdCardNumber: profile?.nbo_id_card_number ?? null,
      nigeriaIdType: profile?.nigeria_id_type ?? null,
      nigeriaIdNumber: profile?.nigeria_id_number ?? null,
      transactions: transactions ?? [],
      unpaidDfyMonths: dfyMonths ?? [],
    };
  });

/** Creates a pending ledger row — the one thing every purpose shares before diverging into a provider-specific checkout call. Exported for signup.functions.ts, whose checkout rows have no user_id yet (signup_request_id instead). */
export async function createPendingTransaction(supabaseAdmin: any, row: {
  user_id?: string | null; signup_request_id?: string | null; purpose: string; purpose_ref_id?: string | null; provider: string;
  amount_usd: number; charged_currency: string; charged_amount: number; metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabaseAdmin
    .from("payment_transactions")
    .insert({ ...row, metadata: row.metadata ?? {} })
    .select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function createStripeCheckout(
  txId: string, amountUsd: number, description: string,
  redirects: { successUrl?: string; cancelUrl?: string } = {},
) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Payments aren't configured yet — Stripe isn't connected. Contact an admin.");
  const body = new URLSearchParams({
    "mode": "payment",
    "client_reference_id": txId,
    "success_url": redirects.successUrl ?? `${SITE_URL}/payments?paid=1`,
    "cancel_url": redirects.cancelUrl ?? `${SITE_URL}/payments?cancelled=1`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(Math.round(amountUsd * 100)),
    "line_items[0][price_data][product_data][name]": description,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Stripe checkout failed: ${await res.text()}`);
  const session = await res.json();
  return session.url as string;
}

export async function createPaystackCheckout(
  txId: string, email: string, amountNgn: number, description: string,
  redirects: { callbackUrl?: string } = {},
) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Payments aren't configured yet — Paystack isn't connected. Contact an admin.");
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email, amount: Math.round(amountNgn * 100), reference: txId,
      callback_url: redirects.callbackUrl ?? `${SITE_URL}/payments?paid=1`,
      metadata: { description },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.status) throw new Error(`Paystack checkout failed: ${data.message ?? "unknown error"}`);
  return data.data.authorization_url as string;
}

const dseCheckoutSchema = z.object({ provider: z.enum(["stripe", "paystack"]) });

/** Paystack is deliberately narrow: NBO entrants only, at the further-subsidized flat ₦75,000 — never a currency conversion of the $90 price. Every other DSE entry (direct-channel) is Stripe-only. */
export const createDseEntryCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => dseCheckoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("email,entry_channel,dse_entry_paid_at,bef_number,nbo_id_card_number,nigeria_id_type,nigeria_id_number")
      .eq("id", context.userId).maybeSingle();
    if (!profile) throw new Error("Profile not found.");
    if (profile.dse_entry_paid_at) throw new Error("DSE entry is already paid.");
    const entryChannel = (profile.entry_channel ?? "direct") as EntryChannel;

    // Every NBO participant must present their BEF number or NBO Identity
    // card before the subsidized entry fee can be paid — enforced here,
    // not just in the UI, since this is what actually stands between the
    // discount and anyone who could otherwise just claim NBO status.
    if (entryChannel === "nbo" && !profile.bef_number && !profile.nbo_id_card_number) {
      throw new Error("Provide your BEF number or NBO Identity card number before paying.");
    }

    if (data.provider === "paystack") {
      if (entryChannel !== "nbo") throw new Error("Paystack is only available for NBO-subsidized entry.");
      if (!profile.nigeria_id_type || !profile.nigeria_id_number) {
        throw new Error("Nigerian NBO participants must provide a means of identification (NIN, Voter's Card, Driver's License, or Passport) before paying.");
      }
      const txId = await createPendingTransaction(supabaseAdmin, {
        user_id: context.userId, purpose: "dse_entry", provider: "paystack",
        amount_usd: dseEntryAmountUsd(entryChannel), charged_currency: "NGN", charged_amount: DSE_ENTRY_NGN_NBO,
      });
      const url = await createPaystackCheckout(txId, profile.email, DSE_ENTRY_NGN_NBO, "DSE Entry (NBO subsidy, or local equivalent)");
      return { url };
    }

    const amountUsd = dseEntryAmountUsd(entryChannel);
    const txId = await createPendingTransaction(supabaseAdmin, {
      user_id: context.userId, purpose: "dse_entry", provider: "stripe",
      amount_usd: amountUsd, charged_currency: "USD", charged_amount: amountUsd,
    });
    const url = await createStripeCheckout(txId, amountUsd, "DSE Entry");
    return { url };
  });

const dfyCheckoutSchema = z.object({ dfy_month_id: z.string().uuid() });

/** Stripe-only — DFY remittances never had a Nigeria-specific subsidy to begin with. */
export const createDfyRemittanceCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => dfyCheckoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: month } = await supabaseAdmin
      .from("dfy_months").select("user_id,period_month,remittance_owed_usd,remittance_paid").eq("id", data.dfy_month_id).maybeSingle();
    if (!month) throw new Error("Not found.");
    if (month.user_id !== context.userId) throw new Error("Forbidden.");
    if (month.remittance_paid) throw new Error("Already paid.");
    const amountUsd = Number(month.remittance_owed_usd);
    const txId = await createPendingTransaction(supabaseAdmin, {
      user_id: context.userId, purpose: "dfy_remittance", purpose_ref_id: data.dfy_month_id, provider: "stripe",
      amount_usd: amountUsd, charged_currency: "USD", charged_amount: amountUsd,
    });
    const label = new Date(month.period_month).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const url = await createStripeCheckout(txId, amountUsd, `DFY Remittance — ${label}`);
    return { url };
  });

const sucCheckoutSchema = z.object({ tier: z.enum(["standard_2000", "direct_6000", "direct_24000"]) });

/** Stripe-only. */
export const createSucEntryCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => sucCheckoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin.from("profiles").select("suc_entry_paid_at").eq("id", context.userId).maybeSingle();
    if (profile?.suc_entry_paid_at) throw new Error("SUC entry is already paid.");
    const tier = SUC_ENTRY_TIERS[data.tier as SucEntryTier];
    const txId = await createPendingTransaction(supabaseAdmin, {
      user_id: context.userId, purpose: "suc_entry", provider: "stripe",
      amount_usd: tier.usd, charged_currency: "USD", charged_amount: tier.usd,
      metadata: { suc_tier: data.tier, equity_percent: tier.equityPercent },
    });
    const url = await createStripeCheckout(txId, tier.usd, `SUC Entry — ${tier.label}`);
    return { url };
  });

/* ── Council console: oversight + manual override ────────────── */

export const listAllPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("payment_transactions").select("*").order("created_at", { ascending: false }).limit(300);
    const userIds = Array.from(new Set((rows ?? []).map((r: any) => r.user_id).filter(Boolean)));
    const signupIds = Array.from(new Set((rows ?? []).map((r: any) => r.signup_request_id).filter(Boolean)));
    const [{ data: people }, { data: signups }] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("profiles").select("id,full_name,email,bef_number,nbo_id_card_number,nigeria_id_type,nigeria_id_number").in("id", userIds)
        : Promise.resolve({ data: [] as any[] }),
      signupIds.length
        ? supabaseAdmin.from("signup_requests").select("id,full_name,email,bef_number,nbo_id_card_number,nigeria_id_type,nigeria_id_number").in("id", signupIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const byId = new Map((people ?? []).map((p: any) => [p.id, p]));
    const bySignupId = new Map((signups ?? []).map((s: any) => [s.id, s]));
    return (rows ?? []).map((r: any) => ({
      ...r,
      beneficiary: byId.get(r.user_id) ?? (r.signup_request_id ? bySignupId.get(r.signup_request_id) : null) ?? null,
      is_new_signup: !r.user_id && !!r.signup_request_id,
    }));
  });

const markPaidSchema = z.object({
  transaction_id: z.string().uuid(),
  note: z.string().trim().min(1).max(500),
});

/** For payment collected outside the app (bank transfer, cash) — a real, expected path until both providers are fully live, and after. */
export const markPaymentPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => markPaidSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tx } = await supabaseAdmin.from("payment_transactions").select("*").eq("id", data.transaction_id).maybeSingle();
    if (!tx) throw new Error("Not found.");
    if (tx.status === "succeeded") throw new Error("Already marked paid.");
    const { error } = await supabaseAdmin.from("payment_transactions").update({
      status: "succeeded", paid_at: new Date().toISOString(), marked_paid_by: context.userId, marked_paid_note: data.note,
    }).eq("id", data.transaction_id);
    if (error) throw error;
    if (!tx.user_id && tx.signup_request_id) {
      await provisionFromSignup(supabaseAdmin, tx);
    } else {
      await applyPaymentSuccess(supabaseAdmin, tx);
    }
    return { ok: true };
  });

/**
 * A signup paid by bank transfer/cash before either provider is live —
 * exactly the same provisioning the two webhooks do on a real Stripe/
 * Paystack confirmation, just triggered by an admin's manual override
 * instead. Turns the signup_requests row into a real account: invites the
 * email (handle_new_user creates auth.users + profiles synchronously),
 * then backfills identification + dse_entry_paid_at onto that profile.
 */
async function provisionFromSignup(supabaseAdmin: any, tx: any) {
  const { data: signup } = await supabaseAdmin.from("signup_requests").select("*").eq("id", tx.signup_request_id).maybeSingle();
  if (!signup || signup.status !== "pending") return;

  await supabaseAdmin.from("invitations").insert({
    email: signup.email, full_name: signup.full_name, role: "beneficiary",
    cohort_id: signup.cohort_id, sponsor_name: signup.sponsor_name, entry_channel: signup.entry_channel,
  });

  const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(signup.email, {
    data: { full_name: signup.full_name },
    redirectTo: `${SITE_URL}/accept-invite`,
  });
  if (error || !invited?.user?.id) throw error ?? new Error("Couldn't create the account.");
  const newUserId = invited.user.id as string;

  await supabaseAdmin.from("profiles").update({
    bef_number: signup.bef_number, nbo_id_card_number: signup.nbo_id_card_number,
    nigeria_id_type: signup.nigeria_id_type, nigeria_id_number: signup.nigeria_id_number,
    dse_entry_paid_at: new Date().toISOString(),
  }).eq("id", newUserId);

  await supabaseAdmin.from("payment_transactions").update({ user_id: newUserId }).eq("id", tx.id);
  await supabaseAdmin.from("signup_requests").update({ status: "provisioned", user_id: newUserId }).eq("id", signup.id);
}

/** Shared by both the manual-override path above and the two webhooks — updates the linked record for whichever purpose just got paid. Exported so the edge functions... actually edge functions run in Deno and can't import this; they duplicate this logic themselves, same as every other edge function in this codebase duplicates its own small pieces of src/lib. */
async function applyPaymentSuccess(supabaseAdmin: any, tx: any) {
  if (tx.purpose === "dse_entry") {
    await supabaseAdmin.from("profiles").update({ dse_entry_paid_at: new Date().toISOString() }).eq("id", tx.user_id);
  } else if (tx.purpose === "dfy_remittance" && tx.purpose_ref_id) {
    await supabaseAdmin.from("dfy_months").update({ remittance_paid: true, remittance_paid_at: new Date().toISOString() }).eq("id", tx.purpose_ref_id);
  } else if (tx.purpose === "suc_entry") {
    await supabaseAdmin.from("profiles").update({
      suc_entry_paid_at: new Date().toISOString(), suc_entry_tier: tx.metadata?.suc_tier ?? null,
    }).eq("id", tx.user_id);
  }
}
