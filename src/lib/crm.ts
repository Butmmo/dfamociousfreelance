// The BPS CRM — pure computation for the client/lead pipeline that
// replaces the Notion CRM described across every path's playbook content
// (src/routes/_authenticated/playbooks/plan.tsx's NOTION_COLS/NOTION_VIEWS
// being the canonical spec this mirrors). Stage order, priority bands and
// the five pipeline views all come from that spec verbatim.

import { localDateStr } from "@/lib/local-date";

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

export interface CrmDateGroup<T> {
  dateKey: string; // YYYY-MM-DD, the local calendar date the row was added
  label: string;   // human display, e.g. "Wednesday, August 20, 2026"
  clients: T[];
}

/** Buckets rows by the local calendar date they were added (created_at), newest date first — an alternate grouping layered on top of whichever pipeline view/filter is already active. */
export function groupClientsByDateAdded<T extends { created_at: string }>(rows: T[]): CrmDateGroup<T>[] {
  const byDate = new Map<string, T[]>();
  for (const r of rows) {
    const key = localDateStr(new Date(r.created_at));
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(r);
  }
  return Array.from(byDate.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, clients]) => ({
      dateKey,
      label: new Date(clients[0].created_at).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      clients,
    }));
}

/* ═══════════════════════ CSV import ═══════════════════════ */
// Beneficiaries switching off Notion/Google Sheets bring a CSV export with
// them — this maps whatever headers they arrive with onto crm_clients
// columns rather than requiring an exact NOTION_COLS match.

export interface ImportedClient {
  name: string;
  contact_name?: string | null; contact_email?: string | null; contact_phone?: string | null; contact_linkedin?: string | null;
  website_url?: string | null; city?: string | null; country?: string | null; niche?: string | null;
  google_reviews_count?: number | null; lead_score?: number | null; stage?: string;
  the_gap?: string | null; the_leak?: string | null; the_lift?: string | null;
  email_1_sent?: boolean; email_2_sent?: boolean; email_3_sent?: boolean;
  linkedin_connected?: boolean; linkedin_dm_sent?: boolean;
  last_contacted_at?: string | null; notes?: string | null;
}

/** Minimal RFC4180 parser: quoted fields, embedded commas/newlines, "" escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const HEADER_ALIASES: Record<string, keyof ImportedClient> = {
  "smb name": "name", "business name": "name", "name": "name", "company": "name", "lead name": "name", "client name": "name",
  "phone number": "contact_phone", "phone": "contact_phone", "contact phone": "contact_phone",
  "website url": "website_url", "website": "website_url", "url": "website_url",
  "google reviews": "google_reviews_count", "reviews": "google_reviews_count", "google reviews count": "google_reviews_count",
  "city": "city", "country": "country", "niche": "niche", "industry": "niche",
  "founder name": "contact_name", "contact name": "contact_name", "founder": "contact_name", "contact": "contact_name",
  "founder email": "contact_email", "contact email": "contact_email", "email": "contact_email",
  "founder linkedin": "contact_linkedin", "linkedin": "contact_linkedin", "contact linkedin": "contact_linkedin",
  "lead score": "lead_score", "score": "lead_score",
  "lead stage": "stage", "stage": "stage", "status": "stage",
  "the gap": "the_gap", "the leak": "the_leak", "the lift": "the_lift",
  "email 1 sent": "email_1_sent", "email 2 sent": "email_2_sent", "email 3 sent": "email_3_sent",
  "linkedin connected": "linkedin_connected", "linkedin dm sent": "linkedin_dm_sent",
  "last contacted": "last_contacted_at", "last contacted at": "last_contacted_at",
  "notes": "notes", "note": "notes",
};

const STAGE_ALIASES: Record<string, string> = {
  "not contacted": "not_contacted",
  "contacted": "contacted",
  "replied positively": "replied_positively",
  "replied negatively": "replied_negatively",
  "call booked": "call_booked",
  "proposal sent": "proposal_sent",
  "closed": "closed", "closed won": "closed", "won": "closed",
  "retainer": "retainer",
};

function csvTruthy(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "true" || s === "yes" || s === "y" || s === "1" || s === "done" || s === "✅";
}

/** Maps a raw CSV export onto crm_clients-shaped rows. Rows without a resolvable name are skipped, not guessed. */
export function mapCsvToClients(text: string): { rows: ImportedClient[]; skipped: number } {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], skipped: 0 };
  const headers = table[0].map((h) => h.trim().toLowerCase());
  const fieldForCol = headers.map((h) => HEADER_ALIASES[h] ?? null);

  const rows: ImportedClient[] = [];
  let skipped = 0;
  for (const raw of table.slice(1)) {
    const record: any = {};
    raw.forEach((cell, i) => {
      const field = fieldForCol[i];
      if (!field) return;
      const value = cell.trim();
      if (!value) return;
      if (field === "google_reviews_count" || field === "lead_score") {
        const n = Number(value.replace(/[^\d.-]/g, ""));
        if (!Number.isNaN(n)) record[field] = n;
      } else if (field === "email_1_sent" || field === "email_2_sent" || field === "email_3_sent" || field === "linkedin_connected" || field === "linkedin_dm_sent") {
        record[field] = csvTruthy(value);
      } else if (field === "stage") {
        record.stage = STAGE_ALIASES[value.toLowerCase()] ?? "not_contacted";
      } else if (field === "last_contacted_at") {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) record.last_contacted_at = d.toISOString().slice(0, 10);
      } else {
        record[field] = value;
      }
    });
    if (!record.name) { skipped++; continue; }
    rows.push(record as ImportedClient);
  }
  return { rows, skipped };
}
