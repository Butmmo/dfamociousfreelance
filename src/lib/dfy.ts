// DFY (D'Famocious Year) computation — shared by the beneficiary DFY page and
// admin verification surfaces. Pure functions over dfy_months rows; nothing
// here is stored that's derivable, matching the pattern already used by
// escalation.ts. All figures are USD.
//
// Source: digital-systems-engineering skill's references/pricing-and-dfy.md.
// Where this file and that document differ, the document governs.

export const QUALIFYING_MONTH_THRESHOLD_USD = 2000;
export const DFY_REMITTANCE_RATE = 0.20;
export const DFY_CAP_USD = 18000;
export const QUALIFIED_MONTHS_TARGET = 12;

export const SUC_TARGET_USD = 450_000;
export const SUC_RATE_PER_YEAR_USD = 90_000; // $450,000 ÷ 5 years
export const SUC_EXCELLENCE_WINDOW_YEARS = 4; // Tier 1 covers years 1-4
export const SUC_NORMAL_GATE_YEAR = 5;

export type DfyMonthStatus = "submitted" | "remittance_paid" | "verified" | "disputed";

export type DfyMonthRow = {
  period_month: string; // ISO date, day 1 of the month
  net_income_usd: number;
  qualified: boolean;
  remittance_owed_usd: number;
  remittance_paid: boolean;
  status: DfyMonthStatus;
};

export interface DfyProgress {
  qualifiedMonths: number;
  monthsRemaining: number;
  cumulativeNetIncomeUsd: number;
  cumulativeRemittedUsd: number;
  capReached: boolean;
  complete: boolean;
  completionReason: "qualified_months" | "cap" | null;
}

/**
 * Rolls up a beneficiary's dfy_months rows into their DFY progress.
 * Every earning month generates a remittance regardless of qualification
 * status — only qualified months move the counter toward 12. Completion is
 * 12 qualified months OR the $18,000 cap, whichever comes first.
 */
export function dfyProgress(rows: DfyMonthRow[]): DfyProgress {
  const qualifiedMonths = rows.filter((r) => r.qualified).length;
  const cumulativeNetIncomeUsd = rows.reduce((sum, r) => sum + r.net_income_usd, 0);
  const cumulativeRemittedUsd = rows.reduce((sum, r) => sum + r.remittance_owed_usd, 0);
  const capReached = cumulativeRemittedUsd >= DFY_CAP_USD;
  const monthsComplete = qualifiedMonths >= QUALIFIED_MONTHS_TARGET;
  const complete = monthsComplete || capReached;

  return {
    qualifiedMonths,
    monthsRemaining: Math.max(0, QUALIFIED_MONTHS_TARGET - qualifiedMonths),
    cumulativeNetIncomeUsd,
    cumulativeRemittedUsd,
    capReached,
    complete,
    completionReason: !complete ? null : monthsComplete ? "qualified_months" : "cap",
  };
}

export interface SucPace {
  yearsElapsed: number;
  cumulativeEarningsUsd: number;
  /** cumulative ÷ ($90,000 × years elapsed) × 100 — the trackable-from-day-one early-warning signal. */
  pacePercent: number;
  /** Tier 1 — Performance Per Excellence: flat $450,000, achievable in years 1-4. */
  excellenceTargetUsd: number;
  excellenceEligible: boolean;
  excellenceMet: boolean;
  /** Tier 2 — Normal Gate: the standard $450,000 threshold, specifically at year 5. */
  normalGateTargetUsd: number;
  normalGateEligible: boolean;
  normalGateMet: boolean;
  /** Tier 3 — Equivalent Qualification: $90,000 × years elapsed, continuous from year 5 onward. */
  equivalentTargetUsd: number;
  equivalentEligible: boolean;
  equivalentMet: boolean;
  /** True if any tier's bar is currently met. */
  qualifies: boolean;
}

/**
 * The three-tier SUC readiness calculator. Show all three tiers together —
 * a beneficiary may not yet know which one they'll land in, and seeing
 * their trajectory against all three is more useful than a single verdict.
 */
export function sucPace(cumulativeEarningsUsd: number, yearsElapsed: number): SucPace {
  const years = Math.max(0, yearsElapsed);
  const paceTargetUsd = SUC_RATE_PER_YEAR_USD * years;
  const pacePercent = paceTargetUsd > 0 ? (cumulativeEarningsUsd / paceTargetUsd) * 100 : 0;

  const excellenceEligible = years <= SUC_EXCELLENCE_WINDOW_YEARS;
  const excellenceMet = excellenceEligible && cumulativeEarningsUsd >= SUC_TARGET_USD;

  const normalGateEligible = years >= SUC_NORMAL_GATE_YEAR;
  const normalGateMet = normalGateEligible && cumulativeEarningsUsd >= SUC_TARGET_USD;

  const equivalentEligible = years >= SUC_NORMAL_GATE_YEAR;
  const equivalentTargetUsd = paceTargetUsd;
  const equivalentMet = equivalentEligible && cumulativeEarningsUsd >= equivalentTargetUsd;

  return {
    yearsElapsed: years,
    cumulativeEarningsUsd,
    pacePercent,
    excellenceTargetUsd: SUC_TARGET_USD,
    excellenceEligible,
    excellenceMet,
    normalGateTargetUsd: SUC_TARGET_USD,
    normalGateEligible,
    normalGateMet,
    equivalentTargetUsd,
    equivalentEligible,
    equivalentMet,
    qualifies: excellenceMet || normalGateMet || equivalentMet,
  };
}

/** The canonical DFY disclosure statement — use verbatim, never paraphrase. */
export const DFY_DISCLOSURE =
  "DFY is a revenue-share obligation — 20% of your earnings while it's active, capped at $18,000 total, " +
  "ending at 12 qualified months or the cap, whichever comes first. This is a real, binding financial " +
  "commitment; plan for it the way you'd plan for any other significant obligation.";

/** First day of the current calendar month, as an ISO date string (matches period_month's shape). */
export function currentPeriodMonth(now = new Date()): string {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10);
}
