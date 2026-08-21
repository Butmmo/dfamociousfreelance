import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { usePath } from "@/lib/use-path";
import { PATHS } from "@/lib/paths";
import { submitBeliefGoal, submitAffirmationGoal, submitEvaluationGoal } from "@/lib/bps.functions";
import {
  BPS_PILLARS, PILLAR_ITEM_COUNT, MLM_DEFAULT_GOAL, computeFinanceRevenueTarget,
  beliefDueDate, affirmationDueDate, evaluationDueDate, defaultTargetMonth, monthKey,
  goalCycleStatus, computeFinanceCycleTargets, financeExpectationForDays, sumFinanceEntries,
  bpsMonthWindowDays, parseTargetMonth, FINANCE_CYCLE_WEEKS,
  type GoalItem, type PillarKey, type CustomPillar, type FinanceMetrics,
} from "@/lib/bps";
import { getMyPocketSummary, logMlmActualSpend, requestEmergencyWithdrawal, enrollInBpn } from "@/lib/pocket.functions";
import {
  savingsUnlockDate, isSavingsUnlocked, ESCALATION_LABELS, MLM_BALANCE_CAP_USD,
  MLM_MONTHLY_FLOOR_USD, MLM_MONTHLY_CEILING_USD, BPN_ELIGIBILITY_MIN_NET_INCOME_USD,
  BPN_PPV_ADVISED_CAP, BPN_PPV_HARD_CAP, EMERGENCY_AUTO_RELEASE_MONTHS,
  type EscalationLevel,
} from "@/lib/pocket";
import { localDateStr } from "@/lib/local-date";
import {
  CRM_STAGES, priorityFromScore, PRIORITY_META,
  viewAllLeads, viewHotLeads, viewActiveOutreach, viewThisWeek, viewClosedWon,
  mapCsvToClients, groupClientsByDateAdded,
} from "@/lib/crm";
import { toast } from "sonner";
import {
  Target, Users, CalendarCheck2, Plus, Pencil, Trash2, X, Save, Loader2,
  Phone, Mail, Linkedin, Globe, MapPin, Star, Flame, CheckCircle2, Circle,
  Send, ClipboardList, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight,
  BarChart3, Upload, Eye, EyeOff, Wallet, PiggyBank, ShoppingBag, ShieldAlert, Lock, Unlock,
  LayoutGrid, Table2, CalendarDays,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/bps")({
  head: () => ({ meta: [{ title: "Productivity Scheme (BPS) — DBI Citadel" }] }),
  component: BpsPage,
});

type Tab = "crm" | "tracker" | "goals" | "pocket";

function BpsPage() {
  const [tab, setTab] = useState<Tab>("crm");

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <Target className="h-3.5 w-3.5" /> Blazer Productivity Scheme
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Productivity Scheme (BPS)</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Your client pipeline, your daily binary tracker, and the Belief → Affirmation → Evaluation goal
          cycle — one system, so nothing has to live in Notion or a spreadsheet.
        </p>
      </header>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1 w-fit">
        <TabButton active={tab === "crm"} onClick={() => setTab("crm")} icon={Users} label="Client CRM" />
        <TabButton active={tab === "tracker"} onClick={() => setTab("tracker")} icon={CalendarCheck2} label="Daily Tracker" />
        <TabButton active={tab === "goals"} onClick={() => setTab("goals")} icon={ClipboardList} label="Monthly Goals" />
        <TabButton active={tab === "pocket"} onClick={() => setTab("pocket")} icon={Wallet} label="Pocket System" />
      </div>

      {tab === "crm" && <CrmSection />}
      {tab === "tracker" && <TrackerSection />}
      {tab === "goals" && <GoalsSection />}
      {tab === "pocket" && <PocketSection />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

/* ═══════════════════════════ CRM ═══════════════════════════ */

type Client = {
  id: string; user_id: string; path_key: string | null; name: string;
  contact_name: string | null; contact_email: string | null; contact_phone: string | null; contact_linkedin: string | null;
  website_url: string | null; city: string | null; country: string | null; niche: string | null;
  google_reviews_count: number | null; lead_score: number | null; priority: string | null; stage: string;
  the_gap: string | null; the_leak: string | null; the_lift: string | null;
  email_1_sent: boolean; email_2_sent: boolean; email_3_sent: boolean;
  linkedin_connected: boolean; linkedin_dm_sent: boolean;
  last_contacted_at: string | null; notes: string | null; created_at: string;
};

type CrmView = "all" | "hot" | "active" | "week" | "closed";
const CRM_VIEWS: { key: CrmView; label: string }[] = [
  { key: "all", label: "📋 All Leads" },
  { key: "hot", label: "🔥 Hot Leads" },
  { key: "active", label: "⚡ Active Outreach" },
  { key: "week", label: "📅 This Week" },
  { key: "closed", label: "🏆 Closed Won" },
];

function CrmSection() {
  const { user } = useSession();
  const { pathKey } = usePath();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CrmView>("all");
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [groupByDate, setGroupByDate] = useState(false);
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("crm_clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setClients((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const filtered = useMemo(() => {
    switch (view) {
      case "hot": return viewHotLeads(clients);
      case "active": return viewActiveOutreach(clients);
      case "week": return viewThisWeek(clients);
      case "closed": return viewClosedWon(clients);
      default: return viewAllLeads(clients);
    }
  }, [clients, view]);

  const saveClient = async (payload: Partial<Client>, id?: string) => {
    if (!user) return;
    const withPriority = { ...payload, priority: priorityFromScore(payload.lead_score ?? null) };
    if (id) {
      const { error } = await supabase.from("crm_clients").update(withPriority as any).eq("id", id);
      if (error) { toast.error(error.message); return; }
      toast.success("Client updated.");
    } else {
      const { error } = await supabase.from("crm_clients").insert({ ...withPriority, user_id: user.id } as any);
      if (error) { toast.error(error.message); return; }
      toast.success("Client added.");
    }
    setEditing(null);
    load();
  };

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your pipeline? This can't be undone.`)) return;
    const { error } = await supabase.from("crm_clients").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removed.");
    load();
  };

  const quickStage = async (id: string, stage: string) => {
    const { error } = await supabase.from("crm_clients").update({ stage } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const quickFlag = async (c: Client, field: keyof Client) => {
    const { error } = await supabase.from("crm_clients").update({ [field]: !c[field] } as any).eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const importCsv = async (file: File) => {
    if (!user) return;
    setImporting(true);
    try {
      const text = await file.text();
      const { rows, skipped } = mapCsvToClients(text);
      if (rows.length === 0) { toast.error("No rows with a recognizable name column found in that CSV."); return; }
      const withOwner = rows.map((r) => ({
        ...r, user_id: user.id, path_key: pathKey ?? null, priority: priorityFromScore(r.lead_score ?? null),
      }));
      const CHUNK = 200;
      let inserted = 0;
      for (let i = 0; i < withOwner.length; i += CHUNK) {
        const { error } = await supabase.from("crm_clients").insert(withOwner.slice(i, i + CHUNK) as any);
        if (error) { toast.error(`Import stopped: ${error.message}`); break; }
        inserted += Math.min(CHUNK, withOwner.length - i);
      }
      toast.success(`Imported ${inserted} client${inserted === 1 ? "" : "s"}.${skipped > 0 ? ` Skipped ${skipped} row(s) without a name.` : ""}`);
      load();
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading your pipeline…</div>;

  const groups = groupByDate ? groupClientsByDateAdded(filtered) : null;
  const renderList = (list: Client[]) => layout === "cards" ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {list.map((c) => (
        <ClientCard key={c.id} client={c} onEdit={() => setEditing(c)} onDelete={() => deleteClient(c.id, c.name)}
          onStage={(stage) => quickStage(c.id, stage)} onFlag={(f) => quickFlag(c, f)} />
      ))}
    </div>
  ) : (
    <ClientTable clients={list} onEdit={setEditing} onDelete={deleteClient} onStage={quickStage} />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {CRM_VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                view === v.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) importCsv(file); e.target.value = ""; }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import CSV
          </button>
          <button
            onClick={() => setEditing("new")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add client
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          <button
            onClick={() => setLayout("cards")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              layout === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button
            onClick={() => setLayout("table")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              layout === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" /> Table
          </button>
        </div>
        <button
          onClick={() => setGroupByDate((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
            groupByDate ? "border-gold bg-gold/10 text-gold-deep" : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" /> Group by date added
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No leads in this view yet. Add your first client to start the pipeline.
        </div>
      )}

      {groups ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.dateKey}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-3.5 w-3.5 text-gold-deep" />
                <h3 className="text-sm font-semibold">{g.label}</h3>
                <span className="text-xs text-muted-foreground">({g.clients.length})</span>
              </div>
              {renderList(g.clients)}
            </div>
          ))}
        </div>
      ) : renderList(filtered)}

      {editing && (
        <ClientFormModal
          client={editing === "new" ? null : editing}
          defaultPathKey={pathKey ?? undefined}
          onClose={() => setEditing(null)}
          onSave={(payload) => saveClient(payload, editing === "new" ? undefined : editing.id)}
        />
      )}
    </div>
  );
}

function ClientCard({ client: c, onEdit, onDelete, onStage, onFlag }: {
  client: Client; onEdit: () => void; onDelete: () => void; onStage: (s: string) => void; onFlag: (f: keyof Client) => void;
}) {
  const prio = c.priority ? PRIORITY_META[c.priority as "hot" | "warm" | "cold"] : null;
  const path = PATHS.find((p) => p.key === c.path_key);
  return (
    <div className="min-w-0 max-w-full rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-semibold truncate flex items-center gap-1.5">
            {prio && <span title={prio.label}>{prio.emoji}</span>}
            {c.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2">
            {c.niche && <span className="max-w-[160px] truncate">{c.niche}</span>}
            {c.city && <span className="inline-flex items-center gap-0.5 max-w-[140px] truncate"><MapPin className="h-3 w-3 shrink-0" />{c.city}</span>}
            {path && <span className="text-gold-deep">{path.short}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="rounded-md border border-border p-1.5 hover:bg-muted" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} className="rounded-md border border-crimson p-1.5 text-crimson hover:bg-crimson/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <select
        value={c.stage}
        onChange={(e) => onStage(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs font-semibold"
      >
        {CRM_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {c.lead_score != null && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{c.lead_score}/10</span>}
        {c.google_reviews_count != null && <span>{c.google_reviews_count} reviews</span>}
        {c.last_contacted_at && <span>Last: {new Date(c.last_contacted_at).toLocaleDateString()}</span>}
      </div>

      {(c.contact_email || c.contact_phone || c.website_url || c.contact_linkedin) && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {c.contact_email && <a href={`mailto:${c.contact_email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="h-3 w-3" />Email</a>}
          {c.contact_phone && <a href={`tel:${c.contact_phone}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="h-3 w-3" />Call</a>}
          {c.contact_linkedin && <a href={c.contact_linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><Linkedin className="h-3 w-3" />LinkedIn</a>}
          {c.website_url && <a href={c.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><Globe className="h-3 w-3" />Site</a>}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
        <FlagChip label="Email 1" active={c.email_1_sent} onClick={() => onFlag("email_1_sent")} />
        <FlagChip label="Email 2" active={c.email_2_sent} onClick={() => onFlag("email_2_sent")} />
        <FlagChip label="Email 3" active={c.email_3_sent} onClick={() => onFlag("email_3_sent")} />
        <FlagChip label="LI Connected" active={c.linkedin_connected} onClick={() => onFlag("linkedin_connected")} />
        <FlagChip label="LI DM" active={c.linkedin_dm_sent} onClick={() => onFlag("linkedin_dm_sent")} />
      </div>

      {(c.the_gap || c.the_leak || c.the_lift) && (
        <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 break-words">
          {c.the_gap && <div><span className="font-semibold text-foreground">Gap:</span> {c.the_gap}</div>}
          {c.the_leak && <div><span className="font-semibold text-foreground">Leak:</span> {c.the_leak}</div>}
          {c.the_lift && <div><span className="font-semibold text-foreground">Lift:</span> {c.the_lift}</div>}
        </div>
      )}
    </div>
  );
}

function FlagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition ${
        active ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600" : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />} {label}
    </button>
  );
}

/** Dense, scannable alternative to the card grid — same rows, same actions, better for scanning a large pipeline at once. */
function ClientTable({ clients, onEdit, onDelete, onStage }: {
  clients: Client[]; onEdit: (c: Client) => void; onDelete: (id: string, name: string) => void; onStage: (id: string, stage: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-xs min-w-[820px]">
        <thead className="text-muted-foreground border-b border-border">
          <tr className="text-left">
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Stage</th>
            <th className="py-2 px-3">Score</th>
            <th className="py-2 px-3">Niche</th>
            <th className="py-2 px-3">City</th>
            <th className="py-2 px-3">Path</th>
            <th className="py-2 px-3">Contact</th>
            <th className="py-2 px-3">Last contacted</th>
            <th className="py-2 px-3">Added</th>
            <th className="py-2 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => {
            const prio = c.priority ? PRIORITY_META[c.priority as "hot" | "warm" | "cold"] : null;
            const path = PATHS.find((p) => p.key === c.path_key);
            return (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="py-2 px-3 font-medium whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">{prio && <span title={prio.label}>{prio.emoji}</span>}{c.name}</span>
                </td>
                <td className="py-2 px-3">
                  <select
                    value={c.stage} onChange={(e) => onStage(c.id, e.target.value)}
                    className="rounded-md border border-input bg-background px-1.5 py-1 text-[11px] font-semibold"
                  >
                    {CRM_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </td>
                <td className="py-2 px-3">{c.lead_score != null ? `${c.lead_score}/10` : "—"}</td>
                <td className="py-2 px-3 max-w-[140px] truncate">{c.niche || "—"}</td>
                <td className="py-2 px-3 max-w-[120px] truncate">{c.city || "—"}</td>
                <td className="py-2 px-3 text-gold-deep whitespace-nowrap">{path?.short ?? "—"}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1.5">
                    {c.contact_email && <a href={`mailto:${c.contact_email}`} className="text-primary hover:underline" title={c.contact_email}><Mail className="h-3.5 w-3.5" /></a>}
                    {c.contact_phone && <a href={`tel:${c.contact_phone}`} className="text-primary hover:underline" title={c.contact_phone}><Phone className="h-3.5 w-3.5" /></a>}
                    {c.contact_linkedin && <a href={c.contact_linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline" title="LinkedIn"><Linkedin className="h-3.5 w-3.5" /></a>}
                    {c.website_url && <a href={c.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline" title="Website"><Globe className="h-3.5 w-3.5" /></a>}
                    {!c.contact_email && !c.contact_phone && !c.contact_linkedin && !c.website_url && "—"}
                  </div>
                </td>
                <td className="py-2 px-3 whitespace-nowrap">{c.last_contacted_at ? new Date(c.last_contacted_at).toLocaleDateString() : "—"}</td>
                <td className="py-2 px-3 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(c)} className="rounded-md border border-border p-1.5 hover:bg-muted" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDelete(c.id, c.name)} className="rounded-md border border-crimson p-1.5 text-crimson hover:bg-crimson/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ClientFormModal({ client, defaultPathKey, onClose, onSave }: {
  client: Client | null; defaultPathKey?: string; onClose: () => void; onSave: (payload: Partial<Client>) => void;
}) {
  const [f, setF] = useState<Partial<Client>>(
    client ?? { path_key: defaultPathKey, stage: "not_contacted", email_1_sent: false, email_2_sent: false, email_3_sent: false, linkedin_connected: false, linkedin_dm_sent: false },
  );
  const set = (k: keyof Client, v: any) => setF((prev) => ({ ...prev, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name?.trim()) { toast.error("Name is required."); return; }
    onSave(f);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gold bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{client ? "Edit client" : "Add client"}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <TextField label="Business / lead name *" value={f.name} onChange={(v) => set("name", v)} />
            <SelectField label="Path" value={f.path_key ?? ""} onChange={(v) => set("path_key", v || null)}
              options={[{ value: "", label: "— none —" }, ...PATHS.map((p) => ({ value: p.key, label: p.short }))]} />
            <TextField label="Niche" value={f.niche} onChange={(v) => set("niche", v)} />
            <TextField label="City" value={f.city} onChange={(v) => set("city", v)} />
            <TextField label="Country" value={f.country} onChange={(v) => set("country", v)} />
            <TextField label="Google reviews" type="number" value={f.google_reviews_count as any} onChange={(v) => set("google_reviews_count", v ? Number(v) : null)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <TextField label="Contact / founder name" value={f.contact_name} onChange={(v) => set("contact_name", v)} />
            <TextField label="Contact email" value={f.contact_email} onChange={(v) => set("contact_email", v)} />
            <TextField label="Contact phone" value={f.contact_phone} onChange={(v) => set("contact_phone", v)} />
            <TextField label="LinkedIn URL" value={f.contact_linkedin} onChange={(v) => set("contact_linkedin", v)} />
            <TextField label="Website URL" value={f.website_url} onChange={(v) => set("website_url", v)} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-border">
            <TextField label="Lead score (0-10)" type="number" value={f.lead_score as any} onChange={(v) => set("lead_score", v === "" ? null : Math.max(0, Math.min(10, Number(v))))} />
            <SelectField label="Stage" value={f.stage ?? "not_contacted"} onChange={(v) => set("stage", v)}
              options={CRM_STAGES.map((s) => ({ value: s.key, label: s.label }))} />
            <TextField label="Last contacted" type="date" value={f.last_contacted_at ?? ""} onChange={(v) => set("last_contacted_at", v || null)} />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <TextAreaField label="The Gap — missing piece in their digital presence" value={f.the_gap} onChange={(v) => set("the_gap", v)} />
            <TextAreaField label="The Leak — what it costs them weekly" value={f.the_leak} onChange={(v) => set("the_leak", v)} />
            <TextAreaField label="The Lift — revenue they could capture" value={f.the_lift} onChange={(v) => set("the_lift", v)} />
          </div>

          <TextAreaField label="Notes" value={f.notes} onChange={(v) => set("notes", v)} rows={3} />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, type }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <input type={type ?? "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function TextAreaField({ label, value, onChange, rows }: { label: string; value: any; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows ?? 2}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}

/* ═══════════════════════════ DAILY TRACKER (1 / 0, auto-derived from the Belief Goal) ═══════════════════════════ */

type Activity = { id: string; label: string; sort_order: number; active: boolean; goal_id: string | null };
type DailyCheck = { activity_id: string; check_date: string; done: boolean };
type WeeklyReport = { id: string; week_start: string; week_end: string; activities_done: number; activities_total: number; percent: number };

/** Monday of the week containing d. */
function weekStartOf(d: Date): Date {
  const out = new Date(d); out.setHours(0, 0, 0, 0);
  const day = out.getDay();
  out.setDate(out.getDate() - (day === 0 ? 6 : day - 1));
  return out;
}
function isoDate(d: Date): string {
  return localDateStr(d);
}

function TrackerSection() {
  const { user } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekCursor, setWeekCursor] = useState<Date>(() => weekStartOf(new Date()));

  const targetKey = useMemo(() => monthKey(defaultTargetMonth()), []);

  const load = async () => {
    if (!user) return;
    const { data: goal } = await supabase
      .from("bps_monthly_goals").select("id").eq("user_id", user.id).eq("target_month", targetKey).maybeSingle();
    const goalId = (goal as any)?.id ?? null;
    const [{ data: acts }, { data: wr }] = await Promise.all([
      goalId
        ? supabase.from("bps_activities").select("*").eq("goal_id", goalId).eq("active", true).order("sort_order", { ascending: true })
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("bps_weekly_reports").select("id,week_start,week_end,activities_done,activities_total,percent").eq("user_id", user.id).order("week_start", { ascending: false }).limit(8),
    ]);
    const list = (acts as any) ?? [];
    setActivities(list);
    setWeeklyReports((wr as any) ?? []);
    const ids = list.map((a: any) => a.id);
    if (ids.length) {
      const { data: ch } = await supabase.from("bps_daily_checks").select("activity_id,check_date,done").in("activity_id", ids);
      setChecks((ch as any) ?? []);
    } else {
      setChecks([]);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const weekDates = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekCursor); d.setDate(d.getDate() + i);
      out.push(isoDate(d));
    }
    return out;
  }, [weekCursor]);

  const checkMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const c of checks) m.set(`${c.activity_id}:${c.check_date}`, c.done);
    return m;
  }, [checks]);

  const toggle = async (activityId: string, date: string) => {
    if (!user) return;
    const current = checkMap.get(`${activityId}:${date}`) ?? false;
    const { error } = await supabase.from("bps_daily_checks").upsert(
      { user_id: user.id, activity_id: activityId, check_date: date, done: !current },
      { onConflict: "activity_id,check_date" },
    );
    if (error) { toast.error(error.message); return; }
    setChecks((prev) => {
      const next = prev.filter((c) => !(c.activity_id === activityId && c.check_date === date));
      next.push({ activity_id: activityId, check_date: date, done: !current });
      return next;
    });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading your tracker…</div>;

  const today = isoDate(new Date());

  return (
    <div className="space-y-4">
      <TpeDefaultingBanner />
      <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 text-xs text-muted-foreground">
        Activities here are deduced automatically from this month's Belief Goal action items — there's nothing to type in.
        Set or edit your Belief Goal in the Monthly Goals tab and a tracking sheet appears here for the cycle, broken into weeks.
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No Belief Goal set for this cycle yet — submit one in Monthly Goals and your daily tracker will populate here.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="font-display text-lg font-bold">
              Week of {weekCursor.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekCursor((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} className="p-1.5 rounded hover:bg-muted" aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setWeekCursor(weekStartOf(new Date()))} className="rounded border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted">This week</button>
              <button onClick={() => setWeekCursor((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} className="p-1.5 rounded hover:bg-muted" aria-label="Next week"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>
                <th className="text-left p-2 sticky left-0 bg-card">Activity</th>
                {weekDates.map((d) => (
                  <th key={d} className={`p-1 font-normal text-center min-w-[36px] ${d === today ? "text-gold-deep font-bold" : "text-muted-foreground"}`}>
                    {new Date(d).toLocaleDateString(undefined, { weekday: "short" })}<br />{new Date(d).getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="p-2 font-semibold sticky left-0 bg-card max-w-[180px] truncate" title={a.label}>{a.label}</td>
                  {weekDates.map((d) => {
                    const done = checkMap.get(`${a.id}:${d}`) ?? false;
                    return (
                      <td key={d} className="p-1 text-center">
                        <button
                          onClick={() => toggle(a.id, d)}
                          className={`h-7 w-7 rounded-md text-[11px] font-bold transition ${
                            done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                        >
                          {done ? "1" : "0"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FinanceDailyTracker />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-gold-deep"><BarChart3 className="h-3.5 w-3.5" /> Weekly reports</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Every Monday your past week is scored automatically and sent to your mentor and DSE Rep (or the founder if you don't have one yet) — nothing to submit here.
        </p>
        {weeklyReports.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No weekly report generated yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {weeklyReports.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs">
                <span>{new Date(w.week_start).toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {new Date(w.week_end).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <span className="font-semibold">{w.activities_done}/{w.activities_total} ({w.percent.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type FinanceGoalRow = {
  id: string;
  finance_leads_target: number | null; finance_messages_target: number | null;
  finance_new_clients_target: number | null; finance_returning_clients_target: number | null;
  finance_avg_price_usd: number | null;
  belief_submitted_at: string | null;
};
type FinanceEntry = {
  entry_date: string; leads_contacted: number; messages_sent: number;
  new_clients_closed: number; returning_clients_closed: number; revenue_usd: number;
};

function fmtMetric(m: FinanceMetrics, decimals = 0) {
  const f = (n: number) => n.toFixed(decimals);
  return { leads: f(m.leads), messages: f(m.messages), newClients: f(m.newClients), returningClients: f(m.returningClients), revenue: m.revenueUsd.toFixed(0) };
}

/**
 * The Financial Goal's daily numeric tracker — separate from the binary
 * activity grid above. Any number a beneficiary sets on their Finance
 * pillar breaks into daily/weekly/monthly standards (weekly = monthly/6,
 * daily = monthly/40, matching the 40-day Evaluation cycle) so it's
 * actually measured day to day, not just checked at the end. A day not
 * marked can never be marked afterward — enforced server-side, not just
 * here.
 */
function FinanceDailyTracker() {
  const { user } = useSession();
  const [goal, setGoal] = useState<FinanceGoalRow | null>(null);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ leads: "", messages: "", newClients: "", returningClients: "", revenue: "" });

  const targetKey = useMemo(() => monthKey(defaultTargetMonth()), []);
  const today = isoDate(new Date());

  const load = async () => {
    if (!user) return;
    const { data: g } = await supabase
      .from("bps_monthly_goals")
      .select("id,finance_leads_target,finance_messages_target,finance_new_clients_target,finance_returning_clients_target,finance_avg_price_usd,belief_submitted_at")
      .eq("user_id", user.id).eq("target_month", targetKey).maybeSingle();
    const row = (g as any) ?? null;
    setGoal(row);
    if (row?.id) {
      const { data: e } = await supabase
        .from("bps_finance_daily_entries")
        .select("entry_date,leads_contacted,messages_sent,new_clients_closed,returning_clients_closed,revenue_usd")
        .eq("goal_id", row.id);
      setEntries((e as any) ?? []);
    } else {
      setEntries([]);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, targetKey]);

  if (loading || !goal || goal.finance_leads_target == null || !goal.belief_submitted_at) return null;

  const targetMonthDate = parseTargetMonth(targetKey);
  const cycleStart = beliefDueDate(targetMonthDate);
  const cycleDays = bpsMonthWindowDays(targetMonthDate);
  const targets = computeFinanceCycleTargets(goal, targetMonthDate);
  const todaysEntry = entries.find((e) => e.entry_date === today) ?? null;

  const daysSinceStart = Math.min(
    cycleDays,
    Math.max(1, Math.round((Date.now() - cycleStart.getTime()) / 86_400_000) + 1),
  );
  const cycleActual = sumFinanceEntries(entries);
  const cycleExpected = financeExpectationForDays(targets, daysSinceStart);

  const weekNumber = Math.min(FINANCE_CYCLE_WEEKS, Math.ceil(daysSinceStart / 7));
  const weekStartDay = (weekNumber - 1) * 7 + 1;
  const weekEntries = entries.filter((e) => {
    const d = Math.round((new Date(e.entry_date).getTime() - cycleStart.getTime()) / 86_400_000) + 1;
    return d >= weekStartDay && d <= daysSinceStart;
  });
  const weekActual = sumFinanceEntries(weekEntries);
  const daysIntoWeek = daysSinceStart - weekStartDay + 1;
  const weekExpected = financeExpectationForDays(targets, daysIntoWeek);

  const submit = async () => {
    if (!user || !goal) return;
    setSaving(true);
    const { error } = await supabase.from("bps_finance_daily_entries").insert({
      user_id: user.id,
      goal_id: goal.id,
      entry_date: today,
      leads_contacted: Number(form.leads || 0),
      messages_sent: Number(form.messages || 0),
      new_clients_closed: Number(form.newClients || 0),
      returning_clients_closed: Number(form.returningClients || 0),
      revenue_usd: Number(form.revenue || 0),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Today's financial tracker marked. Locked in — see you tomorrow.");
    load();
  };

  const t = fmtMetric(targets.daily, 1);
  const wt = fmtMetric(weekExpected, 1);
  const mt = fmtMetric(cycleExpected, 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 text-[10px] tracking-widest text-gold-deep"><TrendingUp className="h-3.5 w-3.5" /> Financial Goal — daily tracker</div>
      <p className="text-xs text-muted-foreground">
        Your monthly Finance targets, broken down: <strong className="text-foreground">{t.leads}</strong> leads,{" "}
        <strong className="text-foreground">{t.messages}</strong> messages, <strong className="text-foreground">{t.newClients}</strong> new
        clients, <strong className="text-foreground">{t.returningClients}</strong> returning clients and{" "}
        <strong className="text-foreground">${t.revenue}</strong> revenue expected <em>per day</em> — this is that.
      </p>

      {todaysEntry ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
          <div className="font-semibold text-emerald-700 dark:text-emerald-400">Today marked — {todaysEntry.leads_contacted} leads, {todaysEntry.messages_sent} messages, {todaysEntry.new_clients_closed} new, {todaysEntry.returning_clients_closed} returning, ${Number(todaysEntry.revenue_usd).toFixed(2)} revenue.</div>
          <div className="mt-1 text-muted-foreground">Locked for today — come back tomorrow. A day not marked can never be marked afterward.</div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gold/50 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <NumberField label="Leads contacted" value={form.leads} onChange={(v) => setForm((f) => ({ ...f, leads: v }))} />
            <NumberField label="Messages sent" value={form.messages} onChange={(v) => setForm((f) => ({ ...f, messages: v }))} />
            <NumberField label="New clients closed" value={form.newClients} onChange={(v) => setForm((f) => ({ ...f, newClients: v }))} />
            <NumberField label="Returning clients closed" value={form.returningClients} onChange={(v) => setForm((f) => ({ ...f, returningClients: v }))} />
            <NumberField label="Revenue today (USD)" value={form.revenue} onChange={(v) => setForm((f) => ({ ...f, revenue: v }))} step="0.01" />
          </div>
          <button
            onClick={submit}
            disabled={saving}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Mark today
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-accent/30 p-3">
          <div className="text-[10px] tracking-widest text-muted-foreground">This week so far (expect {wt.leads}L / {wt.messages}M / {wt.newClients}NC / {wt.returningClients}RC / ${wt.revenue})</div>
          <div className="mt-1 font-semibold">{weekActual.leads}L · {weekActual.messages}M · {weekActual.newClients}NC · {weekActual.returningClients}RC · ${weekActual.revenueUsd.toFixed(0)}</div>
        </div>
        <div className="rounded-lg bg-accent/30 p-3">
          <div className="text-[10px] tracking-widest text-muted-foreground">This cycle so far (expect {mt.leads}L / {mt.messages}M / {mt.newClients}NC / {mt.returningClients}RC / ${mt.revenue})</div>
          <div className="mt-1 font-semibold">{cycleActual.leads}L · {cycleActual.messages}M · {cycleActual.newClients}NC · {cycleActual.returningClients}RC · ${cycleActual.revenueUsd.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ MONTHLY GOALS (Belief → Affirmation → Evaluation) ═══════════════════════════ */

type MonthlyGoal = {
  id: string; target_month: string;
  finance_goal: string | null; finance_items: GoalItem[];
  finance_leads_target: number | null; finance_messages_target: number | null;
  finance_new_clients_target: number | null; finance_returning_clients_target: number | null;
  finance_avg_price_usd: number | null;
  self_dev_goal: string | null; self_dev_items: GoalItem[];
  mlm_goal: string; mlm_items: GoalItem[];
  relationship_goal: string | null; relationship_items: GoalItem[];
  custom_pillars: CustomPillar[];
  belief_submitted_at: string | null;
  affirmation_submitted_at: string | null; affirmation_score: number | null; affirmation_total: number | null; affirmation_percent: number | null; affirmation_remark: string | null;
  evaluation_submitted_at: string | null; evaluation_score: number | null; evaluation_total: number | null; evaluation_percent: number | null; evaluation_remark: string | null;
};

function emptyItems(): GoalItem[] {
  return Array.from({ length: PILLAR_ITEM_COUNT }, () => ({ text: "", done: false }));
}

function ItemsEditor({ items, onChange, placeholder }: { items: GoalItem[]; onChange: (items: GoalItem[]) => void; placeholder: string }) {
  return (
    <div className="mt-2 space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <input
            value={item.text}
            onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], text: e.target.value }; onChange(next); }}
            placeholder={`${placeholder} ${idx + 1}`}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
          />
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== idx))} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="Remove item">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { text: "", done: false }])}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-deep hover:underline"
      >
        <Plus className="h-3 w-3" /> Add action item
      </button>
    </div>
  );
}

/** Surfaced wherever the user works on their goals — no fine, just a visible signal for their mentor/DSE Rep too. */
function TpeDefaultingBanner() {
  const { user } = useSession();
  const [until, setUntil] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("tpe_defaulting_until").eq("id", user.id).maybeSingle()
      .then(({ data }: { data: { tpe_defaulting_until: string | null } | null }) => setUntil(data?.tpe_defaulting_until ?? null));
  }, [user]);

  if (!until || new Date(until) < new Date(new Date().toDateString())) return null;

  return (
    <div className="rounded-xl border border-crimson/40 bg-crimson/10 p-3 text-xs text-crimson">
      <strong>The Practise of Enterprise — defaulting.</strong> A weekly session was missed; visible to your mentor and
      DSE Rep until {new Date(until).toLocaleDateString()}. Catch up any time on the TPE page — no fine, just a signal.
    </div>
  );
}

function PrivacyToggle({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={hidden ? "Hidden from sponsor, mentor and DSE Rep — click to make visible" : "Visible to sponsor, mentor and DSE Rep — click to hide"}
      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold border transition ${
        hidden ? "border-crimson/40 bg-crimson/10 text-crimson" : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      {hidden ? "Hidden" : "Visible"}
    </button>
  );
}

function NumberField({ label, value, onChange, step }: { label: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <label className="text-[11px] text-muted-foreground">
      {label}
      <input
        type="number" min={0} step={step ?? "1"} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
      />
    </label>
  );
}

function GoalsSection() {
  const { user, isSuperAdmin } = useSession();
  const submitBelief = useServerFn(submitBeliefGoal);
  const submitAffirmation = useServerFn(submitAffirmationGoal);
  const submitEvaluation = useServerFn(submitEvaluationGoal);

  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [entryChannel, setEntryChannel] = useState<"nbo" | "direct">("direct");

  const targetMonth = useMemo(() => defaultTargetMonth(), []);
  const targetKey = monthKey(targetMonth);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("bps_monthly_goals").select("*").eq("user_id", user.id).order("target_month", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setGoals((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("entry_channel").eq("id", user.id).maybeSingle().then(({ data }: { data: { entry_channel: string } | null }) => {
      if (data?.entry_channel === "nbo" || data?.entry_channel === "direct") setEntryChannel(data.entry_channel);
    });
  }, [user]);

  const current = goals.find((g) => g.target_month === targetKey) ?? null;
  const history = goals.filter((g) => g.target_month !== targetKey);

  const [pillars, setPillars] = useState<Record<Exclude<PillarKey, "finance">, { goal: string; items: GoalItem[] }>>({
    self_dev: { goal: "", items: emptyItems() },
    mlm: { goal: MLM_DEFAULT_GOAL, items: emptyItems() },
    relationship: { goal: "", items: emptyItems() },
  });
  const [financeGoal, setFinanceGoal] = useState("");
  const [financeItems, setFinanceItems] = useState<GoalItem[]>(emptyItems());
  const [financeLeadsTarget, setFinanceLeadsTarget] = useState("");
  const [financeMessagesTarget, setFinanceMessagesTarget] = useState("");
  const [financeNewClients, setFinanceNewClients] = useState("");
  const [financeReturningClients, setFinanceReturningClients] = useState("");
  const [financeAvgPrice, setFinanceAvgPrice] = useState("");
  const [customPillars, setCustomPillars] = useState<CustomPillar[]>([]);
  const [hiddenPillars, setHiddenPillars] = useState<string[]>([]);
  const togglePillarPrivacy = (key: string) =>
    setHiddenPillars((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const revenueTarget = computeFinanceRevenueTarget(
    financeAvgPrice ? Number(financeAvgPrice) : null,
    financeNewClients ? Number(financeNewClients) : null,
    financeReturningClients ? Number(financeReturningClients) : null,
  );

  const addCustomPillar = () => setCustomPillars((prev) => [...prev, { key: `custom_${Date.now()}`, label: "", goal: "", items: [{ text: "", done: false }] }]);
  const removeCustomPillar = (idx: number) => setCustomPillars((prev) => prev.filter((_, i) => i !== idx));
  const updateCustomPillar = (idx: number, patch: Partial<CustomPillar>) =>
    setCustomPillars((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  const submitBeliefGoalHandler = async () => {
    if (!pillars.self_dev.goal.trim()) { toast.error("Fill in your Self-Development Goal."); return; }
    if (pillars.self_dev.items.length === 0 || pillars.self_dev.items.some((i) => !i.text.trim())) { toast.error("Fill in your Self-Development action items, or remove blank ones."); return; }
    if (!isSuperAdmin) {
      if (!pillars.relationship.goal.trim()) { toast.error("Fill in your Relationship Goal."); return; }
      if (pillars.relationship.items.length === 0 || pillars.relationship.items.some((i) => !i.text.trim())) { toast.error("Fill in your Relationship action items, or remove blank ones."); return; }
    }
    if (pillars.mlm.items.some((i) => !i.text.trim())) { toast.error("Remove blank Multilevel Marketing action items, or fill them in."); return; }

    if (entryChannel === "nbo") {
      if (!financeGoal.trim()) { toast.error("Fill in your Finance Goal."); return; }
      if (financeItems.length === 0 || financeItems.some((i) => !i.text.trim())) { toast.error("Fill in your Finance action items, or remove blank ones."); return; }
    } else if (!financeLeadsTarget || !financeMessagesTarget || !financeNewClients || !financeReturningClients || !financeAvgPrice) {
      toast.error("Fill in all five Finance targets — leads, messages, new clients, returning clients, and average sale price.");
      return;
    }
    for (const p of customPillars) {
      if (!p.label.trim()) { toast.error("Every custom goal needs a name."); return; }
      if (p.items.length === 0 || p.items.some((i) => !i.text.trim())) { toast.error(`Fill in action items for "${p.label || "your custom goal"}", or remove blank ones.`); return; }
    }

    setBusy(true);
    try {
      await submitBelief({
        data: {
          target_month: targetKey,
          finance_goal: entryChannel === "nbo" ? financeGoal : "",
          finance_items: entryChannel === "nbo" ? financeItems : [],
          finance_leads_target: entryChannel === "nbo" ? null : Number(financeLeadsTarget),
          finance_messages_target: entryChannel === "nbo" ? null : Number(financeMessagesTarget),
          finance_new_clients_target: entryChannel === "nbo" ? null : Number(financeNewClients),
          finance_returning_clients_target: entryChannel === "nbo" ? null : Number(financeReturningClients),
          finance_avg_price_usd: entryChannel === "nbo" ? null : Number(financeAvgPrice),
          self_dev_goal: pillars.self_dev.goal, self_dev_items: pillars.self_dev.items,
          mlm_goal: pillars.mlm.goal || MLM_DEFAULT_GOAL, mlm_items: pillars.mlm.items.filter((i) => i.text.trim()),
          relationship_goal: isSuperAdmin ? "N/A — Founder, no sponsor" : pillars.relationship.goal,
          relationship_items: isSuperAdmin ? [] : pillars.relationship.items,
          custom_pillars: customPillars.map((p) => ({ ...p, items: p.items.filter((i) => i.text.trim()) })),
          hidden_pillars: hiddenPillars,
        },
      });
      toast.success("Belief Goal submitted — daily binary tracking is now the evidence for Affirmation and Evaluation.");
      load();
    } catch (e: any) { toast.error(e?.message ?? "Could not submit."); }
    finally { setBusy(false); }
  };

  const doAffirmation = async (goalId: string) => {
    setBusy(true);
    try {
      const res: any = await submitAffirmation({ data: { goal_id: goalId } });
      toast.success(`Affirmation Goal submitted: ${res.score}/${res.total} (${res.percent.toFixed(1)}%) — "${res.remark}"`);
      load();
    } catch (e: any) { toast.error(e?.message ?? "Could not submit."); }
    finally { setBusy(false); }
  };
  const doEvaluation = async (goalId: string) => {
    setBusy(true);
    try {
      const res: any = await submitEvaluation({ data: { goal_id: goalId } });
      toast.success(`Evaluation Goal submitted: ${res.score}/${res.total} (${res.percent.toFixed(1)}%) — "${res.remark}"`);
      load();
    } catch (e: any) { toast.error(e?.message ?? "Could not submit."); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading your goal cycle…</div>;

  return (
    <div className="space-y-6">
      <TpeDefaultingBanner />
      <div className="rounded-2xl border border-gold/40 bg-accent/20 p-5">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-gold-deep"><TrendingUp className="h-3.5 w-3.5" /> This cycle</div>
        <h2 className="mt-1 font-display text-xl font-bold">
          {targetMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div>Belief due: <strong className="text-foreground">{beliefDueDate(targetMonth).toLocaleDateString()}</strong></div>
          <div>Affirmation due: <strong className="text-foreground">{affirmationDueDate(targetMonth).toLocaleDateString()}</strong></div>
          <div>Evaluation due: <strong className="text-foreground">{evaluationDueDate(targetMonth).toLocaleDateString()}</strong></div>
        </div>
      </div>

      {!current && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold">Set your Belief Goal</h3>
            <p className="text-xs text-muted-foreground mt-1">
              States intended effort, not results. Add as many action items to each goal as you need — every one of
              them becomes a tracked activity in your Daily Tracker automatically once you submit. The BPS works
              just as well for personal tracking — anything you don't want your sponsor, mentor or DSE Rep to see
              can be hidden per goal below.
            </p>
          </div>

          {BPS_PILLARS.filter((p) => p.key !== "finance" && !(isSuperAdmin && p.key === "relationship")).map((p) => {
            const key = p.key as Exclude<PillarKey, "finance">;
            return (
              <div key={p.key} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm">{p.label}</div>
                  <PrivacyToggle hidden={hiddenPillars.includes(p.key)} onToggle={() => togglePillarPrivacy(p.key)} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{p.hint}</p>
                <input
                  value={pillars[key].goal}
                  onChange={(e) => setPillars((prev) => ({ ...prev, [key]: { ...prev[key], goal: e.target.value } }))}
                  placeholder={key === "mlm" ? MLM_DEFAULT_GOAL : "Your goal statement"}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <ItemsEditor items={pillars[key].items} onChange={(items) => setPillars((prev) => ({ ...prev, [key]: { ...prev[key], items } }))} placeholder="Action item" />
              </div>
            );
          })}

          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-sm">Finance Goal</div>
              <PrivacyToggle hidden={hiddenPillars.includes("finance")} onToggle={() => togglePillarPrivacy("finance")} />
            </div>
            {entryChannel === "nbo" ? (
              <>
                <p className="text-[11px] text-muted-foreground mt-0.5">Income target and source — weeks 1-3 sales and marketing, week 4 skill training.</p>
                <input
                  value={financeGoal}
                  onChange={(e) => setFinanceGoal(e.target.value)}
                  placeholder="Your goal statement"
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <ItemsEditor items={financeItems} onChange={setFinanceItems} placeholder="Action item" />
              </>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Structural, not aspirational: leads to contact for the month, outreach messages to send, new and
                  returning clients you expect to close, and your expected average sale price. Your revenue target
                  is derived from these automatically.
                </p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <NumberField label="Leads to contact" value={financeLeadsTarget} onChange={setFinanceLeadsTarget} />
                  <NumberField label="Messages to send" value={financeMessagesTarget} onChange={setFinanceMessagesTarget} />
                  <NumberField label="New clients" value={financeNewClients} onChange={setFinanceNewClients} />
                  <NumberField label="Returning clients" value={financeReturningClients} onChange={setFinanceReturningClients} />
                  <NumberField label="Avg. sale price (USD)" value={financeAvgPrice} onChange={setFinanceAvgPrice} step="0.01" />
                </div>
                <div className="mt-2 rounded-md bg-accent/30 px-3 py-2 text-xs">
                  Revenue target: <strong className="font-display">${revenueTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-gold/50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="font-semibold text-sm">Other goals</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Add as many custom goal types as you need, each with its own indefinite action items.</p>
              </div>
              <button
                type="button"
                onClick={addCustomPillar}
                className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-[11px] font-semibold hover:bg-accent"
              >
                <Plus className="h-3.5 w-3.5" /> Add custom goal
              </button>
            </div>
            {customPillars.map((p, idx) => (
              <div key={p.key} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={p.label}
                    onChange={(e) => updateCustomPillar(idx, { label: e.target.value })}
                    placeholder="Goal name (e.g. Physical Health)"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium"
                  />
                  <PrivacyToggle hidden={hiddenPillars.includes(p.key)} onToggle={() => togglePillarPrivacy(p.key)} />
                  <button type="button" onClick={() => removeCustomPillar(idx)} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="Remove goal">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  value={p.goal}
                  onChange={(e) => updateCustomPillar(idx, { goal: e.target.value })}
                  placeholder="Your goal statement"
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                />
                <ItemsEditor items={p.items} onChange={(items) => updateCustomPillar(idx, { items })} placeholder="Action item" />
              </div>
            ))}
          </div>

          <button
            onClick={submitBeliefGoalHandler}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Belief Goal
          </button>
        </div>
      )}

      {current && <GoalCycleCard goal={current} busy={busy} onAffirmation={() => doAffirmation(current.id)} onEvaluation={() => doEvaluation(current.id)} />}

      {history.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold mb-3">Other cycles</h3>
          <p className="text-xs text-muted-foreground -mt-2 mb-3">
            Cycles overlap by design — this month's Evaluation can still be open here while next month's Belief
            Goal is already the current one above. Affirmation/Evaluation stay submittable here once due.
          </p>
          <div className="space-y-3">
            {history.map((g) => (
              <GoalCycleCard key={g.id} goal={g} busy={busy} compact onAffirmation={() => doAffirmation(g.id)} onEvaluation={() => doEvaluation(g.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCycleCard({ goal, busy, onAffirmation, onEvaluation, compact }: {
  goal: MonthlyGoal; busy: boolean; onAffirmation: () => void; onEvaluation: () => void; compact?: boolean;
}) {
  const targetMonthDate = parseTargetMonth(goal.target_month);
  const status = goalCycleStatus(goal, targetMonthDate);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg font-bold">
          {new Date(goal.target_month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h3>
        <StatusPill status={status} />
      </div>

      {!compact && (
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
          {goal.finance_avg_price_usd != null ? (
            <FinanceSummary goal={goal} />
          ) : (
            <PillarSummary label="Finance" goal={goal.finance_goal} items={goal.finance_items} />
          )}
          <PillarSummary label="Self-Development" goal={goal.self_dev_goal} items={goal.self_dev_items} />
          <PillarSummary label="Multilevel Marketing" goal={goal.mlm_goal} items={goal.mlm_items} />
          <PillarSummary label="Relationship (Sponsor)" goal={goal.relationship_goal} items={goal.relationship_items} />
          {(goal.custom_pillars ?? []).map((p) => (
            <PillarSummary key={p.key} label={p.label} goal={p.goal} items={p.items} />
          ))}
        </div>
      )}

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <ScoreBlock
          label="Affirmation Goal"
          submittedAt={goal.affirmation_submitted_at}
          score={goal.affirmation_score} total={goal.affirmation_total} percent={goal.affirmation_percent} remark={goal.affirmation_remark}
          action={
            status === "affirmation_due" ? <ActionButton busy={busy} onClick={onAffirmation} label="Submit Affirmation Goal" />
            : status === "affirmation_pending" ? <p className="mt-2 text-[11px] text-muted-foreground">Opens {affirmationDueDate(targetMonthDate).toLocaleDateString()}</p>
            : null
          }
        />
        <ScoreBlock
          label="Evaluation Goal"
          submittedAt={goal.evaluation_submitted_at}
          score={goal.evaluation_score} total={goal.evaluation_total} percent={goal.evaluation_percent} remark={goal.evaluation_remark}
          action={
            status === "evaluation_due" ? <ActionButton busy={busy} onClick={onEvaluation} label="Submit Evaluation Goal" />
            : status === "evaluation_pending" ? <p className="mt-2 text-[11px] text-muted-foreground">Opens {evaluationDueDate(targetMonthDate).toLocaleDateString()}</p>
            : null
          }
        />
      </div>
    </div>
  );
}

function ActionButton({ busy, onClick, label }: { busy: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} {label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta: Record<string, { label: string; className: string }> = {
    belief_due: { label: "Belief due", className: "bg-muted text-muted-foreground" },
    affirmation_pending: { label: "Affirmation not yet due", className: "bg-muted text-muted-foreground" },
    affirmation_due: { label: "Affirmation due", className: "bg-amber-500/15 text-amber-600" },
    evaluation_pending: { label: "Evaluation not yet due", className: "bg-muted text-muted-foreground" },
    evaluation_due: { label: "Evaluation due", className: "bg-sky-500/15 text-sky-600" },
    complete: { label: "Complete", className: "bg-emerald-500/15 text-emerald-600" },
  };
  const m = meta[status] ?? meta.belief_due;
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest ${m.className}`}>{m.label}</span>;
}

function PillarSummary({ label, goal, items }: { label: string; goal: string | null; items: GoalItem[] }) {
  const done = items.filter((i) => i.done).length;
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[10px] tracking-widest text-gold-deep">{label}</div>
      <div className="mt-1 font-medium">{goal || "—"}</div>
      {items.length > 0 && <div className="mt-1 text-muted-foreground">{done}/{items.length} action items done</div>}
    </div>
  );
}

function FinanceSummary({ goal }: { goal: MonthlyGoal }) {
  const revenueTarget = computeFinanceRevenueTarget(goal.finance_avg_price_usd, goal.finance_new_clients_target, goal.finance_returning_clients_target);
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[10px] tracking-widest text-gold-deep">Finance</div>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
        <div>Leads: <span className="text-foreground font-medium">{goal.finance_leads_target ?? "—"}</span></div>
        <div>Messages: <span className="text-foreground font-medium">{goal.finance_messages_target ?? "—"}</span></div>
        <div>New clients: <span className="text-foreground font-medium">{goal.finance_new_clients_target ?? "—"}</span></div>
        <div>Returning: <span className="text-foreground font-medium">{goal.finance_returning_clients_target ?? "—"}</span></div>
      </div>
      <div className="mt-1.5 font-medium">Revenue target: ${revenueTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
    </div>
  );
}

function ScoreBlock({ label, submittedAt, score, total, percent, remark, action }: {
  label: string; submittedAt: string | null; score: number | null; total: number | null; percent: number | null; remark: string | null; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[10px] tracking-widest text-gold-deep">{label}</div>
      {submittedAt ? (
        <>
          <div className="mt-1 font-display text-xl font-bold">{score}/{total} <span className="text-sm text-muted-foreground">({percent?.toFixed(1)}%)</span></div>
          <p className="mt-1 text-xs italic text-muted-foreground">"{remark}"</p>
        </>
      ) : (
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Not yet submitted</div>
      )}
      {action}
    </div>
  );
}

function PocketSection() {
  const summaryFn = useServerFn(getMyPocketSummary);
  const mlmSpendFn = useServerFn(logMlmActualSpend);
  const requestFn = useServerFn(requestEmergencyWithdrawal);
  const enrollFn = useServerFn(enrollInBpn);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mlmSpendInput, setMlmSpendInput] = useState<Record<string, string>>({});
  const [busyMlm, setBusyMlm] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setData(await summaryFn({ data: undefined as never })); }
    catch (e: any) { toast.error(e.message ?? "Failed to load the Pocket System"); }
    setLoading(false);
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return null;

  const latest = data.allocations[0];
  const unlockDate = data.savingsStartedAt ? savingsUnlockDate(new Date(data.savingsStartedAt)) : null;
  const savingsUnlocked = isSavingsUnlocked(data.savingsStartedAt ? new Date(data.savingsStartedAt) : null);
  const bpnEnrolled = !!data.bpnEnrolledAt;

  const doMlmSpend = async (allocationId: string) => {
    const raw = mlmSpendInput[allocationId];
    const value = Number(raw);
    if (!raw || Number.isNaN(value) || value < 0) { toast.error("Enter a valid amount."); return; }
    setBusyMlm(allocationId);
    try { await mlmSpendFn({ data: { allocation_id: allocationId, actual_spend_usd: value } }); toast.success("Logged."); await refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
    setBusyMlm(null);
  };

  const doRequest = async () => {
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) { toast.error("Enter a valid amount."); return; }
    if (!reason.trim()) { toast.error("Describe the emergency."); return; }
    setRequesting(true);
    try {
      await requestFn({ data: { amount_usd: value, reason: reason.trim() } });
      toast.success("Sent to your Rep.");
      setAmount(""); setReason("");
      await refresh();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    setRequesting(false);
  };

  const doEnroll = async () => {
    setEnrolling(true);
    try { await enrollFn({ data: undefined as never }); toast.success("Enrolled in BPN."); await refresh(); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
    setEnrolling(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> NBO Pocket Policy — binding on every participant</div>
        <p className="mt-2 text-sm text-muted-foreground">
          The moment a BPS Month's Evaluation Goal is submitted, that month's revenue is split five ways: Upkeep/Spending 25% (always
          available), Savings 25% (3-year cycles — each completed cycle issues a withdrawal permit and starts a new one), Investments 20%
          (released by your mentor as it's needed, in full at least once a year regardless), MLM Product Purchase 20% (only for BPN
          participants — otherwise it goes to Investments instead), and Emergency 10% (Rep-approved on request, plus an automatic 40%
          release every March and October).
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <PocketCard icon={Wallet} label="Upkeep / Spending" value={data.lifetimeUpkeepUsd} hint="Always available." />
        <PocketCard icon={PiggyBank} label="Savings" value={data.lifetimeSavingsUsd} hint={unlockDate ? (savingsUnlocked ? "Cycle complete — check permits below." : `Cycle ends ${unlockDate.toLocaleDateString()}`) : "Funds on your first Evaluation Goal."} />
        <PocketCard icon={data.investmentLockedUsd > 0 ? Lock : Unlock} label="Investments" value={data.lifetimeInvestmentsUsd} hint={`Unlocked: $${Number(data.investmentUnlockedUsd).toFixed(2)} · Locked: $${Number(data.investmentLockedUsd).toFixed(2)}`} />
        <PocketCard icon={ShoppingBag} label="MLM Product" value={data.mlmBalanceUsd} hint={`Cap $${MLM_BALANCE_CAP_USD} · Spent so far $${Number(data.lifetimeMlmActualSpendUsd).toFixed(2)}`} />
        <PocketCard icon={ShieldAlert} label="Emergency (available)" value={data.emergencyBalanceUsd} hint="Withdrawable now." />
      </div>

      {/* BPN — Blazer People Network */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2"><Users className="h-4 w-4" /> BPN — Blazer People Network</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Not compulsory. If you're not enrolled, your MLM Product Pocket's monthly share goes to Investments instead — the money isn't lost, it just has nowhere to go without BPN.
          Personal Neolife purchases: advised {BPN_PPV_ADVISED_CAP} PPV/month, hard cap {BPN_PPV_HARD_CAP} PPV — the emphasis is personal use, not aggressive selling.
        </p>
        {bpnEnrolled ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled since {new Date(data.bpnEnrolledAt).toLocaleDateString()}
          </div>
        ) : data.bpnEligible ? (
          <button onClick={doEnroll} disabled={enrolling} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {enrolling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />} Enroll in BPN
          </button>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Needs $1,000 in cumulative net income first (DFY's own tracked figure) — you're at ${Number(data.cumulativeNetIncomeUsd).toFixed(2)} of ${BPN_ELIGIBILITY_MIN_NET_INCOME_USD.toLocaleString()}.
          </p>
        )}
      </div>

      {latest && bpnEnrolled && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">
            Log MLM Actual Spend — {new Date(latest.target_month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {`This month's inflow: $${Number(latest.mlm_usd).toFixed(2)} (band: $${MLM_MONTHLY_FLOOR_USD}-$${MLM_MONTHLY_CEILING_USD}/month).`}
            {Number(latest.mlm_diverted_usd) > 0 && ` $${Number(latest.mlm_diverted_usd).toFixed(2)} of this month's nominal share went to Investments instead (over the monthly ceiling or the $${MLM_BALANCE_CAP_USD} pocket cap).`}
            {` Unspent balance stays in the pocket for future months, up to the $${MLM_BALANCE_CAP_USD} cap.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number" min="0" step="0.01" placeholder="Actual spend ($)"
              value={mlmSpendInput[latest.id] ?? String(latest.mlm_actual_spend_usd ?? "")}
              onChange={(e) => setMlmSpendInput((s) => ({ ...s, [latest.id]: e.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-40"
            />
            <button
              onClick={() => doMlmSpend(latest.id)} disabled={busyMlm === latest.id}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busyMlm === latest.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2"><Lock className="h-4 w-4" /> Investments Pocket</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Not self-service — your mentor releases funds when there's something concrete to put them toward. Whatever's still locked releases in full automatically once a year, regardless.
        </p>
        {data.unlocks.length > 0 ? (
          <div className="mt-3 space-y-2">
            {data.unlocks.map((u: any) => (
              <div key={u.id} className="rounded-lg border border-border p-3 flex items-center justify-between flex-wrap gap-2 text-sm">
                <div>
                  <span className="font-semibold text-emerald-600">${Number(u.amount_usd).toFixed(2)} released</span>
                  {u.note && <span className="text-muted-foreground"> — {u.note}</span>}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(u.unlocked_at).toLocaleDateString()}{u.is_annual_safeguard ? " · annual safeguard" : " · mentor release"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Nothing released yet.</p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Request an Emergency Withdrawal</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Goes to your Rep first. If it stalls 48 hours, it escalates to your Sponsor/Mentor, then the Founder. 40% of your balance also releases
          automatically every {EMERGENCY_AUTO_RELEASE_MONTHS.map((m: number) => new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: "long" })).join(" and ")} — no request needed.
        </p>
        <div className="mt-3 grid sm:grid-cols-[160px_1fr_auto] gap-2">
          <input type="number" min="0" step="0.01" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm" />
          <input type="text" placeholder="What's the emergency?" value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm" />
          <button
            onClick={doRequest} disabled={requesting}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {requesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send to Rep
          </button>
        </div>
        {data.requests.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.requests.map((r: any) => <WithdrawalRow key={r.id} r={r} />)}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2"><PiggyBank className="h-4 w-4" /> Savings Withdrawal Permits</h3>
        <p className="mt-1 text-xs text-muted-foreground">Issued automatically when a 3-year cycle completes — permanently withdrawable from that point on.</p>
        {data.permits.length > 0 ? (
          <div className="mt-3 space-y-2">
            {data.permits.map((p: any) => (
              <div key={p.id} className="rounded-lg border border-border p-3 flex items-center justify-between flex-wrap gap-2 text-sm">
                <span className="font-semibold text-emerald-600">${Number(p.amount_usd).toFixed(2)} withdrawable</span>
                <span className="text-[11px] text-muted-foreground">
                  Cycle {new Date(p.cycle_started_at).toLocaleDateString()} – {new Date(p.cycle_ended_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">No cycle completed yet.</p>
        )}
      </div>

      {data.allocations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 overflow-x-auto">
          <h3 className="font-display text-lg font-bold">Allocation History</h3>
          <table className="mt-3 w-full text-xs min-w-[720px]">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                <th className="py-1.5 pr-3">Month</th><th className="py-1.5 pr-3">Revenue</th><th className="py-1.5 pr-3">Upkeep</th>
                <th className="py-1.5 pr-3">Savings</th><th className="py-1.5 pr-3">Investments</th><th className="py-1.5 pr-3">MLM</th>
                <th className="py-1.5 pr-3">MLM Diverted</th><th className="py-1.5 pr-3">Emergency</th>
              </tr>
            </thead>
            <tbody>
              {data.allocations.map((a: any) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="py-1.5 pr-3 font-medium">{new Date(a.target_month).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</td>
                  <td className="py-1.5 pr-3">${Number(a.revenue_usd).toFixed(2)}</td>
                  <td className="py-1.5 pr-3">${Number(a.upkeep_usd).toFixed(2)}</td>
                  <td className="py-1.5 pr-3">${Number(a.savings_usd).toFixed(2)}</td>
                  <td className="py-1.5 pr-3">${Number(a.investments_usd).toFixed(2)}</td>
                  <td className="py-1.5 pr-3">${Number(a.mlm_usd).toFixed(2)}</td>
                  <td className="py-1.5 pr-3">${Number(a.mlm_diverted_usd).toFixed(2)}</td>
                  <td className="py-1.5 pr-3">${Number(a.emergency_usd).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PocketCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-1 font-display text-xl font-bold">${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function WithdrawalRow({ r }: { r: any }) {
  const statusMeta: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-600",
    approved: "bg-emerald-500/15 text-emerald-600",
    denied: "bg-crimson/15 text-crimson",
  };
  return (
    <div className="rounded-lg border border-border p-3 flex items-center justify-between flex-wrap gap-2">
      <div>
        <div className="font-medium text-sm">${Number(r.amount_usd).toFixed(2)} — {r.reason}</div>
        <div className="text-[11px] text-muted-foreground">
          Requested {new Date(r.requested_at).toLocaleDateString()}
          {r.status === "pending" && ` · ${ESCALATION_LABELS[r.escalation_level as EscalationLevel] ?? r.escalation_level}`}
          {r.decision_note && ` · "${r.decision_note}"`}
        </div>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest ${statusMeta[r.status] ?? statusMeta.pending}`}>{r.status}</span>
    </div>
  );
}
