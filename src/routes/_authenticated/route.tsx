import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DfsMark, Motto } from "@/components/dfs/Brand";
import { NotificationBell } from "@/components/dfs/NotificationBell";
import { useSession } from "@/lib/use-session";
import { usePath, formatCountdown } from "@/lib/use-path";
import { useAccountStatus } from "@/lib/use-account-status";
import { usePushSubscription } from "@/lib/push";
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
  Activity,
  CalendarDays,
  FileText,
  DollarSign,
  Plus,
  Headphones,
  Bell,
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
  const push = usePushSubscription();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({
    full_name: null,
    avatar_url: null,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreSheetRef = useRef<HTMLDivElement>(null);

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

  // Every reminder cron (and the finance daily tracker's same-day-only
  // lock) reads profiles.timezone to decide what "now" means for this
  // beneficiary — keep it in sync with whatever the browser actually
  // reports, silently, on every login.
  useEffect(() => {
    if (!user?.id) return;
    let detected: string | null = null;
    try {
      detected = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      detected = null;
    }
    if (!detected) return;
    supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: { data: { timezone: string } | null }) => {
        if (data && data.timezone !== detected) {
          supabase.from("profiles").update({ timezone: detected } as never).eq("id", user.id);
        }
      });
  }, [user?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (moreRef.current?.contains(t) || moreSheetRef.current?.contains(t)) return;
      setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [moreOpen]);

  // Close the menus on route change so they never linger after navigating.
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
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

  // Push access is a prerequisite to using the Citadel — every category
  // except messages fires unconditionally once subscribed (profile.tsx
  // carries the one messaging-only opt-out). Browsers/devices that simply
  // don't implement the Push API (push.supported === false) are let
  // through rather than locked out entirely, since there is nothing for
  // them to grant.
  if (!status.loading && !status.suspended && push.supported && !push.loading && !push.subscribed) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-gold/40 bg-card p-8 text-center shadow-regal">
          <Bell className="mx-auto h-12 w-12 text-gold-deep" />
          <h1 className="mt-4 font-display text-2xl font-bold">Enable notifications to continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The Citadel runs on push notifications — escalations, mentorship, BPS cadence, DFY and council
            updates all reach you this way. It's a prerequisite to using the app, the same way a suspended
            account or an unsealed path gates access. The one exception is messaging, which you can silence
            later from your profile without losing this subscription.
          </p>
          {push.permission === "denied" ? (
            <p className="mt-4 rounded-lg border border-crimson/40 bg-crimson/10 p-3 text-sm text-crimson">
              Notifications are blocked for this site in your browser. Enable them from your browser's site
              settings, then reload this page.
            </p>
          ) : (
            <button
              onClick={push.subscribe}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Bell className="h-4 w-4" /> Enable notifications
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mobile keeps a hard cap of 4 items on the bottom bar (tabs, below) plus
  // a "More" sheet for everything else. Desktop has room to spare, so BPS
  // and Report get promoted onto the bar itself (desktopTabs/
  // desktopMoreLinks, below) — six items total instead of four. For an
  // ordinary admin, Playbooks/choose-path never show (the paths
  // curriculum), and every consumer-side item only shows once consumer
  // access is granted. The founder's cross-path "Paths" browser lives in
  // the profile dropdown.
  const tabs = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/playbooks", label: "Playbooks", icon: BookOpen, show: !effectiveNeedsChoice && !isOrdinaryAdmin },
    { to: "/messages", label: "Messages", icon: MessageSquare, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/choose-path", label: "Your Path", icon: Compass, show: effectiveNeedsChoice && !isOrdinaryAdmin },
  ].filter((t) => t.show);

  const moreLinks = [
    { to: "/calendar", label: "Calendar", icon: CalendarDays, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/report", label: "Report", icon: FileText, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/bps", label: "BPS", icon: Activity, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/dfy", label: "DFY Tracker", icon: DollarSign, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/mentorship", label: "Mentorship", icon: Users, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/tpe", label: "TPE", icon: Headphones, show: !effectiveNeedsChoice && !consumerGated },
    { to: "/admin", label: "Council", icon: Crown, show: role === "admin" },
  ].filter((t) => t.show);

  // Desktop has room for 6 top-level items before "More" feels necessary —
  // BPS and Report get promoted out of the dropdown there. Mobile keeps
  // its original 4-icon cap (tabs/moreLinks above, untouched) since screen
  // width doesn't have the same slack.
  const desktopPromoted = moreLinks.filter((l) => l.to === "/bps" || l.to === "/report");
  const desktopTabs = [...tabs, ...desktopPromoted];
  const desktopMoreLinks = moreLinks.filter((l) => l.to !== "/bps" && l.to !== "/report");

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
            {desktopTabs.map((t) => (
              <NavTab key={t.to} to={t.to} icon={t.icon}>
                {t.label}
              </NavTab>
            ))}
            {desktopMoreLinks.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted text-foreground"
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                >
                  <Plus className="h-4 w-4" /> More
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                </button>
                {moreOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-regal py-1.5 z-50"
                  >
                    {desktopMoreLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        activeProps={{ className: "bg-muted text-primary font-semibold" }}
                      >
                        <l.icon className="h-4 w-4" /> {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell />
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

      {/* Mobile / tablet bottom nav — max 4 items (unaffected by the desktop BPS/Report promotion above) */}
      {moreOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
        />
      )}
      {moreOpen && moreLinks.length > 0 && (
        <div ref={moreSheetRef} className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl border border-gold/40 bg-card shadow-regal p-2 grid grid-cols-3 gap-1">
          {moreLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMoreOpen(false)}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[10px] font-semibold text-muted-foreground hover:bg-muted text-center"
              activeProps={{ className: "bg-gold/15 text-gold-deep" }}
            >
              <l.icon className="h-5 w-5" />
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      )}
      <nav
        className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-2xl border border-gold/40 bg-card/95 backdrop-blur shadow-regal px-2 py-2 flex items-center gap-1 max-w-[calc(100vw-1.5rem)]"
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
        {moreLinks.length > 0 && (
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold shrink-0 ${moreOpen ? "bg-gold/15 text-gold-deep" : "text-muted-foreground"}`}
          >
            <Plus className="h-5 w-5" />
            <span>More</span>
          </button>
        )}
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
