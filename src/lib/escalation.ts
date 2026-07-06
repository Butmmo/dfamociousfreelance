// Shared escalation & velocity logic used by Report page (and future admin surfaces).
// Rules provided by the founder:
//   • <5 active days in last 14 days  → score < 20%, ₦7,000 fine + 2-week suspension
//   • <6 active days in last 7 days   → score < 40%, ₦2,500 fine
// We layer additional inputs (weekly cadence, playbook depth, streak) so the number
// isn't binary. Everything is derived from `task_progress.completed_at`.

export type ProgressRow = {
  playbook: string;
  task_id: string;
  completed: boolean;
  completed_at: string | null;
};

export interface EscalationSnapshot {
  score: number;                        // 0-100 (higher = safer)
  band: "elite" | "healthy" | "watch" | "at_risk" | "critical";
  activeDaysLast7: number;
  activeDaysLast14: number;
  currentStreak: number;                // consecutive days with ≥1 completion, ending today (or yesterday)
  longestStreak: number;
  tasksLast7: number;
  tasksLast14: number;
  fineNGN: number;                      // 0, 2500, or 7000
  suspensionWeeks: number;              // 0 or 2
  daysSinceLastActivity: number | null; // null if never active
  reasons: string[];                    // human-readable factors
}

const startOfDayISO = (d: Date) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd.toISOString().slice(0, 10);
};

/** Set of YYYY-MM-DD strings where the beneficiary completed ≥1 task. */
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

function streaks(days: Set<string>, today: Date) {
  // current streak: walk back from today until a day is missing
  let current = 0;
  const cur = new Date(today);
  cur.setHours(0, 0, 0, 0);
  // allow "today not yet active but yesterday was" to still count
  if (!days.has(startOfDayISO(cur))) cur.setDate(cur.getDate() - 1);
  while (days.has(startOfDayISO(cur))) {
    current++;
    cur.setDate(cur.getDate() - 1);
  }
  // longest streak: sort dates
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
  const seven = new Date(now); seven.setDate(seven.getDate() - 6);   // inclusive 7-day window
  const fourteen = new Date(now); fourteen.setDate(fourteen.getDate() - 13);

  const activeDaysLast7 = daysInWindow(days, seven, now);
  const activeDaysLast14 = daysInWindow(days, fourteen, now);
  const { current: currentStreak, longest: longestStreak } = streaks(days, now);

  const withinLast = (windowDays: number) => {
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - (windowDays - 1));
    return rows.filter(r =>
      r.completed && r.completed_at && new Date(r.completed_at) >= cutoff,
    ).length;
  };
  const tasksLast7 = withinLast(7);
  const tasksLast14 = withinLast(14);

  // Days since last activity
  let daysSinceLastActivity: number | null = null;
  if (days.size > 0) {
    const latest = [...days].sort().at(-1)!;
    const diff = Math.floor((now.getTime() - new Date(latest).getTime()) / 86_400_000);
    daysSinceLastActivity = Math.max(0, diff);
  }

  // ── Score composition (0-100). Reasons collected alongside.
  const reasons: string[] = [];
  // A. 14-day cadence (max 40)
  //    hitting ≥10 active days = full 40; each missing day −4
  const cadence14 = Math.max(0, Math.min(40, 40 - (10 - activeDaysLast14) * 4));
  if (activeDaysLast14 < 10) reasons.push(`${activeDaysLast14}/10 active days in last 14`);

  // B. 7-day cadence (max 30)
  //    ≥6 active days = full 30
  const cadence7 = Math.max(0, Math.min(30, 30 - (6 - activeDaysLast7) * 6));
  if (activeDaysLast7 < 6) reasons.push(`${activeDaysLast7}/6 active days in last 7`);

  // C. Task volume (max 15) — 20 tasks in 14 days = full
  const volume = Math.max(0, Math.min(15, Math.round((tasksLast14 / 20) * 15)));
  if (tasksLast14 < 20) reasons.push(`${tasksLast14} tasks in last 14 days`);

  // D. Streak bonus (max 15)
  const streakBonus = Math.min(15, currentStreak * 3);
  if (currentStreak === 0) reasons.push("no active streak");

  let score = cadence14 + cadence7 + volume + streakBonus;

  // ── Hard-rule enforcement (founder-specified)
  let fineNGN = 0;
  let suspensionWeeks = 0;

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
  };
}

/** Velocity forecast: how long until first deal close (plan Day 26 milestone). */
export function forecastFirstClose(
  rows: ProgressRow[],
  startDate: Date | null,
  now: Date = new Date(),
) {
  const planRows = rows.filter(r => r.playbook === "p_45day" && r.completed);
  const tasksDone = planRows.length;
  const TOTAL_PLAN_TASKS = 220; // approx — plan has ~220 tickable tasks
  const CLOSE_THRESHOLD = 130;  // ~Day 26 of 45-day plan
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
