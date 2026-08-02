import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { Motto } from "@/components/dfs/Brand";
import { Calendar, Globe, ArrowRight, Calculator } from "lucide-react";

export const Route = createFileRoute("/_authenticated/playbooks/")({
  head: () => ({ meta: [{ title: "The Playbooks — DFS Citadel" }] }),
  component: PlaybooksIndex,
});

const PLAYBOOKS = [
  { slug: "global-smb-engine", key: "p_global", title: "Global SMB Engine", tagline: "Markets · Leads · Offer", body: "7 countries, 12 niches, exact Google Maps searches, hot/cold lead scoring and the Grand Slam offer builder — merged into one engine.", icon: Globe, accent: "from-rose-500/25 to-transparent" },
  { slug: "plan",           key: "p_45day",        title: "45-Day Implementation Playbook", tagline: "From Zero to First Client",     body: "Day-by-day plan across 7 weeks — foundation, harvest, outreach, first close, deliver, scale, launch month 2.", icon: Calendar,   accent: "from-indigo-500/25 to-transparent" },
  { slug: "smb-calculator", key: "p_smb_calc",     title: "SMB Performance Calculator",      tagline: "Powered by Claude AI",          body: "Enter a prospect's numbers → discover their revenue leak → export a branded PDF per tab.",                    icon: Calculator, accent: "from-sky-500/25 to-transparent" },
];

function PlaybooksIndex() {
  const { user } = useSession();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("task_progress").select("playbook, completed").eq("user_id", user.id).eq("completed", true)
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data ?? []).forEach((r) => { map[r.playbook] = (map[r.playbook] ?? 0) + 1; });
        setCounts(map);
      });
  }, [user]);

  return (
    <div className="space-y-8">
      <header>
        <Motto />
        <div className="mt-2 text-[10px] uppercase tracking-widest text-gold-deep">SMB Optimisation System</div>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">The Playbooks</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          The complete SMB Optimisation System — one of the DFS tracks, distinct from the High-Ticket Closer System (The Ascent). Three playbooks, one path.
          Every checkbox you tick is synced to the Citadel — your rank and XP move with your work.
        </p>
        <p className="mt-2 text-xs text-muted-foreground max-w-2xl">
          Tool focus: <strong className="text-foreground">Go High Level · Notion · Lovable · Make / Zapier / n8n</strong>.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {PLAYBOOKS.map((p) => {
          const done = counts[p.key] ?? 0;
          const isCalc = p.slug === "smb-calculator";
          return (
            <Link
              key={p.slug}
              to={`/playbooks/${p.slug}` as any}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:border-gold hover:shadow-regal transition"
            >
              <div className={`pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br ${p.accent} blur-3xl`} />
              <div className="relative flex items-start gap-4">
                <div className="rounded-xl border border-gold/30 bg-accent/30 p-3 shrink-0">
                  <p.icon className="h-6 w-6 text-gold-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-gold-deep">{p.tagline}</div>
                  <div className="mt-1 font-display text-lg md:text-xl font-bold">{p.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {isCalc ? "Calculator · PDF export" : (<><span className="font-semibold text-foreground">{done}</span> tasks completed</>)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Open <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] uppercase tracking-widest text-gold-deep">Cadence</div>
        <h2 className="mt-1 font-display text-2xl font-bold">Weekly report ritual</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Every Sunday, <Link to="/weekly-report" className="text-primary font-semibold hover:underline">file a weekly report</Link> — outreach count, calls booked, wins, blockers. Reports feed the council escalation queue: any beneficiary who misses two consecutive weeks or logs zero outreach for seven days is auto-flagged for a mentor call.
        </p>
      </section>
    </div>
  );
}
