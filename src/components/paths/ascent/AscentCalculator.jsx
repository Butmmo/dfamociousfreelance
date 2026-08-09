// The Ascent — Performance Calculator
// Restyled to match smb-path-briefing.jsx's DBI Regal design system exactly:
// cream/gold/crimson palette, Inter type, inline styles, emoji iconography.
// All data, formulas and interactivity carried over unchanged from the
// original dark "signal/insignia/alert" theme — visuals only were replaced.

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
/* DATA — deal sizes / commissions pulled directly from Pick Lane + the 7th Lane */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: "lane", label: "🎯 Your Lane" },
  { id: "ramping", label: "🌱 Ramping" },
  { id: "established", label: "🌳 Established" },
  { id: "ceiling", label: "🏔️ Beyond 90" },
  { id: "report", label: "📋 Report" },
];

const LANES = [
  { id: "funding", name: "Credit & Business Funding", dealMin: 3000, dealMax: 15000, commMin: 10, commMax: 15, commDefault: 12,
    ramping: 4000, established: 6000, ceiling: 9000, safety: 3 },
  { id: "dating", name: "Dating & Relationship Coaching", dealMin: 2000, dealMax: 10000, commMin: 5, commMax: 20, commDefault: 10,
    ramping: 3000, established: 5000, ceiling: 7000, safety: 3 },
  { id: "realestate", name: "Real Estate", dealMin: 5000, dealMax: 25000, commMin: 10, commMax: 15, commDefault: 12,
    ramping: 6000, established: 10000, ceiling: 15000, safety: 4 },
  { id: "content", name: "Content & Personal Branding", dealMin: 2000, dealMax: 8000, commMin: 5, commMax: 15, commDefault: 10,
    ramping: 2500, established: 4000, ceiling: 6000, safety: 3 },
  { id: "trading", name: "Trading & Trading Bots", dealMin: 1500, dealMax: 10000, commMin: 10, commMax: 20, commDefault: 15,
    ramping: 2500, established: 4500, ceiling: 7000, safety: 2 },
  { id: "ai", name: "AI & B2B AI Implementation", dealMin: 5000, dealMax: 50000, commMin: 10, commMax: 20, commDefault: 15,
    ramping: 7000, established: 12000, ceiling: 20000, safety: 4 },
  { id: "agency", name: "B2B Agency & Marketing Services", dealMin: 3000, dealMax: 30000, commMin: 10, commMax: 15, commDefault: 12,
    ramping: 4000, established: 8000, ceiling: 15000, safety: 4 },
];

const STAGES = {
  ramping:     { name: "Ramping",        window: "Days 1–30 in the seat",          toneKey: "plain",
    note: `Expect inconsistency here — even experienced reps typically need 3+ months to reach full productivity in a new seat.` },
  established: { name: "Established",    window: "60–90 days in the seat",         toneKey: "neutral",
    note: `This is realistically where the CLOSER framework becomes second nature and your close rate stabilizes.` },
  ceiling:     { name: "Beyond 90 Days", window: "The stated ceiling of the role", toneKey: "good",
    note: `Earned through volume and close-rate discipline from here — not granted by landing the seat.` },
};

/* ---------------------------------------------------------------------- */
/* HELPERS                                                                  */
/* ---------------------------------------------------------------------- */

const fmt = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`);

const h2Style = { fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK };
const pStyle = { fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" };
const eyebrowStyle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 };

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

function Slider({ value, min, max, step = 1, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 5, borderRadius: 3, background: BORDER, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: GOLD }} />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="ascent-slider"
        aria-label="value"
        style={{ position: "relative", width: "100%", background: "transparent", height: 22, margin: 0, cursor: "pointer" }}
      />
    </div>
  );
}

function InputField({ label, value, unit, hint, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 800, color: GOLD_DEEP, margin: 0 }}>{value}{unit}</p>
      </div>
      {hint && <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px", lineHeight: 1.55 }}>{hint}</p>}
      {children}
    </div>
  );
}

function HeroStat({ eyebrow, tk, value, suffix, caption }) {
  const t = tone(tk);
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${t.c === MUTED ? BORDER : t.c}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ ...eyebrowStyle, color: t.c, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>{eyebrow}</div>
      <p style={{ fontSize: "clamp(30px,6vw,42px)", fontWeight: 800, color: INK, margin: "0 0 8px", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}> {suffix}</span>
      </p>
      <p style={{ fontSize: 11.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>{caption}</p>
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

function LaneTab({ laneId, applyLane, commission, setCommission }) {
  const lane = LANES.find((l) => l.id === laneId);
  return (
    <div>
      <h2 style={h2Style}>Pick Your Lane</h2>
      <p style={pStyle}>Same seven lanes as Pick Lane and the 7th Lane module — this sets the deal size and commission range every other tab runs on.</p>

      <div style={{ background: "#FFFFFF", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ ...eyebrowStyle, color: GOLD_DEEP }}>🧮 The formula that sets your income</div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: "0 0 6px" }}>Qualified Calls × Close Rate × Average Deal Value × Commission % = Monthly Income</p>
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>Straight from the Day 46+ tab. Every number on this page is that exact formula, run at different — and honest — inputs.</p>
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: "0 0 10px" }}>Lane</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, marginBottom: 18 }}>
        {LANES.map((l) => {
          const isSel = laneId === l.id;
          return (
            <button
              key={l.id}
              onClick={() => applyLane(l.id)}
              style={{
                textAlign: "left", borderRadius: 11, border: `1px solid ${isSel ? GOLD : BORDER}`,
                background: isSel ? "rgba(201,154,59,0.10)" : "#FFFFFF", padding: "13px 15px",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{l.name}</span>
                {l.safety <= 2 && <span title="Below-average safety score" style={{ flexShrink: 0 }}>⚠️</span>}
              </div>
              <p style={{ fontSize: 11, color: MUTED, margin: "6px 0 0" }}>
                ${l.dealMin.toLocaleString()}–${l.dealMax.toLocaleString()} deal · {l.commMin}–{l.commMax}% commission
              </p>
            </button>
          );
        })}
      </div>

      {lane && (
        <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: lane.safety <= 2 ? 10 : 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>{lane.name} — safety score</p>
            <ScoreDots value={lane.safety} />
          </div>
          {lane.safety <= 2 && (
            <div style={{ background: TONE.caution.bg, border: `1px solid ${TONE.caution.bd}`, borderRadius: 8, padding: "9px 11px", marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: INK, lineHeight: 1.55, margin: 0 }}>This lane scores below average on Safety in Pick Lane's own grading. Run the full Vetting Checklist twice as hard here before you trust any number this calculator gives you.</p>
            </div>
          )}
          <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, margin: 0 }}>Full 6-factor breakdown (Entry Ease, Deal Size, Low Competition, Durability, Safety, Beginner Fit) lives in Pick Lane and The 7th Lane.</p>
        </div>
      )}

      <InputField label="Commission %" value={commission} unit="%"
        hint={lane ? `${lane.name}'s typical range is ${lane.commMin}–${lane.commMax}%. Confirm the real number in writing before you rely on it.` : "Pick a lane above first."}>
        <Slider value={commission} min={5} max={25} step={1} onChange={setCommission} />
      </InputField>
    </div>
  );
}

function StageTab({ stageKey, calls, close, deal, commission, setCalls, setClose, setDeal }) {
  const s = STAGES[stageKey];
  const income = calls * (close / 100) * deal * (commission / 100);
  return (
    <div>
      <h2 style={h2Style}>{s.name}</h2>
      <p style={{ ...pStyle, marginBottom: 2, fontWeight: 600, color: INK }}>{s.window}</p>
      <p style={pStyle}>{s.note}</p>

      <HeroStat eyebrow="💵 Monthly income at these inputs" tk={s.toneKey} value={fmt(income)} suffix="/mo"
        caption={`${calls} calls × ${close}% close × ${fmt(deal)} deal × ${commission}% commission`} />

      <InputField label="Qualified Calls / Month" value={calls} unit=""
        hint="Calls that actually happened with a real, qualified prospect — not dials, not no-shows.">
        <Slider value={calls} min={5} max={60} step={1} onChange={setCalls} />
      </InputField>

      <InputField label="Close Rate" value={close} unit="%"
        hint="Percentage of qualified calls that become a signed, paid deal.">
        <Slider value={close} min={5} max={45} step={1} onChange={setClose} />
      </InputField>

      <InputField label="Average Deal Value" value={fmt(deal)} unit=""
        hint="Pre-filled from your lane on the Your Lane tab — adjust to match a real target's actual price point.">
        <Slider value={deal} min={500} max={50000} step={500} onChange={setDeal} />
      </InputField>

      <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Commission (set on Your Lane)</p>
        <p style={{ fontSize: 17, fontWeight: 800, color: GOLD_DEEP, margin: 0 }}>{commission}%</p>
      </div>
    </div>
  );
}

function ReportTab({ laneId, commission, r, e, c, rIncome, eIncome, cIncome }) {
  const lane = LANES.find((l) => l.id === laneId);
  const annualCeiling = cIncome * 12;

  const laneComparison = useMemo(() => {
    return LANES.map((l) => ({
      ...l,
      projected: c.calls * (c.close / 100) * l.ceiling * (l.commDefault / 100),
    })).sort((x, y) => y.projected - x.projected);
  }, [c]);

  const rows = [
    { key: "ramping", ...STAGES.ramping, calls: r.calls, close: r.close, deal: r.deal, income: rIncome },
    { key: "established", ...STAGES.established, calls: e.calls, close: e.close, deal: e.deal, income: eIncome },
    { key: "ceiling", ...STAGES.ceiling, calls: c.calls, close: c.close, deal: c.deal, income: cIncome },
  ];

  const thStyle = { textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED };
  const tdStyle = { padding: "10px 12px", fontSize: 12, color: MUTED };

  return (
    <div>
      <h2 style={h2Style}>Your Income Model</h2>
      <p style={pStyle}>{lane ? lane.name : "Your lane"} · {commission}% commission — the same Day 46+ formula, run three times at your own honest inputs.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {rows.map((row) => {
          const t = tone(row.toneKey);
          return (
            <div key={row.key} style={{ border: `1px solid ${t.c === MUTED ? BORDER : t.c}`, borderRadius: 12, background: "#FFFFFF", overflow: "hidden" }}>
              <div style={{ padding: "13px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: INK, margin: 0 }}>{row.name}</p>
                  <p style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", margin: "3px 0 0" }}>{row.window}</p>
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, color: t.c, margin: 0, whiteSpace: "nowrap" }}>{fmt(row.income)}/mo</p>
              </div>
              <div style={{ padding: "10px 16px", fontSize: 11.5, color: MUTED }}>
                {row.calls} calls × {row.close}% close × {fmt(row.deal)} deal × {commission}% commission
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "rgba(201,154,59,0.10)", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ ...eyebrowStyle, color: GOLD_DEEP }}>🏔️ If Beyond 90 held for a full year</div>
        <p style={{ fontSize: "clamp(26px,5vw,34px)", fontWeight: 800, color: GOLD_DEEP, margin: "0 0 8px", lineHeight: 1 }}>
          {fmt(annualCeiling)}<span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}> /year</span>
        </p>
        <p style={{ fontSize: 12.5, color: INK, lineHeight: 1.6, margin: 0 }}>Treat this as a ceiling to work toward, not a starting assumption — it's your stated volume and close rate held steady for twelve straight months, with no slow months built in.</p>
      </div>

      <h2 style={{ ...h2Style, fontSize: 15 }}>One activity level, every lane</h2>
      <p style={pStyle}>Your Beyond-90 calls and close rate, run against each lane's own typical deal size and commission — not a reason to switch lanes, just a reason to know the ceiling before you pick one.</p>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={thStyle}>Lane</th>
              <th style={thStyle}>Typical Deal</th>
              <th style={thStyle}>Commission</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Projected /mo</th>
            </tr>
          </thead>
          <tbody>
            {laneComparison.map((l) => (
              <tr key={l.id} style={{ borderTop: `1px solid ${BORDER}`, background: l.id === laneId ? "rgba(201,154,59,0.08)" : "#FFFFFF" }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{l.id === laneId ? "🎯 " : ""}{l.name}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{fmt(l.ceiling)}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{l.commDefault}%</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>{fmt(l.projected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ ...eyebrowStyle, color: MUTED, marginBottom: 10 }}>🛡️ Reality check, same as Income Reality</p>
        <p style={{ fontSize: 13, color: INK, lineHeight: 1.65, margin: "0 0 10px" }}>
          Third-party salary data backs up this system's own $8,000–$40,000/month range: Glassdoor's 2025 figures put the average high-ticket sales closer at roughly $113,700/year, with ZipRecruiter showing a $50,000–$150,000/year spread depending on experience and niche. That's a real industry, not hype — and this calculator's numbers sit inside that range, not above it.
        </p>
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.65, margin: "0 0 10px" }}>
          Commission-only income means the company has made zero financial investment in your success. That's exactly why Target Scoring's Legitimacy and Deal Economics factors matter more here than in almost any other kind of sales role — a bad seat doesn't just waste your time, it can make every number on this page worse at once.
        </p>
        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, margin: 0, paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
          Every figure here is this calculator's model of your own inputs — a planning tool to set expectations with yourself, not a promise from this system or a claim about what any specific seat will pay.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

export default function AscentPerformanceCalculator() {
  const [tab, setTab] = useState("lane");
  const [laneId, setLaneId] = useState("funding");
  const [commission, setCommission] = useState(12);

  const [rCalls, setRCalls] = useState(15);
  const [rClose, setRClose] = useState(15);
  const [rDeal, setRDeal] = useState(4000);

  const [eCalls, setECalls] = useState(25);
  const [eClose, setEClose] = useState(22);
  const [eDeal, setEDeal] = useState(6000);

  const [cCalls, setCCalls] = useState(30);
  const [cClose, setCClose] = useState(25);
  const [cDeal, setCDeal] = useState(9000);

  const applyLane = (id) => {
    const l = LANES.find((x) => x.id === id);
    if (!l) return;
    setLaneId(id);
    setCommission(l.commDefault);
    setRDeal(l.ramping);
    setEDeal(l.established);
    setCDeal(l.ceiling);
  };

  const rIncome = rCalls * (rClose / 100) * rDeal * (commission / 100);
  const eIncome = eCalls * (eClose / 100) * eDeal * (commission / 100);
  const cIncome = cCalls * (cClose / 100) * cDeal * (commission / 100);

  const r = { calls: rCalls, close: rClose, deal: rDeal };
  const e = { calls: eCalls, close: eClose, deal: eDeal };
  const c = { calls: cCalls, close: cClose, deal: cDeal };

  const dealMin = Math.min(...LANES.map((l) => l.dealMin));
  const dealMax = Math.max(...LANES.map((l) => l.dealMax));
  const commMin = Math.min(...LANES.map((l) => l.commMin));
  const commMax = Math.max(...LANES.map((l) => l.commMax));

  const VITALS = [
    { label: "Deal Range", value: `${fmt(dealMin)}–${fmt(dealMax)}`, toneKey: "good", note: "across all seven lanes" },
    { label: "Commission Range", value: `${commMin}–${commMax}%`, toneKey: "neutral", note: "confirm the real number in writing" },
    { label: "Stages Modeled", value: "3", toneKey: "neutral", note: "Ramping → Established → Beyond 90" },
    { label: "Formula Basis", value: "Day 46+", toneKey: "good", note: "not a bigger number invented for this page" },
  ];

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .ascent-slider { -webkit-appearance: none; appearance: none; }
        .ascent-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${GOLD}; cursor: pointer; border: 3px solid ${CREAM}; box-shadow: 0 0 0 1px ${BORDER}; margin-top: 0; }
        .ascent-slider::-webkit-slider-runnable-track { height: 5px; background: transparent; }
        .ascent-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: ${GOLD}; cursor: pointer; border: 3px solid ${CREAM}; box-shadow: 0 0 0 1px ${BORDER}; }
        .ascent-slider::-moz-range-track { height: 5px; background: transparent; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #FDF9F0 0%, ${CREAM_DEEP} 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "24px 18px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: CRIMSON, textTransform: "uppercase", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, boxShadow: `0 0 6px ${GOLD}`, display: "inline-block" }} />
            The Ascent · Income Projection Module
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: `linear-gradient(130deg, #1A140F 20%, ${GOLD} 70%, ${CRIMSON} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Performance Calculator
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, maxWidth: 640, lineHeight: 1.7 }}>
            Model your real monthly income before you pick a lane — the exact Qualified Calls × Close Rate × Deal
            Value × Commission formula the 45-Day system runs on, at three honest stages of experience.{" "}
            <strong style={{ color: GOLD_DEEP }}>Nothing here saves between sessions.</strong>
          </p>

          {/* VITALS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9, marginBottom: 18 }}>
            {VITALS.map((v) => {
              const t = tone(v.toneKey);
              return (
                <div key={v.label} style={{ background: "#FFFFFF", border: `1px solid ${t.bd}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED, marginBottom: 4 }}>{v.label}</div>
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
        {tab === "lane" && (
          <LaneTab laneId={laneId} applyLane={applyLane} commission={commission} setCommission={setCommission} />
        )}
        {tab === "ramping" && (
          <StageTab stageKey="ramping" calls={rCalls} close={rClose} deal={rDeal} commission={commission}
            setCalls={setRCalls} setClose={setRClose} setDeal={setRDeal} />
        )}
        {tab === "established" && (
          <StageTab stageKey="established" calls={eCalls} close={eClose} deal={eDeal} commission={commission}
            setCalls={setECalls} setClose={setEClose} setDeal={setEDeal} />
        )}
        {tab === "ceiling" && (
          <StageTab stageKey="ceiling" calls={cCalls} close={cClose} deal={cDeal} commission={commission}
            setCalls={setCCalls} setClose={setCClose} setDeal={setCDeal} />
        )}
        {tab === "report" && (
          <ReportTab laneId={laneId} commission={commission} r={r} e={e} c={c}
            rIncome={rIncome} eIncome={eIncome} cIncome={cIncome} />
        )}
      </div>

      {/* CTA FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: "#FFFFFF" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 16px 40px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>Continue The System</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <NextLink to="/the-ascent" icon="🧭" title="The Ascent" body="The full 45-day roadmap this calculator's formula is built on." />
            <NextLink to="/global-targeting-manual" icon="🌍" title="Global Targeting Manual" body="Where the target companies actually are, and how to score one before you pitch it." />
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            🛡️ Set expectations with yourself, not a fantasy before Day 1. Nothing here saves between sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
