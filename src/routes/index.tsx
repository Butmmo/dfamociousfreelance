import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from "react";
import { DbiMark, DfgMark, Motto } from "@/components/dfs/Brand";
import dbiHero from "@/assets/dbi_hero.webp";
import founderAsset from "@/assets/founder.jpg";
import {
  Crown, Shield, Target, Flame, TrendingUp, Calendar, Lock, Award,
  Calculator, LayoutDashboard, LineChart, Users, Bell, CheckCircle2, Mail,
  MessageSquare, Timer, Gauge, FileDown, Compass, Layers, Store,
  Banknote, GraduationCap, Building2, HeartHandshake, Smartphone,
  Sparkles, Video,
} from "lucide-react";

const DESC =
  "DBI forges Digital Systems Engineers and backs them to build, launch and scale profitable global businesses in record time.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DBI — D'Famocious Business Incubator" },
      { name: "description", content: DESC },
      { property: "og:title", content: "DBI — D'Famocious Business Incubator" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* ═══════════════════════════ helpers ═══════════════════════════ */

/** Fades + rises into place the first time it crosses into view. Respects prefers-reduced-motion. */
function Reveal({
  children, className = "", delay = 0, ...rest
}: { children: ReactNode; className?: string; delay?: number } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** A stylized phone frame for showing an actual mobile screen of the app. */
function PhoneMock({ children, tilt = 0 }: { children: ReactNode; tilt?: number }) {
  return (
    <div
      className="relative mx-auto w-[230px] shrink-0 snap-center"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="pointer-events-none absolute -inset-3 rounded-[2.8rem] bg-gradient-to-br from-gold/25 via-transparent to-crimson/20 blur-2xl" />
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.4rem] border-[7px] border-onyx bg-onyx shadow-regal">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-onyx" />
        <div className="absolute inset-0 overflow-hidden bg-background">{children}</div>
      </div>
    </div>
  );
}

function ScreenHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 pb-2 pt-7">
      <span className="font-display text-[9.5px] font-bold">{title}</span>
      <div className="flex items-center gap-1">
        <Bell className="h-2.5 w-2.5 text-muted-foreground" />
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-gold to-gold-soft" />
      </div>
    </div>
  );
}

/* ═══════════════════════════ mini app screens ═══════════════════════════ */

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col bg-background">
      <ScreenHeader title="Dashboard" />
      <div className="space-y-2.5 p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft">
            <span className="text-[8px] font-bold text-onyx">DF</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[8.5px] font-semibold">D'Famocious Beneficiary</div>
            <div className="text-[6.5px] tracking-widest text-gold-deep">CLOSER · 1,240 XP</div>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-gold-deep to-gold" />
        </div>
        <div className="space-y-1.5 rounded-lg border border-border bg-card p-2">
          <div className="text-[6.5px] tracking-widest text-gold-deep">TODAY'S MISSIONS</div>
          {["Send 10 outreach DMs", "Log 2 new leads", "Seal today's task"].map((t, i) => (
            <div key={t} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 shrink-0 rounded-sm ${i < 2 ? "bg-emerald-500" : "border border-muted-foreground/40"}`} />
              <span className={`text-[7px] ${i < 2 ? "text-muted-foreground line-through" : ""}`}>{t}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-gold/40 bg-accent/20 p-1.5">
            <div className="text-[6px] text-muted-foreground">ESCALATION</div>
            <div className="text-[9.5px] font-display font-bold text-emerald-600">Healthy</div>
          </div>
          <div className="rounded-lg border border-gold/40 bg-accent/20 p-1.5">
            <div className="text-[6px] text-muted-foreground">STREAK</div>
            <div className="text-[9.5px] font-display font-bold text-gold-deep">12 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrmScreen() {
  const leads = [
    { name: "Lagos Dental Co.", tag: "🔥", score: 9 },
    { name: "Northgate Realty", tag: "🟡", score: 6 },
    { name: "Bloom Boutique", tag: "🆕", score: 4 },
  ];
  return (
    <div className="flex h-full flex-col bg-background">
      <ScreenHeader title="Client CRM" />
      <div className="flex gap-1 px-3 pt-2">
        {["All", "Hot", "Active"].map((v, i) => (
          <span key={v} className={`rounded-full px-1.5 py-0.5 text-[6px] font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{v}</span>
        ))}
      </div>
      <div className="space-y-1.5 p-2.5">
        {leads.map((l) => (
          <div key={l.name} className="rounded-lg border border-border bg-card p-2">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[7.5px] font-semibold">{l.name}</span>
              <span className="text-[8px] leading-none">{l.tag}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gold-deep" style={{ width: `${l.score * 10}%` }} />
              </div>
              <span className="text-[6px] text-muted-foreground">{l.score}/10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarScreen() {
  const sealed = new Set([2, 3, 4, 8, 9, 10, 11, 15, 16]);
  return (
    <div className="flex h-full flex-col bg-background">
      <ScreenHeader title="Calendar" />
      <div className="p-3">
        <div className="text-[7px] font-semibold text-muted-foreground">March · Day 16 of 45</div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className={`grid aspect-square place-items-center rounded-[3px] text-[5.5px] font-semibold ${
                sealed.has(d) ? "bg-gradient-to-br from-gold to-gold-deep text-onyx" : d === 16 ? "border border-gold text-gold-deep" : "bg-muted/60 text-muted-foreground/70"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-gold/40 bg-accent/20 p-2">
          <div className="text-[6px] tracking-widest text-gold-deep">NEXT UP · 1:00 PM</div>
          <div className="mt-0.5 text-[7.5px] font-semibold">Outreach block — 20 sends</div>
        </div>
      </div>
    </div>
  );
}

function PaymentsScreen() {
  return (
    <div className="flex h-full flex-col bg-background">
      <ScreenHeader title="Payments" />
      <div className="space-y-2 p-2.5">
        <div className="rounded-lg border border-border bg-card p-2">
          <div className="text-[7px] font-semibold">DSE Entry</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[6px] font-bold text-emerald-600">
            <CheckCircle2 className="h-2 w-2" /> PAID
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-2">
          <div className="text-[7px] font-semibold">DFY Remittance — March</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[8px] font-display font-bold text-gold-deep">$412.00</span>
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[6px] font-semibold text-primary-foreground">Pay via Paystack</span>
          </div>
        </div>
        <div className="rounded-lg border border-gold/40 bg-accent/20 p-2">
          <div className="text-[6px] tracking-widest text-gold-deep">POCKET SYSTEM</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-gold-deep to-gold" />
          </div>
          <div className="mt-1 text-[6.5px] text-muted-foreground">$3,120 saved of $4,800 cap</div>
        </div>
      </div>
    </div>
  );
}

function MessagesScreen() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-1.5 border-b border-border px-3 pb-2 pt-7">
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-gold to-gold-soft" />
        <span className="text-[8px] font-semibold">Your Mentor</span>
        <Video className="ml-auto h-2.5 w-2.5 text-primary" />
      </div>
      <div className="flex-1 space-y-1.5 p-2.5">
        <div className="max-w-[75%] rounded-lg rounded-tl-sm bg-muted px-2 py-1.5 text-[7px]">Great close today — how did the objection at minute 4 land?</div>
        <div className="ml-auto max-w-[75%] rounded-lg rounded-tr-sm bg-primary px-2 py-1.5 text-[7px] text-primary-foreground">Handled it with the ROI reframe. Signed by EOD 🎯</div>
        <div className="max-w-[75%] rounded-lg rounded-tl-sm bg-muted px-2 py-1.5 text-[7px]">That's rank-up work. Logging it now.</div>
      </div>
      <div className="border-t border-border p-2">
        <div className="rounded-full border border-border bg-card px-2.5 py-1.5 text-[6.5px] text-muted-foreground">Message your cohort…</div>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const items = [
    { t: "DFY remittance confirmed", b: "$412.00 received via Paystack.", u: true },
    { t: "Weekly report is due", b: "Submit before Sunday 11:59pm.", u: true },
    { t: "Mentor check-in logged", b: "\"Strong week — keep the pace.\"", u: false },
    { t: "Belief Goal reminder", b: "Set next month's goal by the 1st.", u: false },
  ];
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 pb-2 pt-7">
        <span className="font-display text-[9.5px] font-bold">Notifications</span>
        <span className="text-[6px] font-semibold text-muted-foreground">Mark all read</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((n) => (
          <div key={n.t} className={`flex items-start gap-1.5 px-3 py-2 ${n.u ? "bg-gold/5" : ""}`}>
            {n.u && <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold" />}
            <div className={n.u ? "" : "pl-2.5"}>
              <div className={`text-[7px] ${n.u ? "font-semibold" : "text-muted-foreground"}`}>{n.t}</div>
              <div className="text-[6px] text-muted-foreground">{n.b}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const APP_SCREENS = [
  { Screen: DashboardScreen, t: "Dashboard", d: "Rank, XP, streaks and today's missions the second you log in.", tilt: -3 },
  { Screen: CrmScreen, t: "Client CRM", d: "Your whole outreach pipeline — leads, stages, priority — never a spreadsheet again.", tilt: 2 },
  { Screen: CalendarScreen, t: "45-Day Calendar", d: "Days seal gold as tasks complete. Nothing falls through unseen.", tilt: -2 },
  { Screen: PaymentsScreen, t: "Payments & Pocket", d: "DSE entry, DFY remittances and structured savings — via Paystack.", tilt: 3 },
  { Screen: MessagesScreen, t: "Mentorship", d: "Your Rep, your mentor, your cohort — one tap away, video included.", tilt: -2 },
  { Screen: NotificationsScreen, t: "Notifications", d: "A running history of everything the Citadel has ever told you.", tilt: 2 },
];

/* ═══════════════════════════ content ═══════════════════════════ */

const STAGES = [
  {
    tag: "Stage 1",
    name: "Digital Systems Engineering",
    short: "DSE",
    body:
      "Seven service-based, client-acquisition systems. You pick exactly one and run it for one to three years or more — building real cash flow, real proof and real expertise before anything is ever 'owned'.",
    points: [
      "One system per beneficiary — no two students fight over the same market",
      "Prove skill on self-made material, never free work for a live prospect",
      "45-day forge, XP ranks, weekly filings and live escalation tracking",
    ],
  },
  {
    tag: "Stage 2",
    name: "The Start-up Catalyst",
    short: "SUC",
    body:
      "Fourteen paths — seven Compounder products and seven Proprietor businesses — taken through design, structure, build, testing, launch, authority, ecosystem, valuation and the premium/luxury fork.",
    points: [
      "Entry is outcome-based: $450,000 cumulative DSE earnings within 3–5 years",
      "Plus Leadership by Influence — five mentees carried through their own full DFY",
      "Neither track is the fallback — Compounder and Proprietor are equally complete",
      "Ends in a real, valuable, differentiated business you own",
    ],
  },
];

const SEVEN_SYSTEMS = [
  { emoji: "⛰️", t: "The Ascent", d: "High-ticket sales closing across six scored niche lanes. Remote, zero-capital.", tool: "No tooling required", price: "10–20% commission" },
  { emoji: "🤝", t: "CareBridge", d: "Home-care agency automation — intake, follow-up and family response.", tool: "Zapier", price: "$75–$600/mo" },
  { emoji: "⛪", t: "Digital Ministry Systems", d: "Church and parish management: giving, attendance, follow-up, comms.", tool: "Notion", price: "$50–$400/mo" },
  { emoji: "🛒", t: "Revenue Recovery Engine", d: "Ecommerce email and SMS retention — you get paid from money you return.", tool: "Klaviyo", price: "$297–$1,200/mo" },
  { emoji: "🏪", t: "SMB Optimization System", d: "Local business automation — the broadest applicability of the seven.", tool: "GoHighLevel", price: "Niche & geography" },
  { emoji: "🎙️", t: "The Broadcast Engine", d: "Podcast production, editing, distribution and monetisation.", tool: "Descript · CapCut", price: "$500–$1,800/mo" },
  { emoji: "📈", t: "The Authority Engine", d: "LinkedIn ghostwriting and authority building for founders and advisors.", tool: "Writing-based", price: "$500–$1,800/mo" },
];

const COMPOUNDER = [
  "Template & Asset Vault",
  "Niche Intelligence / Data Product",
  "Signature Course",
  "Membership Community",
  "Micro-SaaS Tool",
  "High-Ticket Mastermind / Certification",
  "Business-in-a-Box License",
];

const PROPRIETOR = [
  "Systemized Local Service Business",
  "Retail & Consumer Trading",
  "Real Estate & Property",
  "Food, Beverage & Hospitality",
  "Agro-Processing & Light Manufacturing",
  "Franchise or Business Acquisition",
  "Import/Export & Cross-Border Trade",
];

const ECONOMICS = [
  { icon: GraduationCap, t: "DSE entry — $900", d: "One-time. Or $90 through NBO, the Blazer Empowerment Foundation subsidy built to open the gate to students who could not otherwise reach it — paid in-app via Paystack, at the ₦75,000 local rate once your NIN is verified." },
  { icon: Banknote, t: "The D'Famocious Year", d: "Once you earn, 20% of every earning month returns to DBI until you complete 12 qualified months — each at $2,000+ net, not necessarily consecutive. Tracked and payable from your own Payments page." },
  { icon: Award, t: "V. DsE. certification", d: "Completing DFY earns the Vetted Digital Systems Engineer credential — the mark that Stage 1 was finished on real income, not attendance." },
  { icon: Layers, t: "The SUC ladder", d: "$2,000 by invitation, once DSE has produced $450k and five mentees carried through their own DFY. Skipping DSE costs $6,000 at 25% equity, or $24,000 with DBI's stake reduced to 10% — a ladder, not a cliff." },
];

const GROUP = [
  {
    icon: Crown,
    tag: "Parent",
    t: "D'Famocious Group",
    d: "The holding company — not a training vendor but a talent pipeline. Governed by four distinct authorities: the Founder, the Chancellor as custodian of doctrine, the Elder Council with doctrinal veto, and the Board of Stewards with the CEO over operations. No individual holds unilateral financial control.",
  },
  {
    icon: Building2,
    tag: "For-profit subsidiary",
    t: "D'Famocious Business Incubator",
    d: "This house. DSE proves earning capacity; SUC turns it into ownership. Revenue-share at Stage 1 because there is no asset yet, real equity at Stage 2 because by then there is.",
  },
  {
    icon: HeartHandshake,
    tag: "NGO subsidiary",
    t: "Blazer Empowerment Foundation",
    d: "The sister foundation. It intervenes before income freedom, where potential is most fragile, and works through named initiatives rather than running programmes itself. DSE proves earning capacity; BEF proves leadership and readiness. Neither substitutes for the other.",
  },
];

const INITIATIVES = [
  { t: "NBO — Next Blazers Organisation", s: "Operating", d: "BEF's first and most developed initiative. Next Blazers College runs 58 days across five stages, Next Blazers Scholarship reduces DSE entry from $900 to $90, and Blazer People Network turns networking capacity into a personal-use income stream." },
  { t: "BSA — Blazing Skill Acquisition", s: "In development", d: "Ten self-employable trades and ten SUC-employability professional offers, each pairing a soft skill with a hard or physical one — training people toward employability, referral into SUC businesses, and startup capital where possible." },
  { t: "BLI — Blazer Life Initiative", s: "Not yet structured", d: "A pro-life initiative for Africa. Deliberately undefined here rather than dressed up: the Foundation will define it before it is described." },
];

const BLAZER = [
  { l: "B", t: "Belief in Self & Vision", d: "All growth is predicated on belief in personal potential and purpose." },
  { l: "L", t: "Leadership by Influence", d: "Authority from character, competence and service — never from title." },
  { l: "A", t: "Action-Oriented Growth", d: "Knowledge becomes powerful only upon application." },
  { l: "Z", t: "Zeal for Excellence", d: "Constant upgrading of skill, mindset and capacity." },
  { l: "E", t: "Empowerment through Education & Enterprise", d: "Mentorship and viable income models toward independence." },
  { l: "R", t: "Relationships & Results", d: "Accountable, mission-aligned relationships as the platform for collective results." },
];

const TPE_MOVEMENTS = [
  "Order & Intelligence",
  "Leadership & Vision",
  "Communication",
  "Time, Effort & Strategy",
  "Execution & Systems-Building",
  "Resilience, Finance, Culture & Ethics",
];

const RANKS = [
  { name: "Recruit", icon: Shield, color: "text-muted-foreground", desc: "Day 1. Arsenal armed." },
  { name: "Operator", icon: Target, color: "text-chart-1", desc: "First demo, first 100 leads." },
  { name: "Closer", icon: TrendingUp, color: "text-gold-deep", desc: "First paid client." },
  { name: "Lion", icon: Flame, color: "text-crimson", desc: "Mentorship privileges. Five clients." },
  { name: "Crown", icon: Crown, color: "text-gold", desc: "Council seat. Pass the torch." },
];

const HERO_STATS = [
  { n: "2", l: "Stages" },
  { n: "7", l: "DSE systems" },
  { n: "14", l: "SUC paths" },
  { n: "V. DsE.", l: "Credential" },
];

/* ═══════════════════════════ page ═══════════════════════════ */

function Landing() {
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <DbiMark className="h-10 w-10" />
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-wider">DBI</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">D'Famocious Business Incubator</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="#stages" className="hover:text-primary transition">The Two Stages</a>
            <a href="#app" className="hover:text-primary transition">Inside the App</a>
            <a href="#dse" className="hover:text-primary transition">Stage 1 · DSE</a>
            <a href="#suc" className="hover:text-primary transition">Stage 2 · SUC</a>
            <a href="#economics" className="hover:text-primary transition">Economics</a>
            <a href="#group" className="hover:text-primary transition">Group &amp; BEF</a>
            <a href="#founder" className="hover:text-primary transition">Founder</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/signup"
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-gold px-4 py-2 text-sm font-semibold hover:bg-accent/40 transition"
            >
              Apply Now
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal"
            >
              <Lock className="h-4 w-4" /> Beneficiary Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-crimson/15 blur-3xl animate-drift-slow" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.13_80/0.06),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_5%,oklch(0.48_0.18_25/0.06),transparent_40%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-10 md:grid-cols-2 md:pb-24 md:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-gold-deep">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              LIVE — BPS, PAYMENTS &amp; MENTORSHIP, ALL IN ONE CITADEL
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05]">
              We don't teach skills.{" "}
              <span className="text-gold-gradient text-shimmer">We incubate owners.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              D'Famocious Business Incubator runs in two stages. First you become a Digital Systems Engineer and monetise
              one of seven client-acquisition systems until the income is undeniable. Then the Start-up Catalyst turns
              that proof into a business you own — digital or traditional. The whole run happens inside one app: your
              path, your pipeline, your goals, your people.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-regal transition hover:bg-primary/90 hover:shadow-lg">
                <Shield className="h-5 w-5 transition-transform group-hover:scale-110" /> Apply for DSE Entry
              </Link>
              <a href="#app" className="inline-flex items-center gap-2 rounded-md border border-gold px-6 py-3 text-base font-semibold transition hover:bg-accent/40">
                <Smartphone className="h-5 w-5" /> See inside the app
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-xl">
              {HERO_STATS.map((s, i) => (
                <Reveal key={s.l} delay={i * 80} className="rounded-xl border border-border bg-card px-4 py-3 hover:border-gold/60 hover:-translate-y-0.5 transition-transform">
                  <div className="font-display text-2xl font-bold text-gold-deep">{s.n}</div>
                  <div className="text-[10px] tracking-widest text-muted-foreground">{s.l}</div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div style={{ ["--float-rotate" as string]: "-4deg" }} className="animate-hover-float">
              <PhoneMock tilt={0}>
                <DashboardScreen />
              </PhoneMock>
            </div>
            <div className="absolute -right-4 bottom-6 hidden sm:block" style={{ ["--float-rotate" as string]: "5deg" }}>
              <div className="animate-hover-float [animation-delay:1.5s]">
                <div className="w-32 scale-[0.62] origin-bottom-right">
                  <PhoneMock tilt={6}>
                    <NotificationsScreen />
                  </PhoneMock>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-auto max-w-7xl" />

      {/* THE TWO STAGES */}
      <section id="stages" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold">One ladder, two stages</h2>
          <p className="mt-4 text-muted-foreground">
            Cash flow first, ownership second. You cannot skip the proof — you can only pay to bypass it, and even then
            DBI keeps a real stake in your success.
          </p>
        </Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {STAGES.map((s, i) => (
            <Reveal key={s.short} delay={i * 120} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition hover:border-gold hover:shadow-regal">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-gold/15 to-transparent blur-3xl transition-opacity group-hover:opacity-150" />
              <div className="relative">
                <div className="text-[10px] tracking-[0.25em] text-gold-deep">{s.tag} · {s.short}</div>
                <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold">{s.name}</h3>
                <p className="mt-4 text-sm text-muted-foreground">{s.body}</p>
                <div className="mt-6 space-y-3">
                  {s.points.map((p) => (
                    <div key={p} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-deep" />
                      <span className="text-muted-foreground">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* INSIDE THE APP — mobile screens */}
      <section id="app" className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] tracking-[0.25em] text-gold">
              <Smartphone className="h-3 w-3" /> In your pocket, every day
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold">
              This isn't a course library. It's a <span className="text-gold">command center.</span>
            </h2>
            <p className="mt-5 text-primary-foreground/80">
              Every screen inside DBI Citadel exists to answer one question: is this beneficiary moving today?
              Built mobile-first — because the work happens between meetings, not at a desk.
            </p>
          </Reveal>

          <div className="mt-16 -mx-6 flex snap-x snap-mandatory gap-8 overflow-x-auto px-6 pb-6 md:mx-0 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-14 md:overflow-visible md:px-0 md:pb-0">
            {APP_SCREENS.map((s, i) => (
              <Reveal key={s.t} delay={i * 100} className="flex w-[230px] shrink-0 flex-col items-center gap-5 md:w-auto">
                <PhoneMock tilt={s.tilt}>
                  <s.Screen />
                </PhoneMock>
                <div className="text-center">
                  <div className="font-display text-lg font-semibold">{s.t}</div>
                  <p className="mt-1 max-w-[220px] text-xs text-primary-foreground/70">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: Gauge, t: "Real-time velocity", d: "Days to first close, outreach volume and weekly revenue, tracked without a spreadsheet in sight." },
              { icon: Bell, t: "One notification centre", d: "Every push the app fires — escalations, mentorship, BPS, DFY, payments — logged in-app, even if you missed the toast." },
              { icon: Timer, t: "Accountability with teeth", d: "Escalation bands, cadence tracking, and a founder-vetted path — the cadence is the curriculum." },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl border border-gold/30 bg-primary-foreground/5 p-6 transition hover:border-gold/60">
                <b.icon className="h-7 w-7 text-gold" />
                <h3 className="mt-4 font-display text-lg font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75">{b.d}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-10 rounded-2xl border border-gold/30 bg-primary-foreground/5 p-6">
            <div className="text-[10px] tracking-[0.25em] text-gold">
              The Practice of Enterprise · every DSE &amp; SUC participant
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Twelve topics, six movements, run on a twelve-week cycle
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/75">
              One video a week, always due Monday. Week 13 returns to the top and the cycle repeats — durable
              principles worth revisiting, not a course you finish once and move past.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {TPE_MOVEMENTS.map((m, i) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1.5 text-xs text-primary-foreground/75"
                >
                  <span className="font-semibold text-gold">{i + 1}.</span> {m}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* STAGE 1 — THE SEVEN SYSTEMS */}
      <section id="dse" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] tracking-[0.25em] text-gold-deep">
            <Compass className="h-3 w-3" /> Stage 1 · choose one · 24 hours to decide
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold">
            The <span className="text-gold-gradient">seven systems</span> of Digital Systems Engineering.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Seven separate markets, by design. Every beneficiary runs exactly one — which keeps DBI students out of
            each other's territory and gives each of you a lane wide enough to actually win in. Pick by mechanism,
            not by whichever number looks biggest: the system whose daily work you would happily do hundreds of times
            is the one you will still be running in year three.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SEVEN_SYSTEMS.map((p, i) => (
            <Reveal key={p.t} delay={(i % 3) * 90} className="rounded-2xl border border-border bg-card p-6 transition hover:border-gold hover:shadow-regal">
              <div className="text-3xl leading-none">{p.emoji}</div>
              <div className="mt-4 font-display text-lg font-semibold">{p.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] tracking-widest">
                <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">{p.tool}</span>
                <span className="rounded-full border border-gold/60 px-2.5 py-0.5 text-gold-deep">{p.price}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-gold/30 bg-accent/10 p-6">
            <div className="text-[10px] tracking-[0.25em] text-gold-deep">The proof rule</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Prove your skill on material you made yourself — a dummy store, practice episodes, a ghostwritten
              persona, a self-recorded mock call. Never free work for a live prospect: it reads as common and trains
              buyers to expect it. The only exception is a relationship that already carries real trust.
            </p>
          </Reveal>
          <Reveal delay={80} className="rounded-2xl border border-gold/30 bg-accent/10 p-6">
            <div className="text-[10px] tracking-[0.25em] text-gold-deep">Honest briefings</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Before you commit, each system opens a full briefing — and now a warning dialog too, so a first choice
              is never made without understanding what it means. No path is sold to you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* STAGE 2 — SUC */}
      <section id="suc" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal className="max-w-3xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Stage 2 — fourteen ways to own something</h2>
            <p className="mt-4 text-muted-foreground">
              The Start-up Catalyst narrows fourteen paths to one in two clean steps: first the track, then the path. The
              Compounder builds something that grows in value without proportional labour. The Proprietor builds something
              real and stakes a name on it being trustworthy. Neither is the fallback.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal className="rounded-2xl border border-border bg-background p-7">
              <div className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-gold-deep" />
                <h3 className="font-display text-2xl font-bold">The Compounder</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Digital products, valued on retention and recurring revenue.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {COMPOUNDER.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                    <span className="text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100} className="rounded-2xl border border-border bg-background p-7">
              <div className="flex items-center gap-3">
                <Store className="h-6 w-6 text-gold-deep" />
                <h3 className="font-display text-2xl font-bold">The Proprietor</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Traditional businesses, valued on owned earnings and verified trust.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {PROPRIETOR.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                    <span className="text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal className="mt-8 rounded-2xl border border-gold/40 bg-accent/20 p-6">
            <div className="text-[10px] tracking-[0.25em] text-gold-deep">Ten stages, then the fork</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Design · Structure · Optimize · Test · Presence · Launch · Content · Ecosystem · Valuation · The Fork.
              Luxury access is decided type by type, not by track: it is reachable where a sale is relationship-brokered
              or structurally scarce, and it is not where the market compares you on a platform.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ECONOMICS */}
      <section id="economics" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal className="max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold">The economics, stated plainly</h2>
          <p className="mt-4 text-muted-foreground">
            DBI is aligned with your earnings, not your enrolment. Nothing here is hidden until after you are inside —
            every fee is payable, and every receipt is kept, right inside the app.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {ECONOMICS.map((e, i) => (
            <Reveal key={e.t} delay={(i % 2) * 100} className="rounded-2xl border border-border bg-card p-6 transition hover:border-gold hover:-translate-y-1">
              <e.icon className="h-7 w-7 text-gold-deep" />
              <h3 className="mt-4 font-display text-lg font-semibold">{e.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{e.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RANKS */}
      <section id="ranks" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold">The five ranks of a beneficiary</h2>
            <p className="mt-4 text-muted-foreground">XP is earned only where it counts. No shortcuts, no padding.</p>
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-5">
            {RANKS.map((r, i) => (
              <Reveal key={r.name} delay={i * 90} className="rounded-xl border border-border bg-background p-5 text-center transition hover:-translate-y-1 hover:border-gold hover:shadow-regal">
                <div className="text-xs text-muted-foreground">Rank {i + 1}</div>
                <r.icon className={`mx-auto mt-3 h-10 w-10 ${r.color}`} />
                <div className="mt-3 font-display text-lg font-semibold">{r.name}</div>
                <p className="mt-2 text-xs text-muted-foreground">{r.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* A DAY IN THE CITADEL */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal className="max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold">A day inside the Citadel</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {[
            { icon: LayoutDashboard, t: "Morning", d: "Open the dashboard. Yesterday, today and tomorrow's missions are already waiting." },
            { icon: MessageSquare, t: "Midday", d: "Run outreach from the scripts. Log leads. Score the gaps you find." },
            { icon: Calculator, t: "Afternoon", d: "Model a prospect's revenue leak in the calculator and send the branded PDF." },
            { icon: CheckCircle2, t: "Evening", d: "Tick the day's tasks, hit save, and watch the day seal gold on your calendar." },
          ].map((s, i) => (
            <Reveal key={s.t} delay={i * 90} className="rounded-2xl border border-border bg-card p-6 transition hover:border-gold">
              <s.icon className="h-7 w-7 text-gold-deep" />
              <div className="mt-4 text-[10px] tracking-widest text-gold-deep">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* GROUP — DFG, DBI, BEF */}
      <section id="group" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold">One group, three houses</h2>
              <p className="mt-4 text-muted-foreground">
                DBI does not stand alone. It answers to a parent and works alongside a sister foundation — three
                distinct bodies, each with its own mandate.
              </p>
            </Reveal>
            <Reveal delay={100} className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold/20 via-transparent to-crimson/20 blur-2xl animate-drift" />
              <img
                src={dbiHero}
                alt="DBI — D'Famocious Business Incubator, with D'Famocious Group and Blazer Empowerment Foundation"
                className="relative mx-auto w-full max-w-sm drop-shadow-2xl"
              />
            </Reveal>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {GROUP.map((g, i) => (
              <Reveal key={g.t} delay={i * 100} className="rounded-2xl border border-border bg-background p-7 transition hover:border-gold hover:-translate-y-1">
                <g.icon className="h-8 w-8 text-gold-deep" />
                <div className="mt-4 text-[10px] tracking-[0.25em] text-gold-deep">{g.tag}</div>
                <h3 className="mt-2 font-display text-xl font-bold">{g.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{g.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BEF's INITIATIVES + BLAZER VALUES */}
      <section id="bef" className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] tracking-[0.25em] text-gold">
              <HeartHandshake className="h-3 w-3" /> Blazer Empowerment Foundation
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold">
              BEF works through <span className="text-gold">named initiatives</span>.
            </h2>
            <p className="mt-5 text-primary-foreground/80">
              The Foundation does not run programmes itself. It holds the mandate, identity and values, and
              operates through initiatives built to carry them out — intervening before income freedom, where
              potential is most fragile.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {INITIATIVES.map((i, idx) => (
              <Reveal key={i.t} delay={idx * 100} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6">
                <span className="inline-flex items-center rounded-full border border-gold/50 px-2.5 py-0.5 text-[10px] tracking-widest text-gold">
                  {i.s}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{i.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75">{i.d}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 max-w-3xl">
            <div className="text-[10px] tracking-[0.25em] text-gold">Accende Potentiam</div>
            <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold">The B.L.A.Z.E.R. values</h3>
            <p className="mt-3 text-sm text-primary-foreground/75">
              Six values BEF measures every initiative, and every beneficiary, against.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BLAZER.map((b, i) => (
              <Reveal key={b.l} delay={i * 80} className="rounded-2xl border border-gold/30 bg-primary-foreground/5 p-5 transition hover:border-gold/60">
                <div className="font-display text-3xl font-bold text-gold">{b.l}</div>
                <div className="mt-2 font-semibold">{b.t}</div>
                <p className="mt-1 text-sm text-primary-foreground/75">{b.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section id="founder" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal className="relative">
            <div className="absolute -inset-3 rounded-full bg-gradient-gold opacity-30 blur-2xl" />
            <img src={founderAsset} alt="Boluwatife Famokunwa, founder of D'Famocious Group" className="relative mx-auto w-full max-w-md rounded-2xl border border-gold object-cover shadow-regal" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display text-4xl md:text-5xl font-bold">From the founder</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              "DBI exists because talent without an arena is wasted talent. We are not selling courses. We admit
              beneficiaries into an incubator, teach them to earn first, and then hand them the machinery to own
              something that outlives the work."
            </p>
            <p className="mt-4 font-display font-semibold">Boluwatife Famokunwa</p>
            <p className="text-sm text-muted-foreground">Founder, D'Famocious Group</p>
            <div className="mt-8 flex items-center gap-4">
              <DfgMark className="h-14 w-14" />
              <div className="text-xs leading-relaxed tracking-widest text-muted-foreground">
                A subsidiary of<br />
                <span className="font-semibold text-foreground">D'Famocious Group</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-royal text-primary-foreground">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl animate-drift" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] tracking-[0.25em] text-gold">
              <Sparkles className="h-3 w-3" /> The gate is open
            </span>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold">The gate opens to those who apply.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
              Fill in your details and pay the DSE entry fee — your account is created the moment payment is confirmed,
              and the founder assigns your cohort. Already invited by an admin? Your invitation is in your inbox.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 text-base font-semibold text-onyx shadow-regal transition hover:bg-gold-soft">
                <Shield className="h-5 w-5" /> Apply for DSE Entry
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-8 py-4 text-base font-semibold transition hover:bg-primary-foreground/10">
                <Lock className="h-5 w-5" /> Beneficiary Login
              </Link>
            </div>
            <div className="mt-14">
              <Motto className="text-gold" />
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-3">
            <DfgMark className="h-8 w-8" />
            <span>© {new Date().getFullYear()} D'Famocious Group. All rights reserved.</span>
          </div>
          <span>Registered in Nigeria · D'Famocious Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
