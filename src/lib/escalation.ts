// Shared escalation & velocity logic used by Report page, dashboard, and admin surfaces.
// Rules provided by the founder:
//   • <5 active days in last 14 days  → score < 20%, ₦7,000 fine + 2-week suspension
//   • <6 active days in last 7 days   → score < 40%, ₦2,500 fine
// GRACE PERIOD: Escalation tracking begins on ESCALATION_START (2026-07-06).
// Nothing before that date counts against a beneficiary. The 14-/7-day windows
// clamp to `max(windowStart, ESCALATION_START)` so people are not punished for
// history that predates the rule.

export const ESCALATION_START = new Date("2026-07-06T00:00:00.000Z");

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
  fineNGN: number;
  suspensionWeeks: number;
  daysSinceLastActivity: number | null;
  reasons: string[];
  gracePeriodActive: boolean;      // true when part of the tracking window is before ESCALATION_START
  daysInGrace: number;             // how many of the 14 days are still in grace (informational)
}

const startOfDayISO = (d: Date) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd.toISOString().slice(0, 10);
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

  // ── Hard-rule enforcement — ONLY when the full 14-day window is past the cutoff.
  let fineNGN = 0;
  let suspensionWeeks = 0;

  if (!gracePeriodActive) {
    if (activeDaysLast14 < 5) {
      score = Math.min(score, 19);
      fineNGN = 7000;
      suspensionWeeks = 2;
      reasons.unshift("Below 5 days work in last 14 → suspension + ₦7,000 fine");
    } else if (activeDaysLast7 < 6) {
      score = Math.min(score, 40);
      if (fineNGN < 2500) fineNGN = 2500;
      reasons.unshift("Below 6 days work in last 7 → ₦2,500 fine");
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
    fineNGN, suspensionWeeks,
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
