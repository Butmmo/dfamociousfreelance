// The Ascent — The Briefing
// Restyled to match smb-path-briefing.jsx's DBI Regal design system exactly:
// cream/gold/crimson palette, Inter type, inline styles, emoji iconography.
// Same primitives as TheAscentPerformanceCalculator.jsx, TheAscentGlobalTargetingManual.jsx
// and the-ascent.jsx, for one consistent visual system across the stack.
// All data and copy carried over unchanged from the original dark
// "signal/insignia/alert" theme — visuals only were replaced.

import { useState } from "react";

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
  { id: "brief", label: "🧭 The Briefing" },
  { id: "highs", label: "⚡ The Highs" },
  { id: "lows", label: "⚠️ The Lows" },
  { id: "standout", label: "🥊 Stand Out" },
  { id: "durability", label: "📈 Durability" },
  { id: "competition", label: "👥 Competition" },
  { id: "fit", label: "✅ Your Lane?" },
];

const SNAPSHOT_LABELS = [
  { key: "entry", label: "Entry Ease" },
  { key: "dealSize", label: "Deal Size" },
  { key: "competition", label: "Low Competition" },
  { key: "durability", label: "Durability" },
  { key: "safety", label: "Safety" },
  { key: "fit", label: "Beginner Fit" },
];

// Averaged directly from Pick Lane's six-factor grading across all seven lanes
// (the six in The Ascent plus the 7th Lane in the Global Targeting Manual).
const PATH_SNAPSHOT = { entry: 3, dealSize: 4, competition: 3, durability: 4, safety: 3, fit: 3 };

const HIGHS = [
  { title: "Zero capital to start",
    body: `No inventory, no ad spend, no paid course required to get in the door. The system this briefing sits in front of is built to run on $0 — paid tools show up only as accelerants, never requirements.` },
  { title: "Paid on outcome, not on hours",
    body: `Commission-based pay means your ceiling isn't set by a manager's budget for your role — it's set by how much you close and how often. Nobody caps a good month.` },
  { title: "The skill outlives any one seat",
    body: `Lose a contract and you keep the thing that got you it: the ability to scout, pitch, and run a call. A dropshipping store built around one supplier or one ad account doesn't survive that same kind of loss nearly as easily.` },
  { title: "A real, independently-tracked pay ceiling",
    body: `Glassdoor, ZipRecruiter, and Salary.com all show a genuine high-earning tier for this exact job title — not just a recruiter's income screenshot. (How much these trackers disagree with each other is in Durability — read that part closely too.)` },
  { title: "No degree, license, or portfolio gate — mostly",
    body: `Outside a few specific lanes (funding, real estate, trading — each flagged in Pick Lane), nobody's checking credentials. What gets you considered is proof you can run a call, not a diploma.` },
  { title: "Remote by default",
    body: `Every lane in this system assumes you're working from wherever you already are. Your address has never mattered less to an employer than it does in this specific role.` },
];

const LOWS = [
  { title: "100% commission, most of the time",
    body: `No seat, no close, no pay — for most roles in this space there's no salary floor cushioning a slow month. The 45-Day System doesn't pretend otherwise: most people aren't earning, or even placed yet, on Day 1.` },
  { title: `The ramp is real, and it isn't instant`,
    body: `Even once you're placed, the first 30 days in a seat are built to be inconsistent — real stabilization lands around 60–90 days in. Anyone telling a Day-1 beginner to expect ceiling-level income in month one is selling something other than an honest career.` },
  { title: "This exact space has a documented scam history",
    body: `Over the past few years the FTC has sued and settled with multiple "become a closer" and business-coaching operations for guaranteed, no-experience-needed income claims that didn't hold up — returning millions of dollars combined to the people who bought in. That history is exactly why every seat, not just the first one that says yes to you, needs vetting.` },
  { title: `Rejection is the job, not a sign something's wrong`,
    body: `Outbound scouting means most contacts don't respond and most calls don't close. That's the normal shape of this work, every week, indefinitely — not a signal to fix your approach after one bad day.` },
  { title: "A few lanes carry real regulatory or reputational exposure",
    body: `Trading and signal-based offers draw increasing regulatory attention; funding and real-estate roles can shade into activity that legally requires a license you don't hold. Pick Lane's "Watch Out" notes exist specifically for this.` },
  { title: "No employer safety net",
    body: `This is independent-contractor work in almost every seat: no health coverage, no paid leave, no employer-side tax handling. Budget and file for that reality wherever you're based.` },
  { title: `You're never fully off`,
    body: `The pipeline goes cold the moment you stop feeding it — even after you land a seat. Staying in this career means scouting lightly forever, not just for 45 days.` },
];

const MODEL_FACTORS = [
  { key: "capitalLight", label: "Capital-Light" },
  { key: "speed", label: "Speed to First $" },
  { key: "ceiling", label: "Income Ceiling" },
  { key: "ownership", label: "Ownership Built" },
  { key: "portability", label: "Portability" },
];

const MODELS = [
  { id: "htc", name: "High-Ticket Closing", capitalLight: 5, speed: 3, ceiling: 4, ownership: 1, portability: 4 },
  { id: "content", name: "Content & Creator Monetization", capitalLight: 4, speed: 1, ceiling: 5, ownership: 5, portability: 3 },
  { id: "ecom", name: "E-Commerce / Dropshipping", capitalLight: 1, speed: 3, ceiling: 4, ownership: 4, portability: 2 },
  { id: "freelance", name: "Freelance Services", capitalLight: 5, speed: 2, ceiling: 3, ownership: 3, portability: 5 },
  { id: "product", name: "Build Your Own Product", capitalLight: 3, speed: 1, ceiling: 5, ownership: 5, portability: 4 },
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
  { name: "Credit & Business Funding", score: 3 },
  { name: "Dating & Relationship Coaching", score: 2 },
  { name: "Real Estate", score: 3 },
  { name: "Content & Personal Branding", score: 2 },
  { name: "Trading & Trading Bots", score: 3 },
  { name: "AI & B2B AI Implementation", score: 5 },
  { name: "B2B Agency & Marketing Services", score: 3 },
];

const FIT_CHECKS = [
  `Can you genuinely go 30–60 days on $0 from this path without it wrecking your finances or your morale?`,
  `Are you drawn to conversation and persuasion more than to building, writing, or designing something of your own?`,
  `Can rejection roll off you — dozens of times a week, indefinitely — without it turning personal?`,
  `Do you want to start today with what you already have, more than you want to spend months building an audience or a product first?`,
  `Will you actually run every "seat" through a vetting checklist, even when someone's telling you exactly what you want to hear?`,
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

function PointList({ items, toneKey, mark }) {
  const t = tone(toneKey);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px 15px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <span style={{
              flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: t.bg, border: `1px solid ${t.bd}`,
              color: t.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, marginTop: 1,
            }}>{mark}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: INK, margin: "0 0 4px" }}>{item.title}</p>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.65, margin: 0 }}>{item.body}</p>
            </div>
          </div>
        </div>
      ))}
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

function BriefTab() {
  return (
    <div>
      <h2 style={h2Style}>What Doorway Is This, Really?</h2>
      <p style={pStyle}>
        Inside DBI (D'Famocious Freelance Scholarship), "Digital Systems Engineering" covers a lot of ground. This
        is the one door, of the seven, that's a sales role — not a content play, not a storefront, not a product
        build. You learn a structured way to run a sales conversation, then get hired, almost always on commission,
        by an online coach, consultant, or agency to close their qualified leads into paying clients.{" "}
        <strong style={{ color: INK }}>The Ascent</strong> — the 45-day system — is how you actually land that seat.
        This briefing is what comes before it: an honest look at the doorway itself, so choosing it is a decision,
        not a reflex.
      </p>

      <CalloutBox toneKey="caution" eyebrow="⚠️ Read this before your 24 hours are up">
        Nobody — inside DBI or outside it — can honestly promise you a number. This exact corner of the internet has
        a real regulatory paper trail: over the past few years the FTC has sued and settled with multiple "become a
        closer" and business-coaching operations for guaranteed, no-experience-needed income claims that didn't hold
        up, returning millions of dollars combined to the people who bought in. That's not a reason to write this
        path off — it's a genuine, working career for plenty of people. It's a reason to read every figure in this
        briefing, and every figure anyone ever gives you in this space, as a range you might reach — never a number
        owed to you for signing up.
      </CalloutBox>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>Path Snapshot</p>
      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", rowGap: 12, columnGap: 16 }}>
          {SNAPSHOT_LABELS.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12.5, color: MUTED }}>{s.label}</span>
              <ScoreDots value={PATH_SNAPSHOT[s.key]} />
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, margin: "0 0 20px" }}>
        Averaged across all seven lanes graded in Pick Lane and the 7th Lane (Global Targeting Manual) — the
        specific lane you pick will swing several points in either direction. No lane scores a flat 5 across the
        board, including this one, averaged. That's the honest picture, not a pitch.
      </p>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ ...eyebrowStyle, color: GOLD_DEEP }}>How to use this briefing</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: MUTED, lineHeight: 1.8 }}>
          <li>Read all seven tabs once, in order — twenty honest minutes.</li>
          <li>Cross-check anything that surprises you against Pick Lane, the Global Targeting Manual, or the Performance Calculator before you decide.</li>
          <li>If you choose this door, <strong style={{ color: INK }}>The Ascent</strong> is where Day 1 actually starts.</li>
        </ol>
      </div>
    </div>
  );
}

function HighsTab() {
  return (
    <div>
      <h2 style={h2Style}>The Highs</h2>
      <p style={pStyle}>Genuine advantages, not recruiter talk — each one checked against the rest of this system or outside data.</p>
      <PointList items={HIGHS} toneKey="good" mark="⚡" />
    </div>
  );
}

function LowsTab() {
  return (
    <div>
      <h2 style={h2Style}>The Lows</h2>
      <p style={pStyle}>Skip any of these and you're choosing this path with your eyes half-open.</p>
      <PointList items={LOWS} toneKey="caution" mark="!" />
    </div>
  );
}

function StandoutTab() {
  return (
    <div>
      <h2 style={h2Style}>What Actually Makes This Stand Out</h2>
      <p style={pStyle}>"Digital income" covers very different bets. Here's this one, lined up honestly against four common alternatives.</p>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Model</th>
              {MODEL_FACTORS.map((f) => (
                <th key={f.key} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED, whiteSpace: "nowrap" }}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => (
              <tr key={m.id} style={{ borderTop: `1px solid ${BORDER}`, background: m.id === "htc" ? "rgba(201,154,59,0.08)" : "#FFFFFF" }}>
                <td style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{m.id === "htc" ? "🎯 " : ""}{m.name}</td>
                {MODEL_FACTORS.map((f) => (
                  <td key={f.key} style={{ padding: "10px" }}><ScoreDots value={m[f.key]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: INK, lineHeight: 1.65, margin: "0 0 10px" }}>
          The honest headline: this is one of the only digital paths where you can go from zero capital to a real
          paycheck without first building an audience, a store, or a product. That speed is real, and it's exactly
          why this door attracts people who need income sooner rather than later.
        </p>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, margin: 0 }}>
          The honest trade-off sits right next to it: at the end of it, you own nothing. No audience, no equity, no
          product, no IP — every dollar depends on someone else's business staying open and paying you on time, for
          as long as you keep showing up and closing. A creator or a builder is stacking an asset while they work. A
          closer is renting out a skill, deal by deal. Neither is wrong. They're different bets on time.
        </p>
      </div>

      <CalloutBox toneKey="neutral" eyebrow="🧭 Why vetting matters more here">
        This is exactly why Pick Lane's Vetting Checklist and the Global Targeting Manual's Target Scoring exist.
        When you own nothing but the relationship, who you work for matters more here than in almost any other
        digital path on this table.
      </CalloutBox>
    </div>
  );
}

function DurabilityTab() {
  return (
    <div>
      <h2 style={h2Style}>How Durable Is The Demand, Really?</h2>

      <CalloutBox toneKey="good" eyebrow="⚡ The pay numbers, checked in mid-2026">
        Even within a single tracker, the exact phrase you search changes the answer: ZipRecruiter data shows
        roughly $36K/year for the literal title "High Ticket Closer" in one 2026 pull, but roughly $113K/year for
        "remote sales closer" the same year. Glassdoor's own number for "High Ticket Sales Closer" sits close to
        that second figure, near $113K/year; Salary.com lands around $88K. That's close to a 3x spread depending on
        which of these near-identical titles gets searched — a sign of inconsistent titling and thin, self-reported,
        commission-heavy data, not a hidden "true" number waiting to be found. Read every income figure in this
        space, including the ones in The Ascent, as a directional range, not a quote.
      </CalloutBox>

      <PointList items={DURABILITY_POINTS} toneKey="neutral" mark="🌍" />
    </div>
  );
}

function CompetitionTab() {
  return (
    <div>
      <h2 style={h2Style}>How Competitive Is It, Really?</h2>

      <div style={{ marginBottom: 20 }}>
        <PointList items={COMPETITION_POINTS} toneKey="neutral" mark="👥" />
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>📊 Competition by lane</p>
      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Lane</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Low-Competition Score</th>
            </tr>
          </thead>
          <tbody>
            {LANE_COMPETITION.map((l) => (
              <tr key={l.name} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{l.name}</td>
                <td style={{ padding: "10px 12px" }}><ScoreDots value={l.score} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>Straight from Pick Lane's own six-factor grading (Global Targeting Manual included) — higher dots mean less competition, not more of it.</p>
    </div>
  );
}

function FitTab() {
  return (
    <div>
      <h2 style={h2Style}>Is This Your Lane?</h2>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ ...eyebrowStyle, color: GOLD_DEEP }}>Five honest questions, not a scored quiz</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FIT_CHECKS.map((q, i) => (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <span style={{
                flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: TONE.good.bg, border: `1px solid ${TONE.good.bd}`,
                color: EMERALD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, marginTop: 1,
              }}>✓</span>
              <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{q}</span>
            </div>
          ))}
        </div>
      </div>

      <CalloutBox toneKey="neutral" eyebrow="🧭 There's no wrong door, only an honest one">
        None of DBI's seven doors is "the right one," and this briefing isn't built to talk you into this one — Pick
        Lane's own line applies just as much up here: choose with open eyes, not the answer it's grading for. If the
        highs in this document sound like a career and the lows sound like a livable trade-off, this door is a
        genuinely real one. If the lows sound like more than you're set up to carry right now, that's useful
        information too — a fit question answered honestly, on your own terms, before the clock runs out instead of
        after.
      </CalloutBox>

      <div style={{ background: "#FFFFFF", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ fontSize: 13, color: INK, lineHeight: 1.65, margin: 0 }}>
          <strong>If you choose this door:</strong> The Ascent (45-Day System) is where Day 1 starts. Keep the
          Global Targeting Manual and the Performance Calculator open alongside it — this briefing's job ends here.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

export default function AscentPathBriefing() {
  const [activeTab, setActiveTab] = useState("brief");

  const VITALS = [
    { label: "Sections", value: "7", toneKey: "neutral", note: "read in order, once" },
    { label: "Snapshot Factors", value: "6", toneKey: "neutral", note: "averaged across all seven lanes" },
    { label: "Models Compared", value: "5", toneKey: "good", note: "high-ticket closing vs. four alternatives" },
    { label: "Capital Required", value: "$0", toneKey: "good", note: "same zero-capital basis as The Ascent" },
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
            The Ascent · Decision Briefing
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: `linear-gradient(130deg, #1A140F 20%, ${GOLD} 70%, ${CRIMSON} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Briefing
          </h1>
          <p style={{ margin: "0 0 4px", fontSize: 12.5, color: GOLD_DEEP, fontWeight: 700 }}>High-Ticket Closing — One Door Inside DBI</p>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, maxWidth: 660, lineHeight: 1.7 }}>
            An honest look at the doorway itself, before you spend 45 days walking through it — the highs, the lows,
            how it compares to other zero-capital paths, and whether it's actually your lane.
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
                  padding: "11px 13px", fontSize: 12.5, fontWeight: activeTab === t.id ? 700 : 500,
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
        {activeTab === "brief" && <BriefTab />}
        {activeTab === "highs" && <HighsTab />}
        {activeTab === "lows" && <LowsTab />}
        {activeTab === "standout" && <StandoutTab />}
        {activeTab === "durability" && <DurabilityTab />}
        {activeTab === "competition" && <CompetitionTab />}
        {activeTab === "fit" && <FitTab />}
      </div>

      {/* CTA FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: "#FFFFFF" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 16px 40px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, marginBottom: 12 }}>If You Choose This Door</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
            <NextLink to="/the-ascent" icon="🧭" title="The Ascent" body="Day 1 of the 45-day system starts here." />
            <NextLink to="/global-targeting-manual" icon="🌍" title="Global Targeting Manual" body="Where the target companies are, and the 7th lane." />
            <NextLink to="/performance-calculator" icon="🧮" title="Performance Calculator" body="Model your own real numbers before you start." />
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            🛡️ Decision support, not a pitch — every figure here is a range to plan around, not a promise.
          </p>
        </div>
      </div>
    </div>
  );
}
