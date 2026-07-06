import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { useSession } from "@/lib/use-session";
import { LayoutDashboard, BookOpen, LogOut, Crown, CalendarDays, FileBarChart } from "lucide-react";
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
  const { role, user } = useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <DfsMark className="h-9 w-9" />
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">DFS Citadel</div>
              <Motto className="text-[9px]" />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavTab to="/dashboard" icon={LayoutDashboard}>Dashboard</NavTab>
            <NavTab to="/playbooks" icon={BookOpen}>Playbooks</NavTab>
            <NavTab to="/calendar" icon={CalendarDays}>Calendar</NavTab>
            <NavTab to="/report" icon={FileBarChart}>Report</NavTab>
            {role === "admin" && (
              <NavTab to="/admin" icon={Crown}>Council</NavTab>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium truncate max-w-[180px]">{user?.email}</div>
              <div className="text-[10px] uppercase tracking-widest text-gold-deep">
                {role === "admin" ? "Council Admin" : "Beneficiary"}
              </div>
            </div>
            <button onClick={signOut} className="p-2 rounded-md hover:bg-muted" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
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
