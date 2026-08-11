import { useState, useMemo } from "react";

/* ============================================================
   DATA
   ============================================================ */

const WEEK_SNAPSHOT = [
  { range: "Days 1–7",   title: "Learn The Craft",        text: "Klaviyo fundamentals, the 4 core flows, and your own dummy demo store built as proof of skill." },
  { range: "Days 8–14",  title: "Build The Demo",          text: "Abandoned Cart, Welcome, Post-Purchase, and Win-Back flows, live in a real (practice) account." },
  { range: "Days 15–21", title: "Find & Score Real Stores",text: "Pick a niche, build a list of 30–40 real prospects, audit and score every one." },
  { range: "Days 22–28", title: "Warm Approach",           text: "Outreach waves to Hot and Warm leads, using the demo and audit data as proof." },
  { range: "Days 29–35", title: "Close & Pilot",           text: "Free pilots on real inquiries, converting proof into a first paying retainer." },
  { range: "Days 36–45", title: "Deliver & Prove Value",   text: "Real flows live for a real client, results tracked, case study built for the next one." },
];

const HIGHS_LOWS = [
  {
    dimension: "Barrier To Entry",
    high: "Starts at $0. No coding, no funding, no employees — Klaviyo's free tier, Notion, and a dummy demo store are the entire toolkit, and the core skill is genuinely learnable in 45 focused days.",
    low: "That same low barrier is true for everyone else reading a playbook like this one. Low barrier to entry for you is low barrier to entry for your competition too — this is a starting line, not a moat."
  },
  {
    dimension: "Trust-Building Mechanism",
    high: "The free-pilot and dummy-demo model lets you prove real value before ever asking for money — one of the strongest cold-outreach conversion mechanisms available in any digital service business.",
    low: "Proof costs real hours. A demo store and a handful of free pilots are genuine unpaid work up front, and not every pilot converts into a paying retainer — some of that time simply won't come back as revenue."
  },
  {
    dimension: "Revenue Model",
    high: "Retainer-based, recurring revenue compounds — a realistic blend of Growth and Full Revenue System clients can genuinely clear six figures across roughly ten accounts.",
    low: "Ten clients is also a small, concentrated client base. Losing two of them is a 20% revenue swing overnight — nothing like the diversification a business serving hundreds of accounts would feel."
  },
  {
    dimension: "Addressable Market",
    high: "Ecommerce is a large, genuinely growing sector — global online retail is projected near $7 trillion in 2026, still taking share from physical retail every year.",
    low: "A big market is not the same as an uncontested one. Klaviyo's own onboarding, other freelancers, and other agencies are already selling into this exact space — \"no competition\" was never quite true, even before you arrived."
  },
  {
    dimension: "Skill Durability",
    high: "The underlying craft — lifecycle strategy, segmentation, and persuasive copy — transfers across tools and will likely stay relevant as long as ecommerce checkout exists. Email is still commonly cited around $36 returned per $1 spent, ahead of most paid channels.",
    low: "The specific mechanical task — manually assembling a standard flow — is exactly the layer AI tools are automating fastest right now. Over half of agency owners already call AI a serious threat to the routine-execution side of this business."
  },
  {
    dimension: "Work Rhythm",
    high: "Remote and async by design — runs from a laptop, on your own hours, with no office and no commute required.",
    low: "Still a real service business underneath. Outreach, client calls, and account management are ongoing work, especially in the first few months — this is not passive income."
  },
  {
    dimension: "Results & Proof",
    high: "You can show concrete, provable numbers — a real response-time delta, a real recovered-revenue figure — a rare, genuinely persuasive kind of proof in digital services.",
    low: "Those results are bounded by the client's own business health. A brilliant flow cannot manufacture website traffic or product-market fit a struggling store doesn't already have."
  },
];

const DURABILITY_FACTORS = [
  { icon: "🌍", name: "The Ecommerce Sector", rating: "Strong", color: "#0D7A5F",
    note: "Global ecommerce is projected near $6.9–7.4 trillion in 2026, growing roughly 7–8% year over year and still taking share from physical retail. This is a structurally growing market, not a fad." },
  { icon: "🧰", name: "Klaviyo's Market Position", rating: "Dominant, for now", color: "#0D7A5F",
    note: "Klaviyo holds an estimated 68% share within ecommerce-specific email marketing tools, used by 220,000+ companies — the large majority of them small businesses under 10 employees, which is exactly this system's target client. It's also now a public company, a real signal of maturity." },
  { icon: "📬", name: "The Email Channel Itself", rating: "Strong", color: "#0D7A5F",
    note: "Independent of any one tool, email marketing is consistently cited as one of the highest-ROI channels available — commonly quoted around $36 returned per $1 spent, ahead of most paid channels a small store could buy into instead." },
  { icon: "⚖️", name: "Regulatory Environment", rating: "Mature, stable", color: "#7A5A00",
    note: "CAN-SPAM (2003) and GDPR (2018) are well-established, evolving incrementally rather than disruptively. Compliance work is real and ongoing, but this is a known, navigable landscape — nothing like the sudden shocks that have hit some other digital channels." },
  { icon: "🤖", name: "AI Disruption Risk", rating: "Real and rising", color: "#8B0000",
    note: "More than half of agency owners now call AI a serious threat to their business, sharply up from a year earlier. The exposure is concentrated in routine execution — manually assembling a standard flow — while strategy, client relationships, and judgment remain the harder-to-automate layer. This system's demo-and-pilot model already leans toward that harder layer, which is worth knowing going in, not discovering later." },
];

const COMPETITIVE_LAYERS = [
  { icon: "🏢", name: "The Tool Vendor Itself",
    note: "Klaviyo runs its own onboarding, templates, and customer success outreach — some of what this playbook teaches, Klaviyo is also trying to teach store owners to do themselves." },
  { icon: "🏆", name: "Established Agencies",
    note: "Full-service ecommerce marketing agencies already serve this space, typically chasing larger accounts with bigger retainers — which is exactly why they tend to leave small, single-owner stores underserved." },
  { icon: "🎓", name: "Other Freelancers & Course Graduates",
    note: "This playbook's ideas are not secret. Anyone else who has learned Klaviyo, taken a similar course, or read similar material is a genuine peer competitor for the same small-store clients." },
  { icon: "🤖", name: "AI-Powered DIY Tools",
    note: "A store owner with ChatGPT and Klaviyo's own AI features can now assemble a basic flow without hiring anyone — the fastest-growing competitive layer, and the one most likely to keep growing." },
];

const FIT_SIGNALS = [
  "I don't mind reaching out to strangers, even when some of them say no",
  "I like the idea of building an automated system once and having it keep working",
  "I'd rather have 10 ongoing relationships than 10 one-off transactions",
  "I can be patient with a sales cycle that takes weeks, not minutes",
  "I'm comfortable being the main point of contact for a small business owner directly",
  "Ongoing client care doesn't bother me — not every task needs to be 'done' forever",
  "I'm at least a little interested in marketing, copywriting, or consumer behavior",
  "I'm fine starting solo, from a laptop, without a team around me at first",
];

/* ============================================================
   SMALL SHARED COMPONENTS
   ============================================================ */

function Chevron({ open }) {
  return (
    <span style={{ color: "#6E6459", fontSize: 19, display: "inline-block",
      transform: open ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>›</span>
  );
}

function SLabel({ text, color }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "",
      letterSpacing: ".08em", marginBottom: 7 }}>{text}</div>
  );
}

function HighLowCard({ dimension, high, low }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      background: open ? "#FBF8F1" : "#F8F5EE", border: "1px solid " + (open ? "#D9CFBB" : "#FBF8F1"),
      borderRadius: 11, cursor: "pointer", overflow: "hidden", marginBottom: 9 }}>
      <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: "#201A16" }}>{dimension}</span>
        <Chevron open={open} />
      </div>
      {open && (
        <div style={{ padding: "0 15px 16px", borderTop: "1px solid #FBF8F1" }}>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0D7A5F", textTransform: "",
              letterSpacing: ".07em", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <span>▲</span> High
            </div>
            <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65,
              borderLeft: "2px solid #0D7A5F40", paddingLeft: 10 }}>{high}</p>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#8B0000", textTransform: "",
              letterSpacing: ".07em", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <span>▼</span> Low
            </div>
            <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65,
              borderLeft: "2px solid #8B000040", paddingLeft: 10 }}>{low}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FactorCard({ icon, name, rating, color, note }) {
  return (
    <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "14px 15px", marginBottom: 9 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 19 }}>{icon}</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: "#201A16", minWidth: 140 }}>{name}</span>
        <span style={{ background: color + "18", border: "1px solid " + color + "45", borderRadius: 999,
          padding: "3px 11px", fontSize: 11, fontWeight: 700, color, whiteSpace: "nowrap" }}>{rating}</span>
      </div>
      <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.65 }}>{note}</p>
    </div>
  );
}

function LayerRow({ icon, name, note }) {
  return (
    <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "13px 15px",
      marginBottom: 9, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 19, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#201A16", marginBottom: 3 }}>{name}</div>
        <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.55 }}>{note}</p>
      </div>
    </div>
  );
}

/* ============================================================
   FIT CHECKLIST (reflective, not a verdict)
   ============================================================ */

function FitChecklist() {
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked(p => ({ ...p, [i]: !p[i] }));
  const count = Object.values(checked).filter(Boolean).length;

  const band = useMemo(() => {
    if (count <= 2) return { color: "#8B0000",
      text: "Worth sitting with this honestly — a lot of the daily texture of this path may feel like friction rather than flow. That's useful to know now, not on day 20." };
    if (count <= 5) return { color: "#C99A3B",
      text: "A genuinely mixed picture. Look specifically at which statements you didn't check — that's more informative than the count itself." };
    return { color: "#0D7A5F",
      text: "Real signals of fit here. That's not a guarantee of success, but it does mean the daily shape of this work is less likely to fight you." };
  }, [count]);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {FIT_SIGNALS.map((s, i) => (
          <button key={i} onClick={() => toggle(i)} style={{
            display: "flex", alignItems: "center", gap: 9, textAlign: "left",
            background: checked[i] ? "#0D7A5F14" : "#F8F5EE",
            border: `1px solid ${checked[i] ? "#0D7A5F60" : "#FBF8F1"}`,
            borderRadius: 9, padding: "10px 12px", cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0,
              border: `2px solid ${checked[i] ? "#0D7A5F" : "#D9CFBB"}`,
              background: checked[i] ? "#0D7A5F" : "transparent", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 10, color: "#F5F0E4", fontWeight: 800 }}>{checked[i] ? "✓" : ""}</span>
            <span style={{ flex: 1, fontSize: 13, color: checked[i] ? "#201A16" : "#6E6459", lineHeight: 1.45 }}>{s}</span>
          </button>
        ))}
      </div>
      <div style={{ background: "#F5F0E4", border: `1px solid ${band.color}40`, borderRadius: 12, padding: "15px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: band.color }}>{count}</span>
          <span style={{ fontSize: 12, color: "#6E6459" }}>of 8 resonated</span>
        </div>
        <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>{band.text}</p>
      </div>
      <p style={{ fontSize: 11, color: "#6E6459", margin: "10px 0 0", lineHeight: 1.6 }}>
        This is a reflection aid, not a test and not a verdict. No checklist can make a decision like this
        for you — it can only help you think more clearly in the time you have.
      </p>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function RevenueRecoveryEnginePathBriefing() {
  const [tab, setTab] = useState("doorway");
  const [openHighLow, setOpenHighLow] = useState(null);

  const TABS = [
    { id: "doorway",  label: "🧭 The Doorway" },
    { id: "highslows",label: "⚖️ Highs & Lows" },
    { id: "durability",label:"🛡️ Durability" },
    { id: "competition",label:"🥊 Competition" },
    { id: "fit",      label: "🎯 Is This Yours?" },
    { id: "bottomline",label:"📋 Bottom Line" },
  ];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,-apple-system,sans-serif",
      background: "#F5F0E4", minHeight: "100vh", color: "#201A16" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding: "22px 16px 18px", borderBottom: "1px solid #FBF8F1" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#0D7A5F",
            textTransform: "", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0D7A5F",
              boxShadow: "0 0 6px #0D7A5F", display: "inline-block" }} />
            DBI — One Of Seven Doorways
          </div>
          <h1 style={{ margin: "0 0 7px", fontSize: "clamp(21px,4.5vw,33px)", fontWeight: 800,
            lineHeight: 1.15, background: "linear-gradient(135deg,#201A16 30%,#0D7A5F 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Revenue Recovery Engine — The Honest Doorway Briefing
          </h1>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#6E6459", maxWidth: 620, lineHeight: 1.65 }}>
            You have 24 hours and one choice. This is a genuine, balanced look at what's actually on the
            other side of this particular door — the highs and the lows, not just the highlight reel.
          </p>
          <div style={{ background: "#F5F0E4", border: "1px solid #C99A3B30", borderRadius: 10, padding: "11px 14px" }}>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#C99A3B" }}>About scope:</strong> this covers ONE of your seven
              doorways in real depth. It is not a side-by-side comparison of all seven — that would need
              the same depth of look at the other six. Read this fully, then weigh it against whatever you
              know about the rest before your window closes.
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: "#F8F5EE", borderBottom: "1px solid #FBF8F1", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", padding: "0 8px", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none",
              borderBottom: tab === t.id ? "2px solid #0D7A5F" : "2px solid transparent",
              color: tab === t.id ? "#0D7A5F" : "#D9CFBB",
              padding: "12px 13px", fontSize: 12.5, fontWeight: tab === t.id ? 600 : 500,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s", fontFamily: "inherit" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "18px 13px 60px" }}>

        {/* THE DOORWAY */}
        {tab === "doorway" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>What's Actually Behind This Door</h2>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 16px", lineHeight: 1.6 }}>
              In plain terms, before anything else.
            </p>

            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 12, padding: "15px 16px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#201A16", margin: 0, lineHeight: 1.7 }}>
                Revenue Recovery Engine teaches you to build and sell a recurring email and SMS system —
                four automated flows (Abandoned Cart, Welcome Series, Post-Purchase, Win-Back) built in
                Klaviyo — to small ecommerce store owners who are quietly losing revenue at each of those
                four moments. You learn the craft, build a working demo as proof, find and score real
                prospects, then convert free pilots into paying monthly retainers. The stated plan runs 45
                days from a standing start to a first paying client.
              </p>
            </div>

            <SLabel text="The Arc, Week By Week" color="#7A5A00" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {WEEK_SNAPSHOT.map(w => (
                <div key={w.range} style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 10,
                  padding: "11px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 78, fontSize: 10.5, fontWeight: 800, color: "#7A5A00", flexShrink: 0, paddingTop: 1 }}>{w.range}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#201A16", marginBottom: 2 }}>{w.title}</div>
                    <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.5 }}>{w.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <SLabel text="What It Costs To Start" color="#0D7A5F" />
            <div style={{ background: "#F5F0E4", border: "1px solid #0D7A5F30", borderRadius: 11, padding: "13px 15px" }}>
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                Genuinely close to $0 — Klaviyo's free tier, a free Notion workspace, and a practice demo
                store cover the entire technical setup. The real cost is time and consistency, not capital.
              </p>
            </div>
          </div>
        )}

        {/* HIGHS & LOWS */}
        {tab === "highslows" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Highs & Lows, Paired Honestly</h2>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 16px", lineHeight: 1.6 }}>
              Seven dimensions. Each strength here has a real, matching tradeoff — not a token weakness in
              disguise. Tap any row to open both sides.
            </p>
            <div>
              {HIGHS_LOWS.map((h, i) => (
                <HighLowCard key={h.dimension} {...h} />
              ))}
            </div>
          </div>
        )}

        {/* DURABILITY */}
        {tab === "durability" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>How Durable Is This, Really?</h2>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 16px", lineHeight: 1.6 }}>
              Five factors, rated honestly — including the one that cuts against the pitch.
            </p>
            {DURABILITY_FACTORS.map(f => <FactorCard key={f.name} {...f} />)}

            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "14px 15px", marginTop: 6 }}>
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.65 }}>
                Put together: the underlying <em>demand</em> for lifecycle email is durable and likely to
                stay that way. The specific <em>job of manually building flows by hand</em> is the least
                durable part of this business, and it's worth entering with that distinction clear rather
                than discovering it a year in. The parts of this system built around real client
                relationships and custom strategy — not just flow assembly — are the parts most likely to
                still be valuable in five years.
              </p>
            </div>
          </div>
        )}

        {/* COMPETITION */}
        {tab === "competition" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Who Else Is In This Room</h2>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 16px", lineHeight: 1.6 }}>
              Four real layers of competition, not zero.
            </p>
            {COMPETITIVE_LAYERS.map(l => <LayerRow key={l.name} {...l} />)}

            <div style={{ background: "#F5F0E4", border: "1px solid #FBF8F1", borderRadius: 12, padding: "14px 16px", marginTop: 6 }}>
              <SLabel text="Where The Real Gap Still Sits" color="#C99A3B" />
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.65 }}>
                The genuine opening is with small, single-owner ecommerce stores — the under-10-employee
                businesses that make up the largest share of Klaviyo's own user base. They're too small for
                most established agencies to chase, too busy to DIY it properly themselves, and too numerous
                for any one person to run out of. That gap is real. It was never a gap with zero competition
                inside it — the edge here comes from speed, niche focus, and follow-through, not from being
                structurally uncontested.
              </p>
            </div>
          </div>
        )}

        {/* FIT */}
        {tab === "fit" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Is This Your Doorway?</h2>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 16px", lineHeight: 1.6 }}>
              Check anything that genuinely resonates. Answer for who you actually are, not who you'd like
              to be by next month.
            </p>
            <FitChecklist />
          </div>
        )}

        {/* BOTTOM LINE */}
        {tab === "bottomline" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>The Honest Bottom Line</h2>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 16px", lineHeight: 1.6 }}>
              No spin, in either direction.
            </p>

            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 12, padding: "15px 16px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#201A16", margin: 0, lineHeight: 1.7 }}>
                Revenue Recovery Engine is a real, learnable, genuinely low-cost path into recurring
                freelance income, sitting inside a large and growing sector. It rewards people who don't
                mind outreach, enjoy systems work, and are patient with a trust-first sales cycle. It is not
                uncontested, not passive, and not immune to AI eating the most mechanical parts of the job
                over time — the durable version of this path leans into client relationships and strategy,
                not just flow assembly. Ten clients can realistically build toward six figures with the
                right tier mix, but that outcome depends on real, sustained execution, not the playbook
                alone.
              </p>
            </div>

            <div style={{ background: "#F5F0E4", border: "1px solid #0D7A5F30", borderRadius: 11, padding: "13px 15px", marginBottom: 16 }}>
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: "#0D7A5F" }}>If you choose this door:</strong> the Revenue Recovery
                Engine 45-Day Plan, the Ecommerce Prospecting Guide, and the Ecommerce Performance Calculator
                are the actual execution toolkit — this briefing was the decision, those three are the work.
              </p>
            </div>

            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "13px 15px" }}>
              <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                This briefing covered one of seven doorways in real depth, deliberately. It cannot tell you
                which of the seven is best for you — only whichever set of seven briefings you're able to
                gather in the time you have can do that. Choose with the clearest picture you can build, not
                the fastest one.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
