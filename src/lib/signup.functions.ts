// Public self-signup: fill details, pay the DSE entry fee — the account
// itself is only created once that payment succeeds (see provisionFromSignup
// in the two webhook edge functions, and in payments.functions.ts for the
// manual-override path). This function carries no requireSupabaseAuth —
// it's the one place in the app meant to be called by someone with no
// session at all.
//
// Cohort assignment is never the applicant's choice: only the founder may
// place a participant in a specific cohort, and short of that a signup
// lands unassigned unless an admin has turned on random assignment among
// cohorts with room. Both policies live centrally in handle_new_user() —
// this file simply leaves signup_requests.cohort_id null and lets that
// trigger decide once the account is actually provisioned.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  dseEntryAmountUsd, DSE_ENTRY_NGN_NBO, type EntryChannel,
} from "@/lib/payments";
import {
  createPendingTransaction, createPaystackCheckout, verifyNinWithProvider, SITE_URL,
} from "@/lib/payments.functions";

const signupSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  country: z.string().trim().max(120).optional(),
  sponsor_name: z.string().trim().min(1).max(160).default("Boluwatife Famokunwa"),
  entry_channel: z.enum(["nbo", "direct"]).default("direct"),
  bef_number: z.string().trim().max(80).optional(),
  nin_number: z.string().trim().regex(/^\d{11}$/, "NIN must be 11 digits").optional(),
  currency: z.enum(["USD", "NGN"]).default("USD"),
});

/** Submits the application and immediately returns a checkout URL — nothing about the applicant is written to profiles/auth.users until Paystack confirms payment. */
export const submitSignup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => signupSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles").select("id").ilike("email", data.email).maybeSingle();
    if (existingProfile) throw new Error("An account with this email already exists — log in and use the Payments page instead.");

    const { data: pendingSignup } = await supabaseAdmin
      .from("signup_requests").select("id").ilike("email", data.email).eq("status", "pending").maybeSingle();
    if (pendingSignup) throw new Error("You already have an application pending payment. Check your email, or contact an admin if the checkout link expired.");

    // Same rule as the existing beneficiary flow (createDseEntryCheckout):
    // every NBO applicant needs a BEF Reg. Number, and the ₦75,000 local
    // rate additionally needs a NIN that actually matches the name given —
    // re-verified here, not just trusted from the live "Verify NIN" button,
    // since that's what actually stands between the discount and anyone
    // who could otherwise just claim it.
    if (data.entry_channel === "nbo" && !data.bef_number) {
      throw new Error("Provide your BEF Reg. Number to continue.");
    }
    let ninVerifiedAt: string | null = null;
    if (data.currency === "NGN") {
      if (data.entry_channel !== "nbo") throw new Error("The ₦75,000 local rate is only available for NBO-subsidized entry.");
      if (!data.nin_number) throw new Error("Verify your NIN to continue with the local rate.");
      const { verified } = await verifyNinWithProvider(data.nin_number, data.full_name);
      if (!verified) throw new Error("That NIN doesn't match the name provided — double check both and try again.");
      ninVerifiedAt = new Date().toISOString();
    }

    const { data: signup, error: signupErr } = await supabaseAdmin
      .from("signup_requests")
      .insert({
        email: data.email.toLowerCase(), full_name: data.full_name, country: data.country ?? null,
        sponsor_name: data.sponsor_name, entry_channel: data.entry_channel,
        bef_number: data.bef_number ?? null,
        nigeria_id_type: ninVerifiedAt ? "nin" : null, nigeria_id_number: ninVerifiedAt ? data.nin_number : null,
        nigeria_id_verified_at: ninVerifiedAt,
      })
      .select("id").single();
    if (signupErr) throw signupErr;

    const entryChannel = data.entry_channel as EntryChannel;
    const successUrl = `${SITE_URL}/signup?paid=1`;

    if (data.currency === "NGN") {
      const txId = await createPendingTransaction(supabaseAdmin, {
        signup_request_id: signup.id, purpose: "dse_entry", provider: "paystack",
        amount_usd: dseEntryAmountUsd(entryChannel), charged_currency: "NGN", charged_amount: DSE_ENTRY_NGN_NBO,
      });
      const url = await createPaystackCheckout(txId, data.email, DSE_ENTRY_NGN_NBO, "NGN", "DSE Entry (NBO subsidy, or local equivalent)", { callbackUrl: successUrl });
      return { url };
    }

    const amountUsd = dseEntryAmountUsd(entryChannel);
    const txId = await createPendingTransaction(supabaseAdmin, {
      signup_request_id: signup.id, purpose: "dse_entry", provider: "paystack",
      amount_usd: amountUsd, charged_currency: "USD", charged_amount: amountUsd,
    });
    const url = await createPaystackCheckout(txId, data.email, amountUsd, "USD", "DSE Entry", { callbackUrl: successUrl });
    return { url };
  });
