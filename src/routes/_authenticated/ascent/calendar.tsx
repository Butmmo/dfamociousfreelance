import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { DAYS, PHASES, ASCENT_PLAYBOOK_KEY } from "@/lib/ascent-data";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ascent/calendar")({
  head: () => ({ meta: [{ title: "Ascent Calendar — DFS Citadel" }] }),
  component: AscentCalendar,
});

function AscentCalendar() {
  const { user } = useSession();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [pRes, tRes, aRes] = await Promise.all([
        supabase.from("profiles").select("start_date, created_at").eq("id", user.id).maybeSingle(),
        supabase.from("task_progress").select("task_id, completed").eq("user_id", user.id).eq("playbook", ASCENT_PLAYBOOK_KEY),
        supabase.from("ascent_access").select("granted_at").eq("user_id", user.id).maybeSingle(),
      ]);
      const g = aRes.data?.granted_at ? new Date(aRes.data.granted_at) : null;
      const s = pRes.data?.start_date ? new Date(pRes.data.start_date) : null;
      setStartDate(g ?? s);
      setDone(new Set(((tRes.data as any) ?? []).filter((r: any) => r.completed).map((r: any) => r.task_id)));
    })();
  }, [user]);

  const todayDayNum = useMemo(() => {
    if (!startDate) return null;
    const diff = Math.floor((Date.now() - startDate.getTime()) / 86_400_000) + 1;
    return Math.min(45, Math.max(1, diff));
  }, [startDate]);

  const phaseKeys = Object.keys(PHASES).map(Number);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Timeline</div>
        <h1 className="mt-1 font-display text-3xl font-bold">45-Day Ascent Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Every day of the direct-scouting closer system, laid out in phase order. Ring fills as you complete missions; today is haloed in gold.
        </p>
      </header>

      {!startDate && (
        <div className="rounded-lg border border-gold/40 bg-gold/5 p-3 text-xs text-gold-deep">
          Your Ascent start date will pin once access is granted. Until then every day is unlocked for exploration.
        </div>
      )}

      {phaseKeys.map((pn) => {
        const meta = PHASES[pn];
        const phaseDays = DAYS.filter((d) => d.phase === pn);
        return (
          <section key={pn}>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gold-deep">Phase 0{pn}</div>
                <h2 className="font-display text-xl font-bold">{meta.title}</h2>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">{meta.range}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {phaseDays.map((d) => {
                const complete = d.items.filter((i) => done.has(i.id)).length;
                const total = d.items.length;
                const pct = total ? Math.round((complete / total) * 100) : 0;
                const isToday = todayDayNum === d.day;
                const isDone = complete === total && total > 0;
                return (
                  <Link
                    key={d.day}
                    to="/ascent/curriculum"
                    className={`group rounded-xl border p-3 hover:border-gold hover:shadow-regal transition bg-card ${
                      isToday ? "border-gold ring-2 ring-gold/30" : isDone ? "border-emerald-500/40" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gold-deep">Day {d.day}</div>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : isToday ? (
                        <Clock className="h-4 w-4 text-gold-deep" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-1 font-display text-sm font-bold leading-snug line-clamp-2">{d.title}</div>
                    <div className="mt-2 h-1.5 rounded bg-muted overflow-hidden">
                      <div
                        className={`h-full ${isDone ? "bg-emerald-500" : "bg-insignia"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-muted-foreground">{complete}/{total} · {pct}%</div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
