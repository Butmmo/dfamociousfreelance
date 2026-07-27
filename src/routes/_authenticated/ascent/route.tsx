import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkMyAscentAccess } from "@/lib/ascent.functions";
import { useSession } from "@/lib/use-session";
import { supabase } from "@/integrations/supabase/client";
import { RANKS, DAYS, ASCENT_PLAYBOOK_KEY } from "@/lib/ascent-data";
import { Lock, ArrowLeft, LayoutDashboard, BookOpen, CalendarDays, FileBarChart, Crown, Mountain } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ascent")({
  head: () => ({ meta: [{ title: "The Ascent — DFS Citadel" }] }),
  component: AscentShell,
});

function AscentShell() {
  const { role, user } = useSession();
  const check = useServerFn(checkMyAscentAccess);
  const [status, setStatus] = useState<"loading" | "granted" | "denied">("loading");
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    check({ data: undefined as never })
      .then((r) => setStatus(r?.hasAccess ? "granted" : "denied"))
      .catch(() => setStatus("denied"));
  }, [check]);

  useEffect(() => {
    if (!user || status !== "granted") return;
    supabase
      .from("task_progress")
      .select("task_id, completed")
      .eq("user_id", user.id)
      .eq("playbook", ASCENT_PLAYBOOK_KEY)
      .then(({ data }) => {
        const done = new Set((data ?? []).filter((r: any) => r.completed).map((r: any) => r.task_id));
        let xp = 0;
        DAYS.forEach((d) => d.items.forEach((i) => { if (done.has(i.id)) xp += i.xp; }));
        setEarned(xp);
      });
  }, [user, status]);

  if (status === "loading") {
    return <div className="p-10 text-center text-muted-foreground">Verifying Ascent access…</div>;
  }
  if (status === "denied") {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-gold/40 bg-card p-10 text-center space-y-3 shadow-regal">
        <Lock className="h-10 w-10 text-gold-deep mx-auto" />
        <h1 className="font-display text-2xl">The Ascent is invitation-only</h1>
        <p className="text-sm text-muted-foreground">
          This programme is granted individually by the Founder. Contact your council admin if you believe you should have access.
        </p>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
          <ArrowLeft className="h-4 w-4" /> Back to Citadel
        </Link>
      </div>
    );
  }

  const totalXP = DAYS.reduce((s, d) => s + d.items.reduce((a, i) => a + i.xp, 0), 0);
  const percent = totalXP ? Math.min(100, Math.round((earned / totalXP) * 100)) : 0;
  let rank = RANKS[0];
  RANKS.forEach((r) => { if (percent >= r.threshold) rank = r; });

  const tabs = [
    { to: "/ascent", label: "Dashboard", icon: LayoutDashboard, exact: true, show: true },
    { to: "/ascent/curriculum", label: "Curriculum", icon: BookOpen, exact: false, show: true },
    { to: "/ascent/calendar", label: "Calendar", icon: CalendarDays, exact: false, show: true },
    { to: "/ascent/report", label: "Report", icon: FileBarChart, exact: false, show: true },
    { to: "/ascent/council", label: "Council", icon: Crown, exact: false, show: role === "admin" },
  ].filter((t) => t.show);

  return (
    <div className="-mx-4 sm:-mx-6 -my-6 sm:-my-10">
      {/* Ascent sub-header */}
      <div className="border-b-2 border-insignia/40 bg-gradient-to-br from-[#1A1410] via-[#241B14] to-[#1A1410] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/dashboard" className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-white/60 hover:text-gold transition">
                <ArrowLeft className="h-3.5 w-3.5" /> Citadel
              </Link>
              <span className="text-white/30">/</span>
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-gold" />
                <div>
                  <div className="font-display text-lg leading-none tracking-wide">THE ASCENT</div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/50 mt-0.5">
                    45-Day Direct-Scouting Closer System
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gold">{rank.name}</div>
              <div className="text-[11px] font-mono text-white/60">{earned} / {totalXP} XP · {percent}%</div>
              <div className="mt-1 h-1 w-40 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gold" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.exact }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/70 hover:text-white hover:border-gold/40 transition"
                activeProps={{ className: "!bg-gold !border-gold !text-[#1A1410] font-semibold" }}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </div>
    </div>
  );
}
