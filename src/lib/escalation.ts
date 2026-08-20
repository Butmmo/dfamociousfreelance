// Shared escalation & velocity logic used by Report page, dashboard, and admin surfaces.
// Cadence thresholds:
//   • <10 active days in last 14 days → score capped below 20%
//   • <6 active days in last 7 days   → score capped below 40%
// No dollar fine or automatic suspension attaches to either threshold — BEF's
// own discipline framework (identity-and-framework.md) requires a good-faith
// classification pass (Acceptable / Correctable / Disciplinary failure)
// before any sanction is even considered, and a missed cadence day is
// presumptively the first or second category, not the third. An algorithm
// charging a fine the instant a threshold is crossed skips that gate
// entirely, so it was removed; the underlying measurement it was reading —
// active days, task volume, streaks, score, band — stays exactly as before,
// since that's the beneficiary-and-mentor-facing signal the classification
// itself should be based on.
// GRACE PERIOD: Escalation tracking begins on ESCALATION_START (2026-08-10).
// Nothing before that date counts against a beneficiary. The 14-/7-day windows
// clamp to `max(windowStart, ESCALATION_START)` so people are not punished for
// history that predates the rule.

export const ESCALATION_START = new Date("2026-08-10T00:00:00.000Z");

export type ProgressRow = {
  playbook: string;
  task_id: string;
  completed: boolean;
  completed_at: string | null;
};

export interface EscalationSnapshot {
  score: number;
  band: "elite" | "healthy" | "watch" | "at_risk" | "critical";
  activeDaysLast7: number;
  activeDaysLast14: number;
  currentStreak: number;
  longestStreak: number;
  tasksLast7: number;
  tasksLast14: number;
  daysSinceLastActivity: number | null;
  reasons: string[];
  gracePeriodActive: boolean;      // true when part of the tracking window is before ESCALATION_START
  daysInGrace: number;             // how many of the 14 days are still in grace (informational)
}

// Buckets by the browser's own local calendar day. Date.toISOString()
// forces UTC first, which silently rolls "today" back a day for anyone
// ahead of UTC (WAT — this operation's own home base — included), so
// this reads the date parts straight off the Date object instead.
const startOfDayISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function activeDaySet(rows: ProgressRow[]): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    if (r.completed && r.completed_at) s.add(startOfDayISO(new Date(r.completed_at)));
  }
  return s;
}

function daysInWindow(days: Set<string>, from: Date, to: Date): number {
  let count = 0;
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    if (days.has(startOfDayISO(cur))) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function windowLength(from: Date, to: Date): number {
  const a = new Date(from); a.setHours(0, 0, 0, 0);
  const b = new Date(to); b.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((b.getTime() - a.getTime()) / 86_400_000) + 1);
}

function streaks(days: Set<string>, today: Date) {
  let current = 0;
  const cur = new Date(today);
  cur.setHours(0, 0, 0, 0);
  if (!days.has(startOfDayISO(cur))) cur.setDate(cur.getDate() - 1);
  while (days.has(startOfDayISO(cur))) {
    current++;
    cur.setDate(cur.getDate() - 1);
  }
  const sorted = [...days].sort();
  let longest = 0, run = 0;
  let prev: Date | null = null;
  for (const iso of sorted) {
    const d = new Date(iso);
    if (prev && (d.getTime() - prev.getTime()) === 86_400_000) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = d;
  }
  return { current, longest };
}

export function computeEscalation(
  rows: ProgressRow[],
  now: Date = new Date(),
  tpeDefaultingUntil: string | null = null,
): EscalationSnapshot {
  const days = activeDaySet(rows);

  // Requested window bounds
  const rawSeven = new Date(now); rawSeven.setDate(rawSeven.getDate() - 6);
  const rawFourteen = new Date(now); rawFourteen.setDate(rawFourteen.getDate() - 13);

  // Grace clamp — never count days before ESCALATION_START
  const seven = rawSeven < ESCALATION_START ? new Date(ESCALATION_START) : rawSeven;
  const fourteen = rawFourteen < ESCALATION_START ? new Date(ESCALATION_START) : rawFourteen;

  // Target thresholds scale with the effective window length while inside grace.
  const sevenLen = windowLength(seven, now);
  const fourteenLen = windowLength(fourteen, now);
  const target7 = Math.max(1, Math.round((6 / 7) * sevenLen));    // 6/7 rhythm
  const target14 = Math.max(1, Math.round((10 / 14) * fourteenLen));

  const activeDaysLast7 = daysInWindow(days, seven, now);
  const activeDaysLast14 = daysInWindow(days, fourteen, now);
  const { current: currentStreak, longest: longestStreak } = streaks(days, now);

  const withinLast = (from: Date) =>
    rows.filter(r => r.completed && r.completed_at && new Date(r.completed_at) >= from).length;
  const tasksLast7 = withinLast(seven);
  const tasksLast14 = withinLast(fourteen);

  let daysSinceLastActivity: number | null = null;
  if (days.size > 0) {
    const latest = [...days].sort().at(-1)!;
    const diff = Math.floor((now.getTime() - new Date(latest).getTime()) / 86_400_000);
    daysSinceLastActivity = Math.max(0, diff);
  }

  const gracePeriodActive = rawFourteen < ESCALATION_START;
  const daysInGrace = gracePeriodActive
    ? Math.min(14, Math.max(0, Math.ceil((ESCALATION_START.getTime() - rawFourteen.getTime()) / 86_400_000)))
    : 0;

  const reasons: string[] = [];
  if (gracePeriodActive) {
    reasons.push(`Grace period active — escalation tracking began ${startOfDayISO(ESCALATION_START)}`);
  }
  // Visibility only, same non-punitive treatment as the cadence bands
  // themselves — no score impact, just a signal the mentor/DSE Rep can see.
  if (tpeDefaultingUntil && new Date(tpeDefaultingUntil) >= new Date(startOfDayISO(now))) {
    reasons.push(`The Practise of Enterprise — defaulting on the weekly requirement, flagged until ${tpeDefaultingUntil}`);
  }

  // A. 14-day cadence (max 40) — scaled to target14
  const cadence14 = Math.max(0, Math.min(40, Math.round((activeDaysLast14 / target14) * 40)));
  if (activeDaysLast14 < target14) reasons.push(`${activeDaysLast14}/${target14} active days in tracked window (14d)`);

  // B. 7-day cadence (max 30) — scaled to target7
  const cadence7 = Math.max(0, Math.min(30, Math.round((activeDaysLast7 / target7) * 30)));
  if (activeDaysLast7 < target7) reasons.push(`${activeDaysLast7}/${target7} active days in tracked window (7d)`);

  // C. Task volume (max 15) — 20 tasks in the tracked 14-day window = full
  const volume = Math.max(0, Math.min(15, Math.round((tasksLast14 / 20) * 15)));
  if (tasksLast14 < 20) reasons.push(`${tasksLast14} tasks in tracked window (14d)`);

  // D. Streak bonus (max 15)
  const streakBonus = Math.min(15, currentStreak * 3);
  if (currentStreak === 0 && !gracePeriodActive) reasons.push("no active streak");

  let score = cadence14 + cadence7 + volume + streakBonus;

  // ── Cadence severity caps — ONLY when the full 14-day window is past the
  // cutoff. These cap the score (feeding the band below) so a serious
  // cadence gap still reads as "at_risk"/"critical" — but nothing here
  // levies a fine or suspension automatically. See the file header.
  if (!gracePeriodActive) {
    if (activeDaysLast14 < 10) {
      score = Math.min(score, 19);
      reasons.unshift("Below 10 days work in last 14 — cadence at risk");
    } else if (activeDaysLast7 < 6) {
      score = Math.min(score, 40);
      reasons.unshift("Below 6 days work in last 7 — cadence drifting");
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const band: EscalationSnapshot["band"] =
    score >= 85 ? "elite" :
    score >= 65 ? "healthy" :
    score >= 45 ? "watch" :
    score >= 20 ? "at_risk" : "critical";

  return {
    score, band,
    activeDaysLast7, activeDaysLast14,
    currentStreak, longestStreak,
    tasksLast7, tasksLast14,
    daysSinceLastActivity, reasons,
    gracePeriodActive, daysInGrace,
  };
}

export function forecastFirstClose(
  rows: ProgressRow[],
  startDate: Date | null,
  now: Date = new Date(),
) {
  const planRows = rows.filter(r => r.playbook === "p_45day" && r.completed);
  const tasksDone = planRows.length;
  const TOTAL_PLAN_TASKS = 220;
  const CLOSE_THRESHOLD = 130;
  const elapsedDays = startDate
    ? Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86_400_000) + 1)
    : Math.max(1, new Set(planRows.map(r => (r.completed_at ?? "").slice(0, 10))).size);
  const tasksPerDay = tasksDone / elapsedDays;
  const remainingToClose = Math.max(0, CLOSE_THRESHOLD - tasksDone);
  const daysToClose = tasksPerDay > 0 ? Math.ceil(remainingToClose / tasksPerDay) : null;
  const closeProgress = Math.min(100, Math.round((tasksDone / CLOSE_THRESHOLD) * 100));
  return {
    tasksDone, elapsedDays, tasksPerDay, daysToClose, closeProgress,
    totalPlanTasks: TOTAL_PLAN_TASKS,
    remainingTotal: Math.max(0, TOTAL_PLAN_TASKS - tasksDone),
  };
}

export function advice(snapshot: EscalationSnapshot, forecast: ReturnType<typeof forecastFirstClose>): string[] {
  const out: string[] = [];
  if (snapshot.gracePeriodActive) {
    out.push(`Grace period active — the new tracking system started ${startOfDayISO(ESCALATION_START)}. Use it to build a rhythm; the full 14-day rule kicks in once the window is entirely post-cutoff.`);
  }
  if (snapshot.band === "critical") {
    out.push("You are one step from formal suspension. Log at least one task today and message your council admin now.");
  } else if (snapshot.band === "at_risk") {
    out.push("Escalation is imminent. Complete 3 tasks today and 3 tomorrow to leave the at-risk zone.");
  } else if (snapshot.band === "watch") {
    out.push("You're inside the safe band, but drifting. Lock in a 2-hour daily window and defend it this week.");
  } else if (snapshot.band === "healthy") {
    out.push("Cadence is holding. Now double down on prospecting depth — quality of outreach is your next unlock.");
  } else {
    out.push("You are pacing at the top of the cohort. Consider stacking the Grand Slam Offer playbook alongside daily prospecting.");
  }
  if (forecast.tasksPerDay > 0 && forecast.daysToClose !== null) {
    if (forecast.daysToClose > 45) {
      out.push(`At current pace (${forecast.tasksPerDay.toFixed(1)} tasks/day) your first close projects beyond Day ${forecast.elapsedDays + forecast.daysToClose}. Raise pace to ≥5 tasks/day to close inside the 45-day window.`);
    } else {
      out.push(`At current pace you should hit first-close territory in roughly ${forecast.daysToClose} more day${forecast.daysToClose === 1 ? "" : "s"}.`);
    }
  } else {
    out.push("You have no measurable pace yet — tick your first tasks today and the forecast will calibrate.");
  }
  if (snapshot.currentStreak >= 5) {
    out.push(`Streak of ${snapshot.currentStreak} days — protect it. Never break the chain on a Sunday.`);
  }
  return out;
}
