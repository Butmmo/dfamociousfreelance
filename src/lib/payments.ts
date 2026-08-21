// Payments — pure pricing computation, mirroring dfy.ts's shape. Source:
// digital-systems-engineering skill's references/pricing-and-dfy.md (DSE
// entry, SUC entry tiers) and the user's own instruction for the
// Paystack-specific NBO/Nigeria subsidy. All ledger figures are USD;
// Paystack's flat NGN price is the one deliberate exception (see
// DSE_ENTRY_NGN_NBO below).

export type EntryChannel = "nbo" | "direct";

/** DSE entry pricing in USD — $900 direct, or $90 via NBO's subsidy. */
export const DSE_ENTRY_USD: Record<EntryChannel, number> = {
  nbo: 90,
  direct: 900,
};

/**
 * Paystack only ever handles ONE thing: a further-subsidized flat ₦75,000
 * DSE entry fee, for NBO entrants paying from Nigeria specifically — not a
 * currency conversion of the $90 price. Every other payment (direct-entry
 * DSE, DFY remittances, SUC entry) goes through Stripe only. Show
 * "or local equivalent" wherever this displays, per instruction, so a
 * one-country subsidy doesn't read as favoritism.
 */
export const DSE_ENTRY_NGN_NBO = 75_000;
export const LOCAL_EQUIVALENT_DISCLAIMER = "or local equivalent";

export function dseEntryAmountUsd(entryChannel: EntryChannel): number {
  return DSE_ENTRY_USD[entryChannel];
}

export type SucEntryTier = "standard_2000" | "direct_6000" | "direct_24000";

/**
 * SUC entry tiers: the standard invited-through-DSE path keeps DBI's usual
 * 25% equity; direct entry can skip DSE at $6,000 (still 25%) or $24,000
 * (equity reduced to 10% instead) — a deliberate ladder, never a cliff
 * that removes DBI's stake entirely.
 */
export const SUC_ENTRY_TIERS: Record<SucEntryTier, { usd: number; equityPercent: number; label: string }> = {
  standard_2000: { usd: 2000, equityPercent: 25, label: "Standard (invited via DSE)" },
  direct_6000: { usd: 6000, equityPercent: 25, label: "Direct entry — 25% equity" },
  direct_24000: { usd: 24000, equityPercent: 10, label: "Direct entry — 10% equity" },
};

export type PaymentPurpose = "dse_entry" | "dfy_remittance" | "suc_entry";
export type PaymentProvider = "stripe" | "paystack";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export const PAYMENT_PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  dse_entry: "DSE Entry",
  dfy_remittance: "DFY Remittance",
  suc_entry: "SUC Entry",
};

/**
 * Once a beneficiary already has app access, DSE entry is no longer a
 * self-serve concern here — it was either paid up front via /signup or is
 * being reconciled off-app by an admin. So by default the DSE pay buttons
 * go inert and the SUC Entry section stays hidden until there's an actual
 * reason to be looking at it. SUC's "standard" $2,000 tier requires a real
 * invited/qualified verification workflow that doesn't exist yet — it stays
 * permanently non-clickable regardless of gate state; only the two "pay
 * more to skip the requirement" direct-entry tiers are ever payable.
 */
export interface PaymentsGateInput {
  dseEntryPaidAt: string | null;
  sucEntryPaidAt: string | null;
  vettedDseCertifiedAt: string | null;
  /** dfyProgress(months).complete — at least 12 qualified months or the $18,000 cap. */
  dfyComplete: boolean;
  /** sucPace(...).qualifies — any of the three earnings-pace tiers currently met. */
  sucPaceQualifies: boolean;
  /** Any qualified DFY month still owing a remittance — kept payable regardless of the gate below; real debt is never hidden. */
  hasUnpaidDfyRemittance: boolean;
}

export interface PaymentsGate {
  /** Nav visibility: is there anything on this page actually worth a beneficiary's attention right now. */
  showPaymentsLink: boolean;
  /** SUC Entry section visibility — qualifies for SUC, or at least finished DFY. */
  sucSectionUnlocked: boolean;
  /** DSE Entry pay buttons — inert once you already have access, unless you're the direct-to-SUC exception below. */
  dseButtonsClickable: boolean;
  /** Paid SUC without ever paying DSE — evidence this account's route bypassed DSE entirely, so DSE stays available to them. */
  enteredSucDirect: boolean;
}

export function computePaymentsGate(input: PaymentsGateInput): PaymentsGate {
  const sucQualified = !!input.vettedDseCertifiedAt || input.sucPaceQualifies;
  const enteredSucDirect = !!input.sucEntryPaidAt && !input.dseEntryPaidAt;
  const sucSectionUnlocked = sucQualified || input.dfyComplete;
  const dseButtonsClickable = !input.dseEntryPaidAt && enteredSucDirect;
  const showPaymentsLink = sucSectionUnlocked || input.hasUnpaidDfyRemittance || enteredSucDirect;
  return { showPaymentsLink, sucSectionUnlocked, dseButtonsClickable, enteredSucDirect };
}
