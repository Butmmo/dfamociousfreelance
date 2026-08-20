import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { WEEKS } from "./playbooks/plan";
import {
  CheckCircle2, Circle, CalendarDays, Flame, Lock, ArrowRight, Clock, ChevronLeft, ChevronRight,
  Target, Sparkles, Headphones, Plus, X, Trash2, MapPin, AlignLeft,
} from "lucide-react";
import { ESCALATION_START } from "@/lib/escalation";
import { localDateStr } from "@/lib/local-date";
import { layoutDayEvents, minutesSinceMidnight, CALENDAR_COLORS, CALENDAR_COLOR_KEYS, type CalendarColor } from "@/lib/calendar-layout";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — DBI Citadel" }] }),
  component: CalendarPage,
});

type DayMeta = { day: number; focus: string; icon: string; taskIds: string[]; note?: string };
type ProgressRow = { task_id: string; completed: boolean; completed_at: string | null };
type BpsActivity = { id: string; label: string; sort_order: number };
type BpsCheck = { activity_id: string; check_date: string; done: boolean };
type CalendarEvent = {
  id: string; title: string; description: string | null; location: string | null;
  start_at: string; end_at: string; all_day: boolean; color: string;
};
type CalendarView = "month" | "week" | "day";

const DAY_MANUAL_PREFIX = "day-complete-";
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_ROW_PX = 48;

function CalendarPage() {
  const { user } = useSession();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [bpsActivities, setBpsActivities] = useState<BpsActivity[]>([]);
  const [bpsChecks, setBpsChecks] = useState<BpsCheck[]>([]);
  const [beliefSubmittedAt, setBeliefSubmittedAt] = useState<string | null>(null);
  const [affirmationSubmittedAt, setAffirmationSubmittedAt] = useState<string | null>(null);
  const [evaluationSubmittedAt, setEvaluationSubmittedAt] = useState<string | null>(null);
  const [tpeDefaultingUntil, setTpeDefaultingUntil] = useState<string | null>(null);
  const [tpeCompletedDates, setTpeCompletedDates] = useState<Set<string>>(new Set());
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState<Date>(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalState, setModalState] = useState<{ open: boolean; editing: CalendarEvent | null; prefillDate: Date | null; prefillHour: number | null }>(
    { open: false, editing: null, prefillDate: null, prefillHour: null },
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [pRes, prRes, actRes, goalRes, tpeRes] = await Promise.all([
        supabase.from("profiles").select("start_date, created_at, tpe_defaulting_until").eq("id", user.id).maybeSingle(),
        supabase.from("task_progress").select("task_id, completed, completed_at").eq("user_id", user.id).eq("playbook", "p_45day"),
        supabase.from("bps_activities").select("id,label,sort_order").eq("user_id", user.id).eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("bps_monthly_goals").select("belief_submitted_at,affirmation_submitted_at,evaluation_submitted_at").eq("user_id", user.id).order("target_month", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("task_progress").select("completed_at").eq("user_id", user.id).eq("playbook", "tpe").eq("completed", true),
      ]);
      const sd = pRes.data?.start_date ?? pRes.data?.created_at ?? null;
      setStartDate(sd ? new Date(sd) : new Date());
      setProgress((prRes.data as any) ?? []);
      setBpsActivities((actRes.data as any) ?? []);
      setTpeDefaultingUntil((pRes.data as any)?.tpe_defaulting_until ?? null);
      setBeliefSubmittedAt((goalRes.data as any)?.belief_submitted_at ?? null);
      setAffirmationSubmittedAt((goalRes.data as any)?.affirmation_submitted_at ?? null);
      setEvaluationSubmittedAt((goalRes.data as any)?.evaluation_submitted_at ?? null);
      setTpeCompletedDates(new Set(((tpeRes.data as any[]) ?? []).filter((r) => r.completed_at).map((r) => localDateStr(new Date(r.completed_at)))));
      setLoading(false);
    })();
  }, [user]);

  // Every Belief Goal creates its own Affirmation (day 14) and Evaluation
  // (day 40) reminders automatically — no separate event to create.
  const addDays = (iso: string, n: number) => { const d = new Date(iso); d.setDate(d.getDate() + n); return d; };
  const affirmationDueAt = beliefSubmittedAt && !affirmationSubmittedAt ? addDays(beliefSubmittedAt, 14) : null;
  const evaluationDueAt = beliefSubmittedAt && !evaluationSubmittedAt ? addDays(beliefSubmittedAt, 40) : null;
  const isSameDate = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tpeDefaulting = tpeDefaultingUntil ? new Date(tpeDefaultingUntil) >= new Date(new Date().toDateString()) : false;
  const startOfWeek = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); x.setHours(0, 0, 0, 0); return x; };

  // BPS daily checks for the visible Gregorian month, refetched whenever
  // the user pages the calendar or toggles today's tracker.
  const [bpsNonce, setBpsNonce] = useState(0);
  useEffect(() => {
    if (!user || bpsActivities.length === 0) { setBpsChecks([]); return; }
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    supabase
      .from("bps_daily_checks")
      .select("activity_id,check_date,done")
      .eq("user_id", user.id)
      .gte("check_date", localDateStr(from))
      .lt("check_date", localDateStr(to))
      .then(({ data, error }: { data: BpsCheck[] | null; error: { message: string } | null }) => {
        if (error) { toast.error(error.message); return; }
        setBpsChecks(data ?? []);
      });
  }, [user, cursor, bpsActivities, bpsNonce]);

  // User-created calendar events for the visible range — a month grid
  // (padded a week either side so overhang weeks still show events), a
  // week, or a single day, depending on the active view.
  const [eventsNonce, setEventsNonce] = useState(0);
  useEffect(() => {
    if (!user) return;
    let from: Date; let to: Date;
    if (view === "month") {
      from = new Date(cursor.getFullYear(), cursor.getMonth(), 1); from.setDate(from.getDate() - 7);
      to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); to.setDate(to.getDate() + 7);
    } else if (view === "week") {
      from = startOfWeek(cursor); to = new Date(from); to.setDate(to.getDate() + 7);
    } else {
      from = new Date(cursor); from.setHours(0, 0, 0, 0); to = new Date(from); to.setDate(to.getDate() + 1);
    }
    supabase
      .from("calendar_events")
      .select("id,title,description,location,start_at,end_at,all_day,color")
      .eq("user_id", user.id)
      .lt("start_at", to.toISOString())
      .gt("end_at", from.toISOString())
      .order("start_at", { ascending: true })
      .then(({ data, error }: { data: CalendarEvent[] | null; error: { message: string } | null }) => {
        if (error) { toast.error(error.message); return; }
        setEvents(data ?? []);
      });
  }, [user, cursor, view, eventsNonce]);

  const eventsForDate = (d: Date) => {
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
    return events
      .filter((e) => new Date(e.start_at) < dayEnd && new Date(e.end_at) > dayStart)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  };

  const openCreateModal = (date: Date, hour: number | null = null) => setModalState({ open: true, editing: null, prefillDate: date, prefillHour: hour });
  const openEditModal = (ev: CalendarEvent) => setModalState({ open: true, editing: ev, prefillDate: null, prefillHour: null });
  const closeModal = () => setModalState({ open: false, editing: null, prefillDate: null, prefillHour: null });

  const saveEvent = async (
    payload: { title: string; description: string; location: string; start_at: string; end_at: string; all_day: boolean; color: string },
    editingId?: string,
  ) => {
    if (!user) return false;
    if (editingId) {
      const { error } = await supabase.from("calendar_events").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return false; }
      toast.success("Event updated.");
    } else {
      const { error } = await supabase.from("calendar_events").insert({ ...payload, user_id: user.id });
      if (error) { toast.error(error.message); return false; }
      toast.success("Event created.");
    }
    setEventsNonce((n) => n + 1);
    return true;
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Event deleted.");
    setEventsNonce((n) => n + 1);
    return true;
  };

  const toggleBpsToday = async (activityId: string) => {
    if (!user) return;
    const todayStr = localDateStr();
    const current = bpsChecks.find((c) => c.activity_id === activityId && c.check_date === todayStr)?.done ?? false;
    const { error } = await supabase.from("bps_daily_checks").upsert(
      { user_id: user.id, activity_id: activityId, check_date: todayStr, done: !current },
      { onConflict: "activity_id,check_date" },
    );
    if (error) { toast.error(error.message); return; }
    setBpsNonce((n) => n + 1);
  };

  const bpsDoneDates = useMemo(() => {
    if (bpsActivities.length === 0) return new Set<string>();
    const byDate = new Map<string, number>();
    for (const c of bpsChecks) if (c.done) byDate.set(c.check_date, (byDate.get(c.check_date) ?? 0) + 1);
    const out = new Set<string>();
    for (const [date, n] of byDate) if (n >= bpsActivities.length) out.add(date);
    return out;
  }, [bpsChecks, bpsActivities]);

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

  const markersForDate = (d: Date) => {
    const planDay = planDayForDate(d);
    const dayObj = planDay ? daysMeta.find((x) => x.day === planDay) : null;
    const st = dayObj ? dayStatus(dayObj) : null;
    return {
      bpsDone: bpsDoneDates.has(localDateStr(d)),
      tpeDone: tpeCompletedDates.has(localDateStr(d)),
      isAffirmationDue: !!affirmationDueAt && isSameDate(d, affirmationDueAt),
      isEvaluationDue: !!evaluationDueAt && isSameDate(d, evaluationDueAt),
      planDay,
      planLabel: dayObj ? `${dayObj.icon} D${planDay} ${dayObj.focus}` : null,
      planDone: st ? st.complete : null,
    };
  };

  const weekDates = useMemo(() => {
    const s = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(s); d.setDate(d.getDate() + i); return d; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  const total = daysMeta.length;
  const completeCount = daysMeta.filter((d) => dayStatus(d).complete).length;
  const overallPct = total > 0 ? Math.round((completeCount / total) * 100) : 0;

  if (loading) return <div className="text-sm text-muted-foreground">Loading calendar…</div>;

  // ─── Monthly Gregorian grid ────────────────────────────────
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gridCells: { date: Date | null }[] = [];
  for (let i = 0; i < startWeekday; i++) gridCells.push({ date: null });
  for (let i = 1; i <= daysInMonth; i++) gridCells.push({ date: new Date(year, month, i) });
  while (gridCells.length % 7 !== 0) gridCells.push({ date: null });

  const shiftView = (delta: number) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + delta);
    else if (view === "week") d.setDate(d.getDate() + delta * 7);
    else d.setDate(d.getDate() + delta);
    setCursor(d);
  };
  const goToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); setCursor(d); };

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

      {tpeDefaulting && (
        <div className="rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-sm text-crimson flex items-start gap-3">
          <Headphones className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>The Practise of Enterprise — defaulting.</strong> A weekly session was missed, flagged visible to
            your mentor and DSE Rep until <strong>{new Date(tpeDefaultingUntil!).toLocaleDateString()}</strong>. Catch
            up on <Link to="/tpe" className="underline font-semibold">the TPE page</Link> — no fine, just a signal.
          </div>
        </div>
      )}

      {(affirmationDueAt || evaluationDueAt) && (
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5">
          <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upcoming BPS checkpoints</div>
          <div className="mt-2 grid sm:grid-cols-2 gap-3 text-xs">
            {affirmationDueAt && (
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="font-semibold">Affirmation Goal due</div>
                <div className="text-muted-foreground mt-0.5">{affirmationDueAt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} — 14 days into this Belief Goal.</div>
              </div>
            )}
            {evaluationDueAt && (
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="font-semibold">Evaluation Goal due</div>
                <div className="text-muted-foreground mt-0.5">{evaluationDueAt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} — 40 days into this Belief Goal.</div>
              </div>
            )}
          </div>
          <Link to="/bps" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline">
            Open Monthly Goals <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* BPS daily tracker — the same 1/0 binary layer that scores the Belief/Affirmation/Evaluation cycle */}
      <section className="rounded-2xl border border-gold/40 bg-gold/5 p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> BPS — Today
            </div>
            <h2 className="mt-1 font-display text-lg font-bold">Today's daily tracker</h2>
          </div>
          <Link to="/bps" className="text-xs font-semibold text-gold-deep hover:underline inline-flex items-center gap-1">
            Open full BPS <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {bpsActivities.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No tracked activities yet — set up your daily 1/0 tracker in{" "}
            <Link to="/bps" className="text-primary font-semibold hover:underline">BPS</Link>.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {bpsActivities.map((a) => {
              const done = bpsChecks.some((c) => c.activity_id === a.id && c.check_date === localDateStr() && c.done);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleBpsToday(a.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    done ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600" : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />} {a.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Calendar — Month / Week / Day, Google-Calendar-style */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="text-[10px] tracking-widest text-gold-deep">Calendar</div>
            <h2 className="mt-1 font-display text-xl md:text-2xl font-bold">
              {view === "month" && cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              {view === "week" && `${weekDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekDates[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`}
              {view === "day" && cursor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
              {(["month", "week", "day"] as CalendarView[]).map((v) => (
                <button
                  key={v} onClick={() => setView(v)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                    view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => shiftView(-1)} className="p-2 rounded hover:bg-muted" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goToday} className="rounded border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted">
                Today
              </button>
              <button onClick={() => shiftView(1)} className="p-2 rounded hover:bg-muted" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => openCreateModal(cursor)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> New event
            </button>
          </div>
        </div>

        {view === "month" && (
          <>
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

                const bpsDone = bpsDoneDates.has(localDateStr(cd));
                const isAffirmationDay = !!affirmationDueAt && isSameDate(cd, affirmationDueAt);
                const isEvaluationDay = !!evaluationDueAt && isSameDate(cd, evaluationDueAt);
                const tpeDone = tpeCompletedDates.has(localDateStr(cd));
                const dayEvents = eventsForDate(cd);

                return (
                  <button
                    key={i}
                    onClick={() => { setCursor(new Date(cd)); setView("day"); }}
                    className={`aspect-square rounded-md border p-1 flex flex-col text-left text-[10px] ${tone} hover:ring-1 hover:ring-gold/50`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{cd.getDate()}</span>
                      <span className="flex items-center gap-0.5">
                        {bpsDone && <span className="h-1.5 w-1.5 rounded-full bg-gold" title="BPS: all activities done" />}
                        {tpeDone && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" title="TPE session listened" />}
                        {(isAffirmationDay || isEvaluationDay) && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" title={isAffirmationDay ? "Affirmation Goal due" : "Evaluation Goal due"} />
                        )}
                        {planDay && <span className="text-[8px] opacity-70">D{planDay}</span>}
                      </span>
                    </div>
                    {dayObj && (
                      <div className="truncate text-[9px]" title={dayObj.focus}>
                        {dayObj.icon} {st?.complete ? "✓" : `${st?.doneTasks}/${st?.total}`}
                      </div>
                    )}
                    {dayEvents.length > 0 && (
                      <div className="mt-auto space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((e) => {
                          const c = CALENDAR_COLORS[(e.color as CalendarColor) ?? "gold"];
                          return (
                            <div
                              key={e.id}
                              onClick={(ev) => { ev.stopPropagation(); openEditModal(e); }}
                              className={`truncate rounded px-1 text-[8px] font-semibold ${c.bg} ${c.text}`}
                            >
                              {e.all_day ? "" : `${new Date(e.start_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} `}{e.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && <div className="text-[8px] text-muted-foreground">+{dayEvents.length - 2} more</div>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Click a date to open its Day view. The 45-Day plan is anchored to your start date · your program will run for at least a year — new playbooks land here as they release.
              {bpsActivities.length > 0 && <> A gold dot marks a day where every BPS activity was checked off.</>} A purple dot marks a TPE session listened that day, an indigo dot an Affirmation/Evaluation Goal due date.
            </p>
          </>
        )}

        {view === "week" && (
          <HourGridView
            days={weekDates.map((d) => ({ date: d, markers: markersForDate(d) }))}
            events={events}
            onSlotClick={openCreateModal}
            onHeaderClick={(d) => { setCursor(d); setView("day"); }}
            onEventClick={openEditModal}
            today={today}
          />
        )}

        {view === "day" && (
          <HourGridView
            days={[{ date: cursor, markers: markersForDate(cursor) }]}
            events={events}
            onSlotClick={openCreateModal}
            onEventClick={openEditModal}
            today={today}
          />
        )}
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

      {modalState.open && (
        <EventModal
          editing={modalState.editing}
          prefillDate={modalState.prefillDate}
          prefillHour={modalState.prefillHour}
          onClose={closeModal}
          onSave={async (payload, editingId) => { const ok = await saveEvent(payload, editingId); if (ok) closeModal(); }}
          onDelete={async (id) => { const ok = await deleteEvent(id); if (ok) closeModal(); }}
        />
      )}
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

type DayMarkers = {
  bpsDone: boolean; tpeDone: boolean; isAffirmationDue: boolean; isEvaluationDue: boolean;
  planDay: number | null; planLabel: string | null; planDone: boolean | null;
};

const HOUR_LABEL = (h: number) => (h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);

/** The Week/Day time-grid — an hourly column per date, an all-day row on top for computed markers and all-day events, and a red "now" line when today is in view. Shared by both views so their layout and interactions stay identical. */
function HourGridView({
  days, events, onSlotClick, onHeaderClick, onEventClick, today,
}: {
  days: { date: Date; markers: DayMarkers }[];
  events: CalendarEvent[];
  onSlotClick: (date: Date, hour: number) => void;
  onHeaderClick?: (date: Date) => void;
  onEventClick: (ev: CalendarEvent) => void;
  today: Date;
}) {
  const dayStartEnd = (date: Date) => {
    const s = new Date(date); s.setHours(0, 0, 0, 0);
    const e = new Date(s); e.setDate(e.getDate() + 1);
    return [s, e] as const;
  };

  const timedByDay = days.map(({ date }) => {
    const [dayStart, dayEnd] = dayStartEnd(date);
    const dayEvents = events.filter((e) => !e.all_day && new Date(e.start_at) < dayEnd && new Date(e.end_at) > dayStart);
    const timed = dayEvents.map((e) => {
      const s = new Date(e.start_at); const en = new Date(e.end_at);
      const startMin = s < dayStart ? 0 : minutesSinceMidnight(s);
      const endMin = en > dayEnd ? 1440 : minutesSinceMidnight(en);
      return { id: e.id, startMin, endMin: Math.max(endMin, startMin + 20), raw: e };
    });
    return layoutDayEvents(timed);
  });

  const allDayByDay = days.map(({ date }) => {
    const [dayStart, dayEnd] = dayStartEnd(date);
    return events.filter((e) => e.all_day && new Date(e.start_at) < dayEnd && new Date(e.end_at) > dayStart);
  });

  const nowMin = minutesSinceMidnight(new Date());
  const gridCols = `56px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: gridCols }}>
        <div />
        {days.map(({ date, markers }) => {
          const isToday = date.toDateString() === today.toDateString();
          const content = (
            <>
              <div className="text-[10px] tracking-widest text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className={`mt-0.5 mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-bold ${isToday ? "bg-gold text-white" : ""}`}>
                {date.getDate()}
              </div>
              <div className="mt-1 flex items-center justify-center gap-0.5">
                {markers.bpsDone && <span className="h-1.5 w-1.5 rounded-full bg-gold" title="BPS done" />}
                {markers.tpeDone && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" title="TPE listened" />}
                {(markers.isAffirmationDue || markers.isEvaluationDue) && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" title="Goal due" />}
              </div>
            </>
          );
          return onHeaderClick ? (
            <button key={date.toISOString()} onClick={() => onHeaderClick(date)} className="p-2 text-center border-l border-border hover:bg-muted/40">
              {content}
            </button>
          ) : (
            <div key={date.toISOString()} className="p-2 text-center border-l border-border">
              {content}
            </div>
          );
        })}
      </div>

      {/* All-day row: computed plan marker + all-day events */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: gridCols }}>
        <div className="p-1 text-[9px] text-muted-foreground text-right pr-1">all-day</div>
        {days.map(({ markers }, i) => (
          <div key={i} className="p-1 border-l border-border flex flex-col gap-0.5 min-h-[30px]">
            {markers.planLabel && (
              <span className={`truncate rounded px-1 py-0.5 text-[9px] font-semibold ${markers.planDone ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {markers.planLabel}
              </span>
            )}
            {allDayByDay[i].map((e) => {
              const c = CALENDAR_COLORS[(e.color as CalendarColor) ?? "gold"];
              return (
                <button key={e.id} onClick={() => onEventClick(e)} className={`truncate rounded px-1 py-0.5 text-[9px] font-semibold text-left ${c.bg} ${c.text}`}>
                  {e.title}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hour grid */}
      <div className="overflow-y-auto" style={{ maxHeight: 560 }}>
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_ROW_PX }} className="relative">
                {h > 0 && <span className="absolute -top-2 right-1 text-[9px] text-muted-foreground">{HOUR_LABEL(h)}</span>}
              </div>
            ))}
          </div>
          {days.map(({ date }, i) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div key={i} className="relative border-l border-border" style={{ height: HOUR_ROW_PX * 24 }}>
                {HOURS.map((h) => (
                  <button
                    key={h} onClick={() => onSlotClick(date, h)}
                    style={{ top: h * HOUR_ROW_PX, height: HOUR_ROW_PX }}
                    className="absolute left-0 right-0 border-t border-border/60 hover:bg-muted/30"
                    aria-label={`New event at ${HOUR_LABEL(h)}`}
                  />
                ))}
                {isToday && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: (nowMin / 60) * HOUR_ROW_PX }}>
                    <div className="border-t-2 border-crimson relative">
                      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-crimson" />
                    </div>
                  </div>
                )}
                {timedByDay[i].map(({ event, col, cols }) => {
                  const top = (event.startMin / 60) * HOUR_ROW_PX;
                  const height = Math.max(18, ((event.endMin - event.startMin) / 60) * HOUR_ROW_PX);
                  const width = 100 / cols;
                  const c = CALENDAR_COLORS[(event.raw.color as CalendarColor) ?? "gold"];
                  return (
                    <button
                      key={event.id}
                      onClick={(ev) => { ev.stopPropagation(); onEventClick(event.raw); }}
                      style={{ top, height, left: `${col * width}%`, width: `${width}%` }}
                      className={`absolute z-10 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-[10px] font-semibold shadow-sm ${c.bg} ${c.border} ${c.text}`}
                    >
                      <div className="truncate">{event.raw.title}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const timeInputValue = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const dateInputValue = (d: Date) => localDateStr(d);

/** Create/edit form for a calendar_events row — prefilled from a clicked hour slot when creating, or from the clicked event when editing. */
function EventModal({ editing, prefillDate, prefillHour, onClose, onSave, onDelete }: {
  editing: CalendarEvent | null;
  prefillDate: Date | null;
  prefillHour: number | null;
  onClose: () => void;
  onSave: (payload: { title: string; description: string; location: string; start_at: string; end_at: string; all_day: boolean; color: string }, editingId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const seedStart = editing ? new Date(editing.start_at) : (() => {
    const d = prefillDate ? new Date(prefillDate) : new Date();
    d.setHours(prefillHour ?? 9, 0, 0, 0);
    return d;
  })();
  const seedEnd = editing ? new Date(editing.end_at) : (() => { const d = new Date(seedStart); d.setHours(d.getHours() + 1); return d; })();

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [allDay, setAllDay] = useState(editing?.all_day ?? false);
  const [date, setDate] = useState(dateInputValue(seedStart));
  const [startTime, setStartTime] = useState(timeInputValue(seedStart));
  const [endTime, setEndTime] = useState(timeInputValue(seedEnd));
  const [color, setColor] = useState<CalendarColor>((editing?.color as CalendarColor) ?? "gold");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Give the event a title."); return; }
    const [y, m, d] = date.split("-").map(Number);
    let start: Date; let end: Date;
    if (allDay) {
      start = new Date(y, m - 1, d, 0, 0, 0, 0);
      end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    } else {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      start = new Date(y, m - 1, d, sh, sm);
      end = new Date(y, m - 1, d, eh, em);
      if (end <= start) end = new Date(start.getTime() + 30 * 60_000);
    }
    setBusy(true);
    await onSave({
      title: title.trim(), description: description.trim(), location: location.trim(),
      start_at: start.toISOString(), end_at: end.toISOString(), all_day: allDay, color,
    }, editing?.id);
    setBusy(false);
  };

  const remove = async () => {
    if (!editing) return;
    if (!confirm(`Delete "${editing.title}"?`)) return;
    setBusy(true);
    await onDelete(editing.id);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{editing ? "Edit event" : "New event"}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} /> All day
          </label>

          <div className={`grid gap-2 ${allDay ? "grid-cols-1" : "grid-cols-3"}`}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
            {!allDay && (
              <>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
          </div>
          <div className="flex items-start gap-2 text-xs">
            <AlignLeft className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1.5" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
          </div>

          <div className="flex items-center gap-1.5">
            {CALENDAR_COLOR_KEYS.map((k) => (
              <button
                key={k} type="button" onClick={() => setColor(k)}
                aria-label={k}
                className={`h-6 w-6 rounded-full ${CALENDAR_COLORS[k].dot} ${color === k ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {editing && (
              <button type="button" onClick={remove} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md border border-crimson px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson/10 disabled:opacity-60">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
            <button type="submit" disabled={busy} className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {editing ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
