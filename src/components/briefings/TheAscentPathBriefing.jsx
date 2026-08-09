import React, { useState } from 'react';
import {
  TrendingUp, AlertTriangle, BarChart3, Globe, Users, CheckCircle2, ShieldCheck, Compass, Zap
} from 'lucide-react';

/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: 'brief', label: 'The Briefing' },
  { id: 'highs', label: 'The Highs' },
  { id: 'lows', label: 'The Lows' },
  { id: 'standout', label: 'Stand Out' },
  { id: 'durability', label: 'Durability' },
  { id: 'competition', label: 'Competition' },
  { id: 'fit', label: 'Your Lane?' },
];

const SNAPSHOT_LABELS = [
  { key: 'entry', label: 'Entry Ease' },
  { key: 'dealSize', label: 'Deal Size' },
  { key: 'competition', label: 'Low Competition' },
  { key: 'durability', label: 'Durability' },
  { key: 'safety', label: 'Safety' },
  { key: 'fit', label: 'Beginner Fit' },
];

// Averaged directly from Pick Lane's six-factor grading across all seven lanes
// (the six in The Ascent plus the 7th Lane in the Global Targeting Manual).
const PATH_SNAPSHOT = { entry: 3, dealSize: 4, competition: 3, durability: 4, safety: 3, fit: 3 };

const HIGHS = [
  { title: 'Zero capital to start',
    body: `No inventory, no ad spend, no paid course required to get in the door. The system this briefing sits in front of is built to run on $0 — paid tools show up only as accelerants, never requirements.` },
  { title: 'Paid on outcome, not on hours',
    body: `Commission-based pay means your ceiling isn't set by a manager's budget for your role — it's set by how much you close and how often. Nobody caps a good month.` },
  { title: 'The skill outlives any one seat',
    body: `Lose a contract and you keep the thing that got you it: the ability to scout, pitch, and run a call. A dropshipping store built around one supplier or one ad account doesn't survive that same kind of loss nearly as easily.` },
  { title: 'A real, independently-tracked pay ceiling',
    body: `Glassdoor, ZipRecruiter, and Salary.com all show a genuine high-earning tier for this exact job title — not just a recruiter's income screenshot. (How much these trackers disagree with each other is in Durability — read that part closely too.)` },
  { title: 'No degree, license, or portfolio gate — mostly',
    body: `Outside a few specific lanes (funding, real estate, trading — each flagged in Pick Lane), nobody's checking credentials. What gets you considered is proof you can run a call, not a diploma.` },
  { title: 'Remote by default',
    body: `Every lane in this system assumes you're working from wherever you already are. Your address has never mattered less to an employer than it does in this specific role.` },
];

const LOWS = [
  { title: '100% commission, most of the time',
    body: `No seat, no close, no pay — for most roles in this space there's no salary floor cushioning a slow month. The 45-Day System doesn't pretend otherwise: most people aren't earning, or even placed yet, on Day 1.` },
  { title: `The ramp is real, and it isn't instant`,
    body: `Even once you're placed, the first 30 days in a seat are built to be inconsistent — real stabilization lands around 60–90 days in. Anyone telling a Day-1 beginner to expect ceiling-level income in month one is selling something other than an honest career.` },
  { title: 'This exact space has a documented scam history',
    body: `Over the past few years the FTC has sued and settled with multiple "become a closer" and business-coaching operations for guaranteed, no-experience-needed income claims that didn't hold up — returning millions of dollars combined to the people who bought in. That history is exactly why every seat, not just the first one that says yes to you, needs vetting.` },
  { title: `Rejection is the job, not a sign something's wrong`,
    body: `Outbound scouting means most contacts don't respond and most calls don't close. That's the normal shape of this work, every week, indefinitely — not a signal to fix your approach after one bad day.` },
  { title: 'A few lanes carry real regulatory or reputational exposure',
    body: `Trading and signal-based offers draw increasing regulatory attention; funding and real-estate roles can shade into activity that legally requires a license you don't hold. Pick Lane's "Watch Out" notes exist specifically for this.` },
  { title: 'No employer safety net',
    body: `This is independent-contractor work in almost every seat: no health coverage, no paid leave, no employer-side tax handling. Budget and file for that reality wherever you're based.` },
  { title: `You're never fully off`,
    body: `The pipeline goes cold the moment you stop feeding it — even after you land a seat. Staying in this career means scouting lightly forever, not just for 45 days.` },
];

const MODEL_FACTORS = [
  { key: 'capitalLight', label: 'Capital-Light' },
  { key: 'speed', label: 'Speed to First $' },
  { key: 'ceiling', label: 'Income Ceiling' },
  { key: 'ownership', label: 'Ownership Built' },
  { key: 'portability', label: 'Portability' },
];

const MODELS = [
  { id: 'htc', name: 'High-Ticket Closing', capitalLight: 5, speed: 3, ceiling: 4, ownership: 1, portability: 4 },
  { id: 'content', name: 'Content & Creator Monetization', capitalLight: 4, speed: 1, ceiling: 5, ownership: 5, portability: 3 },
  { id: 'ecom', name: 'E-Commerce / Dropshipping', capitalLight: 1, speed: 3, ceiling: 4, ownership: 4, portability: 2 },
  { id: 'freelance', name: 'Freelance Services', capitalLight: 5, speed: 2, ceiling: 3, ownership: 3, portability: 5 },
  { id: 'product', name: 'Build Your Own Product', capitalLight: 3, speed: 1, ceiling: 5, ownership: 5, portability: 4 },
];

const DURABILITY_POINTS = [
  { title: `The underlying market isn't a fad`,
    body: `Trackers disagree hugely on the exact size of the coaching-and-consulting economy this whole system sells into — 2026 estimates run from roughly $5–6 billion (the most conservative, membership-body-sourced numbers) past $40 billion (broader definitions that bundle in corporate coaching platforms). That spread says more about inconsistent methodology than about reality, but nearly every source agrees on direction: it has grown for most of the last decade and keeps expanding as more individual and corporate coaching spend moves online.` },
  { title: `AI is reshaping the role, not (yet) replacing the seat`,
    body: `Current analysis draws a consistent line: AI is rapidly automating the repetitive front end of sales — prospecting, list-building, first-touch outreach — the exact "setter" work this system trains you to route around via direct scouting. What most 2026 analysis says AI still can't reliably do is run the actual high-stakes conversation: multi-stakeholder objection handling and reading real hesitation on a five-figure decision. That's specifically the function this system trains for. Treat that as a current read, not a permanent guarantee — the line between what AI can and can't do here has moved fast for two years running, with no reason to assume it stops.` },
  { title: `Cyclical, not recession-proof`,
    body: `Coaching, consulting, and high-ticket digital services are discretionary spend for the people and businesses buying them. When budgets tighten, this is often one of the first lines cut — which shows up for you as fewer qualified calls and smaller deal sizes, not a graceful slowdown. Durability here means the skill and the broader market outlast a bad quarter, not that any one seat is immune to one.` },
  { title: `Durability varies a lot by lane`,
    body: `Pick Lane's own scoring already reflects this: AI & B2B Implementation scores highest on durability of the seven lanes; Trading scores lowest, tied to real regulatory attention. "High-Ticket Closing" as a category is durable. Any one lane inside it is only as durable as its niche.` },
];

const COMPETITION_POINTS = [
  { title: `Low barrier, both ways`,
    body: `No degree, no license in most lanes, no capital required to try — which is exactly why this attracts a lot of aspirants, including plenty cutting corners with copy-pasted outreach or borrowed testimonials. The real seats — companies with a genuine product, genuine leads, and money to actually pay commission — are properly competed for.` },
  { title: `Competition isn't spread evenly`,
    body: `Pick Lane's own scores already show it: Dating & Relationship Coaching and Content & Personal Branding are the two most crowded lanes of the seven — the widest "guru noise," in Pick Lane's own words. AI & B2B Implementation currently scores as the least crowded, specifically because its technical learning curve keeps most aspiring closers out.` },
  { title: `Credentials don't win here — proof does`,
    body: `A $10,000 "certification" doesn't separate you from the next applicant in a legitimate hirer's eyes; a recorded mock call and a genuinely personalized outreach message do. In a low-barrier field, demonstrated skill is close to the only real moat a beginner has.` },
  { title: `AI is raising the floor on personalization`,
    body: `As generic, AI-templated outreach gets cheaper, more common, and easier for a recipient to spot on sight, the closers who differentiate through real, specific personalization — the bespoke Loom, the detail that proves you actually looked — get a growing edge over mass-blasted competitors. That's becoming the actual competitive line, not a minor nice-to-have.` },
];

const LANE_COMPETITION = [
  { name: 'Credit & Business Funding', score: 3 },
  { name: 'Dating & Relationship Coaching', score: 2 },
  { name: 'Real Estate', score: 3 },
  { name: 'Content & Personal Branding', score: 2 },
  { name: 'Trading & Trading Bots', score: 3 },
  { name: 'AI & B2B AI Implementation', score: 5 },
  { name: 'B2B Agency & Marketing Services', score: 3 },
];

const FIT_CHECKS = [
  `Can you genuinely go 30–60 days on $0 from this path without it wrecking your finances or your morale?`,
  `Are you drawn to conversation and persuasion more than to building, writing, or designing something of your own?`,
  `Can rejection roll off you — dozens of times a week, indefinitely — without it turning personal?`,
  `Do you want to start today with what you already have, more than you want to spend months building an audience or a product first?`,
  `Will you actually run every "seat" through a vetting checklist, even when someone's telling you exactly what you want to hear?`,
];

/* ---------------------------------------------------------------------- */
/* SMALL COMPONENTS — matched to The Ascent's own visual system            */
/* ---------------------------------------------------------------------- */

function CornerMarks() {
  return (
    <>
      <span className="pointer-events-none absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-emerald-700/60" />
      <span className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-emerald-700/60" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-emerald-700/60" />
      <span className="pointer-events-none absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-emerald-700/60" />
    </>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="relative mb-5 pl-4 border-l-2 border-gold/40">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-deep">{eyebrow}</p>
      <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide leading-tight mt-0.5">{title}</h2>
      {sub && <p className="text-sm text-foreground-muted mt-1.5 max-w-2xl">{sub}</p>}
    </div>
  );
}

function ScoreDots({ value }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-gold' : 'bg-accent/40 border border-border'}`} />
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */

function BriefTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Mission Briefing" title="What doorway is this, really?" />
      <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
        Inside DBI (D'Famocious Business Incubator), "Digital Systems Engineering" covers a lot of ground. This is the one door, of the seven, that's a sales role — not a content play, not a storefront, not a product build. You learn a structured way to run a sales conversation, then get hired, almost always on commission, by an online coach, consultant, or agency to close their qualified leads into paying clients. <strong className="text-white">The Ascent</strong> — the 45-day system — is how you actually land that seat. This briefing is what comes before it: an honest look at the doorway itself, so choosing it is a decision, not a reflex.
      </p>

      <div className="relative rounded-lg border border-destructive bg-destructive/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-destructive" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-destructive">Read this before your 24 hours are up</p>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          Nobody — inside DBI or outside it — can honestly promise you a number. This exact corner of the internet has a real regulatory paper trail: over the past few years the FTC has sued and settled with multiple "become a closer" and business-coaching operations for guaranteed, no-experience-needed income claims that didn't hold up, returning millions of dollars combined to the people who bought in. That's not a reason to write this path off — it's a genuine, working career for plenty of people. It's a reason to read every figure in this briefing, and every figure anyone ever gives you in this space, as a range you might reach — never a number owed to you for signing up.
        </p>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-700 mb-2">Path Snapshot</p>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
            {SNAPSHOT_LABELS.map(s => (
              <div key={s.key} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">{s.label}</span>
                <ScoreDots value={PATH_SNAPSHOT[s.key]} />
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-foreground-muted mt-2 leading-relaxed">Averaged across all seven lanes graded in Pick Lane and the 7th Lane (Global Targeting Manual) — the specific lane you pick will swing several points in either direction. No lane scores a flat 5 across the board, including this one, averaged. That's the honest picture, not a pitch.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-700 mb-2">How to use this briefing</p>
        <ol className="text-sm text-slate-300 space-y-1.5 leading-relaxed list-decimal list-inside">
          <li>Read all seven tabs once, in order — twenty honest minutes.</li>
          <li>Cross-check anything that surprises you against Pick Lane, the Global Targeting Manual, or the Performance Calculator before you decide.</li>
          <li>If you choose this door, <strong className="text-white">The Ascent</strong> is where Day 1 actually starts.</li>
        </ol>
      </div>
    </div>
  );
}

function HighsTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="What's Real About The Upside" title="The highs" sub="Genuine advantages, not recruiter talk — each one checked against the rest of this system or outside data." />
      <div className="space-y-3">
        {HIGHS.map((h, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-2.5">
              <TrendingUp size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">{h.title}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{h.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LowsTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="What's Real About The Downside" title="The lows" sub="Skip any of these and you're choosing this path with your eyes half-open." />
      <div className="space-y-3">
        {LOWS.map((l, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">{l.title}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{l.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StandoutTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Same Zero Capital, Different Shape" title="What actually makes this stand out" sub={`"Digital income" covers very different bets. Here's this one, lined up honestly against four common alternatives.`} />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="bg-accent/40 text-foreground-muted font-mono uppercase tracking-wide text-[10px]">
              <th className="text-left px-3 py-2 font-medium">Model</th>
              {MODEL_FACTORS.map(f => <th key={f.key} className="text-left px-2 py-2 font-medium whitespace-nowrap">{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m, idx) => (
              <tr key={m.id} className={`${m.id === 'htc' ? 'bg-emerald-700/10' : idx % 2 ? 'bg-card/60' : 'bg-card'} border-t border-border`}>
                <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{m.name}</td>
                {MODEL_FACTORS.map(f => <td key={f.key} className="px-2 py-2.5"><ScoreDots value={m[f.key]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm text-slate-300 leading-relaxed">
          The honest headline: this is one of the only digital paths where you can go from zero capital to a real paycheck without first building an audience, a store, or a product. That speed is real, and it's exactly why this door attracts people who need income sooner rather than later.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          The honest trade-off sits right next to it: at the end of it, you own nothing. No audience, no equity, no product, no IP — every dollar depends on someone else's business staying open and paying you on time, for as long as you keep showing up and closing. A creator or a builder is stacking an asset while they work. A closer is renting out a skill, deal by deal. Neither is wrong. They're different bets on time.
        </p>
      </div>

      <div className="relative rounded-lg border border-gold/40 bg-gold/10 p-4">
        <CornerMarks />
        <p className="text-sm text-slate-200 leading-relaxed">
          This is exactly why Pick Lane's Vetting Checklist and the Global Targeting Manual's Target Scoring exist. When you own nothing but the relationship, who you work for matters more here than in almost any other digital path on this table.
        </p>
      </div>
    </div>
  );
}

function DurabilityTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Volatility Check" title="How durable is the demand, really?" />

      <div className="relative rounded-lg border border-emerald-700 bg-emerald-700/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-emerald-700" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-700">The pay numbers, checked in mid-2026</p>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          Even within a single tracker, the exact phrase you search changes the answer: ZipRecruiter data shows roughly $36K/year for the literal title "High Ticket Closer" in one 2026 pull, but roughly $113K/year for "remote sales closer" the same year. Glassdoor's own number for "High Ticket Sales Closer" sits close to that second figure, near $113K/year; Salary.com lands around $88K. That's close to a 3x spread depending on which of these near-identical titles gets searched — a sign of inconsistent titling and thin, self-reported, commission-heavy data, not a hidden "true" number waiting to be found. Read every income figure in this space, including the ones in The Ascent, as a directional range, not a quote.
        </p>
      </div>

      <div className="space-y-3">
        {DURABILITY_POINTS.map((d, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-2.5">
              <Globe size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">{d.title}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{d.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitionTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Who Else Is Trying This" title="How competitive is it, really?" />

      <div className="space-y-3">
        {COMPETITION_POINTS.map((c, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-2.5">
              <Users size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">{c.title}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{c.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-700 mb-2 flex items-center gap-2"><BarChart3 size={14} /> Competition by lane</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="bg-accent/40 text-foreground-muted font-mono uppercase tracking-wide text-[10px]">
                <th className="text-left px-3 py-2 font-medium">Lane</th>
                <th className="text-left px-2 py-2 font-medium">Low-Competition Score</th>
              </tr>
            </thead>
            <tbody>
              {LANE_COMPETITION.map((l, i) => (
                <tr key={l.name} className={`${i % 2 ? 'bg-card/60' : 'bg-card'} border-t border-border`}>
                  <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{l.name}</td>
                  <td className="px-2 py-2.5"><ScoreDots value={l.score} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-foreground-muted mt-2 leading-relaxed">Straight from Pick Lane's own six-factor grading (Global Targeting Manual included) — higher dots mean less competition, not more of it.</p>
      </div>
    </div>
  );
}

function FitTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Decide With Open Eyes" title="Is this your lane?" />

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-700 mb-3">Five honest questions, not a scored quiz</p>
        <div className="space-y-2.5">
          {FIT_CHECKS.map((q, i) => (
            <div key={i} className="flex gap-2.5 text-sm">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <span className="text-slate-300 leading-relaxed">{q}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative rounded-lg border border-gold/40 bg-gold/10 p-4">
        <CornerMarks />
        <p className="text-sm text-slate-200 leading-relaxed">
          None of DBI's seven doors is "the right one," and this briefing isn't built to talk you into this one — Pick Lane's own line applies just as much up here: choose with open eyes, not the answer it's grading for. If the highs in this document sound like a career and the lows sound like a livable trade-off, this door is a genuinely real one. If the lows sound like more than you're set up to carry right now, that's useful information too — a fit question answered honestly, on your own terms, before the clock runs out instead of after.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-accent/20 p-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">If you choose this door:</strong> The Ascent (45-Day System) is where Day 1 starts. Keep the Global Targeting Manual and the Performance Calculator open alongside it — this briefing's job ends here.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

export default function AscentPathBriefing() {
  const [activeTab, setActiveTab] = useState('brief');

  return (
    <div className="min-h-screen bg-background font-body text-slate-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Big Shoulders Display', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .bg-background {
          background-color: #12151A;
          background-image:
            linear-gradient(rgba(69,199,176,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69,199,176,0.045) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .text-foreground { color: #12151A; }
        .bg-card { background-color: #1B1F27; }
        .bg-accent/40 { background-color: #232833; }
        .border-border { border-color: #2A303C; }
        .text-foreground-muted { color: #8B93A3; }
        .text-emerald-700 { color: #0D7A5F; }
        .bg-emerald-700 { background-color: #0D7A5F; }
        .border-emerald-700 { border-color: #0D7A5F; }
        .text-gold-deep { color: #C99A3B; }
        .bg-gold { background-color: #C99A3B; }
        .border-gold/40 { border-color: #C99A3B; }
        .text-destructive { color: #E0574A; }
        .border-destructive { border-color: #E0574A; }
        .bg-destructive\\/10 { background-color: rgba(224,87,74,0.1); }
        .bg-emerald-700\\/10 { background-color: rgba(69,199,176,0.1); }
        .bg-gold\\/10 { background-color: rgba(217,164,65,0.1); }
        .border-gold/40\\/50 { border-color: rgba(217,164,65,0.5); }
        .border-destructive\\/50 { border-color: rgba(224,87,74,0.5); }
        .bg-accent/40\\/50 { background-color: rgba(35,40,51,0.5); }
        .bg-accent/40\\/60 { background-color: rgba(35,40,51,0.6); }
        .hover\\:bg-accent/40\\/60:hover { background-color: rgba(35,40,51,0.6); }
        .focus-visible\\:outline-signal:focus-visible { outline-color: #0D7A5F; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-border" style={{ backgroundColor: 'rgba(18,21,26,0.96)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide leading-none">THE BRIEFING</h1>
              <p className="font-mono text-[10px] text-foreground-muted uppercase tracking-[0.2em] mt-1">High-Ticket Closing — One Door Inside DBI</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-gold-deep uppercase tracking-wider flex items-center gap-1.5 justify-end"><Compass size={12} /> Companion to The Ascent</p>
              <p className="font-mono text-[11px] text-foreground-muted mt-0.5">7 sections · 6-factor snapshot · 5 models compared</p>
            </div>
          </div>
        </div>

        <nav className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2.5 pt-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`shrink-0 font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
                activeTab === t.id ? 'bg-emerald-700 border-emerald-700 text-foreground font-semibold' : 'border-border text-foreground-muted hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-16">
        {activeTab === 'brief' && <BriefTab />}
        {activeTab === 'highs' && <HighsTab />}
        {activeTab === 'lows' && <LowsTab />}
        {activeTab === 'standout' && <StandoutTab />}
        {activeTab === 'durability' && <DurabilityTab />}
        {activeTab === 'competition' && <CompetitionTab />}
        {activeTab === 'fit' && <FitTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-8">
        <p className="text-[11px] text-foreground-muted font-mono flex items-center gap-1.5"><ShieldCheck size={12} /> Decision support, not a pitch — every figure here is a range to plan around, not a promise.</p>
      </footer>
    </div>
  );
}
