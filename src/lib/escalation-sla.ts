// Mentor-reported escalation SLA — pure computation, live-derived (never
// stored) so it's always accurate regardless of whether the hourly sweep
// has run yet. Source: digital-systems-engineering skill's
// references/leadership-by-influence.md (the 48-72h standard) and bef's
// references/identity-and-framework.md (the classification framework).

export const SLA_REMINDER_HOURS = 48;
export const SLA_BREACH_HOURS = 72;

export type SlaStatus = "open" | "due_soon" | "breached" | "acknowledged" | "resolved";

export interface EscalationRow {
  raised_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

export interface SlaSnapshot {
  status: SlaStatus;
  hoursElapsed: number;
  hoursUntilReminder: number | null;
  hoursUntilBreach: number | null;
}

export function slaSnapshot(row: EscalationRow, now = new Date()): SlaSnapshot {
  const raised = new Date(row.raised_at).getTime();
  const hoursElapsed = Math.max(0, (now.getTime() - raised) / 3_600_000);

  if (row.resolved_at) {
    return { status: "resolved", hoursElapsed, hoursUntilReminder: null, hoursUntilBreach: null };
  }
  if (row.acknowledged_at) {
    return { status: "acknowledged", hoursElapsed, hoursUntilReminder: null, hoursUntilBreach: null };
  }
  if (hoursElapsed >= SLA_BREACH_HOURS) {
    return { status: "breached", hoursElapsed, hoursUntilReminder: 0, hoursUntilBreach: 0 };
  }
  if (hoursElapsed >= SLA_REMINDER_HOURS) {
    return { status: "due_soon", hoursElapsed, hoursUntilReminder: 0, hoursUntilBreach: SLA_BREACH_HOURS - hoursElapsed };
  }
  return {
    status: "open",
    hoursElapsed,
    hoursUntilReminder: SLA_REMINDER_HOURS - hoursElapsed,
    hoursUntilBreach: SLA_BREACH_HOURS - hoursElapsed,
  };
}

/** BEF's Acceptable/Correctable/Disciplinary framework — support first,
 * sanction only for a real pattern, never a default. A slow stretch is
 * presumptively the first or second category, not automatically the third. */
export const CLASSIFICATIONS: { key: "acceptable" | "correctable" | "disciplinary"; label: string; blurb: string }[] = [
  { key: "acceptable", label: "Acceptable failure", blurb: "Good-faith effort, external factors — review and support, no sanction." },
  { key: "correctable", label: "Correctable failure", blurb: "Weak systems or a skills gap — retraining and an improvement plan." },
  { key: "disciplinary", label: "Disciplinary failure", blurb: "Persistent insubordination or real financial mismanagement — formal sanctions." },
];

export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h.toFixed(1)}h`;
}
