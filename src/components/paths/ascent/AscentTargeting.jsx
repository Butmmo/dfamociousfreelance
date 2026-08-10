// The Ascent — Global Targeting Manual
// Restyled to match smb-path-briefing.jsx's DBI Regal design system exactly:
// cream/gold/crimson palette, Inter type, inline styles, emoji iconography.
// All data, copy and interactivity carried over unchanged from the original
// dark "signal/insignia/alert" theme — visuals only were replaced.

import { useState, useMemo } from "react";

/* ─── PALETTE (DBI Regal, matched to smb-path-briefing.jsx) ─── */
const CREAM = "#F8F5EE";
const CREAM_DEEP = "#F5F0E4";
const BORDER = "#D9CFBB";
const INK = "#201A16";
const MUTED = "#6E6459";
const GOLD = "#C99A3B";
const GOLD_DEEP = "#7A5A00";
const CRIMSON = "#8B0000";
const EMERALD = "#0D7A5F";

const TONE = {
  good:    { c: EMERALD,   bg: "rgba(13,122,95,0.08)", bd: "rgba(13,122,95,0.35)" },
  caution: { c: CRIMSON,   bg: "rgba(139,0,0,0.06)",   bd: "rgba(139,0,0,0.30)" },
  neutral: { c: GOLD_DEEP, bg: "rgba(122,90,0,0.07)",  bd: "rgba(122,90,0,0.30)" },
};
const PLAIN = { c: MUTED, bg: "#FFFFFF", bd: BORDER };
const tone = (key) => (key === "plain" ? PLAIN : TONE[key] || TONE.neutral);

/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: "start", label: "🧭 Start Here" },
  { id: "sectors", label: "🌍 Global Sectors" },
  { id: "lane7", label: "🏢 The 7th Lane" },
  { id: "scoring", label: "🎯 Target Scoring" },
  { id: "income", label: "💵 Income Reality" },
];

const SECTOR_TIERS = [
  { tier: 1, name: "Tier 1 — Deepest Markets", toneKey: "good",
    blurb: `The most target companies, the most active content, every Scout Method fully populated. Start here regardless of your niche.`,
    countries: [
      { flag: "🇺🇸", name: "United States",
        why: `By far the largest high-ticket coaching and consulting economy in the world, and the default market behind nearly every lane in Pick Lane. Every scouting channel skews US-heavy before anything else.`,
        channel: `LinkedIn X-ray search + YouTube, exactly as written in the Scout tab`,
        local: `1099 contractor commission arrangements are the norm here — confirm your own filing obligations regardless of where you personally live.`,
        signal: `A real application or booking page plus specific, checkable testimonials — the baseline "green" signal from Scout Method 1, in its deepest supply.` },
      { flag: "🇬🇧", name: "United Kingdom",
        why: `The second-largest English-language coaching market. Many UK-based coaches price and sell in USD to a global audience, not just a domestic one.`,
        channel: `LinkedIn + YouTube`,
        local: `Self-employed/sole-trader status is the local equivalent of a 1099 — the Vetting Checklist questions don't change.`,
        signal: `Same green-flag pattern as the US: booking page, real testimonials, visible content cadence.` },
      { flag: "🇨🇦", name: "Canada",
        why: `Large, culturally adjacent to the US market, with a great many coaches and agencies that treat both countries as one audience.`,
        channel: `LinkedIn + YouTube`,
        local: `Time zone overlap with the US is close to total — the least friction of any Tier 1 country for live call scheduling.`,
        signal: `Watch for cross-border operators — a "Canadian" coach may already be closing US leads exclusively.` },
      { flag: "🇦🇺", name: "Australia",
        why: `A genuinely well-developed high-ticket coaching culture, especially strong in Real Estate and property-investment coaching — one of the six lanes' deepest markets.`,
        channel: `YouTube + LinkedIn, plus property-investment podcasts specifically for the Real Estate lane`,
        local: `Time zone is the real friction point — most live calls will land in your late evening or early morning outside APAC.`,
        signal: `Property and investment coaches with a visible, multi-year YouTube archive are the strongest Australian targets.` },
    ]},
  { tier: 2, name: "Tier 2 — Real, Thinner Markets", toneKey: "neutral",
    blurb: `Genuine target companies exist here; there are just fewer of them. Run Search Scouting and YouTube Mining harder before writing a country off.`,
    countries: [
      { flag: "🇮🇪", name: "Ireland",
        why: `Small population, but a real base for coaches and agencies structuring their business for the EU/UK market, plus a growing tech scene relevant specifically to the AI Implementation lane.`,
        channel: `LinkedIn`,
        local: `Sole-trader registration is common among solo coaches based here.`,
        signal: `AI/automation agencies with a Dublin or Irish-tech-scene footprint are worth a specific search pass.` },
      { flag: "🇸🇬", name: "Singapore",
        why: `The APAC equivalent of Ireland — a business-friendly base for English-speaking consulting and coaching operations reaching a pan-Asian and global audience.`,
        channel: `LinkedIn`,
        local: `Many operators here sell to a US/global audience despite the local base — check the content's actual audience, not the founder's address.`,
        signal: `AI Implementation and Content/Personal Branding lanes both show up here more than the other four.` },
      { flag: "🇳🇿", name: "New Zealand",
        why: `Smaller sibling to Australia's coaching culture — same core lanes, thinner supply of targets.`,
        channel: `YouTube + LinkedIn`,
        local: `Same time-zone friction as Australia.`,
        signal: `Treat as an overflow search after Australia, not a first stop.` },
      { flag: "🇳🇱", name: "Netherlands",
        why: `A business-friendly, English-fluent EU base with a genuine startup and tech scene — worth a dedicated search specifically for the AI Implementation lane.`,
        channel: `LinkedIn`,
        local: `Freelance (ZZP) registration is the local norm for solo operators.`,
        signal: `Automation/AI agency founders with an Amsterdam footprint are the strongest local target type.` },
      { flag: "🇿🇦", name: "South Africa",
        why: `A growing base of English-speaking, fully-remote coaching and agency operations, particularly in Real Estate and Content/Personal Branding.`,
        channel: `LinkedIn + Facebook groups`,
        local: `Deal sizes here often skew toward the lower end of each lane's stated range given local purchasing power — confirm before you assume a Tier-1 price point.`,
        signal: `Agencies and coaches already selling internationally (priced in USD/GBP, not ZAR) are the stronger targets.` },
    ]},
  { tier: 3, name: "Tier 3 — Founder-HQ Hub, Not a Client Base", toneKey: "caution",
    blurb: `This is a company-structure signal, not a targeting signal. Don't build a separate search strategy around it — just recognize it when you see it.`,
    countries: [
      { flag: "🇦🇪", name: "United Arab Emirates (Dubai)",
        why: `A large share of online coaches and course-sellers register a Dubai free-zone company and relocate personally for its 0% personal income tax, while still selling to the exact same US/UK/global audience through the exact same channels. A "Dubai-based" founder's clients are almost never in Dubai.`,
        channel: `Whatever channel matches their actual audience's language and content — not a Dubai-specific search`,
        local: `Treat the Dubai address as context for who you're emailing, not a reason to search differently.`,
        signal: `If a target's content and testimonials are English/US-facing, score it exactly like a Tier 1 target — the Dubai registration doesn't change the Vetting Checklist.` },
    ]},
];

const LANE7 = {
  id: "agency", name: `B2B Agency & Marketing Services`,
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

const SCORE_LABELS = [
  { key: "entry", label: "Entry Ease" },
  { key: "dealSize", label: "Deal Size" },
  { key: "competition", label: "Low Competition" },
  { key: "durability", label: "Durability" },
  { key: "safety", label: "Safety" },
  { key: "fit", label: "Beginner Fit" },
];

const SCORE_FACTORS = [
  { key: "signal", label: "Buying-Intent Signal", max: 25,
    help: `Straight from Scout Method 1's green/red flags — how real is the "they're actively selling and might need help" evidence?`,
    options: [
      { label: `Active application/booking page + an explicit hiring signal (job post, "scaling our sales team")`, points: 25 },
      { label: `Booking page exists, no explicit hiring signal, but real testimonials and content`, points: 18 },
      { label: `Found via general niche search only — offer exists, unclear if actively selling`, points: 8 },
      { label: `Dormant page, no clear offer, no social proof`, points: 0 },
    ]},
  { key: "legit", label: "Verifiable Legitimacy", max: 25,
    help: `Built directly from the Vetting Checklist — this is the one factor with a hard override below.`,
    options: [
      { label: `Real, checkable client results — not just the recruiter's income screenshots — and open about refund/chargeback rate`, points: 25 },
      { label: `Some testimonials exist; hasn't shared refund data but nothing's hidden when asked`, points: 15 },
      { label: `Recruiter's own income claims only — no client-side proof offered`, points: 5 },
      { label: `Red flags present: "no experience needed," 100% commission with zero base, cagey when asked for numbers`, points: 0 },
    ]},
  { key: "deal", label: "Deal Economics & Terms", max: 20,
    help: `This should shape how hard you pursue it — confirm everything in writing before you accept anything.`,
    options: [
      { label: `Deal size fits the lane's typical range, and commission % + payment schedule are confirmed in writing`, points: 20 },
      { label: `Deal size fits, but terms are still verbal/unconfirmed`, points: 12 },
      { label: `Below-typical deal size for the lane`, points: 5 },
      { label: `Terms are vague, or shift depending on who you ask`, points: 0 },
    ]},
  { key: "license", label: "Licensing & Regulatory Clarity", max: 15,
    help: `Pulled straight from the Watch Out sections in Pick Lane — funding, real estate, and trading all carry real licensing risk.`,
    options: [
      { label: `Confirmed no license needed — a pure sales, consulting, or education role`, points: 15 },
      { label: `Unclear — needs confirmation before you go further`, points: 7 },
      { label: `Likely requires a license you don't hold (lending origination, real-estate representation, securities advice)`, points: 0 },
    ]},
  { key: "team", label: "Team & Track Record Signal", max: 15,
    help: `Directly from Scout Method 2 — note whether it's a solo founder or a visible team.`,
    options: [
      { label: `Visible team, consistent content history, established operation`, points: 15 },
      { label: `Solo founder, but a real and consistent track record`, points: 8 },
      { label: `Brand new — a single post, no real history`, points: 2 },
    ]},
];

const SCORE_BANDS = [
  { min: 80, max: 100, label: "Green Light", toneKey: "good",
    action: `Send the bespoke Loom this week. This is a Tier 1 target — treat it like one.` },
  { min: 55, max: 79, label: "Worth Pursuing", toneKey: "neutral",
    action: `Add it to this week's outreach wave — but confirm licensing and payment terms before you accept anything, not after.` },
  { min: 30, max: 54, label: "Keep Scouting", toneKey: "plain",
    action: `Log it and move on for now. Not enough signal yet to spend a bespoke Loom on it — a general wave message is fine.` },
  { min: 0, max: 29, label: "Red Flag", toneKey: "caution",
    action: `Walk away. This is exactly what the Vetting Checklist is for — trust it over the pitch.` },
];

const INCOME_SCENARIOS = [
  { name: "Ramping", window: "Days 1–30 in the seat", toneKey: "plain",
    calls: 15, close: "15%", deal: "$5,000", commission: "10%",
    result: "≈ $1,125/month",
    note: `Expect inconsistency here — this system's own Day 46+ tab says the same thing: even experienced reps typically need 3+ months to reach full productivity in a new seat.` },
  { name: "Established", window: "60–90 days in the seat", toneKey: "neutral",
    calls: 25, close: "22%", deal: "$7,000", commission: "10%",
    result: "≈ $3,850/month",
    note: `This is realistically where the CLOSER framework becomes second nature and your close rate stabilizes.` },
  { name: "Beyond 90 Days", window: "The stated ceiling of the role", toneKey: "good",
    calls: 30, close: "20–30%", deal: "$8,000–$15,000", commission: "10%",
    result: "$4,800 – $10,000+/month",
    note: `The system's own example (30 × 20% × $8,000 × 10% = $4,800) sits at the low end of this band. Push close rate to 30% or deal value to $15k on the same 30 calls and you clear $10k — the $8,000–$40,000/month range becomes the real ceiling from here, earned through volume and close-rate discipline, not granted by landing the seat.` },
];

/* ---------------------------------------------------------------------- */
/* PRIMITIVES                                                              */
/* ---------------------------------------------------------------------- */

const h2Style = { fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK };
const pStyle = { fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" };
const eyebrowStyle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", marginBottom: 8 };
const labelStyle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: GOLD_DEEP, marginBottom: 4 };

function ScoreDots({ value, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: i < value ? GOLD : "transparent",
          border: i < value ? "none" : `1px solid ${BORDER}`,
        }} />
      ))}
    </span>
  );
}

function CalloutBox({ toneKey, eyebrow, children }) {
  const t = tone(toneKey);
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ ...eyebrowStyle, color: t.c, display: "flex", alignItems: "center", gap: 6 }}>{eyebrow}</div>
      <div style={{ fontSize: 13, color: INK, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function AccordionShell({ isOpen, onToggle, header, children }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "13px 16px", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {header}
        <span style={{ flexShrink: 0, color: MUTED, fontSize: 14, marginTop: 2 }}>{isOpen ? "⌄" : "›"}</span>
      </button>
      {isOpen && (
        <div style={{ padding: "2px 16px 18px", borderTop: `1px solid ${BORDER}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

function NextLink({ to, icon, title, body }) {
  return (
    <div title={to} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */

function StartTab() {
  return (
    <div>
      <h2 style={h2Style}>What This Manual Does</h2>
      <p style={pStyle}>
        This is the zoomed-out map for the 45-Day system: where the target companies actually are worldwide, a 7th
        lane to add to Pick Lane's six, a scoring system for grading any target company before you spend a bespoke
        Loom on it, and the honest math on what this role really pays. It replaces nothing in the core system — it's
        what you check before and during the Scout tab, not instead of it.
      </p>

      <CalloutBox toneKey="good" eyebrow="📈 The numbers, checked against the outside world">
        Third-party salary data backs up this system's own $8,000–$40,000/month range: Glassdoor's 2025 figures put
        the average high-ticket sales closer at roughly $113,700/year (about $9,500/month), with ZipRecruiter
        showing a $50,000–$150,000/year spread depending on experience and niche. That's a real industry, not hype —
        the range this system is built around sits inside it, not above it.
      </CalloutBox>

      <CalloutBox toneKey="caution" eyebrow="⚠️ Why the scoring in this manual leans so hard on legitimacy">
        This exact space has real, documented casualties — regulators have shut down "become a closer" training
        operations for deceptive income claims, and other well-known programs in this niche have drawn public
        criticism for the same thing. The Vetting Checklist (Toolkit tab) already protects you from this. Target
        Scoring in this manual just turns it into a number you can act on fast.
      </CalloutBox>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ ...eyebrowStyle, color: GOLD_DEEP }}>How to run this manual</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: MUTED, lineHeight: 1.8 }}>
          <li>Check <strong style={{ color: INK }}>Global Sectors</strong> before a scouting sprint — know which tier you're searching in, and why.</li>
          <li>Read <strong style={{ color: INK }}>The 7th Lane</strong> alongside the six already in Pick Lane, if agency/marketing work fits your background.</li>
          <li>Run every real target through <strong style={{ color: INK }}>Target Scoring</strong> before you tier it — it's the Day 4 "Tag each one Tier 1, 2, or 3" step, made explicit.</li>
          <li>Use <strong style={{ color: INK }}>Income Reality</strong> to set expectations with yourself, not to sell yourself a fantasy before Day 1.</li>
        </ol>
      </div>
    </div>
  );
}

function SectorsTab() {
  const [openCountry, setOpenCountry] = useState("United States");
  return (
    <div>
      <h2 style={h2Style}>Global Sectors, Tiered</h2>
      <p style={pStyle}>Ranked the same way the Warm List tracker tiers a target company — by how much real signal is there, not by population or GDP.</p>

      {SECTOR_TIERS.map((t) => {
        const tn = tone(t.toneKey);
        return (
          <div key={t.tier} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span>🌍</span>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: tn.c, margin: 0 }}>{t.name}</p>
            </div>
            <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 12px", lineHeight: 1.6, maxWidth: 640 }}>{t.blurb}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {t.countries.map((c) => {
                const open = openCountry === c.name;
                return (
                  <AccordionShell
                    key={c.name}
                    isOpen={open}
                    onToggle={() => setOpenCountry(open ? null : c.name)}
                    header={
                      <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <span style={{ fontSize: 19, flexShrink: 0 }}>{c.flag}</span>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: INK }}>{c.name}</span>
                      </span>
                    }
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
                      <div>
                        <p style={labelStyle}>Why it's here</p>
                        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{c.why}</p>
                      </div>
                      <div>
                        <p style={labelStyle}>Primary channel</p>
                        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{c.channel}</p>
                      </div>
                      <div>
                        <p style={labelStyle}>Local note</p>
                        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{c.local}</p>
                      </div>
                      <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px" }}>
                        <p style={{ ...labelStyle, color: GOLD_DEEP, display: "flex", alignItems: "center", gap: 5 }}>📍 Strong-target signal</p>
                        <p style={{ fontSize: 12.5, color: INK, lineHeight: 1.6, margin: 0 }}>{c.signal}</p>
                      </div>
                    </div>
                  </AccordionShell>
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
    <div>
      <h2 style={h2Style}>A 7th Lane, Graded the Same Way as the Other Six</h2>
      <p style={pStyle}>Same honest 1–5 grading as Pick Lane, same card format. It doesn't replace any of the six — it's an option if agency/marketing work fits your background.</p>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Lane</th>
              {SCORE_LABELS.map((s) => (
                <th key={s.key} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED, whiteSpace: "nowrap" }}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: `1px solid ${BORDER}` }}>
              <td style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{n.name}</td>
              {SCORE_LABELS.map((s) => (
                <td key={s.key} style={{ padding: "10px" }}><ScoreDots value={n.scores[s.key]} /></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <AccordionShell
        isOpen={open}
        onToggle={() => setOpen(!open)}
        header={
          <span>
            <span style={{ fontWeight: 700, fontSize: 15, color: INK, display: "block" }}>{n.name}</span>
            <span style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, display: "block", marginTop: 3, maxWidth: 560 }}>{n.verdict}</span>
          </span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 12, fontSize: 13 }}>
          <div>
            <p style={labelStyle}>Who buys</p>
            <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{n.icp}</p>
          </div>
          <div>
            <p style={labelStyle}>Deal size</p>
            <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{n.dealSizeText}</p>
          </div>
          <div>
            <p style={labelStyle}>Where to find offers</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
              {n.whereToFind.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: GOLD_DEEP, flexShrink: 0 }}>→</span><span>{w}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={labelStyle}>Common objections</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
              {n.objections.map((o, i) => (
                <div key={i} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px" }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: INK, margin: "0 0 3px" }}>{o.q}</p>
                  <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.55 }}>{o.a}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={labelStyle}>Sample opener</p>
            <p style={{ fontSize: 12.5, color: INK, fontStyle: "italic", lineHeight: 1.6, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px", margin: 0 }}>{n.opener}</p>
          </div>
          <div style={{ background: TONE.caution.bg, border: `1px solid ${TONE.caution.bd}`, borderRadius: 8, padding: "9px 11px" }}>
            <p style={{ ...labelStyle, color: CRIMSON }}>Watch out</p>
            <p style={{ fontSize: 12.5, color: INK, lineHeight: 1.6, margin: 0 }}>{n.watchOut}</p>
          </div>
        </div>
      </AccordionShell>
    </div>
  );
}

function ScoringTab() {
  const [sel, setSel] = useState({});
  const select = (key, idx) => setSel((p) => ({ ...p, [key]: idx }));
  const reset = () => setSel({});

  const totalScore = useMemo(() => SCORE_FACTORS.reduce((sum, f) => {
    const idx = sel[f.key];
    return idx === undefined ? sum : sum + f.options[idx].points;
  }, 0), [sel]);
  const answeredCount = Object.keys(sel).length;
  const allAnswered = answeredCount === SCORE_FACTORS.length;
  const legitScore = sel.legit !== undefined ? SCORE_FACTORS.find((f) => f.key === "legit").options[sel.legit].points : null;
  const hardOverride = legitScore === 0;
  const band = useMemo(() => {
    if (hardOverride) return SCORE_BANDS.find((b) => b.label === "Red Flag");
    return SCORE_BANDS.find((b) => totalScore >= b.min && totalScore <= b.max) || SCORE_BANDS[SCORE_BANDS.length - 1];
  }, [totalScore, hardOverride]);
  const t = tone(band.toneKey);

  return (
    <div>
      <h2 style={h2Style}>Score the Target Company</h2>
      <p style={pStyle}>Answer all five, honestly, about one real target at a time. This makes Day 4's "Tag each one Tier 1, 2, or 3" an actual number instead of a gut call.</p>

      <div style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED, margin: 0 }}>
            {allAnswered ? "Target Score" : `${answeredCount} of ${SCORE_FACTORS.length} answered`}
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: t.c, margin: 0 }}>{totalScore} / 100</p>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ height: 6, flex: 1, borderRadius: 3, background: i < Math.round(totalScore / 5) ? t.c : "transparent", border: i < Math.round(totalScore / 5) ? "none" : `1px solid ${BORDER}` }} />
          ))}
        </div>
        {allAnswered && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🎯</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: t.c, margin: 0, lineHeight: 1.3 }}>{band.label}{hardOverride && " — Legitimacy Override"}</p>
              <p style={{ fontSize: 12.5, color: INK, margin: "4px 0 0", lineHeight: 1.6 }}>{band.action}</p>
            </div>
          </div>
        )}
        {answeredCount > 0 && (
          <button onClick={reset} style={{ marginTop: 12, background: "none", border: "none", padding: 0, fontSize: 11.5, color: MUTED, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}>
            Reset and score a different target
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SCORE_FACTORS.map((f) => (
          <div key={f.key}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>{f.label}</p>
              <p style={{ fontSize: 10.5, color: MUTED, margin: 0, whiteSpace: "nowrap" }}>max {f.max} pts</p>
            </div>
            <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px", lineHeight: 1.55 }}>{f.help}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {f.options.map((o, oi) => {
                const isSel = sel[f.key] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => select(f.key, oi)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                      borderRadius: 9, padding: "10px 12px", border: `1px solid ${isSel ? GOLD : BORDER}`,
                      background: isSel ? "rgba(201,154,59,0.10)" : "#FFFFFF", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12, lineHeight: 1.55, color: isSel ? INK : MUTED }}>{o.label}</span>
                    <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: isSel ? GOLD_DEEP : MUTED }}>+{o.points}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomeTab() {
  return (
    <div>
      <h2 style={h2Style}>What This Role Actually Pays</h2>
      <p style={pStyle}>Built on the Day 46+ formula, not a bigger number invented for this manual.</p>

      <div style={{ background: "#FFFFFF", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ ...eyebrowStyle, color: GOLD_DEEP }}>💵 The formula that actually sets your income</div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: "0 0 6px" }}>Qualified Calls × Close Rate × Average Deal Value × Commission % = Monthly Income</p>
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>Every scenario below is this exact formula, run with different — and honest — inputs for where you actually are in the seat.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {INCOME_SCENARIOS.map((s) => {
          const t = tone(s.toneKey);
          return (
            <div key={s.name} style={{ border: `1px solid ${t.c === MUTED ? BORDER : t.c}`, borderRadius: 12, background: "#FFFFFF", overflow: "hidden" }}>
              <div style={{ padding: "13px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: INK, margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: 10.5, color: MUTED, textTransform: "", letterSpacing: "0.06em", margin: "3px 0 0" }}>{s.window}</p>
                </div>
                <p style={{ fontSize: 17, fontWeight: 800, color: t.c, margin: 0, whiteSpace: "nowrap" }}>{s.result}</p>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", fontSize: 11.5, color: MUTED, marginBottom: 8 }}>
                  <span>{s.calls} calls/mo</span><span>×</span><span>{s.close} close</span><span>×</span><span>{s.deal} deal</span><span>×</span><span>{s.commission} commission</span>
                </div>
                <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{s.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ ...eyebrowStyle, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}>👥 Why this varies so much</p>
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.65, margin: 0 }}>
          Commission-only income means the company has made zero financial investment in your success — the variance
          above is the actual shape of that trade-off, not a flaw in the system. It's also exactly why Target
          Scoring's Legitimacy and Deal Economics factors matter more here than in almost any other kind of sales
          role: a bad seat doesn't just waste your time, it can make every number in this formula worse at once —
          fewer qualified calls, a lower real close rate, and deal or commission terms that move after you've
          already started.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

export default function AscentGlobalTargetingManual() {
  const [activeTab, setActiveTab] = useState("start");

  const countryCount = SECTOR_TIERS.reduce((s, t) => s + t.countries.length, 0);

  const VITALS = [
    { label: "Countries Mapped", value: String(countryCount), toneKey: "good", note: `across ${SECTOR_TIERS.length} tiers` },
    { label: "Lanes Covered", value: "7", toneKey: "neutral", note: "Pick Lane's six, plus Agency" },
    { label: "Scoring Scale", value: "0–100", toneKey: "neutral", note: "5 factors, 1 hard override" },
    { label: "Formula Basis", value: "Day 46+", toneKey: "good", note: "same math as the calculator" },
  ];

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #FDF9F0 0%, ${CREAM_DEEP} 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "24px 18px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: CRIMSON, textTransform: "", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, boxShadow: `0 0 6px ${GOLD}`, display: "inline-block" }} />
            The Ascent · Sector Intelligence Module
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: `linear-gradient(130deg, #1A140F 20%, ${GOLD} 70%, ${CRIMSON} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Global Targeting Manual
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, maxWidth: 660, lineHeight: 1.7 }}>
            Where the target companies actually are worldwide, a 7th lane, a five-factor scoring system for any
            target before you burn a Loom on it, and the honest math on what this role really pays. Score every
            target before you Loom it — <strong style={{ color: GOLD_DEEP }}>the list doesn't close deals, the Vetting Checklist does</strong>.
          </p>

          {/* VITALS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9, marginBottom: 18 }}>
            {VITALS.map((v) => {
              const t = tone(v.toneKey);
              return (
                <div key={v.label} style={{ background: "#FFFFFF", border: `1px solid ${t.bd}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED, marginBottom: 4 }}>{v.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.c, marginBottom: 3 }}>{v.value}</div>
                  <div style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.4 }}>{v.note}</div>
                </div>
              );
            })}
          </div>

          {/* TABS */}
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: activeTab === t.id ? `2px solid ${GOLD}` : "2px solid transparent",
                  color: activeTab === t.id ? GOLD_DEEP : "#8A7C6D",
                  padding: "11px 14px", fontSize: 12.5, fontWeight: activeTab === t.id ? 700 : 500,
                  whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
        {activeTab === "start" && <StartTab />}
        {activeTab === "sectors" && <SectorsTab />}
        {activeTab === "lane7" && <Lane7Tab />}
        {activeTab === "scoring" && <ScoringTab />}
        {activeTab === "income" && <IncomeTab />}
      </div>

      {/* CTA FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: "#FFFFFF" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 16px 40px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, marginBottom: 12 }}>Continue The System</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <NextLink to="/the-ascent" icon="🧭" title="The Ascent" body="The full 45-day roadmap — Scout, Pick Lane and Day 4's tiering step this manual makes explicit." />
            <NextLink to="/performance-calculator" icon="🧮" title="Performance Calculator" body="Model a specific target's real numbers once you've scored it here." />
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            🛡️ Score every target before you Loom it. The list doesn't close deals — the Vetting Checklist does.
          </p>
        </div>
      </div>
    </div>
  );
}
