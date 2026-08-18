import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { Motto } from "@/components/dfs/Brand";
import { WEEKS } from "./playbooks/plan";
import { usePath } from "@/lib/use-path";
import { PATH_PLAYBOOKS } from "@/lib/path-playbooks";
import { computeEscalation, forecastFirstClose, type ProgressRow } from "@/lib/escalation";
import {
  Crown, Shield, Target, Flame, TrendingUp, Calendar, BookOpen, Sparkles, Globe, ArrowRight,
  Gauge, AlertTriangle, DollarSign, ChevronLeft, ChevronRight, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DBI Citadel" }] }),
  component: Dashboard,
});

const XP_PER_TASK = 10;
const RANKS = [
  { key: "recruit",   label: "Recruit",   icon: Shield,     min: 0,    color: "text-slate-400" },
  { key: "scout",     label: "Scout",     icon: Target,     min: 50,   color: "text-emerald-400" },
  { key: "operator",  label: "Operator",  icon: Sparkles,   min: 150,  color: "text-sky-400" },
  { key: "closer",    label: "Closer",    icon: TrendingUp, min: 300,  color: "text-indigo-400" },
  { key: "lion",      label: "Lion",      icon: Flame,      min: 500,  color: "text-amber-400" },
  { key: "sovereign", label: "Sovereign", icon: BookOpen,   min: 800,  color: "text-rose-400" },
  { key: "crown",     label: "Crown",     icon: Crown,      min: 1200, color: "text-gold" },
] as const;

type Rank = (typeof RANKS)[number];
function resolveRank(xp: number): { current: Rank; next: Rank | null } {
  let current: Rank = RANKS[0];
  let next: Rank | null = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) current = RANKS[i];
    else { next = RANKS[i]; break; }
  }
  return { current, next };
}

// Order shown on the dashboard: Global SMB Engine → 45-Day → SMB Calculator.
// Only the 45-Day Plan generates XP. Other playbooks are preparatory / active tools.
// The first playbook of whichever path the beneficiary runs (the market /
// prospecting engine). Only the 45-Day plan generates XP.


const BAND_TONE: Record<string, { label: string; bg: string; text: string }> = {
  elite:    { label: "Elite",    bg: "bg-emerald-500/10", text: "text-emerald-500" },
  healthy:  { label: "Healthy",  bg: "bg-sky-500/10",     text: "text-sky-500" },
  watch:    { label: "Watch",    bg: "bg-amber-500/10",   text: "text-amber-500" },
  at_risk:  { label: "At-Risk",  bg: "bg-crimson/10",     text: "text-crimson" },
  critical: { label: "Critical", bg: "bg-crimson/20",     text: "text-crimson" },
};

function Dashboard() {
  const { user, role } = useSession();
  const { pathKey } = usePath();
  const dashPlaybooks = pathKey ? (PATH_PLAYBOOKS[pathKey] ?? []).slice(0, 1) : [];
  const [profile, setProfile] = useState<any>(null);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [planProgress, setPlanProgress] = useState<{ task_id: string; completed: boolean }[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [bpsSnapshot, setBpsSnapshot] = useState<{ clientCount: number; activityCount: number; doneToday: number }>({
    clientCount: 0, activityCount: 0, doneToday: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [pRes, tRes, planRes, rRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("task_progress").select("playbook, task_id, completed, completed_at").eq("user_id", user.id),
        supabase.from("task_progress").select("task_id, completed").eq("user_id", user.id).eq("playbook", "p_45day"),
        supabase.from("weekly_reports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setProfile(pRes.data);
      setProgressRows((tRes.data as any) ?? []);
      setPlanProgress((planRes.data as any) ?? []);
      setLatestReport(rRes.data);
    })();
    // Isolated from the core fetch above, same pattern as the admin
    // console's DFY panel — BPS is newer still and must never take down
    // the rest of the dashboard if its tables aren't migrated yet here.
    (async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [{ count: clientCount }, { data: activities }] = await Promise.all([
          supabase.from("crm_clients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("bps_activities").select("id").eq("user_id", user.id).eq("active", true),
        ]);
        const activityIds = (activities ?? []).map((a: any) => a.id);
        const { data: checks } = activityIds.length
          ? await supabase.from("bps_daily_checks").select("done").in("activity_id", activityIds).eq("check_date", today).eq("done", true)
          : { data: [] as any[] };
        setBpsSnapshot({ clientCount: clientCount ?? 0, activityCount: activityIds.length, doneToday: (checks ?? []).length });
      } catch { /* BPS not migrated yet on this environment */ }
    })();
  }, [user]);

  const completedRows = useMemo(() => progressRows.filter(r => r.completed), [progressRows]);
  const totalCompleted = completedRows.length;
  // XP is derived from the 45-Day Plan only. Other playbooks are preparation, not scoring surfaces.
  const planCompleted = useMemo(() => completedRows.filter(r => r.playbook === "p_45day").length, [completedRows]);
  const xp = planCompleted * XP_PER_TASK;
  const { current: rank, next } = useMemo(() => resolveRank(xp), [xp]);
  const RankIcon = rank.icon;
  const progressToNext = next ? Math.min(100, Math.round(((xp - rank.min) / (next.min - rank.min)) * 100)) : 100;

  const perPlaybook = useMemo(() => {
    const map: Record<string, number> = {};
    completedRows.forEach((r) => { map[r.playbook] = (map[r.playbook] ?? 0) + 1; });
    return map;
  }, [completedRows]);

  const snapshot = useMemo(() => computeEscalation(completedRows), [completedRows]);
  const startDate = profile?.start_date ? new Date(profile.start_date)
                   : profile?.created_at ? new Date(profile.created_at) : null;
  const forecast = useMemo(() => forecastFirstClose(progressRows, startDate), [progressRows, startDate]);

  // 45-day calendar shortcut: yesterday / today / tomorrow relative to start date
  const dayMap = useMemo(() => {
    const out: Record<number, { day: number; focus: string; icon: string; taskIds: string[] }> = {};
    (WEEKS as any[]).forEach((w) => {
      w.days.forEach((d: any) => { out[d.day] = { day: d.day, focus: d.focus, icon: d.icon, taskIds: d.tasks.map((t: any) => t.id) }; });
    });
    return out;
  }, []);
  const planDone = useMemo(() => {
    const s = new Set<string>();
    planProgress.forEach((p) => { if (p.completed) s.add(p.task_id); });
    return s;
  }, [planProgress]);

  const todayPlanDay = useMemo(() => {
    if (!startDate) return null;
    const diff = Math.floor((Date.now() - startDate.getTime()) / 86_400_000) + 1;
    return Math.min(45, Math.max(1, diff));
  }, [startDate]);

  const cardsFor = (offsets: number[]) => (todayPlanDay
    ? offsets.map((o) => todayPlanDay + o).filter((d) => d >= 1 && d <= 45).map((d) => dayMap[d]).filter(Boolean)
    : []);

  const RankPill = ({ pastel }: { pastel?: boolean }) => (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${pastel ? "bg-accent/30 text-gold-deep" : "bg-primary text-primary-foreground"}`}>
      <RankIcon className="h-3.5 w-3.5" /> {rank.label}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-regal relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <Motto />
        <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold">
          Welcome, {profile?.full_name ?? "Beneficiary"}.
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl text-sm md:text-base">
          {role === "admin"
            ? "You hold the council's seal. Below is your beneficiary view — beneficiaries' ranks are managed in the Council."
            : "Every task ticked in a playbook feeds your XP. Your rank rises with the work — and only with the work."}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Current rank" value={rank.label} icon={RankIcon} accent />
          <StatCard label="Tasks completed" value={String(totalCompleted)} icon={Sparkles} />
          <StatCard label="XP earned" value={String(xp)} icon={TrendingUp} />
        </div>

        {next && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs tracking-widest text-muted-foreground mb-2">
              <span>Progress → <span className="text-gold-deep">{next.label}</span></span>
              <span>{xp} / {next.min} XP</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progressToNext}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* Escalation metric card + calendar shortcut side-by-side on desktop */}
      <div className="grid lg:grid-cols-3 gap-4">
        <section className={`rounded-2xl border p-5 ${BAND_TONE[snapshot.band].bg} ring-1 ring-border`}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> Escalation
            </div>
            <Link to="/report" className="text-[11px] text-primary hover:underline">Full report →</Link>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className={`font-display text-4xl font-bold ${BAND_TONE[snapshot.band].text}`}>{snapshot.score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className={`mt-1 text-xs font-semibold ${BAND_TONE[snapshot.band].text}`}>{BAND_TONE[snapshot.band].label}</div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            <div>Last 7d: <span className="font-semibold text-foreground">{snapshot.activeDaysLast7}</span> active days · {snapshot.tasksLast7} tasks</div>
            <div>Last 14d: <span className="font-semibold text-foreground">{snapshot.activeDaysLast14}</span> active days · {snapshot.tasksLast14} tasks</div>
            <div>Streak: <span className="font-semibold text-foreground">{snapshot.currentStreak}d</span></div>
          </div>
          {snapshot.gracePeriodActive && (
            <div className="mt-3 text-[10px] rounded border border-gold/40 bg-gold/10 px-2 py-1 text-gold-deep">
              Grace period active — tracking started 6 Jul 2026.
            </div>
          )}
          {snapshot.fineUSD > 0 && (
            <div className="mt-3 text-[10px] rounded border border-crimson bg-crimson/10 px-2 py-1 text-crimson">
              ⚠ ${snapshot.fineUSD.toLocaleString()} fine active
              {snapshot.suspensionWeeks > 0 ? ` · ${snapshot.suspensionWeeks}w suspension notice` : ""}
            </div>
          )}
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-widest text-gold-deep">Calendar shortcut</div>
              <h3 className="mt-1 font-display text-lg font-bold">Yesterday · Today · Tomorrow</h3>
            </div>
            <Link to="/calendar" className="text-xs text-primary hover:underline">Open calendar →</Link>
          </div>
          {!todayPlanDay ? (
            <p className="mt-3 text-sm text-muted-foreground">Your campaign hasn't started yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Yesterday", off: -1 },
                { label: "Today", off: 0 },
                { label: "Tomorrow", off: 1 },
              ].map(({ label, off }) => {
                const day = cardsFor([off])[0];
                if (!day) {
                  return (
                    <div key={label} className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                      <div className="tracking-widest text-[9px] mb-1">{label}</div>
                      Outside 45-day plan.
                    </div>
                  );
                }
                const done = day.taskIds.filter((id) => planDone.has(id)).length;
                const pct = day.taskIds.length ? Math.round((done / day.taskIds.length) * 100) : 0;
                const isToday = off === 0;
                return (
                  <Link
                    key={label}
                    to="/playbooks/plan"
                    className={`rounded-lg border p-3 hover:border-gold transition ${isToday ? "border-gold bg-gold/5" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="tracking-widest text-[9px] text-muted-foreground">{label}</div>
                      <div className="text-[10px] font-semibold text-gold-deep">Day {day.day}</div>
                    </div>
                    <div className="mt-1 text-sm font-semibold flex items-center gap-1"><span>{day.icon}</span> {day.focus}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{done}/{day.taskIds.length} tasks</span>
                      {pct === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <div className="mt-1.5 h-1 rounded bg-muted overflow-hidden">
                      <div className={`h-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* BPS snapshot */}
      <section className="rounded-2xl border border-gold/40 bg-gold/5 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Productivity Scheme
            </div>
            <h2 className="mt-1 font-display text-xl font-bold">BPS — clients, tracker, goals</h2>
          </div>
          <Link to="/bps" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
            Open BPS <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="font-display text-2xl font-bold">{bpsSnapshot.clientCount}</div>
            <div className="text-[10px] tracking-widest text-muted-foreground mt-1">Clients in pipeline</div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="font-display text-2xl font-bold">{bpsSnapshot.activityCount}</div>
            <div className="text-[10px] tracking-widest text-muted-foreground mt-1">Tracked activities</div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-center">
            <div className="font-display text-2xl font-bold">{bpsSnapshot.doneToday}/{bpsSnapshot.activityCount}</div>
            <div className="text-[10px] tracking-widest text-muted-foreground mt-1">Sealed today</div>
          </div>
        </div>
      </section>

      {/* Playbooks quick access */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Begin today's forge</h2>
            <p className="text-sm text-muted-foreground">Only the 45-Day Plan writes to your rank. The rest are your preparation and active tools.</p>
          </div>
          <Link to="/playbooks" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
            All playbooks <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {dashPlaybooks.map((m) => {
            const done = m.key ? perPlaybook[m.key] ?? 0 : 0;
            return (
              <Link
                key={m.slug}
                to={`/playbooks/${m.slug}` as any}
                className="group rounded-xl border border-border bg-card p-5 hover:border-gold hover:shadow-regal transition"
              >
                <Globe className="h-6 w-6 text-gold-deep group-hover:text-primary transition" />
                <div className="mt-4 font-display font-semibold">{m.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <><span className="font-semibold text-foreground">{done}</span> tasks completed</>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Weekly report */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">Weekly cadence</div>
            <h2 className="mt-1 font-display text-2xl font-bold">Your latest report</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Link to="/weekly-report" className="text-sm font-semibold text-primary hover:underline">
              File this week's report →
            </Link>
            <Link to="/dfy" className="text-xs font-semibold text-gold-deep hover:underline inline-flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> DFY tracker →
            </Link>
          </div>
        </div>
        {latestReport ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <MiniStat label="Outreach" value={latestReport.outreach_count ?? 0} />
            <MiniStat label="Demos" value={latestReport.demos_built ?? 0} />
            <MiniStat label="Calls booked" value={latestReport.calls_booked ?? 0} />
            <MiniStat label="Clients closed" value={latestReport.clients_closed ?? 0} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No weekly report filed yet. The council reviews cadence, not perfection — even a report of zero counts.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-gold bg-accent/20" : "border-border bg-background"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-gold-deep"}`} />
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
