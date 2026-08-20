import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { computeEscalation, forecastFirstClose, advice, type ProgressRow } from "@/lib/escalation";
import { localDateStr } from "@/lib/local-date";
import {
  computeFinanceCycleTargets, financeExpectationForDays, defaultTargetMonth, monthKey, parseTargetMonth,
  evaluationDueDate, bpsMonthWindowDays, FINANCE_CHECKPOINT_DAYS,
} from "@/lib/bps";
import { savingsUnlockDate, isSavingsUnlocked } from "@/lib/pocket";
import {
  TrendingUp, Flame, AlertTriangle, ShieldAlert, Sparkles, Calendar as CalIcon,
  Target, Gauge, BookOpen, ArrowRight, DollarSign, ShieldCheck, CalendarCheck2, Wallet,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({ meta: [{ title: "Report — DBI Citadel" }] }),
  component: ReportPage,
});

const XP_PER_TASK = 10;

const PLAYBOOK_META: Record<string, { title: string; slug: string }> = {
  p_45day:       { title: "SMB Optimisation Engine", slug: "plan" },
  p_global:      { title: "SMB Prospecting Guide", slug: "global-smb-engine" },
  p_prospecting: { title: "SMB Prospecting Guide", slug: "global-smb-engine" },
  p_grandslam:   { title: "SMB Prospecting Guide", slug: "global-smb-engine" },
  p_ascent:      { title: "The Ascent", slug: "ascent-machine" },
  p_carebridge:  { title: "CareBridge", slug: "care-bridge" },
  p_ministry:    { title: "Digital Ministry Systems", slug: "ministry-systems" },
  p_broadcast:   { title: "The Broadcast Engine", slug: "broadcast-engine" },
  p_authority:   { title: "The Authority Engine", slug: "authority-engine" },
  p_revenue:     { title: "Revenue Recovery Engine", slug: "revenue-engine" },
};


const BAND_STYLE: Record<string, { label: string; ring: string; bg: string; text: string; note: string }> = {
  elite:    { label: "Elite",    ring: "ring-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500", note: "You're pacing at the top. Council watches with pride." },
  healthy:  { label: "Healthy",  ring: "ring-sky-500",     bg: "bg-sky-500/10",     text: "text-sky-500",     note: "You're inside the safe cadence. Keep the rhythm." },
  watch:    { label: "Watch",    ring: "ring-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-500",   note: "Drift detected. One more slow week and escalation opens." },
  at_risk:  { label: "At-Risk",  ring: "ring-crimson",     bg: "bg-crimson/10",     text: "text-crimson",     note: "You are on the escalation queue. Log tasks today." },
  critical: { label: "Critical", ring: "ring-crimson",     bg: "bg-crimson/20",     text: "text-crimson",     note: "Suspension is imminent. Contact your council admin immediately." },
};

function ReportPage() {
  const { user, role } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [latestEscalation, setLatestEscalation] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [bpsWeeks, setBpsWeeks] = useState<any[]>([]);
  const [financeGoal, setFinanceGoal] = useState<any>(null);
  const [pocketAllocations, setPocketAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [pRes, tRes, eRes, cRes, bRes, fRes, kRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("task_progress").select("playbook, task_id, completed, completed_at").eq("user_id", user.id),
        supabase.from("escalations").select("*").eq("beneficiary_id", user.id).is("resolved_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("check_ins").select("*").eq("beneficiary_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("bps_weekly_reports").select("*").eq("user_id", user.id).order("week_start", { ascending: false }).limit(4),
        supabase.from("bps_monthly_goals").select("*").eq("user_id", user.id).eq("target_month", monthKey(defaultTargetMonth())).maybeSingle(),
        supabase.from("pocket_allocations").select("*").eq("user_id", user.id).order("target_month", { ascending: false }).limit(3),
      ]);
      setProfile(pRes.data);
      setRows((tRes.data as any) ?? []);
      setLatestEscalation(eRes.data ?? null);
      setCheckIns((cRes.data as any) ?? []);
      setBpsWeeks((bRes.data as any) ?? []);
      setFinanceGoal(fRes.data ?? null);
      setPocketAllocations((kRes.data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const startDate = profile?.start_date ? new Date(profile.start_date)
                   : profile?.created_at ? new Date(profile.created_at) : null;

  const snapshot = useMemo(() => computeEscalation(rows.filter(r => r.completed), new Date(), profile?.tpe_defaulting_until ?? null), [rows, profile?.tpe_defaulting_until]);
  const forecast = useMemo(() => forecastFirstClose(rows, startDate), [rows, startDate]);
  const tips = useMemo(() => advice(snapshot, forecast), [snapshot, forecast]);

  // Per-playbook breakdown
  const perPlaybook = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => { if (r.completed) map[r.playbook] = (map[r.playbook] ?? 0) + 1; });
    return map;
  }, [rows]);

  const totalCompleted = rows.filter(r => r.completed).length;
  const xp = totalCompleted * XP_PER_TASK;

  // 14-day activity strip
  const last14 = useMemo(() => {
    const days: { date: Date; count: number; iso: string }[] = [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const iso = localDateStr(d);
      const count = rows.filter(r => r.completed && r.completed_at && localDateStr(new Date(r.completed_at)) === iso).length;
      days.push({ date: d, count, iso });
    }
    return days;
  }, [rows]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading report…</div>;

  const band = BAND_STYLE[snapshot.band];
  const daysElapsed = startDate ? Math.max(1, Math.floor((Date.now() - startDate.getTime()) / 86_400_000) + 1) : forecast.elapsedDays;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-regal relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <div className="text-[10px] tracking-widest text-gold-deep">Beneficiary Report</div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">
          {profile?.full_name ?? "Beneficiary"} — Field Report
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          The council reads this exact page each week. Cadence, velocity, escalation score, and forecast are all computed from the tasks you tick. No manual entry — the truth is in the doing.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={CalIcon} label="Days in campaign" value={`${daysElapsed}`} />
          <Stat icon={Sparkles} label="Tasks completed" value={`${totalCompleted}`} />
          <Stat icon={TrendingUp} label="XP earned" value={`${xp}`} />
          <Stat icon={Flame} label="Current streak" value={`${snapshot.currentStreak}d`} />
        </div>
      </section>

      {/* ESCALATION SCORE */}
      <section className={`rounded-2xl border p-6 md:p-8 ${band.bg} ${band.ring} ring-1`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className={`text-[10px] tracking-widest font-bold ${band.text}`}>Escalation Band</div>
            <h2 className={`mt-1 font-display text-3xl font-bold ${band.text}`}>{band.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">{band.note}</p>
          </div>
          <ScoreDial score={snapshot.score} band={snapshot.band} />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Gauge} label="Days active (last 7)" value={`${snapshot.activeDaysLast7}/7`} target={6} current={snapshot.activeDaysLast7} />
          <Stat icon={Gauge} label="Days active (last 14)" value={`${snapshot.activeDaysLast14}/14`} target={10} current={snapshot.activeDaysLast14} />
          <Stat icon={Target} label="Tasks (last 7d)" value={`${snapshot.tasksLast7}`} />
          <Stat icon={Target} label="Tasks (last 14d)" value={`${snapshot.tasksLast14}`} />
        </div>

        {(snapshot.band === "at_risk" || snapshot.band === "critical") && !snapshot.gracePeriodActive && (
          <div className="mt-6 rounded-xl border border-crimson bg-crimson/10 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-crimson flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-display font-bold text-crimson">
                {snapshot.band === "critical" ? "Cadence critical" : "Cadence at risk"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your mentor and DSE Rep can see this too — no fine, no automatic suspension, just a signal that it's
                time for a conversation about what's actually in the way. Hitting your cadence targets this week
                clears it.
              </p>
            </div>
          </div>
        )}

        {snapshot.reasons.length > 0 && snapshot.band !== "elite" && (
          <div className="mt-5">
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">Factors dragging your score</div>
            <ul className="text-xs space-y-1">
              {snapshot.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 14-DAY HEATSTRIP */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">Last 14 days</div>
            <h2 className="mt-1 font-display text-2xl font-bold">Cadence heatstrip</h2>
          </div>
          <div className="text-xs text-muted-foreground">
            Green = active · Grey = silent
          </div>
        </div>
        <div className="mt-5 grid grid-cols-14 gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {last14.map((d) => {
            const intensity = d.count === 0 ? "bg-muted" :
              d.count < 3 ? "bg-emerald-500/30" :
              d.count < 6 ? "bg-emerald-500/60" : "bg-emerald-500";
            return (
              <div key={d.iso} className="flex flex-col items-center gap-1" title={`${d.iso}: ${d.count} tasks`}>
                <div className={`h-10 w-full rounded-md ${intensity}`} />
                <div className="text-[9px] text-muted-foreground">{d.date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* VELOCITY / FORECAST */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] tracking-widest text-gold-deep">Velocity & Forecast</div>
        <h2 className="mt-1 font-display text-2xl font-bold">The road to your first close</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Based on your task-completion pace. First-close territory in the 45-day plan sits at roughly Day 26 — that is our benchmark for this forecast.
        </p>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Gauge} label="Pace (tasks/day)" value={forecast.tasksPerDay.toFixed(2)} />
          <Stat icon={Target} label="Progress to first close" value={`${forecast.closeProgress}%`} />
          <Stat
            icon={CalIcon}
            label="Projected days to close"
            value={forecast.daysToClose === null ? "—" : `${forecast.daysToClose}d`}
          />
          <Stat icon={BookOpen} label="Tasks remaining in plan" value={`${forecast.remainingTotal}`} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Toward first-close threshold</span>
            <span>{forecast.tasksDone} / 130 tasks</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-gold" style={{ width: `${forecast.closeProgress}%` }} />
          </div>
        </div>
      </section>

      {/* DFY */}
      <section className="rounded-2xl border border-gold/40 bg-accent/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">Once you're earning</div>
            <h2 className="mt-1 font-display text-2xl font-bold">The D'Famocious Year</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Log net income the month you start earning — qualified months, remittance owed, and your pace
              toward SUC readiness are all tracked there.
            </p>
          </div>
          <Link to="/dfy" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
            <DollarSign className="h-4 w-4" /> Open DFY Tracker
          </Link>
        </div>
      </section>

      {/* BPS WEEKLY CADENCE */}
      <section className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-gold-deep"><CalendarCheck2 className="h-3.5 w-3.5" /> Belief Goal cadence</div>
            <h2 className="mt-1 font-display text-2xl font-bold">BPS weekly report</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Posted automatically every Monday by scoring last week's tracked activities — nothing here is filed by hand.
            </p>
          </div>
          <Link to="/bps" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all whitespace-nowrap">
            Open BPS <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {bpsWeeks.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No weekly cadence report yet — one posts here the first Monday after your Belief Goal is submitted.</p>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {bpsWeeks.map((w) => (
              <div key={w.id} className="rounded-lg border border-border bg-background p-3">
                <div className="text-[10px] tracking-widest text-muted-foreground">
                  {new Date(w.week_start).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {" – "}
                  {new Date(w.week_end).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
                <div className="mt-1 font-display text-xl font-bold">{w.activities_done}/{w.activities_total}</div>
                <div className="text-xs text-muted-foreground">{Number(w.percent).toFixed(1)}% cadence</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FINANCIAL GOAL CHECKPOINTS */}
      {financeGoal?.finance_leads_target != null && financeGoal?.belief_submitted_at && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Financial Goal</div>
          <h2 className="mt-1 font-display text-2xl font-bold">Checkpoint results</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Computed automatically the moment you submit each goal — the 15th of last month (Affirmation) and the
            10th of this month (Evaluation), fixed to the calendar — and reported to your sponsor, mentor and DSE
            Rep the same moment.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <FinanceCheckpointCard
              label="Affirmation (day 15)"
              submitted={!!financeGoal.affirmation_submitted_at}
              actual={{
                leads: financeGoal.finance_checkpoint_leads_actual, messages: financeGoal.finance_checkpoint_messages_actual,
                newClients: financeGoal.finance_checkpoint_new_clients_actual, returningClients: financeGoal.finance_checkpoint_returning_clients_actual,
                revenueUsd: financeGoal.finance_checkpoint_revenue_actual,
              }}
              expected={financeExpectationForDays(computeFinanceCycleTargets(financeGoal, parseTargetMonth(financeGoal.target_month)), FINANCE_CHECKPOINT_DAYS)}
            />
            <FinanceCheckpointCard
              label={`Evaluation (${evaluationDueDate(parseTargetMonth(financeGoal.target_month)).toLocaleDateString()})`}
              submitted={!!financeGoal.evaluation_submitted_at}
              actual={{
                leads: financeGoal.finance_final_leads_actual, messages: financeGoal.finance_final_messages_actual,
                newClients: financeGoal.finance_final_new_clients_actual, returningClients: financeGoal.finance_final_returning_clients_actual,
                revenueUsd: financeGoal.finance_final_revenue_actual,
              }}
              expected={computeFinanceCycleTargets(financeGoal, parseTargetMonth(financeGoal.target_month)).monthly}
            />
          </div>
        </section>
      )}

      {/* NBO POCKET SYSTEM */}
      {pocketAllocations.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> NBO Pocket System</div>
              <h2 className="mt-1 font-display text-2xl font-bold">Latest allocation</h2>
            </div>
            <Link to="/bps" className="text-xs font-semibold text-gold-deep hover:underline inline-flex items-center gap-1">
              Manage in BPS <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {(() => {
            const latest = pocketAllocations[0];
            const unlockDate = profile?.pocket_savings_started_at ? savingsUnlockDate(new Date(profile.pocket_savings_started_at)) : null;
            const unlocked = isSavingsUnlocked(profile?.pocket_savings_started_at ? new Date(profile.pocket_savings_started_at) : null);
            return (
              <>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  {new Date(latest.target_month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}'s BPS Month revenue
                  (${Number(latest.revenue_usd).toFixed(2)}), split per the binding Pocket Policy.
                </p>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Upkeep</div><div className="mt-1 font-display text-lg font-bold">${Number(latest.upkeep_usd).toFixed(2)}</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Savings</div><div className="mt-1 font-display text-lg font-bold">${Number(latest.savings_usd).toFixed(2)}</div><div className="text-[10px] text-muted-foreground">{unlockDate ? (unlocked ? "Unlocked" : `Unlocks ${unlockDate.toLocaleDateString()}`) : ""}</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Investments</div><div className="mt-1 font-display text-lg font-bold">${Number(latest.investments_usd).toFixed(2)}</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">MLM Product</div><div className="mt-1 font-display text-lg font-bold">${Number(latest.mlm_usd).toFixed(2)}</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Emergency</div><div className="mt-1 font-display text-lg font-bold">${Number(latest.emergency_usd).toFixed(2)}</div></div>
                </div>
              </>
            );
          })()}
        </section>
      )}

      {/* PLAYBOOK BREAKDOWN */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] tracking-widest text-gold-deep">Playbook coverage</div>
        <h2 className="mt-1 font-display text-2xl font-bold">Where your work is landing</h2>
        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(PLAYBOOK_META).map(([key, m]) => (
            <Link key={key} to={`/playbooks/${m.slug}` as any}
              className="rounded-xl border border-border bg-background p-4 hover:border-gold transition">
              <div className="text-xs text-muted-foreground">{m.title}</div>
              <div className="mt-2 font-display text-2xl font-bold">{perPlaybook[key] ?? 0}</div>
              <div className="mt-1 text-[10px] tracking-widest text-gold-deep">tasks · {(perPlaybook[key] ?? 0) * XP_PER_TASK} XP</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ADVICE */}
      <section className="rounded-2xl border border-gold/40 bg-accent/20 p-6">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-gold-deep">
          <Sparkles className="h-3.5 w-3.5" /> Personalised counsel
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold">What to do next</h2>
        <ul className="mt-4 space-y-3">
          {tips.map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-deep flex-shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* RECENT COUNCIL CHECK-INS */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">Council notes</div>
            <h2 className="mt-1 font-display text-2xl font-bold">Recent check-ins</h2>
          </div>
          <ShieldCheck className="h-5 w-5 text-gold-deep" />
        </div>
        {checkIns.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No admin check-ins recorded yet. Your admin logs summaries here after each 1:1.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {checkIns.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(c.created_at).toLocaleString()}</span>
                  {c.mood && <span className="tracking-widest text-gold-deep">{c.mood}</span>}
                </div>
                <p className="mt-2 text-sm">{c.summary}</p>
                {c.next_action && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <strong className="text-foreground">Next action:</strong> {c.next_action}
                    {c.next_action_due && ` · by ${new Date(c.next_action_due).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {role === "admin" && (
        <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          You are viewing your own report. Beneficiary reports are inside the <Link to="/admin" className="text-primary font-semibold hover:underline">Council</Link>.
        </div>
      )}
    </div>
  );
}

function FinanceCheckpointCard({ label, submitted, actual, expected }: {
  label: string;
  submitted: boolean;
  actual: { leads: number | null; messages: number | null; newClients: number | null; returningClients: number | null; revenueUsd: number | null };
  expected: { leads: number; messages: number; newClients: number; returningClients: number; revenueUsd: number };
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {!submitted && <span className="text-[10px] text-muted-foreground">Not yet submitted</span>}
      </div>
      {submitted ? (
        <div className="mt-2 text-xs space-y-1">
          <div><strong className="text-foreground">{actual.leads ?? 0}</strong> / {expected.leads.toFixed(1)} leads</div>
          <div><strong className="text-foreground">{actual.messages ?? 0}</strong> / {expected.messages.toFixed(1)} messages</div>
          <div><strong className="text-foreground">{actual.newClients ?? 0}</strong> / {expected.newClients.toFixed(1)} new clients</div>
          <div><strong className="text-foreground">{actual.returningClients ?? 0}</strong> / {expected.returningClients.toFixed(1)} returning clients</div>
          <div><strong className="text-foreground">${Number(actual.revenueUsd ?? 0).toFixed(2)}</strong> / ${expected.revenueUsd.toFixed(2)} revenue</div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Expected by then: {expected.leads.toFixed(1)}L / {expected.messages.toFixed(1)}M / {expected.newClients.toFixed(1)}NC / {expected.returningClients.toFixed(1)}RC / ${expected.revenueUsd.toFixed(2)}</p>
      )}
    </div>
  );
}

function Stat({
  icon: Icon, label, value, target, current,
}: { icon: any; label: string; value: string; target?: number; current?: number }) {
  const short = typeof target === "number" && typeof current === "number" && current < target;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${short ? "text-crimson" : "text-gold-deep"}`} />
      </div>
      <div className={`mt-2 font-display text-2xl font-bold ${short ? "text-crimson" : ""}`}>{value}</div>
    </div>
  );
}

function ScoreDial({ score, band }: { score: number; band: string }) {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const color =
    band === "elite" ? "#10b981" :
    band === "healthy" ? "#0ea5e9" :
    band === "watch" ? "#f59e0b" :
    "#dc2626";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-bold" style={{ color }}>{score}</div>
        <div className="text-[10px] tracking-widest text-muted-foreground">score / 100</div>
      </div>
    </div>
  );
}
