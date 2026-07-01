import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { Motto } from "@/components/dfs/Brand";
import {
  Crown, Shield, Target, Flame, TrendingUp, Calendar, BookOpen, Sparkles, Globe, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DFS Citadel" }] }),
  component: Dashboard,
});

// XP earned per completed task. Rank thresholds inspired by the DFS constitution's
// escalation ladder: Recruit → Scout → Operator → Closer → Lion → Sovereign → Crown.
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

const PLAYBOOK_META: Record<string, { title: string; slug: string; icon: any }> = {
  p_45day:       { title: "45-Day Plan",        slug: "plan",        icon: Calendar },
  p_grandslam:   { title: "Grand Slam Offer",   slug: "grand-slam",  icon: Flame },
  p_prospecting: { title: "SMB Prospecting",    slug: "prospecting", icon: Target },
  p_global:      { title: "Global Playbook",    slug: "global",      icon: Globe },
};

function Dashboard() {
  const { user, role } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [progressRows, setProgressRows] = useState<{ playbook: string; completed_at: string | null }[]>([]);
  const [latestReport, setLatestReport] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [pRes, tRes, rRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("task_progress").select("playbook, completed_at").eq("user_id", user.id).eq("completed", true),
        supabase.from("weekly_reports").select("*").eq("user_id", user.id).order("week_number", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setProfile(pRes.data);
      setProgressRows((tRes.data as any) ?? []);
      setLatestReport(rRes.data);
    })();
  }, [user]);

  const totalCompleted = progressRows.length;
  const xp = totalCompleted * XP_PER_TASK;
  const { current: rank, next } = useMemo(() => resolveRank(xp), [xp]);
  const RankIcon = rank.icon;

  // Progress toward next rank
  const progressToNext = next
    ? Math.min(100, Math.round(((xp - rank.min) / (next.min - rank.min)) * 100))
    : 100;

  // Per-playbook counts
  const perPlaybook = useMemo(() => {
    const map: Record<string, number> = {};
    progressRows.forEach((r) => { map[r.playbook] = (map[r.playbook] ?? 0) + 1; });
    return map;
  }, [progressRows]);

  // 7-day activity: any task completed in last 7 days?
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeThisWeek = progressRows.some((r) => r.completed_at && new Date(r.completed_at).getTime() > sevenDaysAgo);

  // Persist rank/xp back to profile when they change (fire and forget)
  useEffect(() => {
    if (!user || !profile) return;
    if (profile.xp === xp && profile.rank === rank.key) return;
    supabase.from("profiles").update({ xp, rank: rank.key } as any).eq("id", user.id).then(({ error }) => {
      if (error) console.error("[profile sync]", error);
    });
  }, [user, profile, xp, rank.key]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-border bg-card p-8 shadow-regal relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <Motto />
        <h1 className="mt-3 font-display text-4xl font-bold">
          Welcome, {profile?.full_name ?? "Beneficiary"}.
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {role === "admin"
            ? "You hold the council's seal. Below is your beneficiary view — your ranks and beneficiaries' are managed in the Council."
            : "Every task ticked in a playbook feeds your XP. Your rank rises with the work — and only with the work."}
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <StatCard label="Current rank" value={rank.label} icon={RankIcon} accent />
          <StatCard label="Tasks completed" value={String(totalCompleted)} icon={Sparkles} />
          <StatCard label="XP earned" value={String(xp)} icon={TrendingUp} />
        </div>

        {next && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground mb-2">
              <span>Progress → <span className="text-gold-deep">{next.label}</span></span>
              <span>{xp} / {next.min} XP</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progressToNext}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* At-risk banner */}
      {!activeThisWeek && totalCompleted > 0 && (
        <div className="rounded-xl border border-crimson/40 bg-crimson/5 p-4 text-sm">
          <strong className="text-crimson">Cadence alert.</strong> No task has been ticked in the last 7 days. Log a win today to stay off the council escalation queue.
        </div>
      )}

      {/* Playbooks quick access */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Begin today's forge</h2>
            <p className="text-sm text-muted-foreground">Each playbook writes to your rank in real time.</p>
          </div>
          <Link to="/playbooks" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
            All playbooks <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(PLAYBOOK_META).map(([key, m]) => {
            const done = perPlaybook[key] ?? 0;
            return (
              <Link
                key={key}
                to={`/playbooks/${m.slug}` as any}
                className="group rounded-xl border border-border bg-card p-5 hover:border-gold hover:shadow-regal transition"
              >
                <m.icon className="h-6 w-6 text-gold-deep group-hover:text-primary transition" />
                <div className="mt-4 font-display font-semibold">{m.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{done}</span> tasks · {done * XP_PER_TASK} XP earned
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Weekly report */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gold-deep">Weekly cadence</div>
            <h2 className="mt-1 font-display text-2xl font-bold">Your latest report</h2>
          </div>
          <Link to="/weekly-report" className="text-sm font-semibold text-primary hover:underline">
            File this week's report →
          </Link>
        </div>
        {latestReport ? (
          <div className="mt-6 grid sm:grid-cols-4 gap-3 text-sm">
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
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-gold-deep"}`} />
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
