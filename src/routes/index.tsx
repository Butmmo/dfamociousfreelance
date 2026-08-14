import { createFileRoute, Link } from "@tanstack/react-router";
import { DbiMark, DfgMark, Motto } from "@/components/dfs/Brand";
import dbiHero from "@/assets/dbi_hero.png.asset.json";
import founderAsset from "@/assets/founder.jpg.asset.json";
import {
  Crown, Shield, Target, Flame, TrendingUp, Calendar, Lock, Award,
  Calculator, LayoutDashboard, LineChart, Users, Bell, CheckCircle2, Mail,
  MessageSquare, Timer, ArrowRight, Gauge, FileDown, Compass, Layers, Store,
  Banknote, GraduationCap, Building2, HeartHandshake,
} from "lucide-react";

const DESC =
  "D'Famocious Business Incubator — an invitation-only, two-stage incubator by D'Famocious Group. Stage 1: Digital Systems Engineering, seven client-acquisition systems. Stage 2: The Start-up Catalyst, fourteen paths to an owned business.";

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

const SYSTEMS = [
  { icon: LayoutDashboard, t: "The Dashboard", d: "Rank, XP, streaks, and your Yesterday / Today / Tomorrow missions the moment you log in." },
  { icon: Calendar, t: "45-Day Calendar", d: "A sealing day-grid plus a full monthly view. Days seal as tasks complete — or seal them by hand." },
  { icon: LineChart, t: "The Report", d: "Escalation score dial, cadence heatstrips, velocity to first close, and DSE Rep check-in notes." },
  { icon: Users, t: "The Council", d: "Admins add beneficiaries, get assigned as DSE Reps, log check-ins, and unlock gated programmes." },
  { icon: Bell, t: "Escalation Engine", d: "Fewer than 6 active days in 7 triggers a $5 notice. Fewer than 10 in 14 triggers $10 and a suspension notice." },
  { icon: Mail, t: "Report Cadence", d: "Weekly progress emails to beneficiaries, cohort digests to admins, and the full Citadel report to the founder." },
];

const ECONOMICS = [
  { icon: GraduationCap, t: "DSE entry — $900", d: "One-time. Or $90 through NBO, the Blazer Empowerment Foundation subsidy built to open the gate to students who could not otherwise reach it." },
  { icon: Banknote, t: "The D'Famocious Year", d: "Once you earn, 20% of every earning month returns to DBI until you complete 12 qualified months — each at $2,000+ net, not necessarily consecutive." },
  { icon: Award, t: "V. DsE. certification", d: "Completing DFY earns the Vetted Digital Systems Engineer credential — the mark that Stage 1 was finished on real income, not attendance." },
  { icon: Layers, t: "The SUC ladder", d: "$2,000 by invitation, once DSE has produced $450k and five mentees carried through their own DFY. Skipping DSE costs $6,000 at 25% equity, or $24,000 with DBI's stake reduced to 10% — a ladder, not a cliff. DBI always keeps a real stake." },
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

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-md bg-background/80">
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
            <a href="#dse" className="hover:text-primary transition">Stage 1 · DSE</a>
            <a href="#suc" className="hover:text-primary transition">Stage 2 · SUC</a>
            <a href="#systems" className="hover:text-primary transition">Inside the Citadel</a>
            <a href="#economics" className="hover:text-primary transition">Economics</a>
            <a href="#group" className="hover:text-primary transition">Group &amp; BEF</a>
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
        <div className="relative mx-auto max-w-7xl px-6 pt-8 pb-16 md:pt-10 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Motto />
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05]">
              We don't teach skills. We incubate{" "}
              <span className="text-gold-gradient">owners</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              D'Famocious Business Incubator runs in two stages. First you become a Digital Systems Engineer and monetise
              one of seven client-acquisition systems until the income is undeniable. Then the Start-up Catalyst turns
              that proof into a business you own — digital or traditional.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal">
                <Shield className="h-5 w-5" /> Enter as Beneficiary
              </Link>
              <a href="#stages" className="inline-flex items-center gap-2 rounded-md border border-gold px-6 py-3 text-base font-semibold hover:bg-accent/40 transition">
                <Compass className="h-5 w-5" /> See the two stages
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              {[
                { n: "2", l: "Stages" },
                { n: "7", l: "DSE systems" },
                { n: "14", l: "SUC paths" },
                { n: "V. DsE.", l: "Credential" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card px-4 py-3">
                  <div className="font-display text-2xl font-bold text-gold-deep">{s.n}</div>
                  <div className="text-[10px] tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold/20 via-transparent to-crimson/20 blur-2xl" />
            <img
              src={dbiHero.url}
              alt="DBI — D'Famocious Business Incubator, with D'Famocious Group and Blazer Empowerment Foundation"
              className="relative mx-auto w-full max-w-md drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      <div className="gold-divider mx-auto max-w-7xl" />

      {/* THE TWO STAGES */}
      <section id="stages" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">One ladder, two stages</h2>
          <p className="mt-4 text-muted-foreground">
            Cash flow first, ownership second. You cannot skip the proof — you can only pay to bypass it, and even then
            DBI keeps a real stake in your success.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {STAGES.map((s) => (
            <div key={s.short} className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:border-gold hover:shadow-regal transition">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-gold/15 to-transparent blur-3xl" />
              <div className="relative">
                <div className="text-[10px] tracking-[0.25em] text-gold-deep">{s.tag} · {s.short}</div>
                <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold">{s.name}</h3>
                <p className="mt-4 text-sm text-muted-foreground">{s.body}</p>
                <div className="mt-6 space-y-3">
                  {s.points.map((p) => (
                    <div key={p} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-gold-deep shrink-0" />
                      <span className="text-muted-foreground">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STAGE 1 — THE SEVEN SYSTEMS */}
      <section id="dse" className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] tracking-[0.25em] text-gold">
              <Compass className="h-3 w-3" /> Stage 1 · choose one · 24 hours to decide
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold">
              The <span className="text-gold">seven systems</span> of Digital Systems Engineering.
            </h2>
            <p className="mt-5 text-primary-foreground/80">
              Seven separate markets, by design. Every beneficiary runs exactly one — which keeps DBI students out of
              each other's territory and gives each of you a lane wide enough to actually win in. Pick by mechanism,
              not by whichever number looks biggest: the system whose daily work you would happily do hundreds of times
              is the one you will still be running in year three.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SEVEN_SYSTEMS.map((p) => (
              <div key={p.t} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6">
                <div className="text-3xl leading-none">{p.emoji}</div>
                <div className="mt-4 font-display text-lg font-semibold">{p.t}</div>
                <p className="mt-2 text-sm text-primary-foreground/75">{p.d}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] tracking-widest">
                  <span className="rounded-full border border-primary-foreground/25 px-2.5 py-0.5 text-primary-foreground/70">{p.tool}</span>
                  <span className="rounded-full border border-gold/60 px-2.5 py-0.5 text-gold">{p.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gold/30 bg-primary-foreground/5 p-6">
              <div className="text-[10px] tracking-[0.25em] text-gold">The proof rule</div>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Prove your skill on material you made yourself — a dummy store, practice episodes, a ghostwritten
                persona, a self-recorded mock call. Never free work for a live prospect: it reads as common and trains
                buyers to expect it. The only exception is a relationship that already carries real trust.
              </p>
            </div>
            <div className="rounded-2xl border border-gold/30 bg-primary-foreground/5 p-6">
              <div className="text-[10px] tracking-[0.25em] text-gold">Honest briefings</div>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Before you commit, each system opens a full briefing: the highs, the lows, how durable the demand really
                is, who you compete against, and a straight answer on whether it suits you. No path is sold to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 2 — SUC */}
      <section id="suc" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">Stage 2 — fourteen ways to own something</h2>
          <p className="mt-4 text-muted-foreground">
            The Start-up Catalyst narrows fourteen paths to one in two clean steps: first the track, then the path. The
            Compounder builds something that grows in value without proportional labour. The Proprietor builds something
            real and stakes a name on it being trustworthy. Neither is the fallback.
          </p>
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-gold-deep" />
              <h3 className="font-display text-2xl font-bold">The Compounder</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Digital products, valued on retention and recurring revenue.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {COMPOUNDER.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-gold-deep shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6 text-gold-deep" />
              <h3 className="font-display text-2xl font-bold">The Proprietor</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Traditional businesses, valued on owned earnings and verified trust.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {PROPRIETOR.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-gold-deep shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-gold/40 bg-accent/20 p-6">
          <div className="text-[10px] tracking-[0.25em] text-gold-deep">Ten stages, then the fork</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Design · Structure · Optimize · Test · Presence · Launch · Content · Ecosystem · Valuation · The Fork.
            Luxury access is decided type by type, not by track: it is reachable where a sale is relationship-brokered
            or structurally scarce, and it is not where the market compares you on a platform.
          </p>
        </div>
      </section>

      {/* ECONOMICS */}
      <section id="economics" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <Motto />
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The economics, stated plainly</h2>
            <p className="mt-4 text-muted-foreground">
              DBI is aligned with your earnings, not your enrolment. Nothing here is hidden until after you are inside.
            </p>
          </div>
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {ECONOMICS.map((e) => (
              <div key={e.t} className="rounded-2xl border border-border bg-background p-6 hover:border-gold transition">
                <e.icon className="h-7 w-7 text-gold-deep" />
                <h3 className="mt-4 font-display text-lg font-semibold">{e.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIDE THE CITADEL */}
      <section id="systems" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The Citadel runs on systems, not motivation</h2>
          <p className="mt-4 text-muted-foreground">
            Every screen inside DBI exists to answer one question: is this beneficiary moving today?
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
            { icon: FileDown, t: "Branded PDF exports", d: "Every calculator report exports with the DBI crest, D'Famocious Group and Claude AI attribution." },
            { icon: Timer, t: "Accountability with teeth", d: "Miss the weekly report and a $5 notice is issued. The cadence is the curriculum." },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-gold/40 bg-accent/20 p-6">
              <b.icon className="h-7 w-7 text-gold-deep" />
              <h3 className="mt-4 font-display text-lg font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-gold/40 bg-accent/20 p-6">
          <div className="text-[10px] tracking-[0.25em] text-gold-deep">
            The Practice of Enterprise · every DSE &amp; SUC participant
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">
            Twelve topics, six movements, run on a twelve-week cycle
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            One video a week, always due Monday. Week 13 returns to the top and the cycle repeats — durable
            principles worth revisiting, not a course you finish once and move past.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TPE_MOVEMENTS.map((m, i) => (
              <span
                key={m}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
              >
                <span className="font-semibold text-gold-deep">{i + 1}.</span> {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* RANKS */}
      <section id="ranks" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Motto />
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The five ranks of a beneficiary</h2>
            <p className="mt-4 text-muted-foreground">XP is earned only where it counts. No shortcuts, no padding.</p>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
            {RANKS.map((r, i) => (
              <div key={r.name} className="rounded-xl border border-border bg-background p-5 text-center hover:border-gold transition">
                <div className="text-xs text-muted-foreground">Rank {i + 1}</div>
                <r.icon className={`h-10 w-10 mx-auto mt-3 ${r.color}`} />
                <div className="mt-3 font-display text-lg font-semibold">{r.name}</div>
                <p className="text-xs text-muted-foreground mt-2">{r.desc}</p>
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
            { icon: MessageSquare, t: "Midday", d: "Run outreach from the scripts. Log leads. Score the gaps you find." },
            { icon: Calculator, t: "Afternoon", d: "Model a prospect's revenue leak in the calculator and send the branded PDF." },
            { icon: CheckCircle2, t: "Evening", d: "Tick the day's tasks, hit save, and watch the day seal gold on your calendar." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6">
              <s.icon className="h-7 w-7 text-gold-deep" />
              <div className="mt-4 text-[10px] tracking-widest text-gold-deep">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GROUP — DFG, DBI, BEF */}
      <section id="group" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">One group, three houses</h2>
          <p className="mt-4 text-muted-foreground">
            DBI does not stand alone. It answers to a parent and works alongside a sister foundation — three
            distinct bodies, each with its own mandate.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {GROUP.map((g) => (
            <div key={g.t} className="rounded-2xl border border-border bg-card p-7 hover:border-gold transition">
              <g.icon className="h-8 w-8 text-gold-deep" />
              <div className="mt-4 text-[10px] tracking-[0.25em] text-gold-deep">{g.tag}</div>
              <h3 className="mt-2 font-display text-xl font-bold">{g.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{g.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEF's INITIATIVES + BLAZER VALUES */}
      <section id="bef" className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
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
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {INITIATIVES.map((i) => (
              <div key={i.t} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6">
                <span className="inline-flex items-center rounded-full border border-gold/50 px-2.5 py-0.5 text-[10px] tracking-widest text-gold">
                  {i.s}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{i.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75">{i.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl">
            <div className="text-[10px] tracking-[0.25em] text-gold">Accende Potentiam</div>
            <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold">The B.L.A.Z.E.R. values</h3>
            <p className="mt-3 text-sm text-primary-foreground/75">
              Six values BEF measures every initiative, and every beneficiary, against.
            </p>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BLAZER.map((b) => (
              <div key={b.l} className="rounded-2xl border border-gold/30 bg-primary-foreground/5 p-5">
                <div className="font-display text-3xl font-bold text-gold">{b.l}</div>
                <div className="mt-2 font-semibold">{b.t}</div>
                <p className="mt-1 text-sm text-primary-foreground/75">{b.d}</p>
              </div>
            ))}
          </div>
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
                "DBI exists because talent without an arena is wasted talent. We are not selling courses. We admit
                beneficiaries into an incubator, teach them to earn first, and then hand them the machinery to own
                something that outlives the work."
              </p>
              <p className="mt-4 font-display font-semibold">Boluwatife Famokunwa</p>
              <p className="text-sm text-muted-foreground">Founder, D'Famocious Group</p>
              <div className="mt-8 flex items-center gap-4">
                <DfgMark className="h-14 w-14" />
                <div className="text-xs tracking-widest text-muted-foreground leading-relaxed">
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
            DBI is closed to public sign-up. If your email has been registered by an admin, your invitation is already
            in your inbox — use it to set your password and step inside.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal">
              <Lock className="h-5 w-5" /> Beneficiary Login
            </Link>
            <a href="#dse" className="inline-flex items-center gap-2 rounded-md border border-gold px-8 py-4 text-base font-semibold hover:bg-accent/40 transition">
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
