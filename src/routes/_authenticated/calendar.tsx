import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { WEEKS } from "./playbooks/plan";
import { CheckCircle2, Circle, CalendarDays, Flame, Lock, ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { ESCALATION_START } from "@/lib/escalation";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — DBI Citadel" }] }),
  component: CalendarPage,
});

type DayMeta = { day: number; focus: string; icon: string; taskIds: string[]; note?: string };
type ProgressRow = { task_id: string; completed: boolean; completed_at: string | null };

const DAY_MANUAL_PREFIX = "day-complete-";

function CalendarPage() {
  const { user } = useSession();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [pRes, prRes] = await Promise.all([
        supabase.from("profiles").select("start_date, created_at").eq("id", user.id).maybeSingle(),
        supabase.from("task_progress").select("task_id, completed, completed_at").eq("user_id", user.id).eq("playbook", "p_45day"),
      ]);
      const sd = pRes.data?.start_date ?? pRes.data?.created_at ?? null;
      setStartDate(sd ? new Date(sd) : new Date());
      setProgress((prRes.data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const daysMeta: DayMeta[] = useMemo(() => {
    const out: DayMeta[] = [];
    for (const w of WEEKS as any[]) {
      for (const d of w.days) {
        out.push({ day: d.day, focus: d.focus, icon: d.icon, note: d.note, taskIds: d.tasks.map((t: any) => t.id) });
      }
    }
    return out.sort((a, b) => a.day - b.day);
  }, []);

  const doneMap = useMemo(() => {
    const m: Record<string, ProgressRow> = {};
    for (const p of progress) m[p.task_id] = p;
    return m;
  }, [progress]);

  const dayStatus = (d: DayMeta) => {
    const total = d.taskIds.length;
    const doneTasks = d.taskIds.filter((id) => doneMap[id]?.completed).length;
    const manual = !!doneMap[`${DAY_MANUAL_PREFIX}${d.day}`]?.completed;
    const allDone = total > 0 && doneTasks === total;
    const complete = manual || allDone;
    return { total, doneTasks, complete, manual, allDone };
  };

  const markDayComplete = async (day: number) => {
    if (!user) return;
    const id = `${DAY_MANUAL_PREFIX}${day}`;
    const already = !!doneMap[id]?.completed;
    const { error } = await supabase.from("task_progress").upsert(
      { user_id: user.id, playbook: "p_45day", task_id: id, day_number: day,
        completed: !already, completed_at: already ? null : new Date().toISOString() } as any,
      { onConflict: "user_id,playbook,task_id" },
    );
    if (error) { toast.error("Could not update day"); return; }
    setProgress((prev) => {
      const next = prev.filter((r) => r.task_id !== id);
      next.push({ task_id: id, completed: !already, completed_at: already ? null : new Date().toISOString() });
      return next;
    });
    toast.success(already ? `Day ${day} reopened` : `Day ${day} sealed`);
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayOfPlan = (d: number) => {
    if (!startDate) return null;
    const dt = new Date(startDate); dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + d - 1);
    return dt;
  };
  const planDayForDate = (date: Date) => {
    if (!startDate) return null;
    const diff = Math.floor((date.getTime() - startDate.setHours(0, 0, 0, 0)) / 86_400_000) + 1;
    if (diff < 1 || diff > 45) return null;
    return diff;
  };
  const isToday = (d: Date | null) => d?.getTime() === today.getTime();
  const isPast = (d: Date | null) => !!d && d.getTime() < today.getTime();
  // Grace period: never mark days before ESCALATION_START as "behind" — the
  // programme was paused for this build; tracking resumes on 27 Jul 2026.
  const isTrackable = (d: Date | null) => !!d && d.getTime() >= ESCALATION_START.getTime();


  const total = daysMeta.length;
  const completeCount = daysMeta.filter((d) => dayStatus(d).complete).length;
  const overallPct = total > 0 ? Math.round((completeCount / total) * 100) : 0;

  if (loading) return <div className="text-sm text-muted-foreground">Loading calendar…</div>;

  // ─── Monthly Gregorian grid ────────────────────────────────
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gridCells: { date: Date | null }[] = [];
  for (let i = 0; i < startWeekday; i++) gridCells.push({ date: null });
  for (let i = 1; i <= daysInMonth; i++) gridCells.push({ date: new Date(year, month, i) });
  while (gridCells.length % 7 !== 0) gridCells.push({ date: null });

  const shiftMonth = (delta: number) => {
    const d = new Date(monthCursor); d.setMonth(d.getMonth() + delta); setMonthCursor(d);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-regal relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" /> Campaign Calendar
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Your Path to First Close</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Two views: the natural Gregorian month (for planning against the real world) and the 45-Day campaign grid (for tracking playbook execution). Every seal moves your rank and your escalation score.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <MiniStat label="Days sealed" value={`${completeCount} / ${total}`} />
          <MiniStat label="Campaign progress" value={`${overallPct}%`} />
          <MiniStat label="Start date" value={startDate ? startDate.toLocaleDateString() : "—"} />
        </div>
        <div className="mt-5 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-gold transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </section>

      {/* Monthly Gregorian view */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">Gregorian view</div>
            <h2 className="mt-1 font-display text-xl md:text-2xl font-bold">
              {monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} className="p-2 rounded hover:bg-muted" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => { const d = new Date(); d.setDate(1); setMonthCursor(d); }} className="rounded border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted">
              Today
            </button>
            <button onClick={() => shiftMonth(1)} className="p-2 rounded hover:bg-muted" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] tracking-widest text-muted-foreground text-center mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {gridCells.map((c, i) => {
            if (!c.date) return <div key={i} className="aspect-square" />;
            const cd = new Date(c.date); cd.setHours(0, 0, 0, 0);
            const isTodayCell = cd.getTime() === today.getTime();
            const planDay = planDayForDate(new Date(cd));
            const dayObj = planDay ? daysMeta.find((d) => d.day === planDay) : null;
            const st = dayObj ? dayStatus(dayObj) : null;
            const isFuture = cd.getTime() > today.getTime();
            const tone = st?.complete
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700"
              : isTodayCell
              ? "bg-gold/15 border-gold ring-1 ring-gold text-gold-deep"
              : dayObj && !isFuture && !st?.complete && isTrackable(cd)
              ? "bg-crimson/10 border-crimson/40 text-crimson"
              : dayObj
              ? "bg-background border-border"
              : "bg-muted/20 border-transparent text-muted-foreground";

            return (
              <div key={i} className={`aspect-square rounded-md border p-1 flex flex-col text-[10px] ${tone}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{cd.getDate()}</span>
                  {planDay && <span className="text-[8px] opacity-70">D{planDay}</span>}
                </div>
                {dayObj && (
                  <div className="mt-auto truncate text-[9px]" title={dayObj.focus}>
                    {dayObj.icon} {st?.complete ? "✓" : `${st?.doneTasks}/${st?.total}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          The 45-Day plan is anchored to your start date · your program will run for at least a year — new playbooks land here as they release.
        </p>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend swatch="bg-emerald-500/80" label="Sealed" />
        <Legend swatch="bg-amber-500/70" label="In progress" />
        <Legend swatch="bg-primary/70 ring-2 ring-primary" label="Today" />
        <Legend swatch="bg-crimson/60" label="Behind schedule" />
        <Legend swatch="bg-muted" label="Upcoming" />
      </div>

      {/* Weeks — existing 45-day grid */}
      {(WEEKS as any[]).map((w) => {
        const weekDays = daysMeta.filter((d) => w.days.some((x: any) => x.day === d.day));
        const weekComplete = weekDays.filter((d) => dayStatus(d).complete).length;
        const weekPct = Math.round((weekComplete / weekDays.length) * 100);
        return (
          <section key={w.week} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs tracking-widest text-gold-deep">Week {w.week} · {w.range}</div>
                <h2 className="mt-1 font-display text-xl font-bold">{w.icon} {w.title}</h2>
                <p className="text-xs text-muted-foreground max-w-xl mt-1">{w.goal}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Sealed</div>
                <div className="font-display text-2xl font-bold">{weekComplete}/{weekDays.length}</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${weekPct}%` }} />
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weekDays.map((d) => {
                const st = dayStatus(d);
                const dt = dayOfPlan(d.day);
                const isTodayDay = isToday(dt);
                const behind = !st.complete && isPast(dt) && isTrackable(dt);
                const upcoming = !!dt && dt.getTime() > new Date().setHours(0, 0, 0, 0);

                const tone = st.complete ? "bg-emerald-500/10 border-emerald-500/40"
                  : isTodayDay ? "bg-primary/10 border-primary ring-1 ring-primary"
                  : behind ? "bg-crimson/10 border-crimson/50"
                  : st.doneTasks > 0 ? "bg-amber-500/10 border-amber-500/40"
                  : upcoming ? "bg-muted/30 border-border"
                  : "bg-background border-border";

                return (
                  <DayCard key={d.day} day={d} date={dt} tone={tone} status={st}
                    isToday={isTodayDay} isBehind={behind} isUpcoming={upcoming}
                    onToggle={() => markDayComplete(d.day)} />
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-gold-deep mt-0.5 flex-shrink-0" />
          <p>
            The calendar is your pacing instrument. To adjust your start date or reset the campaign, ask a council admin.
            Every seal you mark manually is logged.
          </p>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, date, tone, status, isToday, isBehind, isUpcoming, onToggle }: {
  day: DayMeta; date: Date | null; tone: string;
  status: { total: number; doneTasks: number; complete: boolean; manual: boolean; allDone: boolean };
  isToday: boolean; isBehind: boolean; isUpcoming: boolean; onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = status.total > 0 ? Math.round((status.doneTasks / status.total) * 100) : 0;
  return (
    <div className={`rounded-xl border p-3 transition ${tone} flex flex-col gap-2`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">Day {day.day}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {date ? date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—"}
          </div>
        </div>
        <div>
          {status.complete ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            : isToday ? <Flame className="h-5 w-5 text-primary" />
            : isBehind ? <Lock className="h-5 w-5 text-crimson" />
            : <Circle className="h-5 w-5 text-muted-foreground/60" />}
        </div>
      </div>
      <div className="text-xs font-semibold leading-snug">
        <span className="mr-1">{day.icon}</span>{day.focus}
      </div>
      <div className="text-[10px] text-muted-foreground">
        {status.doneTasks} / {status.total} tasks
        {status.manual && !status.allDone && <span className="ml-1 text-gold-deep">· hand-sealed</span>}
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${status.complete ? "bg-emerald-500" : isBehind ? "bg-crimson" : "bg-primary"}`}
          style={{ width: `${status.complete ? 100 : pct}%` }} />
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        <button onClick={onToggle}
          className={`w-full inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
            status.complete ? "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
          {status.complete ? "Reopen day" : status.allDone ? "Seal day" : "Mark complete"}
        </button>
        <Link to="/playbooks/plan" className="w-full inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-semibold hover:bg-muted">
          Open tasks <ArrowRight className="h-3 w-3" />
        </Link>
        {day.note && (
          <button onClick={() => setExpanded((v) => !v)} className="text-[10px] text-muted-foreground hover:text-foreground underline text-left">
            {expanded ? "Hide note" : "Show note"}
          </button>
        )}
        {expanded && day.note && (
          <p className="text-[10px] italic text-muted-foreground leading-relaxed">{day.note}</p>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}
