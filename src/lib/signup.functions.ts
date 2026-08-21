// Public self-signup: fill details, pick an open cohort, pay the DSE entry
// fee — the account itself is only created once that payment succeeds (see
// applyProvisioning in the two webhook edge functions). Neither function
// here carries requireSupabaseAuth — this is the one place in the app
// meant to be called by someone with no session at all.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  dseEntryAmountUsd, DSE_ENTRY_NGN_NBO, type EntryChannel,
} from "@/lib/payments";
import {
  createPendingTransaction, createStripeCheckout, createPaystackCheckout, SITE_URL,
} from "@/lib/payments.functions";

/** Cohorts open for new applicants — just enough to render a picker, nothing sensitive. */
export const listOpenCohorts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("cohorts").select("id,name,start_date,description")
      .eq("active", true).order("seq_number", { ascending: true, nullsFirst: true });
    return data ?? [];
  });

const signupSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  country: z.string().trim().max(120).optional(),
  sponsor_name: z.string().trim().min(1).max(160).default("Boluwatife Famokunwa"),
  entry_channel: z.enum(["nbo", "direct"]).default("direct"),
  cohort_id: z.string().uuid(),
  bef_number: z.string().trim().max(80).optional(),
  nbo_id_card_number: z.string().trim().max(80).optional(),
  nigeria_id_type: z.enum(["nin", "voters_card", "drivers_license", "passport"]).optional(),
  nigeria_id_number: z.string().trim().max(80).optional(),
  provider: z.enum(["stripe", "paystack"]),
});

/** Submits the application and immediately returns a checkout URL — nothing about the applicant is written to profiles/auth.users until the provider confirms payment. */
export const submitSignup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => signupSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cohort } = await supabaseAdmin
      .from("cohorts").select("id").eq("id", data.cohort_id).eq("active", true).maybeSingle();
    if (!cohort) throw new Error("That cohort isn't open for new applicants anymore. Refresh and pick another.");

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles").select("id").ilike("email", data.email).maybeSingle();
    if (existingProfile) throw new Error("An account with this email already exists — log in and use the Payments page instead.");

    const { data: pendingSignup } = await supabaseAdmin
      .from("signup_requests").select("id").ilike("email", data.email).eq("status", "pending").maybeSingle();
    if (pendingSignup) throw new Error("You already have an application pending payment. Check your email, or contact an admin if the checkout link expired.");

    // Same rule as the existing beneficiary flow (createDseEntryCheckout):
    // every NBO applicant needs a BEF number or NBO Identity card, and the
    // Paystack rate additionally needs a Nigerian means of identification.
    if (data.entry_channel === "nbo" && !data.bef_number && !data.nbo_id_card_number) {
      throw new Error("Provide your BEF number or NBO Identity card number to continue.");
    }
    if (data.provider === "paystack") {
      if (data.entry_channel !== "nbo") throw new Error("Paystack is only available for NBO-subsidized entry.");
      if (!data.nigeria_id_type || !data.nigeria_id_number) {
        throw new Error("Nigerian NBO applicants must provide a means of identification (NIN, Voter's Card, Driver's License, or Passport) to continue.");
      }
    }

    const { data: signup, error: signupErr } = await supabaseAdmin
      .from("signup_requests")
      .insert({
        email: data.email.toLowerCase(), full_name: data.full_name, country: data.country ?? null,
        sponsor_name: data.sponsor_name, entry_channel: data.entry_channel, cohort_id: data.cohort_id,
        bef_number: data.bef_number ?? null, nbo_id_card_number: data.nbo_id_card_number ?? null,
        nigeria_id_type: data.nigeria_id_type ?? null, nigeria_id_number: data.nigeria_id_number ?? null,
      })
      .select("id").single();
    if (signupErr) throw signupErr;

    const entryChannel = data.entry_channel as EntryChannel;
    const successUrl = `${SITE_URL}/signup?paid=1`;
    const cancelUrl = `${SITE_URL}/signup?cancelled=1`;

    if (data.provider === "paystack") {
      const txId = await createPendingTransaction(supabaseAdmin, {
        signup_request_id: signup.id, purpose: "dse_entry", provider: "paystack",
        amount_usd: dseEntryAmountUsd(entryChannel), charged_currency: "NGN", charged_amount: DSE_ENTRY_NGN_NBO,
      });
      const url = await createPaystackCheckout(txId, data.email, DSE_ENTRY_NGN_NBO, "DSE Entry (NBO subsidy, or local equivalent)", { callbackUrl: successUrl });
      return { url };
    }

    const amountUsd = dseEntryAmountUsd(entryChannel);
    const txId = await createPendingTransaction(supabaseAdmin, {
      signup_request_id: signup.id, purpose: "dse_entry", provider: "stripe",
      amount_usd: amountUsd, charged_currency: "USD", charged_amount: amountUsd,
    });
    const url = await createStripeCheckout(txId, amountUsd, "DSE Entry", { successUrl, cancelUrl });
    return { url };
  });
