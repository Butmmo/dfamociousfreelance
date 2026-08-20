// The NBO Pocket System — binding Pocket Policy, not a suggestion. Every
// BPS Month's revenue (see bps.ts's bpsMonthWindowDays) is split five ways
// the moment that cycle's Evaluation Goal is submitted. Pure computation
// only, mirroring bps.ts's and escalation.ts's shape.

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
  savings: "Long-term savings, locked in 3-year cycles from your first funded allocation.",
  investments: "Capital deployed toward income-producing assets or ventures.",
  mlm: "Neolife product purchase — spend only enough for 250 PPV-equivalent. Whatever's left rolls into Savings.",
  emergency: "Short-term, for real emergencies only — propose to your Rep to withdraw.",
};

/** The Neolife Back-Office PPV target the MLM pocket exists to cover — a ceiling to spend up to, not a target to exhaust. */
export const MLM_TARGET_PPV = 250;

/** The Savings Pocket is only available in fixed 3-year cycles. */
export const SAVINGS_CYCLE_YEARS = 3;

export interface PocketSplit {
  upkeepUsd: number;
  savingsUsd: number;
  investmentsUsd: number;
  mlmUsd: number;
  emergencyUsd: number;
}

/** Splits a BPS Month's revenue per the binding Pocket Policy: 25/25/20/20/10. */
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

/** Whatever the MLM pocket doesn't spend on the 250-PPV-equivalent purchase rolls into Savings by default. */
export function mlmRollover(mlmUsd: number, mlmActualSpendUsd: number): number {
  return Math.max(0, mlmUsd - mlmActualSpendUsd);
}

/** The Savings Pocket's 3-year unlock date, counted from when it was first funded. */
export function savingsUnlockDate(firstFundedAt: Date): Date {
  return new Date(firstFundedAt.getFullYear() + SAVINGS_CYCLE_YEARS, firstFundedAt.getMonth(), firstFundedAt.getDate());
}

export function isSavingsUnlocked(firstFundedAt: Date | null, now: Date = new Date()): boolean {
  if (!firstFundedAt) return false;
  return now >= savingsUnlockDate(firstFundedAt);
}

export type EscalationLevel = "rep" | "sponsor_mentor" | "founder";

export const ESCALATION_LABELS: Record<EscalationLevel, string> = {
  rep: "Awaiting your Rep",
  sponsor_mentor: "Escalated to Sponsor/Mentor",
  founder: "Escalated to Founder",
};

/** Stage-to-stage SLA: 48 hours before a stalled request escalates one level up. */
export const ESCALATION_SLA_HOURS = 48;
