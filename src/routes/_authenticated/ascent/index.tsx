import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { RANKS, DAYS, PHASES, ASCENT_PLAYBOOK_KEY } from "@/lib/ascent-data";
import { Flame, ArrowRight, Compass, Target, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ascent/")({
  head: () => ({ meta: [{ title: "Ascent Dashboard — DFS Citadel" }] }),
  component: AscentDashboard,
});

function AscentDashboard() {
  const { user } = useSession();
  const [rows, setRows] = useState<{ task_id: string; completed: boolean; completed_at: string | null }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("task_progress")
      .select("task_id, completed, completed_at")
      .eq("user_id", user.id)
      .eq("playbook", ASCENT_PLAYBOOK_KEY)
      .then(({ data }) => setRows((data as any) ?? []));
  }, [user]);

  const done = useMemo(() => new Set(rows.filter((r) => r.completed).map((r) => r.task_id)), [rows]);

  const allItems = useMemo(() => DAYS.flatMap((d) => d.items.map((i) => ({ ...i, day: d.day, phase: d.phase, dayTitle: d.title }))), []);
  const totalXP = allItems.reduce((s, i) => s + i.xp, 0);
  const earned = allItems.filter((i) => done.has(i.id)).reduce((s, i) => s + i.xp, 0);
  const percent = totalXP ? Math.min(100, Math.round((earned / totalXP) * 100)) : 0;
  const tasksDone = allItems.filter((i) => done.has(i.id)).length;

  const rankIdx = useMemo(() => {
    let idx = 0;
    RANKS.forEach((r, i) => { if (percent >= r.threshold) idx = i; });
    return idx;
  }, [percent]);
  const rank = RANKS[rankIdx];
  const nextRank = RANKS[rankIdx + 1] ?? null;

  const nextMissions = useMemo(
    () => allItems.filter((i) => !done.has(i.id)).slice(0, 5),
    [allItems, done]
  );

  const dayProgress = useMemo(() => {
    return DAYS.map((d) => {
      const total = d.items.length;
      const complete = d.items.filter((i) => done.has(i.id)).length;
      return { ...d, total, complete, pct: total ? Math.round((complete / total) * 100) : 0 };
    });
  }, [done]);

  const lastActive = useMemo(() => {
    const ts = rows.filter((r) => r.completed && r.completed_at).map((r) => new Date(r.completed_at!).getTime());
    return ts.length ? new Date(Math.max(...ts)) : null;
  }, [rows]);

  const currentDay = dayProgress.find((d) => d.complete < d.total) ?? dayProgress[dayProgress.length - 1];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-2xl border-2 border-insignia/30 bg-gradient-to-br from-[#FBF6E9] to-[#F5EFDF] p-6 md:p-8 shadow-regal">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Rank</div>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold text-[#1A1410]">{rank.name}</h1>
            <p className="mt-2 text-sm text-[#6B5D3F] max-w-xl">{rank.blurb}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Ascent XP</div>
            <div className="font-display text-3xl font-bold text-[#1A1410]">{earned} <span className="text-base font-normal text-[#6B5D3F]">/ {totalXP}</span></div>
            <div className="text-xs text-[#6B5D3F] mt-1">{percent}% complete · {tasksDone} tasks</div>
          </div>
        </div>

        {nextRank && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#6B5D3F] mb-2 font-mono">
              <span>Next → <span className="text-gold-deep">{nextRank.name}</span></span>
              <span>{percent}% / {nextRank.threshold}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/60 overflow-hidden border border-gold/20">
              <div className="h-full bg-gradient-gold transition-all" style={{ width: `${Math.min(100, (percent / nextRank.threshold) * 100)}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* Quick stats + continue */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-deep font-mono">
            <Compass className="h-3.5 w-3.5" /> Continue where you left off
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Day {currentDay.day} · Phase {currentDay.phase}</span>
              <span className="text-[10px] font-mono text-gold-deep">{PHASES[currentDay.phase]?.title}</span>
            </div>
            <div className="mt-1 font-display text-xl font-bold">{currentDay.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{currentDay.objective}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-insignia" style={{ width: `${currentDay.pct}%` }} />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{currentDay.complete}/{currentDay.total}</span>
            </div>
            <Link
              to="/ascent/curriculum"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#1A1410] text-white px-4 py-2 text-sm font-semibold hover:bg-[#241B14] transition"
            >
              Open Curriculum <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-deep font-mono">
            <Flame className="h-3.5 w-3.5" /> Cadence
          </div>
          <MiniStat label="Tasks completed" value={`${tasksDone} / ${allItems.length}`} />
          <MiniStat label="Overall XP" value={`${earned} XP`} />
          <MiniStat label="Last activity" value={lastActive ? relativeTime(lastActive) : "No activity yet"} />
        </div>
      </div>

      {/* Next 5 missions */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Next missions
            </div>
            <h2 className="mt-1 font-display text-xl font-bold">Your next 5 unchecked items</h2>
          </div>
          <Link to="/ascent/curriculum" className="text-xs text-primary hover:underline">Open all →</Link>
        </div>
        {nextMissions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Every mission complete. The Ascent has been earned.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {nextMissions.map((m) => (
              <li key={m.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Day {m.day} · +{m.xp} XP</div>
                  <div className="text-sm text-foreground">{m.text}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Phase progress */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Progress by phase</div>
        <h2 className="mt-1 font-display text-xl font-bold">The 6 phases of the Ascent</h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PHASES).map(([n, p]) => {
            const phaseNum = Number(n);
            const phaseDays = dayProgress.filter((d) => d.phase === phaseNum);
            const t = phaseDays.reduce((s, d) => s + d.total, 0);
            const c = phaseDays.reduce((s, d) => s + d.complete, 0);
            const pct = t ? Math.round((c / t) * 100) : 0;
            return (
              <div key={n} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gold-deep">Phase 0{n}</div>
                  {pct === 100 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="mt-1 font-display font-bold">{p.title}</div>
                <div className="text-[11px] text-muted-foreground">{p.range}</div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-insignia" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground">{c}/{t} tasks · {pct}%</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
      <div className="mt-1 font-display text-lg font-bold">{value}</div>
    </div>
  );
}

function relativeTime(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
