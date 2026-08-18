import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { useSession } from "@/lib/use-session";
import { usePath, formatCountdown } from "@/lib/use-path";
import { useAccountStatus } from "@/lib/use-account-status";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Crown,
  Compass,
  ShieldAlert,
  UserRound,
  MessageSquare,
  Users,
  ChevronDown,
  Target,
} from "lucide-react";
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
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({
    full_name: null,
    avatar_url: null,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Admins/DSE Reps never go through path selection — "the paths" (the
  // 5-path playbook curriculum) belong to beneficiaries. The founder still
  // inspects any path via the profile dropdown, so only ordinary admins
  // are excluded here.
  const isOrdinaryAdmin = role === "admin" && !isSuperAdmin;
  const effectiveNeedsChoice = needsChoice && !isOrdinaryAdmin;

  // A beneficiary without a sealed path is funnelled to the briefing room.
  useEffect(() => {
    if (pathLoading || !effectiveNeedsChoice || status.suspended) return;
    if (pathname.startsWith("/choose-path")) return;
    navigate({ to: "/choose-path", replace: true });
  }, [pathLoading, effectiveNeedsChoice, pathname, navigate, status.suspended]);

  // DSE Reps are report-facing by default — the beneficiary/consumer side
  // (Dashboard, Calendar, BPS, DFY, Messages, Mentorship, Report) is
  // off-limits until the super admin grants consumer access, and Playbooks
  // + choose-path stay off-limits regardless since those are "the paths."
  // The founder is always exempt from both.
  const consumerGated = isOrdinaryAdmin && !status.loading && status.consumerAccessStatus !== "granted";
  const repAllowedPrefixes = ["/admin", "/council-reports", "/council-mentorship", "/council-escalations", "/profile"];
  useEffect(() => {
    if (!isOrdinaryAdmin) return;
    const blockedByPaths = pathname.startsWith("/playbooks") || pathname.startsWith("/choose-path");
    const blockedByConsumerGate = consumerGated && !repAllowedPrefixes.some((p) => pathname.startsWith(p));
    if (blockedByPaths || blockedByConsumerGate) navigate({ to: "/admin", replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrdinaryAdmin, consumerGated, pathname, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("full_name,avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: { data: { full_name: string | null; avatar_url: string | null } | null }) => {
        if (!cancelled && data) setProfile({ full_name: data.full_name, avatar_url: data.avatar_url });
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Close the menu on route change so it never lingers after navigating.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  // Dashboard/Playbooks/BPS/Messages/Mentorship only show once a path is
  // chosen, and "Your Path" only shows during the choice window — the two
  // sets are mutually exclusive, so the bar never exceeds 5 plus Council
  // for admins (6, for that one role only). Calendar, Report and DFY stay
  // one click away from Dashboard instead of living in the top bar; the
  // founder's cross-path "Paths" browser moved into the profile dropdown
  // to make room. For an ordinary admin, Playbooks/choose-path never
  // show (the paths curriculum), and Dashboard/BPS/Messages/Mentorship
  // only show once consumer access is granted.
  const tabs = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/playbooks", label: "Playbooks", icon: BookOpen, show: !effectiveNeedsChoice && !isOrdinaryAdmin },
    { to: "/bps", label: "BPS", icon: Target, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/messages", label: "Messages", icon: MessageSquare, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/mentorship", label: "Mentorship", icon: Users, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/choose-path", label: "Your Path", icon: Compass, show: effectiveNeedsChoice && !isOrdinaryAdmin },
    { to: "/admin", label: "Council", icon: Crown, show: role === "admin" },
  ].filter((t) => t.show);

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
              <NavTab key={t.to} to={t.to} icon={t.icon}>
                {t.label}
              </NavTab>
            ))}
          </nav>
          <ProfileMenu
            open={menuOpen}
            setOpen={setMenuOpen}
            menuRef={menuRef}
            fullName={profile.full_name}
            avatarUrl={profile.avatar_url}
            email={user?.email}
            role={role}
            isSuperAdmin={isSuperAdmin}
            pathShort={path?.short}
            onSignOut={signOut}
          />
        </div>

        {effectiveNeedsChoice && (
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

function ProfileMenu({
  open,
  setOpen,
  menuRef,
  fullName,
  avatarUrl,
  email,
  role,
  isSuperAdmin,
  pathShort,
  onSignOut,
}: {
  open: boolean;
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | undefined;
  role: string | null | undefined;
  isSuperAdmin: boolean;
  pathShort: string | undefined;
  onSignOut: () => void;
}) {
  const roleLabel = isSuperAdmin ? "Super Admin" : role === "admin" ? "Council Admin" : "Beneficiary";

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-muted"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover border border-gold/40" />
        ) : (
          <span className="h-7 w-7 rounded-full bg-muted grid place-items-center border border-gold/40">
            <UserRound className="h-3.5 w-3.5" />
          </span>
        )}
        {pathShort && (
          <span className="text-[10px] font-semibold tracking-widest text-gold-deep hidden xs:inline">{pathShort}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-regal py-1.5 z-50"
        >
          <div className="px-3 py-2 border-b border-border">
            <div className="text-sm font-semibold truncate">{fullName || email}</div>
            <div className="text-[10px] tracking-widest text-gold-deep mt-0.5">
              {roleLabel}
              {pathShort ? ` · ${pathShort}` : ""}
            </div>
          </div>
          {isSuperAdmin && (
            <Link
              to="/choose-path"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            >
              <Compass className="h-4 w-4" /> Paths
            </Link>
          )}
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
          >
            <UserRound className="h-4 w-4" /> Profile
          </Link>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-crimson hover:bg-crimson/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
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
