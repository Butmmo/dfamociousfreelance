// SMB Path Briefing — preview build for verification before integration.
// Adapted from the TanStack Router version (smb-path-briefing.tsx):
//   - createFileRoute()/Route registration removed (no router in this preview)
//   - <Link to={...}> swapped for a static <div title={to}> in NextLink, so the
//     destination path is still visible on hover, just not navigable here
// Restore both when copying this component back into the router-driven app.
//
// Every figure here is pulled from the Global SMB Engine, SMB Performance Calculator
// and 45-Day Implementation Playbook, so this stays consistent with the rest of the system.
//
// Route metadata (for reference only — not wired up in this preview):
//   path:        /_authenticated/playbooks/smb-path-briefing
//   title:       SMB Optimisation System — Path Briefing · DBI Citadel
//   description: The highs, the lows, the durability and the competition inside the
//                SMB Optimisation System — read this before your 24 hours are up.

import { useState } from "react";

/* ─── PALETTE (DBI Regal, matched to the Global SMB Engine) ─── */
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

const VITALS = [
  { label: "Cost To Start",     value: "$0 → ~$25/mo",         tone: "good",    note: "Lovable Pro is the only spend until client 1 pays" },
  { label: "First Client",      value: "4–8+ weeks",           tone: "caution", note: "of daily, manual, researched outreach" },
  { label: "Client Ceiling",    value: "$888–$1,188/mo",       tone: "good",    note: "one client, fully upsold, after roughly 7 months" },
  { label: "What Carries It",   value: "Outreach, not code",   tone: "neutral", note: "sales stamina matters more than technical skill" },
  { label: "Competition",       value: "Rising fast",          tone: "caution", note: "one of the fastest-growing starter paths globally" },
  { label: "Underlying Demand", value: "Structurally durable", tone: "good",    note: "cyclically sensitive to SMB ad budgets" },
];

const TABS = [
  { id: "overview",    label: "🔎 Overview" },
  { id: "highs",       label: "⚡ The Highs" },
  { id: "lows",        label: "⚠️ The Lows" },
  { id: "durability",  label: "📈 Durability" },
  { id: "competition", label: "🥊 Competition" },
  { id: "fit",         label: "✅ Is This You" },
];

const HIGHS = [
  { title: "Near-zero startup capital", body: "Genuinely $0 for week one. About $25/month after that for Lovable Pro. Go High Level's own ~$97/month tier doesn't need to come out of your pocket until your first invoice covers it." },
  { title: "Recurring, compounding income", body: "Every service on the ladder is a monthly retainer, not a one-off gig. One client who stays the full run is worth $888–$1,188/month by month seven — and that repeats every month after, not just once." },
  { title: "Provable, not persuaded", body: "Reviews landing, calls answered, appointments booked — a business owner can watch these move themselves. That is an easier case to make than anything built on taste or branding." },
  { title: "Global reach by design", body: "Your own Notion CRM already lists USA, UK, Canada, Australia, Germany, Netherlands, UAE and Israel as target countries. You can be based anywhere and legitimately serve businesses in stronger-currency markets." },
  { title: "Skills that outlast the niche", body: "Outbound offer-writing, Go High Level automation building, and client management transfer to almost any future business. This path doubles as a paid apprenticeship in running one." },
  { title: "A checklist, not a guess", body: "The email cadence, the workflow steps and the scoring rubric are already written down. The work here is disciplined execution, not invention." },
];

const LOWS = [
  { title: "Sales work first, always", body: "The engine is five personalised, researched cold emails a day — about 75 minutes of focused work — mostly met with silence. If rejection genuinely drains you rather than mildly annoys you, expect this to feel heavy before it feels rewarding." },
  { title: "Weeks, not days, to real income", body: "The plan's own target is one closed client inside a 45-day runway. That is the honest yardstick, not a guarantee — and that first client typically starts at $297/month, not the full ladder, which only arrives after roughly seven months if that one client stays that long." },
  { title: "Early income is concentrated", body: "For months, most of your revenue sits in one to three clients. Losing a single one is a proportionally large hit until your base is wider." },
  { title: "You become the tech support too", body: "When a workflow misfires or an integration quietly breaks, your client calls you — not Go High Level." },
  { title: "You don't control the tools underneath you", body: "Go High Level, Bland AI (billed per minute), Lovable and ContactOut are all vendors outside your control. Pricing tiers and features shift, and your margin moves with them." },
  { title: "The scripts aren't secret anymore", body: "The Gap → Leak → Lift → Breakup cadence, and reselling Go High Level as review, speed-to-lead and AI receptionist retainers, is now taught by a large and growing number of course creators worldwide. Some business owners already recognise the shape of this pitch — your research quality ends up mattering more than the template." },
];

const DURABILITY = [
  { title: "The need is structural", body: "Local businesses will always want more reviews, faster responses and more booked calls than they currently get. That doesn't disappear with any single AI model or app update." },
  { title: "The spend is cyclical", body: "SMB marketing budgets are usually first to shrink when the local economy tightens — and how hard depends on the niche. Discretionary spots (restaurants, salons, gyms) tend to cut faster than referral-driven, harder-to-defer niches (dental, legal, home trades). Choosing a niche on purpose, not just on what's easiest to find on Maps, is a real durability decision." },
  { title: "The tools are the least durable layer", body: "Go High Level's reseller economics are still healthy heading through 2026, but full white-label features sit on a higher-cost plan tier than the Starter tier this playbook has you begin on. Budget for the tool stack to cost more as you scale, not less — the same applies to any per-minute AI voice pricing." },
  { title: "The bar is rising, not falling", body: "Buyers are getting more selective about automation pitches in general. Vague 'we automate things with AI' offers are the part of this market getting crowded — offers tied to one specific, visible outcome, which is exactly what this playbook already has you lead with, are the more durable version of this business to be running." },
];

const COMPETITION = [
  { title: "The entry ticket is genuinely low", body: "A laptop, roughly $25–$100 a month in tools, and a playbook like this one — which is exactly why so many people are entering it. This has been one of the fastest-growing starter business models globally over the last two years." },
  { title: "Two very different competitive realities", body: "The generic version — \"I do automation for any local business\" — is genuinely crowded and increasingly a race to the bottom on price. The specific version — one named niche, one named city or country, built on real research into that one business's actual gap — is a far smaller, far less contested field." },
  { title: "The tool was never the edge", body: "Go High Level is now the resale engine behind a large and fast-growing number of agencies worldwide. The durable differentiator was always meant to be the research, niche depth and delivery reliability layered on top of it — exactly the direction the 3-Problem Method and niche playbooks already point you." },
  { title: "What this means in practice", body: "Expect response rates on generic, templated outreach to keep declining, and response rates on specific, well-researched outreach — one niche, one region, one named problem — to hold up far better by comparison." },
];

const FIT_YES = [
  "A repeated \"no\" annoys you — it doesn't wear you down",
  "You're fine being both the salesperson and the tech support, at least for the first few months",
  "You can hold a daily outreach habit for weeks before the first real payoff shows up",
  "You're comfortable representing yourself with confidence to business owners in a different country or time zone",
];

const FIT_NO = [
  "You need income inside days, not weeks",
  "You want a purely technical, build-only role with no client conversations at all",
  "Cold outreach isn't just uncomfortable — it's something you find genuinely intolerable",
];

export default function SmbPathBriefing() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #FDF9F0 0%, ${CREAM_DEEP} 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "24px 18px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: CRIMSON, textTransform: "", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, boxShadow: `0 0 6px ${GOLD}`, display: "inline-block" }} />
            SMB Optimisation System · Path Briefing
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: `linear-gradient(130deg, #1A140F 20%, ${GOLD} 70%, ${CRIMSON} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Know This Path Before You Pick It
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, maxWidth: 640, lineHeight: 1.7 }}>
            Every high, every low, and everything that decides whether the SMB Optimisation System is the right 24 hours'
            worth of commitment for you — before you commit, not after. Same stack the rest of this engine runs on:{" "}
            <strong style={{ color: "#7A5A00" }}>Go High Level, Notion, Lovable, Make / Zapier / n8n</strong>.
          </p>

          {/* VITALS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9, marginBottom: 18 }}>
            {VITALS.map((v) => {
              const t = TONE[v.tone];
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
                onClick={() => setTab(t.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: tab === t.id ? `2px solid ${GOLD}` : "2px solid transparent",
                  color: tab === t.id ? GOLD_DEEP : "#8A7C6D",
                  padding: "11px 14px", fontSize: 12.5, fontWeight: tab === t.id ? 700 : 500,
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

        {tab === "overview" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK }}>What You're Actually Signing Up For</h2>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
              In plain terms: you become a subscription seller for local businesses. You are not writing software from
              scratch — you are installing, customising and reselling automations, running on Go High Level, that fix
              problems almost every local business already has: not enough reviews, slow response to new leads, missed
              calls, and eventually, a website that undersells them.
            </p>
            <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: GOLD_DEEP, marginBottom: 10 }}>The Motion, In Five Steps</div>
              {[
                ["Scout", "Google Maps, one niche, one city or country at a time."],
                ["Score", "The Grand Slam rubric turns a gut feeling into a 1–10 number: Hot, Warm or Cold."],
                ["Enrich", "The owner's name and personal email, plus three connected problems: the Gap, the Leak and the Lift."],
                ["Pitch one thing", "A four-email sequence over twelve days, always starting with the review gap — never all three problems at once."],
                ["Deliver, then climb", "Reviews first, then Speed-to-Lead, then an AI receptionist, then the website — each one earns the right to pitch the next."],
              ].map(([step, body], i) => (
                <div key={step} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "rgba(122,90,0,0.1)", color: GOLD_DEEP, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{step}</span>
                    <span style={{ fontSize: 12.5, color: MUTED }}> — {body}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0 }}>
              What makes it stand out as a monetisation system is simple: what you're selling shows up as a number the
              client can watch move themselves — reviews per week, calls answered, appointments booked. That makes the
              case for being paid without needing to oversell anything.
            </p>
          </div>
        )}

        {tab === "highs" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK }}>Why It's a Genuinely Strong Starting Path</h2>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
              The perks are real — they're just worth naming precisely instead of taking on faith.
            </p>
            <PointList items={HIGHS} tone="good" mark="✓" />
          </div>
        )}

        {tab === "lows" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK }}>What the Highlight Reel Leaves Out</h2>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
              None of this is a reason not to start. It's the honest weather report, so nothing here catches you by
              surprise in week three.
            </p>
            <PointList items={LOWS} tone="caution" mark="!" />
          </div>
        )}

        {tab === "durability" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK }}>How Much of This Is Built to Last</h2>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
              Separate the need from the tools — they age at very different speeds.
            </p>
            <PointList items={DURABILITY} tone="neutral" mark="◆" />
          </div>
        )}

        {tab === "competition" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK }}>How Crowded This Actually Is</h2>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
              Low barrier to entry cuts both ways — it's why the path is reachable, and why it fills up fast.
            </p>
            <PointList items={COMPETITION} tone="caution" mark="⊙" />
          </div>
        )}

        {tab === "fit" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK }}>Is This Actually You?</h2>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
              The tools and the market are only half the decision. The other half is you.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
              <FitColumn heading="Likely a strong fit if…" tone="good" items={FIT_YES} />
              <FitColumn heading="Worth pausing on if…" tone="caution" items={FIT_NO} />
            </div>
            <div style={{ background: "rgba(122,90,0,0.06)", border: "1px solid rgba(122,90,0,0.3)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: GOLD_DEEP, marginBottom: 6 }}>The Honest Trade</div>
              <p style={{ fontSize: 13, color: INK, lineHeight: 1.7, margin: 0 }}>
                This path rewards consistency over talent, and sales stamina over technical sophistication. If that trade
                sounds right, very little here is left to guesswork — the scripts, the workflows and the numbers are
                already written down for you in the playbooks below.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* CTA FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: "#FFFFFF" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 16px 40px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, marginBottom: 12 }}>Once You've Chosen This Path</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <NextLink to="/_authenticated/playbooks/global-smb-engine" icon="🌍" title="SMB Prospecting Guide" body="Pick your country and boring niche, run the map searches, score your leads and build the offer." />
            <NextLink to="/_authenticated/playbooks/smb-calculator" icon="🧮" title="SMB Performance Calculator" body="Model the real numbers for a specific business before you pitch anyone." />
            <NextLink to="/_authenticated/playbooks/plan" icon="📅" title="SMB Optimisation Engine" body="Day 1 starts here — the free-account setup, before a single email goes out." />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── UI PRIMITIVES ─── */
function PointList({ items, tone, mark }) {
  const t = TONE[tone];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it) => (
        <div key={it.title} style={{ display: "flex", gap: 10, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 11, padding: "12px 14px" }}>
          <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: t.bg, color: t.c, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{mark}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: INK, marginBottom: 3 }}>{it.title}</div>
            <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>{it.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FitColumn({ heading, tone, items }) {
  const t = TONE[tone];
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: t.c, marginBottom: 10 }}>{heading}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((line) => (
          <div key={line} style={{ display: "flex", gap: 8, fontSize: 12.5, color: INK, lineHeight: 1.55 }}>
            <span style={{ color: t.c, flexShrink: 0 }}>—</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* NextLink: rendered as a static <div title={to}> here — hover shows the intended
   route so you can still verify destinations. Swap back to TanStack's
   <Link to={to}> (as in the original .tsx) before shipping this to the router-driven app. */
function NextLink({ to, icon, title, body }) {
  return (
    <div
      title={to}
      style={{
        display: "block", background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12,
        padding: "14px 16px", textDecoration: "none", color: "inherit", transition: "border-color .15s",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}
