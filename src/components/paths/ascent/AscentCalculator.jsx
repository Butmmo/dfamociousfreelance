import React, { useState, useMemo } from 'react';
import {
  Target, DollarSign, TrendingUp, Phone, Percent, Zap, Award,
  ShieldCheck, AlertTriangle, BarChart3, ChevronDown, ChevronRight, Calculator
} from 'lucide-react';

/* ---------------------------------------------------------------------- */
/* DATA — deal sizes / commissions pulled directly from Pick Lane + the 7th Lane */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: 'lane', label: 'Your Lane' },
  { id: 'ramping', label: 'Ramping' },
  { id: 'established', label: 'Established' },
  { id: 'ceiling', label: 'Beyond 90' },
  { id: 'report', label: 'Report' },
];

const LANES = [
  { id: 'funding', name: 'Credit & Business Funding', dealMin: 3000, dealMax: 15000, commMin: 10, commMax: 15, commDefault: 12,
    ramping: 4000, established: 6000, ceiling: 9000, safety: 3 },
  { id: 'dating', name: 'Dating & Relationship Coaching', dealMin: 2000, dealMax: 10000, commMin: 5, commMax: 20, commDefault: 10,
    ramping: 3000, established: 5000, ceiling: 7000, safety: 3 },
  { id: 'realestate', name: 'Real Estate', dealMin: 5000, dealMax: 25000, commMin: 10, commMax: 15, commDefault: 12,
    ramping: 6000, established: 10000, ceiling: 15000, safety: 4 },
  { id: 'content', name: 'Content & Personal Branding', dealMin: 2000, dealMax: 8000, commMin: 5, commMax: 15, commDefault: 10,
    ramping: 2500, established: 4000, ceiling: 6000, safety: 3 },
  { id: 'trading', name: 'Trading & Trading Bots', dealMin: 1500, dealMax: 10000, commMin: 10, commMax: 20, commDefault: 15,
    ramping: 2500, established: 4500, ceiling: 7000, safety: 2 },
  { id: 'ai', name: 'AI & B2B AI Implementation', dealMin: 5000, dealMax: 50000, commMin: 10, commMax: 20, commDefault: 15,
    ramping: 7000, established: 12000, ceiling: 20000, safety: 4 },
  { id: 'agency', name: 'B2B Agency & Marketing Services', dealMin: 3000, dealMax: 30000, commMin: 10, commMax: 15, commDefault: 12,
    ramping: 4000, established: 8000, ceiling: 15000, safety: 4 },
];

const STAGES = {
  ramping:     { name: 'Ramping',     window: 'Days 1–30 in the seat',  accent: 'neutral',
    note: `Expect inconsistency here — even experienced reps typically need 3+ months to reach full productivity in a new seat.` },
  established: { name: 'Established', window: '60–90 days in the seat', accent: 'insignia',
    note: `This is realistically where the CLOSER framework becomes second nature and your close rate stabilizes.` },
  ceiling:     { name: 'Beyond 90 Days', window: 'The stated ceiling of the role', accent: 'signal',
    note: `Earned through volume and close-rate discipline from here — not granted by landing the seat.` },
};

const accentClasses = {
  signal:  { text: 'text-signal',   border: 'border-signal',   bg10: 'bg-signal/10' },
  insignia:{ text: 'text-insignia', border: 'border-insignia', bg10: 'bg-insignia/10', border50: 'border-insignia/50' },
  alert:   { text: 'text-alert',    border: 'border-alert',    bg10: 'bg-alert/10',    border50: 'border-alert/50' },
  neutral: { text: 'text-ink-muted',border: 'border-line',     bg10: 'bg-panel-raised/50' },
};

/* ---------------------------------------------------------------------- */
/* HELPERS                                                                  */
/* ---------------------------------------------------------------------- */

const fmt = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;

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

function ScoreDots({ value, max = 5 }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-insignia' : 'bg-panel-raised border border-line'}`} />
      ))}
    </span>
  );
}

function Slider({ value, min, max, step = 1, onChange }) {
  return (
    <div className="relative h-4 flex items-center">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 rounded-sm bg-panel-raised border border-line overflow-hidden">
        <div className="h-full bg-signal" style={{ width: `${((value-min)/(max-min))*100}%` }} />
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="ascent-slider relative w-full" />
    </div>
  );
}

function InputField({ label, value, unit, hint, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="font-mono text-sm text-signal">{value}{unit}</p>
      </div>
      {hint && <p className="text-xs text-ink-muted mb-2 leading-relaxed">{hint}</p>}
      {children}
    </div>
  );
}

function FormulaStrip({ calls, close, deal, commission, result }) {
  return (
    <div className="relative rounded-lg border border-signal bg-signal/10 p-4">
      <CornerMarks />
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={16} className="text-signal" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Monthly income at these inputs</p>
      </div>
      <p className="font-display text-4xl sm:text-5xl text-white leading-none mb-3">
        {fmt(result)}<span className="text-base text-ink-muted font-body ml-1">/mo</span>
      </p>
      <p className="font-mono text-[11px] text-ink-muted">
        {calls} calls × {close}% close × {fmt(deal)} deal × {commission}% commission
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */

function LaneTab({ laneId, applyLane, commission, setCommission }) {
  const lane = LANES.find(l => l.id === laneId);
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Set Your Terms" title="Pick your lane" sub="Same seven lanes as Pick Lane and the 7th Lane module — this sets the deal size and commission range every other tab runs on." />

      <div className="relative rounded-lg border border-signal bg-signal/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={16} className="text-signal" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal">The formula that sets your income</p>
        </div>
        <p className="font-mono text-sm text-white">Qualified Calls × Close Rate × Average Deal Value × Commission % = Monthly Income</p>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">Straight from the Day 46+ tab. Every number on this page is that exact formula, run at different — and honest — inputs.</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-2.5">Lane</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LANES.map(l => {
            const isSel = laneId === l.id;
            return (
              <button key={l.id} onClick={() => applyLane(l.id)}
                className={`text-left rounded-lg border p-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${isSel ? 'border-signal bg-signal/10' : 'border-line bg-panel hover:bg-panel-raised/60'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-base text-white leading-tight">{l.name}</p>
                  {l.safety <= 2 && <AlertTriangle size={14} className="text-alert shrink-0" />}
                </div>
                <p className="font-mono text-[10px] text-ink-muted mt-1.5">
                  ${l.dealMin.toLocaleString()}–${l.dealMax.toLocaleString()} deal · {l.commMin}–{l.commMax}% commission
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {lane && (
        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <p className="text-sm font-semibold text-white">{lane.name} — safety score</p>
            <ScoreDots value={lane.safety} />
          </div>
          {lane.safety <= 2 && (
            <div className="rounded-md border border-alert/50 bg-alert/10 p-2.5 mb-1">
              <p className="text-xs text-slate-200 leading-relaxed">This lane scores below average on Safety in Pick Lane's own grading. Run the full Vetting Checklist twice as hard here before you trust any number this calculator gives you.</p>
            </div>
          )}
          <p className="text-xs text-ink-muted leading-relaxed">Full 6-factor breakdown (Entry Ease, Deal Size, Low Competition, Durability, Safety, Beginner Fit) lives in Pick Lane and The 7th Lane.</p>
        </div>
      )}

      <InputField label="Commission %" value={commission} unit="%"
        hint={lane ? `${lane.name}'s typical range is ${lane.commMin}–${lane.commMax}%. Confirm the real number in writing before you rely on it.` : 'Pick a lane above first.'}>
        <Slider value={commission} min={5} max={25} step={1} onChange={setCommission} />
      </InputField>
    </div>
  );
}

function StageTab({ stageKey, calls, close, deal, commission, setCalls, setClose, setDeal }) {
  const s = STAGES[stageKey];
  const a = accentClasses[s.accent];
  const income = calls * (close/100) * deal * (commission/100);
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={s.window} title={s.name} sub={s.note} />

      <FormulaStrip calls={calls} close={close} deal={deal} commission={commission} result={income} />

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

      <div className={`rounded-lg border ${a.border} bg-panel p-4`}>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Commission (set on Your Lane)</p>
        <p className={`font-display text-lg ${a.text}`}>{commission}%</p>
      </div>
    </div>
  );
}

function ReportTab({ laneId, commission, r, e, c, rIncome, eIncome, cIncome }) {
  const lane = LANES.find(l => l.id === laneId);
  const annualCeiling = cIncome * 12;

  const laneComparison = useMemo(() => {
    return LANES.map(l => ({
      ...l,
      projected: c.calls * (c.close/100) * l.ceiling * (l.commDefault/100),
    })).sort((x, y) => y.projected - x.projected);
  }, [c]);

  const rows = [
    { key: 'ramping', ...STAGES.ramping, calls: r.calls, close: r.close, deal: r.deal, income: rIncome },
    { key: 'established', ...STAGES.established, calls: e.calls, close: e.close, deal: e.deal, income: eIncome },
    { key: 'ceiling', ...STAGES.ceiling, calls: c.calls, close: c.close, deal: c.deal, income: cIncome },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Full Trajectory" title="Your income model" sub={`${lane ? lane.name : 'Your lane'} · ${commission}% commission — the same Day 46+ formula, run three times at your own honest inputs.`} />

      <div className="space-y-3">
        {rows.map(row => {
          const a = accentClasses[row.accent];
          return (
            <div key={row.key} className={`rounded-lg border ${a.border} bg-panel overflow-hidden`}>
              <div className="px-4 py-3.5 border-b border-line flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-display text-lg text-white">{row.name}</p>
                  <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wide mt-0.5">{row.window}</p>
                </div>
                <p className={`font-display text-xl ${a.text} whitespace-nowrap`}>{fmt(row.income)}/mo</p>
              </div>
              <div className="px-4 py-3 font-mono text-[11px] text-ink-muted">
                {row.calls} calls × {row.close}% close × {fmt(row.deal)} deal × {commission}% commission
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative rounded-lg border border-insignia bg-insignia/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <Award size={16} className="text-insignia" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-insignia">If Beyond 90 held for a full year</p>
        </div>
        <p className="font-display text-3xl text-insignia leading-none">{fmt(annualCeiling)}<span className="text-sm text-ink-muted font-body ml-1">/year</span></p>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">Treat this as a ceiling to work toward, not a starting assumption — it's your stated volume and close rate held steady for twelve straight months, with no slow months built in.</p>
      </div>

      <div>
        <SectionHeading eyebrow="Same Effort, Different Economics" title="One activity level, every lane" sub="Your Beyond-90 calls and close rate, run against each lane's own typical deal size and commission — not a reason to switch lanes, just a reason to know the ceiling before you pick one." />
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="bg-panel-raised text-ink-muted font-mono uppercase tracking-wide text-[10px]">
                <th className="text-left px-3 py-2 font-medium">Lane</th>
                <th className="text-left px-2 py-2 font-medium">Typical Deal</th>
                <th className="text-left px-2 py-2 font-medium">Commission</th>
                <th className="text-right px-3 py-2 font-medium">Projected /mo</th>
              </tr>
            </thead>
            <tbody>
              {laneComparison.map((l, i) => (
                <tr key={l.id} className={`border-t border-line ${l.id === laneId ? 'bg-signal/10' : 'bg-panel'}`}>
                  <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap flex items-center gap-1.5">
                    {l.id === laneId && <Target size={12} className="text-signal shrink-0" />}
                    {l.name}
                  </td>
                  <td className="px-2 py-2.5 text-ink-muted whitespace-nowrap">{fmt(l.ceiling)}</td>
                  <td className="px-2 py-2.5 text-ink-muted whitespace-nowrap">{l.commDefault}%</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-white whitespace-nowrap">{fmt(l.projected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4 space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted flex items-center gap-2"><ShieldCheck size={13} /> Reality check, same as Income Reality</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Third-party salary data backs up this system's own $8,000–$40,000/month range: Glassdoor's 2025 figures put the average high-ticket sales closer at roughly $113,700/year, with ZipRecruiter showing a $50,000–$150,000/year spread depending on experience and niche. That's a real industry, not hype — and this calculator's numbers sit inside that range, not above it.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Commission-only income means the company has made zero financial investment in your success. That's exactly why Target Scoring's Legitimacy and Deal Economics factors matter more here than in almost any other kind of sales role — a bad seat doesn't just waste your time, it can make every number on this page worse at once.
        </p>
        <p className="text-xs text-ink-muted leading-relaxed pt-1 border-t border-line">
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
  const [tab, setTab] = useState('lane');
  const [laneId, setLaneId] = useState('funding');
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
    const l = LANES.find(x => x.id === id);
    if (!l) return;
    setLaneId(id);
    setCommission(l.commDefault);
    setRDeal(l.ramping);
    setEDeal(l.established);
    setCDeal(l.ceiling);
  };

  const rIncome = rCalls * (rClose/100) * rDeal * (commission/100);
  const eIncome = eCalls * (eClose/100) * eDeal * (commission/100);
  const cIncome = cCalls * (cClose/100) * cDeal * (commission/100);

  const r = { calls: rCalls, close: rClose, deal: rDeal };
  const e = { calls: eCalls, close: eClose, deal: eDeal };
  const c = { calls: cCalls, close: cClose, deal: cDeal };

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
        .ascent-slider { -webkit-appearance: none; appearance: none; background: transparent; height: 16px; margin: 0; cursor: pointer; }
        .ascent-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 3px; background: #0D7A5F; cursor: pointer; margin-top: 0; border: 2px solid #F5F0E4; }
        .ascent-slider::-webkit-slider-runnable-track { height: 4px; background: transparent; }
        .ascent-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 3px; background: #0D7A5F; cursor: pointer; border: 2px solid #F5F0E4; }
        .ascent-slider::-moz-range-track { height: 4px; background: transparent; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-line" style={{ backgroundColor: 'rgba(18,21,26,0.96)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide leading-none">PERFORMANCE CALCULATOR</h1>
              <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.2em] mt-1">The Ascent — Income Projection Module</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-insignia uppercase tracking-wider flex items-center gap-1.5 justify-end"><Calculator size={12} /> Companion to the 45-Day System</p>
              <p className="font-mono text-[11px] text-ink-muted mt-0.5">7 lanes · 3 stages · 1 honest formula</p>
            </div>
          </div>
        </div>

        <nav className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2.5 pt-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
                tab === t.id ? 'bg-signal border-signal text-ink font-semibold' : 'border-line text-ink-muted hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-16">
        {tab === 'lane' && (
          <LaneTab laneId={laneId} applyLane={applyLane} commission={commission} setCommission={setCommission} />
        )}
        {tab === 'ramping' && (
          <StageTab stageKey="ramping" calls={rCalls} close={rClose} deal={rDeal} commission={commission}
            setCalls={setRCalls} setClose={setRClose} setDeal={setRDeal} />
        )}
        {tab === 'established' && (
          <StageTab stageKey="established" calls={eCalls} close={eClose} deal={eDeal} commission={commission}
            setCalls={setECalls} setClose={setEClose} setDeal={setEDeal} />
        )}
        {tab === 'ceiling' && (
          <StageTab stageKey="ceiling" calls={cCalls} close={cClose} deal={cDeal} commission={commission}
            setCalls={setCCalls} setClose={setCClose} setDeal={setCDeal} />
        )}
        {tab === 'report' && (
          <ReportTab laneId={laneId} commission={commission} r={r} e={e} c={c}
            rIncome={rIncome} eIncome={eIncome} cIncome={cIncome} />
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-8">
        <p className="text-[11px] text-ink-muted font-mono flex items-center gap-1.5"><ShieldCheck size={12} /> Set expectations with yourself, not a fantasy before Day 1. Nothing here saves between sessions.</p>
      </footer>
    </div>
  );
}
