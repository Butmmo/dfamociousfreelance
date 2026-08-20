// The NBO Pocket System — binding Pocket Policy, not a suggestion. Every
// BPS Month's revenue (see bps.ts's bpsMonthWindowDays) is split five ways
// the moment that cycle's Evaluation Goal is submitted. Pure computation
// only, mirroring bps.ts's and escalation.ts's shape.
//
// Each pocket's SPLIT (25/25/20/20/10) is fixed, but what happens to the
// money once it lands differs per pocket:
//   Upkeep      — always available, no gate.
//   Investments — mentor-released, not self-service; see
//                 investmentSafeguardDue for the annual ceiling on how
//                 long a mentor can withhold it.
//   MLM Product — only has a purpose for a BPN (Blazer People Network)
//                 participant; see computeMlmPolicy for the BPN-linked
//                 diversion, monthly ceiling, and running-balance cap.
//   Emergency   — Rep-approved on request, except a biannual automatic
//                 partial release (see emergencyAutoReleasePeriod).
//   Savings     — locked in 3-year cycles; each completed cycle issues a
//                 withdrawal permit for what accrued and starts a new one.

export const POCKET_POLICY = {
  upkeep: 0.25,
  savings: 0.25,
  investments: 0.20,
  mlm: 0.20,
  emergency: 0.10,
} as const;

export type PocketKey = keyof typeof POCKET_POLICY;

export const POCKET_LABELS: Record<PocketKey, string> = {
  upkeep: "Upkeep / Spending Pocket",
  savings: "Savings Pocket",
  investments: "Investments Pocket",
  mlm: "MLM Product Purchase Pocket",
  emergency: "Emergency Pocket",
};

export const POCKET_HINTS: Record<PocketKey, string> = {
  upkeep: "Day-to-day spending — always available.",
  savings: "Long-term savings. Each completed 3-year cycle issues a withdrawal permit for what accrued and starts a new cycle.",
  investments: "Capital for what you're actively building. Released by your mentor as it's needed — fully released at least once a year regardless.",
  mlm: "Neolife product purchase, for BPN (Blazer People Network) participants — if you're not enrolled, this share goes to Investments instead.",
  emergency: "Short-term, for real emergencies — propose to your Rep to withdraw, or draw from the automatic March/October release.",
};

/** $225 USD is the app's approximation of 250 PPV worth of Neolife product — the conversion rate every MLM-pocket dollar figure below is derived from. */
export const PPV_TO_USD_RATE = 225 / 250;
export function usdForPpv(ppv: number): number {
  return ppv * PPV_TO_USD_RATE;
}

/** NBO's own PPV ceiling for personal use — advised 250, hard cap 300 (bpn skill, "Blazer People Network"). Governs the beneficiary's actual Neolife purchases, not the pocket ledger directly. */
export const BPN_PPV_ADVISED_CAP = 250;
export const BPN_PPV_HARD_CAP = 300;

/** The MLM pocket's own monthly inflow band: 250 PPV floor (a target, never a forced top-up — the ledger never manufactures money the month's revenue share doesn't have) and 500 PPV (2× target) ceiling. */
export const MLM_MONTHLY_FLOOR_USD = usdForPpv(250);
export const MLM_MONTHLY_CEILING_USD = usdForPpv(500);

/** The MLM pocket's running balance never exceeds this — inflow that would push it over diverts the excess to Investments instead. */
export const MLM_BALANCE_CAP_USD = 1500;

/** Minimum cumulative net income (DFY's own tracked figure) before a beneficiary may enroll in BPN — BPN itself requires ongoing product spend, so this is a financial-readiness gate, not an arbitrary one. */
export const BPN_ELIGIBILITY_MIN_NET_INCOME_USD = 1000;

/** The Savings Pocket is only available in fixed 3-year cycles. */
export const SAVINGS_CYCLE_YEARS = 3;

/** The longest a mentor may withhold the Investments Pocket before it releases in full regardless. */
export const INVESTMENT_ANNUAL_SAFEGUARD_DAYS = 365;

/** March and October — the Emergency Pocket's two no-request-needed release months. */
export const EMERGENCY_AUTO_RELEASE_MONTHS = [3, 10] as const;
export const EMERGENCY_AUTO_RELEASE_RATE = 0.40;

export interface PocketSplit {
  upkeepUsd: number;
  savingsUsd: number;
  investmentsUsd: number;
  mlmUsd: number;
  emergencyUsd: number;
}

/** The raw, nominal 25/25/20/20/10 split of a BPS Month's revenue — the starting point computeMlmPolicy then adjusts (mlm's nominal share may partly or fully divert to investments). */
export function computePocketSplit(revenueUsd: number): PocketSplit {
  const r = Math.max(0, revenueUsd);
  return {
    upkeepUsd: r * POCKET_POLICY.upkeep,
    savingsUsd: r * POCKET_POLICY.savings,
    investmentsUsd: r * POCKET_POLICY.investments,
    mlmUsd: r * POCKET_POLICY.mlm,
    emergencyUsd: r * POCKET_POLICY.emergency,
  };
}

export interface MlmPolicyResult {
  mlmInflowUsd: number;
  divertedToInvestmentUsd: number;
}

/**
 * Applies the MLM pocket's BPN-linked rules to its nominal 20% share for
 * one BPS Month:
 *   - Not enrolled in BPN → the entire nominal share diverts to
 *     Investments; the MLM pocket has no purpose for a non-participant.
 *   - Enrolled → capped at MLM_MONTHLY_CEILING_USD for this month's
 *     inflow, and the resulting running balance capped at
 *     MLM_BALANCE_CAP_USD — whatever the nominal share can't fit under
 *     either cap diverts to Investments instead of being lost.
 */
export function computeMlmPolicy(nominalMlmShareUsd: number, bpnEnrolled: boolean, priorMlmBalanceUsd: number): MlmPolicyResult {
  const nominal = Math.max(0, nominalMlmShareUsd);
  if (!bpnEnrolled) {
    return { mlmInflowUsd: 0, divertedToInvestmentUsd: nominal };
  }
  const afterCeiling = Math.min(nominal, MLM_MONTHLY_CEILING_USD);
  const roomUnderBalanceCap = Math.max(0, MLM_BALANCE_CAP_USD - Math.max(0, priorMlmBalanceUsd));
  const mlmInflowUsd = Math.min(afterCeiling, roomUnderBalanceCap);
  return { mlmInflowUsd, divertedToInvestmentUsd: nominal - mlmInflowUsd };
}

export function bpnEligible(cumulativeNetIncomeUsd: number): boolean {
  return cumulativeNetIncomeUsd >= BPN_ELIGIBILITY_MIN_NET_INCOME_USD;
}

/** How much of the Investments Pocket is still withheld pending mentor release. */
export function investmentLockedUsd(fundedUsd: number, unlockedUsd: number): number {
  return Math.max(0, fundedUsd - unlockedUsd);
}

/** True once a full year has passed since the last release (or since first funded, if never released) — the ceiling on the mentor's discretion. */
export function investmentSafeguardDue(lastReleaseAt: Date | null, firstFundedAt: Date | null, now: Date = new Date()): boolean {
  const since = lastReleaseAt ?? firstFundedAt;
  if (!since) return false;
  return (now.getTime() - since.getTime()) / 86_400_000 >= INVESTMENT_ANNUAL_SAFEGUARD_DAYS;
}

/** 40% of the current Emergency balance, released automatically — no request needed. */
export function emergencyAutoReleaseAmount(currentBalanceUsd: number): number {
  return Math.max(0, currentBalanceUsd) * EMERGENCY_AUTO_RELEASE_RATE;
}

/** "YYYY-MM" if `now` falls in a release month (in whatever timezone the caller already resolved `now` to), else null — the period key used to guard against releasing twice in the same window. */
export function emergencyAutoReleasePeriod(now: Date): string | null {
  const month = now.getMonth() + 1;
  if (!(EMERGENCY_AUTO_RELEASE_MONTHS as readonly number[]).includes(month)) return null;
  return `${now.getFullYear()}-${String(month).padStart(2, "0")}`;
}

/** The Savings Pocket's 3-year cycle boundary, counted from when the current cycle started. */
export function savingsUnlockDate(cycleStartedAt: Date): Date {
  return new Date(cycleStartedAt.getFullYear() + SAVINGS_CYCLE_YEARS, cycleStartedAt.getMonth(), cycleStartedAt.getDate());
}

export function isSavingsUnlocked(cycleStartedAt: Date | null, now: Date = new Date()): boolean {
  if (!cycleStartedAt) return false;
  return now >= savingsUnlockDate(cycleStartedAt);
}

export type EscalationLevel = "rep" | "sponsor_mentor" | "founder";

export const ESCALATION_LABELS: Record<EscalationLevel, string> = {
  rep: "Awaiting your Rep",
  sponsor_mentor: "Escalated to Sponsor/Mentor",
  founder: "Escalated to Founder",
};

/** Stage-to-stage SLA: 48 hours before a stalled request escalates one level up. */
export const ESCALATION_SLA_HOURS = 48;
