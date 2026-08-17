import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { usePath } from "@/lib/use-path";
import { PATHS } from "@/lib/paths";
import { submitBeliefGoal, submitAffirmationGoal, submitEvaluationGoal } from "@/lib/bps.functions";
import {
  MAX_DAILY_ACTIVITIES, BPS_PILLARS, PILLAR_ITEM_COUNT, MLM_DEFAULT_GOAL,
  beliefDueDate, affirmationDueDate, evaluationDueDate, defaultTargetMonth, monthKey,
  goalCycleStatus, type GoalItem, type PillarKey,
} from "@/lib/bps";
import {
  CRM_STAGES, priorityFromScore, PRIORITY_META,
  viewAllLeads, viewHotLeads, viewActiveOutreach, viewThisWeek, viewClosedWon,
} from "@/lib/crm";
import { toast } from "sonner";
import {
  Target, Users, CalendarCheck2, Plus, Pencil, Trash2, X, Save, Loader2,
  Phone, Mail, Linkedin, Globe, MapPin, Star, Flame, CheckCircle2, Circle,
  Send, ClipboardList, TrendingUp, AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/bps")({
  head: () => ({ meta: [{ title: "Productivity Scheme (BPS) — DBI Citadel" }] }),
  component: BpsPage,
});

type Tab = "crm" | "tracker" | "goals";

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
      </div>

      {tab === "crm" && <CrmSection />}
      {tab === "tracker" && <TrackerSection />}
      {tab === "goals" && <GoalsSection />}
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
  const [editing, setEditing] = useState<Client | "new" | null>(null);

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

  if (loading) return <div className="text-sm text-muted-foreground">Loading your pipeline…</div>;

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
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add client
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No leads in this view yet. Add your first client to start the pipeline.
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <ClientCard key={c.id} client={c} onEdit={() => setEditing(c)} onDelete={() => deleteClient(c.id, c.name)}
            onStage={(stage) => quickStage(c.id, stage)} onFlag={(f) => quickFlag(c, f)} />
        ))}
      </div>

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
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-semibold truncate flex items-center gap-1.5">
            {prio && <span title={prio.label}>{prio.emoji}</span>}
            {c.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2">
            {c.niche && <span>{c.niche}</span>}
            {c.city && <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{c.city}</span>}
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
        <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
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

/* ═══════════════════════════ DAILY TRACKER (1 / 0) ═══════════════════════════ */

type Activity = { id: string; label: string; sort_order: number; active: boolean };
type DailyCheck = { activity_id: string; check_date: string; done: boolean };

function TrackerSection() {
  const { user } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [days, setDays] = useState(14);

  const rangeStart = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1)); return d;
  }, [days]);

  const load = async () => {
    if (!user) return;
    const [{ data: acts }, { data: ch }] = await Promise.all([
      supabase.from("bps_activities").select("*").eq("user_id", user.id).eq("active", true).order("sort_order", { ascending: true }),
      supabase.from("bps_daily_checks").select("activity_id,check_date,done").eq("user_id", user.id).gte("check_date", rangeStart.toISOString().slice(0, 10)),
    ]);
    setActivities((acts as any) ?? []);
    setChecks((ch as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, days]);

  const dateList = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(rangeStart); d.setDate(d.getDate() + i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, [rangeStart, days]);

  const checkMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const c of checks) m.set(`${c.activity_id}:${c.check_date}`, c.done);
    return m;
  }, [checks]);

  const addActivity = async () => {
    if (!user || !newLabel.trim()) return;
    if (activities.length >= MAX_DAILY_ACTIVITIES) { toast.error(`Track at most ${MAX_DAILY_ACTIVITIES} activities at a time.`); return; }
    const { error } = await supabase.from("bps_activities").insert({
      user_id: user.id, label: newLabel.trim(), sort_order: activities.length,
    } as any);
    if (error) { toast.error(error.message); return; }
    setNewLabel("");
    load();
  };

  const retireActivity = async (id: string) => {
    const { error } = await supabase.from("bps_activities").update({ active: false } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Chosen activities</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Up to {MAX_DAILY_ACTIVITIES} activities, scored 1 (done) or 0 (not done) each day. No partial credit — a day either happened or it didn't.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activities.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 text-xs font-semibold">
              {a.label}
              <button onClick={() => retireActivity(a.id)} title="Retire this activity" className="text-muted-foreground hover:text-crimson"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        {activities.length < MAX_DAILY_ACTIVITIES && (
          <div className="mt-3 flex gap-2">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Outreach 10 DMs"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <button onClick={addActivity} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Add your first activity above to start daily binary tracking.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">Daily grid</h2>
            <div className="flex gap-1 text-xs">
              {[7, 14, 30].map((n) => (
                <button key={n} onClick={() => setDays(n)} className={`rounded-full px-3 py-1 font-semibold ${days === n ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>
                  {n}d
                </button>
              ))}
            </div>
          </div>
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 sticky left-0 bg-card">Activity</th>
                {dateList.map((d) => (
                  <th key={d} className={`p-1 font-normal text-center min-w-[28px] ${d === today ? "text-gold-deep font-bold" : "text-muted-foreground"}`}>
                    {new Date(d).getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="p-2 font-semibold sticky left-0 bg-card whitespace-nowrap">{a.label}</td>
                  {dateList.map((d) => {
                    const done = checkMap.get(`${a.id}:${d}`) ?? false;
                    return (
                      <td key={d} className="p-1 text-center">
                        <button
                          onClick={() => toggle(a.id, d)}
                          className={`h-6 w-6 rounded-md text-[11px] font-bold transition ${
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
    </div>
  );
}

/* ═══════════════════════════ MONTHLY GOALS (Belief → Affirmation → Evaluation) ═══════════════════════════ */

type MonthlyGoal = {
  id: string; target_month: string;
  finance_goal: string | null; finance_items: GoalItem[];
  self_dev_goal: string | null; self_dev_items: GoalItem[];
  mlm_goal: string; mlm_items: GoalItem[];
  relationship_goal: string | null; relationship_items: GoalItem[];
  belief_submitted_at: string | null;
  affirmation_submitted_at: string | null; affirmation_score: number | null; affirmation_total: number | null; affirmation_percent: number | null; affirmation_remark: string | null;
  evaluation_submitted_at: string | null; evaluation_score: number | null; evaluation_total: number | null; evaluation_percent: number | null; evaluation_remark: string | null;
};

function emptyItems(): GoalItem[] {
  return Array.from({ length: PILLAR_ITEM_COUNT }, () => ({ text: "", done: false }));
}

function GoalsSection() {
  const { user } = useSession();
  const submitBelief = useServerFn(submitBeliefGoal);
  const submitAffirmation = useServerFn(submitAffirmationGoal);
  const submitEvaluation = useServerFn(submitEvaluationGoal);

  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

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

  const current = goals.find((g) => g.target_month === targetKey) ?? null;
  const history = goals.filter((g) => g.target_month !== targetKey);

  const [pillars, setPillars] = useState<Record<PillarKey, { goal: string; items: GoalItem[] }>>({
    finance: { goal: "", items: emptyItems() },
    self_dev: { goal: "", items: emptyItems() },
    mlm: { goal: MLM_DEFAULT_GOAL, items: emptyItems() },
    relationship: { goal: "", items: emptyItems() },
  });

  const submitBeliefGoalHandler = async () => {
    for (const p of BPS_PILLARS) {
      if (p.key === "mlm") continue;
      if (!pillars[p.key].goal.trim()) { toast.error(`Fill in your ${p.label}.`); return; }
      if (pillars[p.key].items.some((i) => !i.text.trim())) { toast.error(`Fill all 3 action items for your ${p.label}.`); return; }
    }
    setBusy(true);
    try {
      await submitBelief({
        data: {
          target_month: targetKey,
          finance_goal: pillars.finance.goal, finance_items: pillars.finance.items,
          self_dev_goal: pillars.self_dev.goal, self_dev_items: pillars.self_dev.items,
          mlm_goal: pillars.mlm.goal || MLM_DEFAULT_GOAL, mlm_items: pillars.mlm.items.filter((i) => i.text.trim()),
          relationship_goal: pillars.relationship.goal, relationship_items: pillars.relationship.items,
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
              States intended effort, not results. Four pillars, three specific, observable, trackable action items each.
              Make sure you have at least one activity running in the Daily Tracker first.
            </p>
          </div>
          {BPS_PILLARS.map((p) => (
            <div key={p.key} className="rounded-xl border border-border p-4">
              <div className="font-semibold text-sm">{p.label}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{p.hint}</p>
              <input
                value={pillars[p.key].goal}
                onChange={(e) => setPillars((prev) => ({ ...prev, [p.key]: { ...prev[p.key], goal: e.target.value } }))}
                placeholder={p.key === "mlm" ? MLM_DEFAULT_GOAL : "Your goal statement"}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="mt-2 space-y-1.5">
                {pillars[p.key].items.map((item, idx) => (
                  <input
                    key={idx}
                    value={item.text}
                    onChange={(e) => setPillars((prev) => {
                      const items = [...prev[p.key].items];
                      items[idx] = { ...items[idx], text: e.target.value };
                      return { ...prev, [p.key]: { ...prev[p.key], items } };
                    })}
                    placeholder={`Action item ${idx + 1}`}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                  />
                ))}
              </div>
            </div>
          ))}
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
          <h3 className="font-display text-lg font-bold mb-3">Past cycles</h3>
          <div className="space-y-3">
            {history.map((g) => <GoalCycleCard key={g.id} goal={g} busy={false} compact onAffirmation={() => {}} onEvaluation={() => {}} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCycleCard({ goal, busy, onAffirmation, onEvaluation, compact }: {
  goal: MonthlyGoal; busy: boolean; onAffirmation: () => void; onEvaluation: () => void; compact?: boolean;
}) {
  const status = goalCycleStatus(goal);
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
          <PillarSummary label="Finance" goal={goal.finance_goal} items={goal.finance_items} />
          <PillarSummary label="Self-Development" goal={goal.self_dev_goal} items={goal.self_dev_items} />
          <PillarSummary label="Multilevel Marketing" goal={goal.mlm_goal} items={goal.mlm_items} />
          <PillarSummary label="Relationship (Sponsor)" goal={goal.relationship_goal} items={goal.relationship_items} />
        </div>
      )}

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <ScoreBlock
          label="Affirmation Goal"
          submittedAt={goal.affirmation_submitted_at}
          score={goal.affirmation_score} total={goal.affirmation_total} percent={goal.affirmation_percent} remark={goal.affirmation_remark}
          action={status === "affirmation_due" ? <ActionButton busy={busy} onClick={onAffirmation} label="Submit Affirmation Goal" /> : null}
        />
        <ScoreBlock
          label="Evaluation Goal"
          submittedAt={goal.evaluation_submitted_at}
          score={goal.evaluation_score} total={goal.evaluation_total} percent={goal.evaluation_percent} remark={goal.evaluation_remark}
          action={status === "evaluation_due" ? <ActionButton busy={busy} onClick={onEvaluation} label="Submit Evaluation Goal" /> : null}
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
    affirmation_due: { label: "Affirmation due", className: "bg-amber-500/15 text-amber-600" },
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
