import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { useSession } from "@/lib/use-session";
import { usePath, formatCountdown } from "@/lib/use-path";
import { useAccountStatus } from "@/lib/use-account-status";
import { useEffect, useState } from "react";
import { LayoutDashboard, BookOpen, LogOut, Crown, CalendarDays, FileBarChart, Compass, ShieldAlert, UserRound, MessageSquare, Users, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  const { role, user, isSuperAdmin } = useSession();
  const navigate = useNavigate();
  const { path, needsChoice, msRemaining, loading: pathLoading } = usePath();
  const status = useAccountStatus();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // A beneficiary without a sealed path is funnelled to the briefing room.
  useEffect(() => {
    if (pathLoading || !needsChoice || status.suspended) return;
    if (pathname.startsWith("/choose-path")) return;
    navigate({ to: "/choose-path", replace: true });
  }, [pathLoading, needsChoice, pathname, navigate, status.suspended]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  };

  if (!status.loading && status.suspended) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-crimson bg-card p-8 text-center shadow-regal">
          <ShieldAlert className="mx-auto h-12 w-12 text-crimson" />
          <h1 className="mt-4 font-display text-2xl font-bold">Your account is suspended</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The council has suspended your access to the Citadel
            {status.suspendedAt ? ` on ${new Date(status.suspendedAt).toLocaleDateString()}` : ""}. No playbooks,
            calendar or reports are available until the suspension is lifted.
          </p>
          {status.reason && (
            <p className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-left text-sm">
              <span className="font-semibold">Reason:</span> {status.reason}
            </p>
          )}
          <p className="mt-4 text-sm">
            Reinstatement costs <strong className="text-gold-deep">${status.feeUsd}</strong>, payable to the council —
            waived only at the founder's discretion.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !needsChoice },
    { to: "/playbooks", label: "Playbooks", icon: BookOpen, show: !needsChoice },
    { to: "/calendar", label: "Calendar", icon: CalendarDays, show: !needsChoice },
    { to: "/report", label: "Report", icon: FileBarChart, show: !needsChoice },
    { to: "/messages", label: "Messages", icon: MessageSquare, show: !needsChoice },
    { to: "/mentorship", label: "Mentorship", icon: Users, show: !needsChoice },
    // Only the founder keeps the Paths tab; everyone else sees it solely inside their 24-hour window.
    { to: "/choose-path", label: isSuperAdmin ? "Paths" : "Your Path", icon: Compass, show: isSuperAdmin || needsChoice },
    { to: "/admin", label: "Council", icon: Crown, show: role === "admin" },
  ].filter((t) => t.show);

  // The bottom bar shows at most four buttons: three primaries plus "More".
  const primaryTabs = tabs.slice(0, 3);
  const secondaryTabs = tabs.slice(3);



  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            <DfsMark className="h-9 w-9 shrink-0" />
            <div className="leading-tight min-w-0 hidden xs:block">
              <div className="font-display text-sm font-bold truncate">DBI Citadel</div>
              <Motto className="text-[9px]" />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {tabs.map((t) => (
              <NavTab key={t.to} to={t.to} icon={t.icon}>{t.label}</NavTab>
            ))}
          </nav>
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-right hidden sm:block min-w-0">
              <div className="text-xs font-medium truncate max-w-[180px]">{user?.email}</div>
              <div className="text-[10px] tracking-widest text-gold-deep">
                {isSuperAdmin ? "Super Admin" : role === "admin" ? "Council Admin" : "Beneficiary"}
                {path ? ` · ${path.short}` : ""}
              </div>
            </div>
            <Link to="/profile" className="p-2 rounded-md hover:bg-muted shrink-0" aria-label="Profile" title="Profile">
              <UserRound className="h-4 w-4" />
            </Link>
            <button onClick={signOut} className="p-2 rounded-md hover:bg-muted shrink-0" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {needsChoice && (
          <div className="border-t border-crimson/30 bg-crimson/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 text-[11px] text-crimson flex flex-wrap items-center gap-2">
              <strong>Choose your path.</strong>
              <span className="text-muted-foreground">
                {msRemaining > 0
                  ? `${formatCountdown(msRemaining)} remaining before one is assigned at random.`
                  : "Your window has closed — the council will assign one shortly."}
              </span>
              <Link to="/choose-path" className="font-semibold underline">
                Open the briefings
              </Link>
            </div>
          </div>
        )}
      </header>


      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile / tablet bottom nav — never more than four buttons; the rest live under "More" */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
      )}
      {moreOpen && (
        <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl border border-gold/40 bg-card shadow-regal p-3">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[10px] tracking-widest text-gold-deep">More Of The Citadel</span>
            <button onClick={() => setMoreOpen(false)} className="p-1 rounded-md hover:bg-muted" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {secondaryTabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1 rounded-xl border border-border px-2 py-3 text-[10px] font-semibold text-muted-foreground text-center"
                activeProps={{ className: "bg-gold/15 text-gold-deep border-gold/40" }}
              >
                <t.icon className="h-5 w-5" />
                <span>{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-2xl border border-gold/40 bg-card/95 backdrop-blur shadow-regal px-2 py-2 flex items-center gap-1">
        {primaryTabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            onClick={() => setMoreOpen(false)}
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-muted-foreground shrink-0"
            activeProps={{ className: "bg-gold/15 text-gold-deep" }}
          >
            <t.icon className="h-5 w-5" />
            <span>{t.label}</span>
          </Link>
        ))}
        {secondaryTabs.length > 0 && (
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold shrink-0 ${
              moreOpen ? "bg-gold/15 text-gold-deep" : "text-muted-foreground"
            }`}
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        )}
      </nav>
    </div>
  );
}

function NavTab({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted text-foreground"
      activeProps={{ className: "bg-muted text-primary font-semibold" }}
    >
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}
