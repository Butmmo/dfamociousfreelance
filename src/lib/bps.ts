// The Blazer Productivity Scheme — pure computation, mirroring escalation.ts,
// dfy.ts and mentorship.ts's shape. Source: dfg's references/bps-cadence.md
// and nbo's references/nbc-curriculum.md (BPS Assignments 5 and 6). Where
// this file and those documents differ, the documents govern — the fixed
// remark language especially is verbatim, not paraphrased.

export interface GoalItem {
  text: string;
  done: boolean;
}

export const BPS_PILLARS = [
  { key: "finance", label: "Finance Goal", hint: "Income target and source — weeks 1-3 sales and marketing, week 4 skill training." },
  { key: "self_dev", label: "Self-Development Goal", hint: "Specific pages/chapters, daily or weekly reading targets, time commitment." },
  { key: "mlm", label: "Multilevel Marketing Goal", hint: "Marked NIL until you actually become a distributor. No assumptions, no imagination." },
  { key: "relationship", label: "Relationship Goal (Sponsor)", hint: "Total sessions, split between virtual and physical, with a stated purpose." },
] as const;

export type PillarKey = (typeof BPS_PILLARS)[number]["key"];

/** Starting point when a pillar is first shown — beneficiaries may add or remove items freely from here. */
export const PILLAR_ITEM_COUNT = 3;

export const MLM_DEFAULT_GOAL = "NIL – Not yet a distributor";

export interface CustomPillar {
  key: string;
  label: string;
  goal: string;
  items: GoalItem[];
}

/**
 * The Finance Goal's NBO-oriented copy ("weeks 1-3 sales and marketing")
 * only applies to NBC-trained beneficiaries. For everyone else the
 * finance target is structural instead: leads to contact, messages to
 * send, new vs. returning client counts, and an expected average sale
 * price — the revenue target is derived, not typed.
 */
export function computeFinanceRevenueTarget(
  avgPriceUsd: number | null | undefined,
  newClients: number | null | undefined,
  returningClients: number | null | undefined,
): number {
  const price = avgPriceUsd ?? 0;
  const clients = (newClients ?? 0) + (returningClients ?? 0);
  return price * clients;
}

export interface FinanceMetrics {
  leads: number;
  messages: number;
  newClients: number;
  returningClients: number;
  revenueUsd: number;
}

/**
 * A BPS Month's cycle length is NOT a flat 40 days — it's the exact span
 * from the 1st of the month before the target month (Belief due) through
 * the 10th of the target month itself (Evaluation due), inclusive. That
 * span varies 38-41 days depending on how long the prior month is (e.g.
 * August's cycle is July 1 - August 10 = 41 days; February's is 28+10 =
 * 38). See bpsMonthWindowDays(). The Affirmation checkpoint is always
 * exactly 14 days in (the 1st to the 15th), regardless of month length.
 */
export const FINANCE_CYCLE_WEEKS = 6;
export const FINANCE_CHECKPOINT_DAYS = 14;

const emptyFinanceMetrics: FinanceMetrics = { leads: 0, messages: 0, newClients: 0, returningClients: 0, revenueUsd: 0 };

function divideFinanceMetrics(m: FinanceMetrics, n: number): FinanceMetrics {
  return {
    leads: m.leads / n,
    messages: m.messages / n,
    newClients: m.newClients / n,
    returningClients: m.returningClients / n,
    revenueUsd: m.revenueUsd / n,
  };
}

function scaleFinanceMetrics(m: FinanceMetrics, n: number): FinanceMetrics {
  return {
    leads: m.leads * n,
    messages: m.messages * n,
    newClients: m.newClients * n,
    returningClients: m.returningClients * n,
    revenueUsd: m.revenueUsd * n,
  };
}

export interface FinanceCycleTargets {
  monthly: FinanceMetrics;
  weekly: FinanceMetrics;
  daily: FinanceMetrics;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Compulsory, fixed to the calendar — never relative to when a
 * beneficiary happens to sign up or submit. The Belief Goal for a given
 * target month is due the 1st of the month before it (August's Belief
 * Goal is due July 1), independent of anything the beneficiary does.
 */
export function beliefDueDate(targetMonth: Date): Date {
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
}

/** The 15th of the month before the target month — always exactly 14 days after beliefDueDate. */
export function affirmationDueDate(targetMonth: Date): Date {
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 15);
}

/** The 10th of the target month itself. */
export function evaluationDueDate(targetMonth: Date): Date {
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 10);
}

/**
 * The BPS Month's full span — beliefDueDate through evaluationDueDate,
 * inclusive — is what "money made in the BPS Month" actually means (e.g.
 * August's BPS Month is July 1 through August 10, 41 days). Only this
 * window's revenue is subject to the NBO Pocket System.
 */
export function bpsMonthWindowDays(targetMonth: Date): number {
  return daysBetween(beliefDueDate(targetMonth), evaluationDueDate(targetMonth)) + 1;
}

/**
 * Whatever a beneficiary sets as their monthly Financial Goal (leads,
 * messages, new/returning clients, and the revenue those imply) gets
 * broken into weekly and daily standards so it can actually be measured
 * day to day — not just set once and checked at the end. Weekly is
 * always monthly/6; daily is monthly divided by this specific target
 * month's actual BPS Month length (bpsMonthWindowDays), not a flat
 * constant, since that length varies by a few days depending on the
 * prior month.
 */
export function computeFinanceCycleTargets(goal: {
  finance_leads_target: number | null | undefined;
  finance_messages_target: number | null | undefined;
  finance_new_clients_target: number | null | undefined;
  finance_returning_clients_target: number | null | undefined;
  finance_avg_price_usd: number | null | undefined;
}, targetMonth: Date): FinanceCycleTargets {
  const monthly: FinanceMetrics = {
    leads: goal.finance_leads_target ?? 0,
    messages: goal.finance_messages_target ?? 0,
    newClients: goal.finance_new_clients_target ?? 0,
    returningClients: goal.finance_returning_clients_target ?? 0,
    revenueUsd: computeFinanceRevenueTarget(
      goal.finance_avg_price_usd, goal.finance_new_clients_target, goal.finance_returning_clients_target,
    ),
  };
  return {
    monthly,
    weekly: divideFinanceMetrics(monthly, FINANCE_CYCLE_WEEKS),
    daily: divideFinanceMetrics(monthly, bpsMonthWindowDays(targetMonth)),
  };
}

/** The pro-rated expectation for a given number of days into the 40-day cycle — the day-14 checkpoint target, for instance. */
export function financeExpectationForDays(targets: FinanceCycleTargets, days: number): FinanceMetrics {
  return scaleFinanceMetrics(targets.daily, days);
}

export function sumFinanceEntries(entries: {
  leads_contacted: number; messages_sent: number; new_clients_closed: number;
  returning_clients_closed: number; revenue_usd: number;
}[]): FinanceMetrics {
  return entries.reduce((acc, e) => ({
    leads: acc.leads + e.leads_contacted,
    messages: acc.messages + e.messages_sent,
    newClients: acc.newClients + e.new_clients_closed,
    returningClients: acc.returningClients + e.returning_clients_closed,
    revenueUsd: acc.revenueUsd + Number(e.revenue_usd),
  }), { ...emptyFinanceMetrics });
}

/** Every non-empty item across the built-in pillars and any custom pillars — the flat set of things worth tracking daily. */
export function deriveActivityLabels(pillars: {
  finance_items: GoalItem[]; self_dev_items: GoalItem[]; mlm_items: GoalItem[]; relationship_items: GoalItem[];
  custom_pillars: CustomPillar[];
}): string[] {
  const all = [
    ...pillars.finance_items, ...pillars.self_dev_items, ...pillars.mlm_items, ...pillars.relationship_items,
    ...pillars.custom_pillars.flatMap((p) => p.items),
  ];
  return all.map((i) => i.text.trim()).filter(Boolean);
}

/** Per the fixed-date planning rule: you're always executing next month's plan. */
export function defaultTargetMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * Parses a "YYYY-MM-01" target_month key into a local Date. Deliberately
 * NOT `new Date(key)` — a bare "YYYY-MM-DD" string parses as UTC midnight
 * per the JS spec, and reading it back with local getters (getMonth(),
 * as beliefDueDate/affirmationDueDate/evaluationDueDate all do) can land
 * on the wrong month for anyone west of UTC.
 */
export function parseTargetMonth(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Affirmation Goal remark — a 14-day effort report on the Belief Goal.
 * Thresholds and wording are strict, verbatim from BPS Assignment 6.
 */
export function affirmationRemark(percent: number): string {
  if (percent >= 72) return "Effort is satisfactory. Goal set to be achieved";
  if (percent >= 60) return "Effort is minimal. Goal not taken seriously";
  return "Effort is below requisite. Failure of goal is imminent";
}

/**
 * Evaluation Goal remark — a 40-day effort evaluation from Belief Goal
 * submission. Different thresholds and different wording from Affirmation
 * — the two are never interchangeable.
 */
export function evaluationRemark(percent: number): string {
  if (percent >= 75) return "My effort is satisfactory. Goal set will be achieved";
  if (percent >= 60) return "My effort has been minimal. This goal may not be achieved";
  return "My effort has been poor. The goal is unmet";
}

export interface EffortScore {
  score: number;
  total: number;
  percent: number;
}

/**
 * Effort score for a window of days: how many of the possible daily binary
 * checks (across every active tracked activity) actually happened.
 * total = days in window × active activity count, so multiple tracked
 * activities are supported even though the doctrine's own worked example
 * only shows a single metric (8/14).
 */
export function computeEffortScore(checks: { done: boolean }[], activityCount: number, windowDays: number): EffortScore {
  const total = activityCount * windowDays;
  const score = checks.filter((c) => c.done).length;
  const percent = total > 0 ? (score / total) * 100 : 0;
  return { score, total, percent };
}

export type GoalCycleStatus =
  | "belief_due" | "affirmation_pending" | "affirmation_due" | "evaluation_pending" | "evaluation_due" | "complete";

/**
 * "Pending" means the next step's fixed calendar date hasn't arrived yet
 * (the earlier step is done, but it's too early to submit the next one);
 * "due" means that date has arrived and the step is actionable now.
 */
export function goalCycleStatus(
  row: {
    belief_submitted_at: string | null;
    affirmation_submitted_at: string | null;
    evaluation_submitted_at: string | null;
  },
  targetMonth: Date,
  now: Date = new Date(),
): GoalCycleStatus {
  if (row.evaluation_submitted_at) return "complete";
  if (row.affirmation_submitted_at) {
    return now >= evaluationDueDate(targetMonth) ? "evaluation_due" : "evaluation_pending";
  }
  if (row.belief_submitted_at) {
    return now >= affirmationDueDate(targetMonth) ? "affirmation_due" : "affirmation_pending";
  }
  return "belief_due";
}
