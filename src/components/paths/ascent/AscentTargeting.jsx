import React, { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronRight, ShieldCheck, AlertTriangle,
  TrendingUp, Target, Globe, MapPin, DollarSign, Users, Search
} from 'lucide-react';

/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: 'start', label: 'Start Here' },
  { id: 'sectors', label: 'Global Sectors' },
  { id: 'lane7', label: 'The 7th Lane' },
  { id: 'scoring', label: 'Target Scoring' },
  { id: 'income', label: 'Income Reality' },
];

const SECTOR_TIERS = [
  { tier: 1, name: 'Tier 1 — Deepest Markets', accent: 'signal',
    blurb: `The most target companies, the most active content, every Scout Method fully populated. Start here regardless of your niche.`,
    countries: [
      { flag: '🇺🇸', name: 'United States',
        why: `By far the largest high-ticket coaching and consulting economy in the world, and the default market behind nearly every lane in Pick Lane. Every scouting channel skews US-heavy before anything else.`,
        channel: `LinkedIn X-ray search + YouTube, exactly as written in the Scout tab`,
        local: `1099 contractor commission arrangements are the norm here — confirm your own filing obligations regardless of where you personally live.`,
        signal: `A real application or booking page plus specific, checkable testimonials — the baseline "green" signal from Scout Method 1, in its deepest supply.` },
      { flag: '🇬🇧', name: 'United Kingdom',
        why: `The second-largest English-language coaching market. Many UK-based coaches price and sell in USD to a global audience, not just a domestic one.`,
        channel: `LinkedIn + YouTube`,
        local: `Self-employed/sole-trader status is the local equivalent of a 1099 — the Vetting Checklist questions don't change.`,
        signal: `Same green-flag pattern as the US: booking page, real testimonials, visible content cadence.` },
      { flag: '🇨🇦', name: 'Canada',
        why: `Large, culturally adjacent to the US market, with a great many coaches and agencies that treat both countries as one audience.`,
        channel: `LinkedIn + YouTube`,
        local: `Time zone overlap with the US is close to total — the least friction of any Tier 1 country for live call scheduling.`,
        signal: `Watch for cross-border operators — a "Canadian" coach may already be closing US leads exclusively.` },
      { flag: '🇦🇺', name: 'Australia',
        why: `A genuinely well-developed high-ticket coaching culture, especially strong in Real Estate and property-investment coaching — one of the six lanes' deepest markets.`,
        channel: `YouTube + LinkedIn, plus property-investment podcasts specifically for the Real Estate lane`,
        local: `Time zone is the real friction point — most live calls will land in your late evening or early morning outside APAC.`,
        signal: `Property and investment coaches with a visible, multi-year YouTube archive are the strongest Australian targets.` },
    ]},
  { tier: 2, name: 'Tier 2 — Real, Thinner Markets', accent: 'insignia',
    blurb: `Genuine target companies exist here; there are just fewer of them. Run Search Scouting and YouTube Mining harder before writing a country off.`,
    countries: [
      { flag: '🇮🇪', name: 'Ireland',
        why: `Small population, but a real base for coaches and agencies structuring their business for the EU/UK market, plus a growing tech scene relevant specifically to the AI Implementation lane.`,
        channel: `LinkedIn`,
        local: `Sole-trader registration is common among solo coaches based here.`,
        signal: `AI/automation agencies with a Dublin or Irish-tech-scene footprint are worth a specific search pass.` },
      { flag: '🇸🇬', name: 'Singapore',
        why: `The APAC equivalent of Ireland — a business-friendly base for English-speaking consulting and coaching operations reaching a pan-Asian and global audience.`,
        channel: `LinkedIn`,
        local: `Many operators here sell to a US/global audience despite the local base — check the content's actual audience, not the founder's address.`,
        signal: `AI Implementation and Content/Personal Branding lanes both show up here more than the other four.` },
      { flag: '🇳🇿', name: 'New Zealand',
        why: `Smaller sibling to Australia's coaching culture — same core lanes, thinner supply of targets.`,
        channel: `YouTube + LinkedIn`,
        local: `Same time-zone friction as Australia.`,
        signal: `Treat as an overflow search after Australia, not a first stop.` },
      { flag: '🇳🇱', name: 'Netherlands',
        why: `A business-friendly, English-fluent EU base with a genuine startup and tech scene — worth a dedicated search specifically for the AI Implementation lane.`,
        channel: `LinkedIn`,
        local: `Freelance (ZZP) registration is the local norm for solo operators.`,
        signal: `Automation/AI agency founders with an Amsterdam footprint are the strongest local target type.` },
      { flag: '🇿🇦', name: 'South Africa',
        why: `A growing base of English-speaking, fully-remote coaching and agency operations, particularly in Real Estate and Content/Personal Branding.`,
        channel: `LinkedIn + Facebook groups`,
        local: `Deal sizes here often skew toward the lower end of each lane's stated range given local purchasing power — confirm before you assume a Tier-1 price point.`,
        signal: `Agencies and coaches already selling internationally (priced in USD/GBP, not ZAR) are the stronger targets.` },
    ]},
  { tier: 3, name: 'Tier 3 — Founder-HQ Hub, Not a Client Base', accent: 'alert',
    blurb: `This is a company-structure signal, not a targeting signal. Don't build a separate search strategy around it — just recognize it when you see it.`,
    countries: [
      { flag: '🇦🇪', name: 'United Arab Emirates (Dubai)',
        why: `A large share of online coaches and course-sellers register a Dubai free-zone company and relocate personally for its 0% personal income tax, while still selling to the exact same US/UK/global audience through the exact same channels. A "Dubai-based" founder's clients are almost never in Dubai.`,
        channel: `Whatever channel matches their actual audience's language and content — not a Dubai-specific search`,
        local: `Treat the Dubai address as context for who you're emailing, not a reason to search differently.`,
        signal: `If a target's content and testimonials are English/US-facing, score it exactly like a Tier 1 target — the Dubai registration doesn't change the Vetting Checklist.` },
    ]},
];

const LANE7 = {
  id: 'agency', name: `B2B Agency & Marketing Services`,
  scores: { entry: 3, dealSize: 3, competition: 3, durability: 4, safety: 4, fit: 3 },
  verdict: `A steady, evergreen B2B lane with the most checkable deliverables of any lane on this list — client results show up in rankings, traffic, and ad performance, which makes it one of the easier offers to vet before you commit your time.`,
  icp: `Small and mid-size business owners who know they need marketing but don't have the time or expertise to run it themselves — sold as a monthly retainer or a fixed-scope project: SEO, paid ads, content, or full-service.`,
  dealSizeText: `$1,500–$15,000 typical monthly retainer, or $3,000–$30,000 for project-based work · 10–15% commission is common, sometimes on the first 1–3 months only`,
  whereToFind: [
    `Search: "marketing agency" OR "growth partner" "book a call" case studies`,
    `X-ray search: site:linkedin.com/in "closer" "marketing agency" OR "growth agency"`,
    `YouTube: agency-owner channels breaking down real client results — check for an application or booking link`,
    `Agency-owner Skool, Facebook, and Discord communities`,
    `Marketplaces (light backup only): Indeed, Upwork, ZipRecruiter, Glassdoor`,
  ],
  objections: [
    { q: `"We already tried an agency and it didn't work"`, a: `"What was different about that experience?" — get the specifics before you respond to the pattern instead of the anecdote.` },
    { q: `"How do I know you'll actually deliver results"`, a: `"What would proof actually look like to you?" — then go get exactly that, not a generic case study.` },
    { q: `"This is more than we budgeted for marketing"`, a: `"What's the cost of your current approach not working?" — let them do that math out loud.` },
  ],
  opener: `Hey [Name] — saw the case study you posted on [specific client or result]. I help agencies like yours convert more discovery calls into signed retainers. Are you handling all the sales calls yourself right now, or is there room for a closer?`,
  watchOut: `Some "agency" offers are really agency-owner coaching in disguise — you'd be selling a course on how to start an agency, not marketing services to a real business. Read the actual offer page closely before you commit your time; it changes who you're really pitching on the call.`,
};

const SCORE_FACTORS = [
  { key: 'signal', label: 'Buying-Intent Signal', max: 25,
    help: `Straight from Scout Method 1's green/red flags — how real is the "they're actively selling and might need help" evidence?`,
    options: [
      { label: `Active application/booking page + an explicit hiring signal (job post, "scaling our sales team")`, points: 25 },
      { label: `Booking page exists, no explicit hiring signal, but real testimonials and content`, points: 18 },
      { label: `Found via general niche search only — offer exists, unclear if actively selling`, points: 8 },
      { label: `Dormant page, no clear offer, no social proof`, points: 0 },
    ]},
  { key: 'legit', label: 'Verifiable Legitimacy', max: 25,
    help: `Built directly from the Vetting Checklist — this is the one factor with a hard override below.`,
    options: [
      { label: `Real, checkable client results — not just the recruiter's income screenshots — and open about refund/chargeback rate`, points: 25 },
      { label: `Some testimonials exist; hasn't shared refund data but nothing's hidden when asked`, points: 15 },
      { label: `Recruiter's own income claims only — no client-side proof offered`, points: 5 },
      { label: `Red flags present: "no experience needed," 100% commission with zero base, cagey when asked for numbers`, points: 0 },
    ]},
  { key: 'deal', label: 'Deal Economics & Terms', max: 20,
    help: `This should shape how hard you pursue it — confirm everything in writing before you accept anything.`,
    options: [
      { label: `Deal size fits the lane's typical range, and commission % + payment schedule are confirmed in writing`, points: 20 },
      { label: `Deal size fits, but terms are still verbal/unconfirmed`, points: 12 },
      { label: `Below-typical deal size for the lane`, points: 5 },
      { label: `Terms are vague, or shift depending on who you ask`, points: 0 },
    ]},
  { key: 'license', label: 'Licensing & Regulatory Clarity', max: 15,
    help: `Pulled straight from the Watch Out sections in Pick Lane — funding, real estate, and trading all carry real licensing risk.`,
    options: [
      { label: `Confirmed no license needed — a pure sales, consulting, or education role`, points: 15 },
      { label: `Unclear — needs confirmation before you go further`, points: 7 },
      { label: `Likely requires a license you don't hold (lending origination, real-estate representation, securities advice)`, points: 0 },
    ]},
  { key: 'team', label: 'Team & Track Record Signal', max: 15,
    help: `Directly from Scout Method 2 — note whether it's a solo founder or a visible team.`,
    options: [
      { label: `Visible team, consistent content history, established operation`, points: 15 },
      { label: `Solo founder, but a real and consistent track record`, points: 8 },
      { label: `Brand new — a single post, no real history`, points: 2 },
    ]},
];

const SCORE_BANDS = [
  { min: 80, max: 100, label: 'Green Light', accent: 'signal',
    action: `Send the bespoke Loom this week. This is a Tier 1 target — treat it like one.` },
  { min: 55, max: 79, label: 'Worth Pursuing', accent: 'insignia',
    action: `Add it to this week's outreach wave — but confirm licensing and payment terms before you accept anything, not after.` },
  { min: 30, max: 54, label: 'Keep Scouting', accent: 'neutral',
    action: `Log it and move on for now. Not enough signal yet to spend a bespoke Loom on it — a general wave message is fine.` },
  { min: 0, max: 29, label: 'Red Flag', accent: 'alert',
    action: `Walk away. This is exactly what the Vetting Checklist is for — trust it over the pitch.` },
];

const INCOME_SCENARIOS = [
  { name: 'Ramping', window: 'Days 1–30 in the seat', accent: 'neutral',
    calls: 15, close: '15%', deal: '$5,000', commission: '10%',
    result: '≈ $1,125/month',
    note: `Expect inconsistency here — this system's own Day 46+ tab says the same thing: even experienced reps typically need 3+ months to reach full productivity in a new seat.` },
  { name: 'Established', window: '60–90 days in the seat', accent: 'insignia',
    calls: 25, close: '22%', deal: '$7,000', commission: '10%',
    result: '≈ $3,850/month',
    note: `This is realistically where the CLOSER framework becomes second nature and your close rate stabilizes.` },
  { name: 'Beyond 90 Days', window: 'The stated ceiling of the role', accent: 'signal',
    calls: 30, close: '20–30%', deal: '$8,000–$15,000', commission: '10%',
    result: '$4,800 – $10,000+/month',
    note: `The system's own example (30 × 20% × $8,000 × 10% = $4,800) sits at the low end of this band. Push close rate to 30% or deal value to $15k on the same 30 calls and you clear $10k — the $8,000–$40,000/month range becomes the real ceiling from here, earned through volume and close-rate discipline, not granted by landing the seat.` },
];

/* ---------------------------------------------------------------------- */
/* SMALL COMPONENTS — reused from The Ascent's own visual system           */
/* ---------------------------------------------------------------------- */

function CornerMarks() {
  return (
    <>
      <span className="pointer-events-none absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-signal/60" />
      <span className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-signal/60" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-signal/60" />
      <span className="pointer-events-none absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-signal/60" />
    </>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="relative mb-5 pl-4 border-l-2 border-insignia">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-insignia">{eyebrow}</p>
      <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide leading-tight mt-0.5">{title}</h2>
      {sub && <p className="text-sm text-ink-muted mt-1.5 max-w-2xl">{sub}</p>}
    </div>
  );
}

function ScoreDots({ value }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-insignia' : 'bg-panel-raised border border-line'}`} />
      ))}
    </span>
  );
}

const SCORE_LABELS = [
  { key: 'entry', label: 'Entry Ease' },
  { key: 'dealSize', label: 'Deal Size' },
  { key: 'competition', label: 'Low Competition' },
  { key: 'durability', label: 'Durability' },
  { key: 'safety', label: 'Safety' },
  { key: 'fit', label: 'Beginner Fit' },
];

const accentClasses = {
  signal:  { text: 'text-signal',   border: 'border-signal',   bg10: 'bg-signal/10' },
  insignia:{ text: 'text-insignia', border: 'border-insignia', bg10: 'bg-insignia/10', border50: 'border-insignia/50' },
  alert:   { text: 'text-alert',    border: 'border-alert',    bg10: 'bg-alert/10',    border50: 'border-alert/50' },
  neutral: { text: 'text-ink-muted',border: 'border-line',     bg10: 'bg-panel-raised/50' },
};

/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */

function StartTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Mission Briefing" title="What this manual does" />
      <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
        This is the zoomed-out map for the 45-Day system: where the target companies actually are worldwide, a 7th lane to add to Pick Lane's six, a scoring system for grading any target company before you spend a bespoke Loom on it, and the honest math on what this role really pays. It replaces nothing in the core system — it's what you check before and during the Scout tab, not instead of it.
      </p>

      <div className="relative rounded-lg border border-signal bg-signal/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-signal" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal">The numbers, checked against the outside world</p>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          Third-party salary data backs up this system's own $8,000–$40,000/month range: Glassdoor's 2025 figures put the average high-ticket sales closer at roughly $113,700/year (about $9,500/month), with ZipRecruiter showing a $50,000–$150,000/year spread depending on experience and niche. That's a real industry, not hype — the range this system is built around sits inside it, not above it.
        </p>
      </div>

      <div className="relative rounded-lg border border-alert bg-alert/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-alert" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-alert">Why the scoring in this manual leans so hard on legitimacy</p>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          This exact space has real, documented casualties — regulators have shut down "become a closer" training operations for deceptive income claims, and other well-known programs in this niche have drawn public criticism for the same thing. The Vetting Checklist (Toolkit tab) already protects you from this. Target Scoring in this manual just turns it into a number you can act on fast.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2">How to run this manual</p>
        <ol className="text-sm text-slate-300 space-y-1.5 leading-relaxed list-decimal list-inside">
          <li>Check <strong className="text-white">Global Sectors</strong> before a scouting sprint — know which tier you're searching in, and why.</li>
          <li>Read <strong className="text-white">The 7th Lane</strong> alongside the six already in Pick Lane, if agency/marketing work fits your background.</li>
          <li>Run every real target through <strong className="text-white">Target Scoring</strong> before you tier it — it's the Day 4 "Tag each one Tier 1, 2, or 3" step, made explicit.</li>
          <li>Use <strong className="text-white">Income Reality</strong> to set expectations with yourself, not to sell yourself a fantasy before Day 1.</li>
        </ol>
      </div>
    </div>
  );
}

function SectorsTab() {
  const [openCountry, setOpenCountry] = useState('United States');
  return (
    <div className="space-y-7">
      <SectionHeading eyebrow="Where The Seats Are" title="Global sectors, tiered" sub="Ranked the same way the Warm List tracker tiers a target company — by how much real signal is there, not by population or GDP." />

      {SECTOR_TIERS.map(t => {
        const a = accentClasses[t.accent];
        return (
          <div key={t.tier}>
            <div className="flex items-center gap-2 mb-1">
              <Globe size={15} className={a.text} />
              <p className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>{t.name}</p>
            </div>
            <p className="text-sm text-ink-muted mb-3 max-w-2xl">{t.blurb}</p>
            <div className="space-y-2.5">
              {t.countries.map(c => {
                const open = openCountry === c.name;
                return (
                  <div key={c.name} className="relative rounded-lg border border-line bg-panel overflow-hidden">
                    <button onClick={() => setOpenCountry(open ? null : c.name)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{c.flag}</span>
                        <p className="font-display text-lg text-white leading-tight truncate">{c.name}</p>
                      </div>
                      {open ? <ChevronDown size={18} className="text-ink-muted shrink-0" /> : <ChevronRight size={18} className="text-ink-muted shrink-0" />}
                    </button>
                    {open && (
                      <div className="px-4 pb-5 pt-1 border-t border-line space-y-3 text-sm">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Why it's here</p>
                          <p className="text-slate-300 leading-relaxed">{c.why}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Primary channel</p>
                          <p className="text-slate-300 leading-relaxed">{c.channel}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Local note</p>
                          <p className="text-slate-300 leading-relaxed">{c.local}</p>
                        </div>
                        <div className="rounded-md bg-panel-raised/60 border border-line p-2.5">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-insignia mb-1 flex items-center gap-1.5"><MapPin size={11} /> Strong-target signal</p>
                          <p className="text-slate-200 leading-relaxed">{c.signal}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Lane7Tab() {
  const [open, setOpen] = useState(true);
  const n = LANE7;
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Decision Support" title="A 7th lane, graded the same way as the other six" sub="Same honest 1–5 grading as Pick Lane, same card format. It doesn't replace any of the six — it's an option if agency/marketing work fits your background." />

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="bg-panel-raised text-ink-muted font-mono uppercase tracking-wide text-[10px]">
              <th className="text-left px-3 py-2 font-medium">Lane</th>
              {SCORE_LABELS.map(s => <th key={s.key} className="text-left px-2 py-2 font-medium whitespace-nowrap">{s.label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-panel border-t border-line">
              <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{n.name}</td>
              {SCORE_LABELS.map(s => <td key={s.key} className="px-2 py-2.5"><ScoreDots value={n.scores[s.key]} /></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="relative rounded-lg border border-line bg-panel overflow-hidden">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
          <div>
            <p className="font-display text-lg text-white">{n.name}</p>
            <p className="text-xs text-ink-muted mt-1 max-w-xl">{n.verdict}</p>
          </div>
          {open ? <ChevronDown size={18} className="text-ink-muted shrink-0 mt-1" /> : <ChevronRight size={18} className="text-ink-muted shrink-0 mt-1" />}
        </button>
        {open && (
          <div className="px-4 pb-5 pt-1 border-t border-line space-y-4 text-sm">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Who buys</p>
              <p className="text-slate-300 leading-relaxed">{n.icp}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Deal size</p>
              <p className="text-slate-300 leading-relaxed">{n.dealSizeText}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Where to find offers</p>
              <ul className="text-slate-300 space-y-1 mt-1">
                {n.whereToFind.map((w, i) => <li key={i} className="flex gap-2"><span className="text-insignia">→</span><span>{w}</span></li>)}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Common objections</p>
              <div className="space-y-2 mt-1">
                {n.objections.map((o, i) => (
                  <div key={i} className="rounded-md bg-panel-raised/60 border border-line p-2.5">
                    <p className="text-slate-200 font-medium">{o.q}</p>
                    <p className="text-ink-muted mt-1">{o.a}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Sample opener</p>
              <p className="text-slate-300 leading-relaxed italic bg-panel-raised/60 border border-line rounded-md p-2.5">{n.opener}</p>
            </div>
            <div className="rounded-md border border-alert/50 bg-alert/10 p-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-alert mb-1">Watch out</p>
              <p className="text-slate-200 leading-relaxed">{n.watchOut}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoringTab() {
  const [sel, setSel] = useState({});
  const select = (key, idx) => setSel(p => ({ ...p, [key]: idx }));
  const reset = () => setSel({});

  const totalScore = useMemo(() => SCORE_FACTORS.reduce((sum, f) => {
    const idx = sel[f.key];
    return idx === undefined ? sum : sum + f.options[idx].points;
  }, 0), [sel]);
  const answeredCount = Object.keys(sel).length;
  const allAnswered = answeredCount === SCORE_FACTORS.length;
  const legitScore = sel.legit !== undefined ? SCORE_FACTORS.find(f => f.key === 'legit').options[sel.legit].points : null;
  const hardOverride = legitScore === 0;
  const band = useMemo(() => {
    if (hardOverride) return SCORE_BANDS.find(b => b.label === 'Red Flag');
    return SCORE_BANDS.find(b => totalScore >= b.min && totalScore <= b.max) || SCORE_BANDS[SCORE_BANDS.length - 1];
  }, [totalScore, hardOverride]);
  const a = accentClasses[band.accent];

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Before You Burn A Loom" title="Score the target company" sub="Answer all five, honestly, about one real target at a time. This makes Day 4's 'Tag each one Tier 1, 2, or 3' an actual number instead of a gut call." />

      <div className={`relative rounded-lg border ${a.border} ${a.bg10} p-4`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            {allAnswered ? 'Target Score' : `${answeredCount} of ${SCORE_FACTORS.length} answered`}
          </p>
          <p className={`font-display text-2xl ${a.text}`}>{totalScore} / 100</p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < Math.round(totalScore / 5) ? `bg-${band.accent === 'neutral' ? 'panel-raised' : band.accent}` : 'bg-panel-raised border border-line'}`} />
          ))}
        </div>
        {allAnswered && (
          <div className="mt-3 flex items-start gap-2.5">
            <Target size={20} className={`${a.text} shrink-0 mt-0.5`} />
            <div>
              <p className={`font-display text-lg ${a.text} leading-tight`}>{band.label}{hardOverride && ' — Legitimacy Override'}</p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{band.action}</p>
            </div>
          </div>
        )}
        {answeredCount > 0 && (
          <button onClick={reset} className="mt-3 font-mono text-[11px] text-ink-muted underline hover:text-slate-200">
            Reset and score a different target
          </button>
        )}
      </div>

      {SCORE_FACTORS.map(f => (
        <div key={f.key}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white">{f.label}</p>
            <p className="font-mono text-[10px] text-ink-muted">max {f.max} pts</p>
          </div>
          <p className="text-xs text-ink-muted mb-2 leading-relaxed">{f.help}</p>
          <div className="space-y-1.5">
            {f.options.map((o, oi) => {
              const isSel = sel[f.key] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => select(f.key, oi)}
                  className={`w-full flex items-center justify-between gap-3 rounded-md px-3 py-2.5 border text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
                    isSel ? 'bg-signal/10 border-signal' : 'bg-panel-raised/50 border-line hover:bg-panel-raised/60'
                  }`}
                >
                  <span className={`flex-1 text-xs leading-relaxed ${isSel ? 'text-slate-200' : 'text-ink-muted'}`}>{o.label}</span>
                  <span className={`shrink-0 font-mono text-[11px] font-semibold ${isSel ? 'text-signal' : 'text-ink-muted'}`}>+{o.points}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function IncomeTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Beyond The Hype" title="What this role actually pays" sub="Built on the Day 46+ formula, not a bigger number invented for this manual." />

      <div className="relative rounded-lg border border-signal bg-signal/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-signal" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal">The formula that actually sets your income</p>
        </div>
        <p className="font-mono text-sm text-white">Qualified Calls × Close Rate × Average Deal Value × Commission % = Monthly Income</p>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">Every scenario below is this exact formula, run with different — and honest — inputs for where you actually are in the seat.</p>
      </div>

      <div className="space-y-3">
        {INCOME_SCENARIOS.map(s => {
          const a = accentClasses[s.accent];
          return (
            <div key={s.name} className={`rounded-lg border ${a.border} bg-panel overflow-hidden`}>
              <div className="px-4 py-3.5 border-b border-line flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-display text-lg text-white">{s.name}</p>
                  <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wide mt-0.5">{s.window}</p>
                </div>
                <p className={`font-display text-xl ${a.text} whitespace-nowrap`}>{s.result}</p>
              </div>
              <div className="px-4 py-3.5 space-y-2.5">
                <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-ink-muted">
                  <span>{s.calls} calls/mo</span>
                  <span>×</span>
                  <span>{s.close} close</span>
                  <span>×</span>
                  <span>{s.deal} deal</span>
                  <span>×</span>
                  <span>{s.commission} commission</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{s.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-2"><Users size={13} /> Why this varies so much</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Commission-only income means the company has made zero financial investment in your success — the variance above is the actual shape of that trade-off, not a flaw in the system. It's also exactly why Target Scoring's Legitimacy and Deal Economics factors matter more here than in almost any other kind of sales role: a bad seat doesn't just waste your time, it can make every number in this formula worse at once — fewer qualified calls, a lower real close rate, and deal or commission terms that move after you've already started.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

export default function AscentGlobalTargetingManual() {
  const [activeTab, setActiveTab] = useState('start');

  return (
    <div className="min-h-screen bg-ink font-body text-slate-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Big Shoulders Display', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .bg-ink {
          background-color: #F5F0E4;
          background-image:
            linear-gradient(rgba(69,199,176,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69,199,176,0.045) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .bg-panel { background-color: #F5F0E4; }
        .bg-panel-raised { background-color: #E6DECB; }
        .border-line { border-color: #E6DECB; }
        .text-ink-muted { color: #6E6459; }
        .text-signal { color: #0D7A5F; }
        .bg-signal { background-color: #0D7A5F; }
        .border-signal { border-color: #0D7A5F; }
        .text-insignia { color: #C99A3B; }
        .bg-insignia { background-color: #C99A3B; }
        .border-insignia { border-color: #C99A3B; }
        .text-alert { color: #8B2E1F; }
        .border-alert { border-color: #8B2E1F; }
        .bg-alert\\/10 { background-color: rgba(224,87,74,0.1); }
        .bg-signal\\/10 { background-color: rgba(69,199,176,0.1); }
        .bg-insignia\\/10 { background-color: rgba(217,164,65,0.1); }
        .border-insignia\\/50 { border-color: rgba(217,164,65,0.5); }
        .border-alert\\/50 { border-color: rgba(224,87,74,0.5); }
        .bg-panel-raised\\/50 { background-color: rgba(35,40,51,0.5); }
        .bg-panel-raised\\/60 { background-color: rgba(35,40,51,0.6); }
        .hover\\:bg-panel-raised\\/60:hover { background-color: rgba(35,40,51,0.6); }
        .focus-visible\\:outline-signal:focus-visible { outline-color: #0D7A5F; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-line" style={{ backgroundColor: 'rgba(18,21,26,0.96)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide leading-none">GLOBAL TARGETING MANUAL</h1>
              <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.2em] mt-1">The Ascent — Sector Intelligence Module</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-insignia uppercase tracking-wider flex items-center gap-1.5 justify-end"><Search size={12} /> Companion to the 45-Day System</p>
              <p className="font-mono text-[11px] text-ink-muted mt-0.5">10 sectors · 7 lanes · 5-factor scoring</p>
            </div>
          </div>
        </div>

        <nav className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2.5 pt-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`shrink-0 font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
                activeTab === t.id ? 'bg-signal border-signal text-ink font-semibold' : 'border-line text-ink-muted hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-16">
        {activeTab === 'start' && <StartTab />}
        {activeTab === 'sectors' && <SectorsTab />}
        {activeTab === 'lane7' && <Lane7Tab />}
        {activeTab === 'scoring' && <ScoringTab />}
        {activeTab === 'income' && <IncomeTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-8">
        <p className="text-[11px] text-ink-muted font-mono flex items-center gap-1.5"><ShieldCheck size={12} /> Score every target before you Loom it. The list doesn't close deals — the Vetting Checklist does.</p>
      </footer>
    </div>
  );
}
