// The BPS CRM — pure computation for the client/lead pipeline that
// replaces the Notion CRM described across every path's playbook content
// (src/routes/_authenticated/playbooks/plan.tsx's NOTION_COLS/NOTION_VIEWS
// being the canonical spec this mirrors). Stage order, priority bands and
// the five pipeline views all come from that spec verbatim.

export const CRM_STAGES = [
  { key: "not_contacted", label: "Not Contacted" },
  { key: "contacted", label: "Contacted" },
  { key: "replied_positively", label: "Replied Positively" },
  { key: "replied_negatively", label: "Replied Negatively" },
  { key: "call_booked", label: "Call Booked" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "closed", label: "Closed" },
  { key: "retainer", label: "Retainer" },
] as const;

export type CrmStage = (typeof CRM_STAGES)[number]["key"];

export function stageLabel(stage: string): string {
  return CRM_STAGES.find((s) => s.key === stage)?.label ?? stage;
}

export type CrmPriority = "hot" | "warm" | "cold";

/** 🔥 Hot (7+) · ⚡ Warm (4-6) · ❄️ Cold (0-3) — the Grand Slam scoring rubric's own bands. */
export function priorityFromScore(score: number | null | undefined): CrmPriority | null {
  if (score == null) return null;
  if (score >= 7) return "hot";
  if (score >= 4) return "warm";
  return "cold";
}

export const PRIORITY_META: Record<CrmPriority, { label: string; emoji: string }> = {
  hot: { label: "Hot", emoji: "🔥" },
  warm: { label: "Warm", emoji: "⚡" },
  cold: { label: "Cold", emoji: "❄️" },
};

export interface CrmClientRow {
  id: string;
  stage: string;
  priority: string | null;
  last_contacted_at: string | null;
}

/** The five Notion CRM views, reproduced as filters over the same rows. */
export function viewAllLeads<T extends CrmClientRow>(rows: T[]): T[] {
  return rows;
}
export function viewHotLeads<T extends CrmClientRow>(rows: T[]): T[] {
  return rows.filter((r) => r.priority === "hot");
}
export function viewActiveOutreach<T extends CrmClientRow>(rows: T[]): T[] {
  return rows.filter((r) => r.stage === "contacted" || r.stage === "replied_positively");
}
export function viewThisWeek<T extends CrmClientRow>(rows: T[], now = new Date()): T[] {
  const weekAgo = now.getTime() - 7 * 86_400_000;
  return rows.filter((r) => r.last_contacted_at && new Date(r.last_contacted_at).getTime() >= weekAgo);
}
export function viewClosedWon<T extends CrmClientRow>(rows: T[]): T[] {
  return rows.filter((r) => r.stage === "closed" || r.stage === "retainer");
}
