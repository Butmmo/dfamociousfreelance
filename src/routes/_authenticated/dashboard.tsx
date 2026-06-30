import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { Motto } from "@/components/dfs/Brand";
import { Crown, Shield, Target, Flame, TrendingUp, Calendar, BookOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DFS" }] }),
  component: Dashboard,
});

const RANK_META: Record<string, { icon: any; label: string; next: string | null }> = {
  recruit: { icon: Shield, label: "Recruit", next: "Operator" },
  operator: { icon: Target, label: "Operator", next: "Closer" },
  closer: { icon: TrendingUp, label: "Closer", next: "Lion" },
  lion: { icon: Flame, label: "Lion", next: "Crown" },
  crown: { icon: Crown, label: "Crown", next: null },
};

function Dashboard() {
  const { user, role } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [progressCount, setProgressCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(p);
      const { count } = await supabase.from("task_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true);
      setProgressCount(count ?? 0);
    })();
  }, [user]);

  const rank = (profile?.rank ?? "recruit") as keyof typeof RANK_META;
  const meta = RANK_META[rank];
  const RankIcon = meta.icon;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-border bg-card p-8 shadow-regal relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <Motto />
        <h1 className="mt-3 font-display text-4xl font-bold">
          Welcome, {profile?.full_name ?? "Beneficiary"}.
        </h1>
        <p className="mt-2 text-muted-foreground">
          {role === "admin" ? "You hold the council's seal. Below is your beneficiary view." : "Today is another day to advance your rank."}
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <StatCard label="Current rank" value={meta.label} icon={RankIcon} accent />
          <StatCard label="Tasks completed" value={String(progressCount)} icon={Sparkles} />
          <StatCard label="XP earned" value={String(profile?.xp ?? 0)} icon={TrendingUp} />
        </div>
        {meta.next && (
          <p className="mt-6 text-xs uppercase tracking-widest text-gold-deep">
            Next rank: {meta.next} →
          </p>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-2xl font-bold">Begin today's forge</h2>
        <p className="text-sm text-muted-foreground">The full interactive playbooks land in the next turn. Below is your path map.</p>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "45-Day Plan", d: "Day-by-day implementation.", icon: Calendar, to: "/playbooks" },
            { t: "Grand Slam Playbook", d: "Closing system.", icon: Flame, to: "/playbooks" },
            { t: "SMB Prospecting", d: "Niche & lead signals.", icon: Target, to: "/playbooks" },
            { t: "Global Markets", d: "USA, UK, CA, AU.", icon: BookOpen, to: "/playbooks" },
          ].map((c) => (
            <Link key={c.t} to={c.to} className="group rounded-xl border border-border bg-card p-5 hover:border-gold hover:shadow-regal transition">
              <c.icon className="h-6 w-6 text-gold-deep group-hover:text-primary transition" />
              <div className="mt-4 font-display font-semibold">{c.t}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        <strong className="text-foreground">Next turn:</strong> the four interactive playbooks, Google Calendar sync, weekly check-in cadence, and the council escalation queue will be wired in. The foundation is set.
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
