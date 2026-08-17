// The Blazer Productivity Scheme — pure computation, mirroring escalation.ts,
// dfy.ts and mentorship.ts's shape. Source: dfg's references/bps-cadence.md
// and nbo's references/nbc-curriculum.md (BPS Assignments 5 and 6). Where
// this file and those documents differ, the documents govern — the fixed
// remark language especially is verbatim, not paraphrased.

export const MAX_DAILY_ACTIVITIES = 4;

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

export const PILLAR_ITEM_COUNT = 3;

export const MLM_DEFAULT_GOAL = "NIL – Not yet a distributor";

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
