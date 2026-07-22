import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { useSession } from "@/lib/use-session";
import { useServerFn } from "@tanstack/react-start";
import { checkMyAscentAccess } from "@/lib/ascent.functions";
import { useEffect, useState } from "react";
import { LayoutDashboard, BookOpen, LogOut, Crown, CalendarDays, FileBarChart, Mountain } from "lucide-react";
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
  const check = useServerFn(checkMyAscentAccess);
  const [hasAscent, setHasAscent] = useState(false);

  useEffect(() => {
    if (!user) return;
    check({ data: undefined as never })
      .then((r) => setHasAscent(!!r?.hasAccess))
      .catch(() => setHasAscent(false));
  }, [user, check]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  };

  const tabs = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/playbooks", label: "Playbooks", icon: BookOpen, show: true },
    { to: "/calendar", label: "Calendar", icon: CalendarDays, show: true },
    { to: "/report", label: "Report", icon: FileBarChart, show: true },
    { to: "/ascent", label: "Ascent", icon: Mountain, show: hasAscent || isSuperAdmin },
    { to: "/admin", label: "Council", icon: Crown, show: role === "admin" },
  ].filter((t) => t.show);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            <DfsMark className="h-9 w-9 shrink-0" />
            <div className="leading-tight min-w-0 hidden xs:block">
              <div className="font-display text-sm font-bold truncate">DFS Citadel</div>
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
              <div className="text-[10px] uppercase tracking-widest text-gold-deep">
                {isSuperAdmin ? "Super Admin" : role === "admin" ? "Council Admin" : "Beneficiary"}
              </div>
            </div>
            <button onClick={signOut} className="p-2 rounded-md hover:bg-muted shrink-0" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile / tablet bottom nav */}
      <nav
        className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-2xl border border-gold/40 bg-card/95 backdrop-blur shadow-regal px-2 py-2 flex items-center gap-1 max-w-[calc(100vw-1.5rem)] overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-muted-foreground shrink-0"
            activeProps={{ className: "bg-gold/15 text-gold-deep" }}
          >
            <t.icon className="h-5 w-5" />
            <span>{t.label}</span>
          </Link>
        ))}
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
