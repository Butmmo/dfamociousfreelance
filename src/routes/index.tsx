import { createFileRoute, Link } from "@tanstack/react-router";
import { DfsMark, DfgMark, Motto } from "@/components/dfs/Brand";
import dfsCombined from "@/assets/dfs_logo_nobg.png.asset.json";
import founderAsset from "@/assets/founder.jpg.asset.json";
import {
  Crown, Shield, Target, Flame, BookOpen, TrendingUp, Globe, Calendar, Lock, Award,
  Calculator, LayoutDashboard, LineChart, Users, Bell, CheckCircle2, Mail, Sparkles,
  MessageSquare, Bot, Star, Timer, ArrowRight, Gauge, FileDown, Repeat,
} from "lucide-react";

const DESC =
  "An invitation-only training citadel by D'Famocious Group. Playbooks, a 45-day forge, XP ranks, live escalation tracking, The Ascent high-ticket program, and AI-powered client tooling.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DFS — The D'Famocious Freelance Scholarship" },
      { name: "description", content: DESC },
      { property: "og:title", content: "DFS — The D'Famocious Freelance Scholarship" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  { icon: Target, title: "Niche Mastery", desc: "One niche, one city. Depth closes deals." },
  { icon: Globe, title: "Global Markets", desc: "USA, UK, Canada, Australia & the diaspora corridors." },
  { icon: Flame, title: "The 45-Day Forge", desc: "From zero arsenal to first closed client." },
  { icon: TrendingUp, title: "Scale & Systems", desc: "Automations, retainers, and durable income." },
];

const PLAYBOOKS = [
  {
    icon: Globe,
    tag: "The Worldwide Machine",
    title: "Global Freelance Playbook",
    body: "Seven countries, twelve niches, positioning and pricing tiers — plus the modern stack: Go High Level, Lovable, Notion, Make, n8n and Klaviyo.",
  },
  {
    icon: Target,
    tag: "From Google Maps to Closed Deal",
    title: "SMB Prospecting Guide",
    body: "Exact search terms per niche, hot / cold signal scoring, and the outreach motion that turns a map pin into a booked call.",
  },
  {
    icon: Flame,
    tag: "The Closer's Arsenal",
    title: "Grand Slam Offer System",
    body: "Lead scoring with review-gap signals, offer construction, and the value ladder that carries a client from first invoice to retainer.",
  },
  {
    icon: Calendar,
    tag: "From Zero to First Client",
    title: "45-Day Implementation Playbook",
    body: "Day-by-day execution across seven weeks: lead research via Google → LinkedIn → ContactOut, the Gap/Leak/Lift/Breakup email sequence, and the upsell ladder.",
  },
  {
    icon: Calculator,
    tag: "Powered by Claude AI",
    title: "SMB Performance Calculator",
    body: "Enter a prospect's numbers, surface their revenue leak, and export a branded PDF — per tab or the full report — to send with your pitch.",
  },
];

const SYSTEMS = [
  { icon: LayoutDashboard, t: "The Dashboard", d: "Rank, XP, streaks, and your Yesterday / Today / Tomorrow missions the moment you log in." },
  { icon: Calendar, t: "45-Day Calendar", d: "A sealing day-grid plus a full monthly view. Days seal automatically as tasks complete — or seal them by hand." },
  { icon: LineChart, t: "The Report", d: "Escalation score dial, cadence heatstrips, velocity to first close, and mentor check-in notes surfaced to you." },
  { icon: Users, t: "The Council", d: "Admins add beneficiaries, get assigned as mentors, log check-ins, and unlock gated programs." },
  { icon: Bell, t: "Escalation Engine", d: "Fewer than 6 active days in 7 triggers a ₦2,500 notice. Fewer than 5 in 14 triggers ₦7,000 and a suspension notice." },
  { icon: Mail, t: "Report Cadence", d: "Weekly progress emails to beneficiaries, cohort digests to admins, and the full Citadel report to the founder." },
];

const ASCENT_TABS = [
  "Start Here", "Pick Your Lane", "Scout", "45 Days", "Scripts", "Mastery", "Toolkit", "Day 46+",
];

const RANKS = [
  { name: "Recruit", icon: Shield, color: "text-muted-foreground", desc: "Day 1. Arsenal armed." },
  { name: "Operator", icon: Target, color: "text-chart-1", desc: "First demo, first 100 leads." },
  { name: "Closer", icon: TrendingUp, color: "text-gold-deep", desc: "First paid client." },
  { name: "Lion", icon: Flame, color: "text-crimson", desc: "Mentorship privileges. Five clients." },
  { name: "Crown", icon: Crown, color: "text-gold", desc: "Council seat. Pass the torch." },
];

const OFFER_LADDER = [
  { icon: Star, t: "Google Review Automation", d: "The single product every beneficiary sells first. One offer, mastered — closed again and again until the pitch is muscle memory." },
  { icon: Bot, t: "Speed-to-Lead + AI Receptionist", d: "Upsell one: catch every call and form that arrives while the owner is on a job, and book it automatically." },
  { icon: Sparkles, t: "Website / App Rebuild", d: "Upsell two: once traffic is flowing, rebuild the destination so visitors actually convert." },
  { icon: Repeat, t: "Retainer & Referral Engine", d: "The endgame — recurring revenue and clients who introduce you to their network." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-md bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <DfsMark className="h-10 w-10" />
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-wider">DFS</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">D'Famocious Freelance Scholarship</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="#pillars" className="hover:text-primary transition">The Citadel</a>
            <a href="#playbooks" className="hover:text-primary transition">Playbooks</a>
            <a href="#systems" className="hover:text-primary transition">Systems</a>
            <a href="#ascent" className="hover:text-primary transition">The Ascent</a>
            <a href="#ranks" className="hover:text-primary transition">Ranks</a>
            <a href="#founder" className="hover:text-primary transition">Founder</a>
          </nav>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal"
          >
            <Lock className="h-4 w-4" /> Beneficiary Login
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-royal opacity-[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.13_80/0.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Motto />
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05]">
              The citadel for the next generation of{" "}
              <span className="text-gold-gradient">Digital Systems Engineers</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              An invitation-only scholarship by D'Famocious Group. Five playbooks, a sealing 45-day calendar,
              an XP rank ladder, a live escalation engine, AI-powered client tooling, and a gated high-ticket
              program — all in one command centre.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal">
                <Shield className="h-5 w-5" /> Enter as Beneficiary
              </Link>
              <a href="#systems" className="inline-flex items-center gap-2 rounded-md border border-gold px-6 py-3 text-base font-semibold hover:bg-accent/40 transition">
                <BookOpen className="h-5 w-5" /> Tour the Citadel
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              {[
                { n: "5", l: "Playbooks" },
                { n: "45", l: "Day forge" },
                { n: "5", l: "Ranks" },
                { n: "24/7", l: "Tracking" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card px-4 py-3">
                  <div className="font-display text-2xl font-bold text-gold-deep">{s.n}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold/20 via-transparent to-crimson/20 blur-2xl" />
            <img src={dfsCombined.url} alt="DFS — D'Famocious Freelance Scholarship, a D'Famocious Group institution" className="relative mx-auto w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <div className="gold-divider mx-auto max-w-7xl" />

      {/* PILLARS */}
      <section id="pillars" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">Four pillars of the scholarship</h2>
          <p className="mt-4 text-muted-foreground">The DFS Constitution mandates four interlocking systems every beneficiary must master.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p) => (
            <div key={p.title} className="group rounded-xl border border-border bg-card p-6 hover:border-gold hover:shadow-regal transition">
              <p.icon className="h-8 w-8 text-gold-deep group-hover:text-primary transition" />
              <h3 className="mt-4 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLAYBOOKS */}
      <section id="playbooks" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <Motto />
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">Five playbooks. One curriculum.</h2>
            <p className="mt-4 text-muted-foreground">
              Every playbook is interactive. Tick a task, hit save, and your progress is written to the Citadel —
              feeding your rank, your calendar, and the council's view of your week.
            </p>
          </div>
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {PLAYBOOKS.map((p, i) => (
              <div key={p.title} className={`relative overflow-hidden rounded-2xl border border-border bg-background p-6 hover:border-gold hover:shadow-regal transition ${i === 4 ? "md:col-span-2" : ""}`}>
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-gold/15 to-transparent blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className="rounded-xl border border-gold/30 bg-accent/30 p-3 shrink-0">
                    <p.icon className="h-6 w-6 text-gold-deep" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gold-deep">{p.tag}</div>
                    <h3 className="mt-1 font-display text-xl font-bold">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEMS */}
      <section id="systems" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The Citadel runs on systems, not motivation</h2>
          <p className="mt-4 text-muted-foreground">
            Every screen inside DFS exists to answer one question: is this beneficiary moving today?
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SYSTEMS.map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 hover:border-gold transition">
              <div className="flex items-center gap-3">
                <s.icon className="h-6 w-6 text-gold-deep" />
                <h3 className="font-display text-lg font-semibold">{s.t}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { icon: Gauge, t: "Real-time velocity", d: "Days to first close, outreach volume and weekly revenue, tracked without a spreadsheet in sight." },
            { icon: FileDown, t: "Branded PDF exports", d: "Every calculator report exports with the DFS crest, D'Famocious Group and Claude AI attribution." },
            { icon: Timer, t: "Accountability with teeth", d: "Miss the weekly report and a ₦2,500 notice is issued. The cadence is the curriculum." },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-gold/40 bg-accent/20 p-6">
              <b.icon className="h-7 w-7 text-gold-deep" />
              <h3 className="mt-4 font-display text-lg font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE ASCENT */}
      <section id="ascent" className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">
                <Lock className="h-3 w-3" /> Gated · Super-admin access only
              </span>
              <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold">
                The Ascent — <span className="text-gold">high-ticket sales</span>, as its own citadel.
              </h2>
              <p className="mt-5 text-primary-foreground/80">
                Not a tab. A second application. The Ascent carries its own dashboard, curriculum, 45-day calendar,
                report and council — with a dedicated rank ladder and mission set for beneficiaries who have earned
                the right to sell at the top of the market.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {ASCENT_TABS.map((t) => (
                  <span key={t} className="rounded-full border border-primary-foreground/25 px-3 py-1 text-xs text-primary-foreground/90">{t}</span>
                ))}
              </div>
              <p className="mt-8 text-sm text-gold">Unlocked one beneficiary at a time, by the founder, from the Council.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: LayoutDashboard, t: "Ascent Dashboard", d: "Rank progress, total XP, and your next five pending missions." },
                { icon: BookOpen, t: "Full Curriculum", d: "Eight sub-tabs, preserved exactly as authored — lanes, scouting, scripts, mastery." },
                { icon: Calendar, t: "Ascent Calendar", d: "A separate 45-day mission grid that never mixes with your Citadel work." },
                { icon: LineChart, t: "Ascent Report", d: "Activity heatstrip, cadence band from Elite to At-Risk, and phase breakdown." },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5">
                  <c.icon className="h-6 w-6 text-gold" />
                  <div className="mt-3 font-display font-semibold">{c.t}</div>
                  <p className="mt-1.5 text-sm text-primary-foreground/75">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OFFER LADDER */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">One offer to open. A ladder to grow.</h2>
          <p className="mt-4 text-muted-foreground">
            Beneficiaries lead with a single product — Google Review Automation — until closing it is second nature.
            Everything else is earned revenue from a client who already trusts you.
          </p>
        </div>
        <div className="mt-14 grid md:grid-cols-4 gap-6">
          {OFFER_LADDER.map((o, i) => (
            <div key={o.t} className="relative rounded-2xl border border-border bg-card p-6 hover:border-gold transition">
              <div className="text-xs text-muted-foreground">Step {i + 1}</div>
              <o.icon className="mt-3 h-8 w-8 text-gold-deep" />
              <h3 className="mt-4 font-display text-lg font-semibold">{o.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{o.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PATH */}
      <section id="path" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Motto />
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The 45-Day Path</h2>
              <p className="mt-4 text-muted-foreground">
                A precise, day-by-day forge. Day 1 arms your arsenal — Lovable, Notion, ContactOut, Go High Level.
                By day 45 you have a client, an invoice and a testimonial.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Prospect research: Google → LinkedIn → ContactOut",
                  "The four-email sequence: Gap, Leak, Lift, Breakup",
                  "Lead scoring with review-gap and response-rate signals",
                  "Weekly report filed every Sunday — outreach, calls, wins, revenue",
                ].map((l) => (
                  <div key={l} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-gold-deep shrink-0" />
                    <span className="text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ol className="space-y-6">
              {[
                { w: "Week 1", t: "Build Your Foundation", d: "Tools, niche, two demos, portfolio live." },
                { w: "Weeks 2–3", t: "Go to Market", d: "Outreach, demos, qualified conversations." },
                { w: "Weeks 4–5", t: "Close & Deliver", d: "First client. First invoice. First testimonial." },
                { w: "Week 6+", t: "Scale & Retain", d: "Retainers, referrals, systems." },
              ].map((s, i) => (
                <li key={s.w} className="flex gap-5 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-royal text-gold flex items-center justify-center font-display font-bold text-lg shadow-regal">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gold-deep">{s.w}</div>
                    <div className="font-display text-xl font-semibold">{s.t}</div>
                    <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* RANK TIERS */}
      <section id="ranks" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The five ranks of a beneficiary</h2>
          <p className="mt-4 text-muted-foreground">
            XP is earned only where it counts — through the 45-Day Implementation Playbook. No shortcuts, no padding.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
          {RANKS.map((r, i) => (
            <div key={r.name} className="rounded-xl border border-border bg-card p-5 text-center hover:border-gold transition">
              <div className="text-xs text-muted-foreground">Rank {i + 1}</div>
              <r.icon className={`h-10 w-10 mx-auto mt-3 ${r.color}`} />
              <div className="mt-3 font-display text-lg font-semibold">{r.name}</div>
              <p className="text-xs text-muted-foreground mt-2">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKING SYSTEMS */}
      <section className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Calendar, t: "Synced to your calendar", d: "Every day's tasks land on your calendar. Reminders fire. Check-ins schedule themselves." },
              { icon: Award, t: "Weekly cadence & XP", d: "Earn XP per task. Promote tiers by hitting weekly KPIs. Fall behind and the council is notified." },
              { icon: Shield, t: "Real-time escalation", d: "If a beneficiary stalls, mentors are paged automatically. No one is forgotten." },
            ].map((b) => (
              <div key={b.t}>
                <b.icon className="h-12 w-12 mx-auto text-gold" />
                <h3 className="mt-5 font-display text-xl font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/80">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A DAY IN THE CITADEL */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">A day inside the Citadel</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-4 gap-6">
          {[
            { icon: LayoutDashboard, t: "Morning", d: "Open the dashboard. Yesterday, today and tomorrow's missions are already waiting." },
            { icon: MessageSquare, t: "Midday", d: "Run outreach from the scripts. Log leads. Score the review gaps you find." },
            { icon: Calculator, t: "Afternoon", d: "Model a prospect's revenue leak in the calculator and send the branded PDF." },
            { icon: CheckCircle2, t: "Evening", d: "Tick the day's tasks, hit save, and watch the day seal gold on your calendar." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6">
              <s.icon className="h-7 w-7 text-gold-deep" />
              <div className="mt-4 text-[10px] uppercase tracking-widest text-gold-deep">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER */}
      <section id="founder" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-gold opacity-30 blur-2xl rounded-full" />
              <img src={founderAsset.url} alt="Boluwatife Famokunwa, founder of D'Famocious Group" className="relative rounded-2xl border border-gold shadow-regal w-full max-w-md mx-auto object-cover" />
            </div>
            <div>
              <Motto />
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">From the founder</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                "DFS exists because talent without an arena is wasted talent. We are not selling courses.
                We are admitting beneficiaries into a citadel — and we expect them to graduate as engineers
                capable of building, selling, and scaling digital systems for businesses anywhere on earth."
              </p>
              <p className="mt-4 font-display font-semibold">Boluwatife Famokunwa</p>
              <p className="text-sm text-muted-foreground">Founder, D'Famocious Group</p>
              <div className="mt-8 flex items-center gap-4">
                <DfgMark className="h-14 w-14" />
                <div className="text-xs uppercase tracking-widest text-muted-foreground leading-relaxed">
                  A subsidiary of<br />
                  <span className="text-foreground font-semibold">D'Famocious Group</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The gate opens by invitation.</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            DFS is closed to public sign-up. If your email has been registered by an admin, your invitation is already
            in your inbox — use it to set your password and step inside.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal">
              <Lock className="h-5 w-5" /> Beneficiary Login
            </Link>
            <a href="#playbooks" className="inline-flex items-center gap-2 rounded-md border border-gold px-8 py-4 text-base font-semibold hover:bg-accent/40 transition">
              See what's inside <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <DfgMark className="h-8 w-8" />
            <span>© {new Date().getFullYear()} D'Famocious Group. All rights reserved.</span>
          </div>
          <Motto />
          <span>Registered in Nigeria · D'Famocious Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
