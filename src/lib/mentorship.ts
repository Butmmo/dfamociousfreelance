// Leadership by Influence — pure computation, mirroring escalation.ts and
// dfy.ts's shape. Source: digital-systems-engineering skill's
// references/leadership-by-influence.md. Where this file and that
// document differ, the document governs.

export const LEADERSHIP_MENTEE_TARGET = 5;
/** Workload assumption behind the weekly-touchpoint-plus-40-day-checkpoint
 * cadence — a soft cap, not a hard block, per the doc's own framing. */
export const MENTOR_SOFT_CAP = 5;
/** No mentee goes unmatched past this many days before auto-assignment kicks in. */
export const AUTO_ASSIGN_AFTER_DAYS = 30;

export interface LeadershipProgress {
  verifiedMenteeCount: number;
  target: number;
  eligible: boolean;
  remaining: number;
}

/**
 * A candidate counts toward the 5 only once their own DFY is fully
 * complete — not onboarding, not becoming a beneficiary. Getting 5 people
 * to each independently sustain qualified months is the anti-gaming
 * mechanism itself; no separate policy check is layered on top of it here.
 */
export function leadershipProgress(mentees: { menteeDfyComplete: boolean }[]): LeadershipProgress {
  const verifiedMenteeCount = mentees.filter((m) => m.menteeDfyComplete).length;
  return {
    verifiedMenteeCount,
    target: LEADERSHIP_MENTEE_TARGET,
    eligible: verifiedMenteeCount >= LEADERSHIP_MENTEE_TARGET,
    remaining: Math.max(0, LEADERSHIP_MENTEE_TARGET - verifiedMenteeCount),
  };
}

/** Monday of the current week, UTC, as an ISO date — the week_of key mentorship_checkins log against. */
export function currentWeekStart(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export interface MentorCandidate {
  mentorId: string;
  verifiedCompletions: number;
}

/**
 * Weighted-random pick for auto-assignment past the 30-day window —
 * weighted toward mentors with stronger verified track records, but
 * genuinely random within that weighting. A pure "always assign the top
 * mentor" rule would concentrate every unclaimed mentee onto whoever's
 * currently best, overloading them and starving everyone else of the
 * chance to build a track record in the first place.
 */
export function pickWeightedMentor(candidates: MentorCandidate[], rand: () => number = Math.random): string | null {
  if (candidates.length === 0) return null;
  // +1 so a mentor with zero completions yet still has a real chance.
  const weights = candidates.map((c) => c.verifiedCompletions + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i].mentorId;
  }
  return candidates[candidates.length - 1].mentorId;
}

export function daysSince(iso: string, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000));
}
