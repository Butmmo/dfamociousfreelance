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

/** A monthly Financial Goal's cycle length: day 14 is the Affirmation checkpoint, day 40 is the full Evaluation cycle. */
export const FINANCE_CYCLE_DAYS = 40;
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

/**
 * Whatever a beneficiary sets as their monthly Financial Goal (leads,
 * messages, new/returning clients, and the revenue those imply) gets
 * broken into weekly and daily standards so it can actually be measured
 * day to day — not just set once and checked at the end. The cycle is 40
 * working days (the same window the Evaluation Goal already uses), so
 * weekly = monthly / 6 and daily = monthly / 40.
 */
export function computeFinanceCycleTargets(goal: {
  finance_leads_target: number | null | undefined;
  finance_messages_target: number | null | undefined;
  finance_new_clients_target: number | null | undefined;
  finance_returning_clients_target: number | null | undefined;
  finance_avg_price_usd: number | null | undefined;
}): FinanceCycleTargets {
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
    daily: divideFinanceMetrics(monthly, FINANCE_CYCLE_DAYS),
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

/** Belief Goal is submitted ~30 days before the target month begins. */
export function beliefDueDate(targetMonth: Date): Date {
  const d = new Date(targetMonth);
  d.setDate(d.getDate() - 30);
  return d;
}

/** Affirmation Goal is submitted ~15 days before the target month begins. */
export function affirmationDueDate(targetMonth: Date): Date {
  const d = new Date(targetMonth);
  d.setDate(d.getDate() - 15);
  return d;
}

/** Evaluation Goal is submitted on the 10th day of the target month. */
export function evaluationDueDate(targetMonth: Date): Date {
  const d = new Date(targetMonth);
  d.setDate(10);
  return d;
}

/** Per the 30-day planning rule: you're always executing next month's plan. */
export function defaultTargetMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
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

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type GoalCycleStatus = "planning" | "belief_due" | "affirmation_due" | "evaluation_due" | "complete";

export function goalCycleStatus(row: {
  belief_submitted_at: string | null;
  affirmation_submitted_at: string | null;
  evaluation_submitted_at: string | null;
}): GoalCycleStatus {
  if (row.evaluation_submitted_at) return "complete";
  if (row.affirmation_submitted_at) return "evaluation_due";
  if (row.belief_submitted_at) return "affirmation_due";
  return "belief_due";
}
