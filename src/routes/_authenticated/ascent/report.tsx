import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { RANKS, DAYS, PHASES, ASCENT_PLAYBOOK_KEY } from "@/lib/ascent-data";
import { Gauge, Flame, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ascent/report")({
  head: () => ({ meta: [{ title: "Ascent Report — DFS Citadel" }] }),
  component: AscentReport,
});

function AscentReport() {
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

  const doneRows = useMemo(() => rows.filter((r) => r.completed), [rows]);
  const done = useMemo(() => new Set(doneRows.map((r) => r.task_id)), [doneRows]);
  const allItems = useMemo(() => DAYS.flatMap((d) => d.items.map((i) => ({ ...i, day: d.day, phase: d.phase }))), []);
  const totalXP = allItems.reduce((s, i) => s + i.xp, 0);
  const earned = allItems.filter((i) => done.has(i.id)).reduce((s, i) => s + i.xp, 0);
  const percent = totalXP ? Math.min(100, Math.round((earned / totalXP) * 100)) : 0;
  const tasksDone = allItems.filter((i) => done.has(i.id)).length;

  const rank = useMemo(() => {
    let r = RANKS[0];
    RANKS.forEach((x) => { if (percent >= x.threshold) r = x; });
    return r;
  }, [percent]);

  const cadence = useMemo(() => {
    const days: Record<string, number> = {};
    doneRows.forEach((r) => {
      if (!r.completed_at) return;
      const k = new Date(r.completed_at).toISOString().slice(0, 10);
      days[k] = (days[k] ?? 0) + 1;
    });
    const now = Date.now();
    let active7 = 0, active14 = 0, tasks7 = 0, tasks14 = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
      const n = days[d] ?? 0;
      if (i < 7) { tasks7 += n; if (n > 0) active7++; }
      tasks14 += n; if (n > 0) active14++;
    }
    return { active7, active14, tasks7, tasks14, days };
  }, [doneRows]);

  const lastActive = useMemo(() => {
    const ts = doneRows.filter((r) => r.completed_at).map((r) => new Date(r.completed_at!).getTime());
    return ts.length ? new Date(Math.max(...ts)) : null;
  }, [doneRows]);
  const daysSince = lastActive ? Math.floor((Date.now() - lastActive.getTime()) / 86_400_000) : null;

  const band =
    cadence.active14 >= 10 ? { label: "Elite", tone: "bg-emerald-500/10 text-emerald-600" } :
    cadence.active14 >= 7  ? { label: "Healthy", tone: "bg-sky-500/10 text-sky-600" } :
    cadence.active14 >= 4  ? { label: "Watch", tone: "bg-amber-500/10 text-amber-600" } :
                             { label: "At-Risk", tone: "bg-crimson/10 text-crimson" };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Progress Report</div>
        <h1 className="mt-1 font-display text-3xl font-bold">Your Ascent status</h1>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Rank
          </div>
          <div className="mt-2 font-display text-2xl font-bold">{rank.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{rank.blurb}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" /> XP
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{earned}<span className="text-base text-muted-foreground"> / {totalXP}</span></div>
          <div className="mt-1 text-xs text-muted-foreground">{percent}% · {tasksDone}/{allItems.length} tasks</div>
        </div>
        <div className={`rounded-2xl border border-border p-5 ${band.tone}`}>
          <div className="text-[10px] uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" /> Cadence band
          </div>
          <div className="mt-2 font-display text-2xl font-bold">{band.label}</div>
          <div className="mt-1 text-xs">
            {cadence.active7}/7 active last week · {cadence.active14}/14 last fortnight
          </div>
          <div className="mt-1 text-xs">
            {daysSince == null ? "No activity logged yet" : daysSince === 0 ? "Active today" : `${daysSince}d since last mission`}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Last 14 days</div>
        <h2 className="mt-1 font-display text-xl font-bold">Activity heatstrip</h2>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10);
            const n = cadence.days[d] ?? 0;
            const shade = n === 0 ? "bg-muted" : n < 2 ? "bg-insignia/30" : n < 4 ? "bg-insignia/60" : "bg-insignia";
            return (
              <div key={d} className={`h-8 flex-1 rounded ${shade}`} title={`${d}: ${n} tasks`} />
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <span>14d ago</span><span>today</span>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-widest text-gold-deep font-mono">Phase breakdown</div>
        <h2 className="mt-1 font-display text-xl font-bold">Where you are, phase by phase</h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PHASES).map(([n, p]) => {
            const phaseNum = Number(n);
            const items = allItems.filter((i) => i.phase === phaseNum);
            const xp = items.reduce((s, i) => s + i.xp, 0);
            const gotXP = items.filter((i) => done.has(i.id)).reduce((s, i) => s + i.xp, 0);
            const pct = xp ? Math.round((gotXP / xp) * 100) : 0;
            return (
              <div key={n} className="rounded-lg border border-border p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-gold-deep">Phase 0{n}</div>
                <div className="mt-1 font-display font-bold">{p.title}</div>
                <div className="text-[11px] text-muted-foreground">{p.range}</div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-insignia" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground">{gotXP}/{xp} XP · {pct}%</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
