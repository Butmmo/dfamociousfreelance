// @ts-nocheck
// SMB Performance Calculator — DFS Regal palette.
// PDF export renders directly with jsPDF (per-tab pages, DFS + Claude AI branding).
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Download, Sparkles, Building2, Star, Zap, Phone, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/playbooks/smb-calculator")({
  head: () => ({ meta: [{ title: "SMB Performance Calculator — DFS" }] }),
  component: SmbCalculator,
});

const PRESETS: Record<string, any> = {
  dental:     { label: "Dental / Medical Clinic",         avgValue: 350,  monthlyCusts: 80,  monthlyCalls: 150, monthlyEnq: 25 },
  realEstate: { label: "Real Estate Agent",               avgValue: 4500, monthlyCusts: 6,   monthlyCalls: 60,  monthlyEnq: 18 },
  salon:      { label: "Hair Salon / Beauty Studio",      avgValue: 140,  monthlyCusts: 130, monthlyCalls: 100, monthlyEnq: 12 },
  gym:        { label: "Gym / Fitness Studio",            avgValue: 75,   monthlyCusts: 70,  monthlyCalls: 80,  monthlyEnq: 30 },
  restaurant: { label: "Restaurant / Cafe",               avgValue: 60,   monthlyCusts: 420, monthlyCalls: 120, monthlyEnq: 35 },
  hvac:       { label: "HVAC / Plumber / Tradesperson",   avgValue: 480,  monthlyCusts: 35,  monthlyCalls: 110, monthlyEnq: 22 },
  legal:      { label: "Law Firm / Solicitor",            avgValue: 1800, monthlyCusts: 12,  monthlyCalls: 70,  monthlyEnq: 14 },
  coach:      { label: "Business / Life Coach",           avgValue: 2200, monthlyCusts: 5,   monthlyCalls: 30,  monthlyEnq: 18 },
  other:      { label: "Other Local Business",            avgValue: 300,  monthlyCusts: 50,  monthlyCalls: 80,  monthlyEnq: 20 },
};
const RECENCY = [
  { id: "fresh",  label: "Less than 1 month ago", penalty: 0.00 },
  { id: "recent", label: "1 – 3 months ago",      penalty: 0.10 },
  { id: "stale",  label: "3 – 6 months ago",      penalty: 0.26 },
  { id: "old",    label: "6 – 12 months ago",     penalty: 0.45 },
  { id: "dead",   label: "Over 12 months ago",    penalty: 0.65 },
];
const RESPONSE = [
  { id: "instant", label: "Under 60 seconds (automated)", keep: 0.92 },
  { id: "fast",    label: "Within 4 hours",               keep: 0.55 },
  { id: "today",   label: "Same day",                     keep: 0.30 },
  { id: "tmrw",    label: "Next day",                     keep: 0.16 },
  { id: "slow",    label: "2+ days or unknown",           keep: 0.07 },
];

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toLocaleString()}`;
const TABS = [
  { id: "profile", label: "Business",  icon: Building2 },
  { id: "reviews", label: "Reviews",   icon: Star },
  { id: "speed",   label: "Speed",     icon: Zap },
  { id: "calls",   label: "Calls",     icon: Phone },
  { id: "report",  label: "Report",    icon: DollarSign },
];

function SmbCalculator() {
  const [tab, setTab] = useState("profile");
  const [smbName, setSmbName] = useState("");
  const [bizKey, setBizKey] = useState("dental");
  const [avgValue, setAvgValue] = useState(350);
  const [monthlyCusts, setMCusts] = useState(80);
  const [yourReviews, setYourRev] = useState(28);
  const [compReviews, setCompRev] = useState(210);
  const [lastReview, setLastRev] = useState("stale");
  const [yourRating, setRating] = useState(4.2);
  const [monthlyEnq, setEnq] = useState(22);
  const [responseId, setResp] = useState("today");
  const [monthlyCalls, setCalls] = useState(120);
  const [missedPct, setMissed] = useState(45);
  const [exporting, setExporting] = useState(false);
  const [pdfSelection, setPdfSelection] = useState<Record<string, boolean>>({
    profile: true, reviews: true, speed: true, calls: true, report: true,
  });
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    setBizKey(key);
    setAvgValue(p.avgValue); setMCusts(p.monthlyCusts);
    setCalls(p.monthlyCalls); setEnq(p.monthlyEnq);
  };

  const reviewLost = useMemo(() => {
    const gapFactor = Math.min(0.75, Math.max(0, (compReviews - yourReviews) / Math.max(compReviews, 1)) * 0.72);
    const recency = RECENCY.find((r) => r.id === lastReview)?.penalty || 0;
    const loss = Math.min(0.82, gapFactor + recency);
    const discovery = monthlyCusts * avgValue * 0.18;
    return Math.round(discovery * loss);
  }, [compReviews, yourReviews, lastReview, monthlyCusts, avgValue]);
  const speedLost = useMemo(() => {
    const keep = RESPONSE.find((r) => r.id === responseId)?.keep || 0.07;
    return Math.round(monthlyEnq * (1 - keep) * 0.28 * avgValue);
  }, [responseId, monthlyEnq, avgValue]);
  const callLost = useMemo(() => {
    const missed = Math.round(monthlyCalls * (missedPct / 100));
    return Math.round(missed * 0.35 * avgValue * 0.22);
  }, [monthlyCalls, missedPct, avgValue]);
  const totalLost = reviewLost + speedLost + callLost;

  // Build the text content for each tab.
  const tabContent = (id: string): { title: string; lines: Array<[string, string]>; footer?: string } => {
    if (id === "profile") return {
      title: "Business Profile",
      lines: [
        ["Business type", PRESETS[bizKey].label],
        ["Avg value per customer / job", fmt(avgValue)],
        ["Monthly customers / jobs", String(monthlyCusts)],
        ["Estimated monthly revenue", fmt(monthlyCusts * avgValue)],
      ],
    };
    if (id === "reviews") return {
      title: "Review Health Audit",
      lines: [
        ["Your reviews", String(yourReviews)],
        ["Top competitor reviews", String(compReviews)],
        ["Google rating", yourRating.toFixed(1)],
        ["Last review received", RECENCY.find(r => r.id === lastReview)?.label ?? "—"],
        ["Revenue lost / month", fmt(reviewLost)],
      ],
    };
    if (id === "speed") return {
      title: "Speed to Lead",
      lines: [
        ["Monthly online enquiries", String(monthlyEnq)],
        ["Typical response time", RESPONSE.find(r => r.id === responseId)?.label ?? "—"],
        ["Revenue lost / month", fmt(speedLost)],
      ],
    };
    if (id === "calls") return {
      title: "Missed Calls",
      lines: [
        ["Monthly calls received", String(monthlyCalls)],
        ["Missed call rate", `${missedPct}%`],
        ["Missed calls / month", String(Math.round(monthlyCalls * missedPct / 100))],
        ["Revenue lost / month", fmt(callLost)],
      ],
    };
    // report
    const services = [
      { name: "Google Review Automation", price: "$297–$497/mo", loss: reviewLost, gain: 0.15 },
      { name: "Speed-to-Lead Automation", price: "$197–$397/mo", loss: speedLost, gain: 0.35 },
      { name: "AI Voice Receptionist",     price: "$297–$497/mo", loss: callLost, gain: 0.30 },
    ].sort((a, b) => b.loss - a.loss);
    return {
      title: "Revenue Recovery Report",
      lines: [
        ["Total monthly leak", fmt(totalLost)],
        ["Total annual leak", fmt(totalLost * 12)],
        ...services.map((s, i): [string, string] => [
          `Priority ${i + 1}: ${s.name}`,
          `${s.price} · recovery ~${fmt(Math.round(s.loss * s.gain))}/mo`,
        ]),
      ],
      footer: "Priority ranking based on annual recovery potential.",
    };
  };

  const drawPage = (pdf: jsPDF, tabId: string, tabLabel: string, pageIdx: number, pageTotal: number) => {
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    // Header band (deep gold)
    pdf.setFillColor(122, 90, 0);
    pdf.rect(0, 0, pageW, 74, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
    pdf.text("DFS Citadel", 32, 30);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
    pdf.text("D'Famocious Freelance Scholarship", 32, 46);
    pdf.setFontSize(8); pdf.setTextColor(240, 220, 170);
    pdf.text("Powered by D'Famocious Group", 32, 60);
    // Right side header
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(9);
    pdf.text(`SMB Performance Calculator — ${tabLabel}`, pageW - 32, 30, { align: "right" });
    pdf.setFontSize(8); pdf.setTextColor(240, 220, 170);
    pdf.text("⟡ Powered by Claude AI", pageW - 32, 46, { align: "right" });
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(8);
    pdf.text(new Date().toLocaleString(), pageW - 32, 60, { align: "right" });

    // Subject line
    let y = 108;
    pdf.setTextColor(26, 20, 16);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(20);
    pdf.text(tabContent(tabId).title, 32, y);
    if (smbName) {
      y += 20;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
      pdf.setTextColor(107, 93, 63);
      pdf.text(`Prospect: ${smbName}`, 32, y);
    }
    y += 24;

    // Body: key/value table
    const { lines, footer } = tabContent(tabId);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
    lines.forEach(([k, v]) => {
      // Row background alternating
      pdf.setFillColor(248, 245, 238);
      pdf.rect(32, y - 12, pageW - 64, 22, "F");
      pdf.setTextColor(107, 93, 63);
      pdf.text(k, 40, y + 3);
      pdf.setTextColor(26, 20, 16);
      pdf.setFont("helvetica", "bold");
      pdf.text(v, pageW - 40, y + 3, { align: "right" });
      pdf.setFont("helvetica", "normal");
      y += 26;
    });

    // Total leak callout for report tab
    if (tabId === "report") {
      y += 12;
      pdf.setFillColor(184, 32, 32);
      pdf.rect(32, y, pageW - 64, 60, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
      pdf.text("MONTHLY REVENUE AT RISK", 44, y + 22);
      pdf.setFontSize(28);
      pdf.text(fmt(totalLost), 44, y + 50);
    }

    if (footer) {
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(9); pdf.setTextColor(120, 110, 90);
      pdf.text(footer, 32, pageH - 60);
    }

    // Footer
    pdf.setDrawColor(217, 207, 187);
    pdf.line(32, pageH - 40, pageW - 32, pageH - 40);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(140, 130, 110);
    pdf.text("D'Famocious Freelance Scholarship — Confidential · Powered by D'Famocious Group", 32, pageH - 24);
    pdf.text(`Page ${pageIdx} / ${pageTotal}`, pageW - 32, pageH - 24, { align: "right" });
  };

  const exportPdf = async (mode: "current" | "selected" | "all") => {
    setExporting(true);
    setPdfMenuOpen(false);
    try {
      let ids: string[];
      if (mode === "current") ids = [tab];
      else if (mode === "all") ids = TABS.map(t => t.id);
      else ids = TABS.map(t => t.id).filter(id => pdfSelection[id]);
      if (ids.length === 0) { toast.error("Select at least one tab."); return; }

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      ids.forEach((id, i) => {
        if (i > 0) pdf.addPage();
        const label = TABS.find(t => t.id === id)?.label ?? id;
        drawPage(pdf, id, label, i + 1, ids.length);
      });
      const stem = (smbName || "smb").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      const suffix = mode === "current" ? tab : mode;
      pdf.save(`dfs-smb-calculator-${stem}-${suffix}.pdf`);
      toast.success("PDF downloaded.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[880px] mx-auto px-4 py-6 pb-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-widest text-gold-deep flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> SMB Revenue Leak Finder
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">SMB Performance Calculator</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Enter a prospect's numbers to discover exactly how much revenue they are leaking — and which single service fixes it fastest.
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 items-center">
          <input
            value={smbName} onChange={(e) => setSmbName(e.target.value)}
            placeholder="SMB name (appears on the PDF)"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-accent/20 px-3 py-1 text-xs font-semibold text-gold-deep w-fit">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Claude AI
          </div>
        </div>
      </header>

      {/* Live summary */}
      {totalLost > 0 && (
        <div className="rounded-xl border border-crimson/40 bg-crimson/5 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-crimson font-bold">Monthly revenue at risk</div>
            <div className="mt-1 font-display text-3xl font-bold text-crimson">{fmt(totalLost)}</div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-4 text-xs">
            <MiniLoss label="Reviews" value={reviewLost} />
            <MiniLoss label="Speed" value={speedLost} />
            <MiniLoss label="Calls" value={callLost} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-border mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
        <button
          onClick={exportPdf}
          disabled={exporting}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download PDF
        </button>
      </div>

      <div ref={panelRef} className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-accent/20 px-3 py-1 text-[10px] font-semibold text-gold-deep">
          <Sparkles className="h-3 w-3" /> Powered by Claude AI
        </div>

        {tab === "profile" && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold">Business Profile</h2>
            <p className="text-xs text-muted-foreground">Select the business type to auto-fill typical values, then adjust to match the actual client.</p>
            <Field label="Business type">
              <select value={bizKey} onChange={(e) => applyPreset(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {Object.entries(PRESETS).map(([k, v]: any) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </Field>
            <Field label={`Average value per customer / job: ${fmt(avgValue)}`}>
              <input type="range" min={50} max={10000} step={50} value={avgValue} onChange={(e) => setAvgValue(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label={`Monthly customers / jobs completed: ${monthlyCusts}`}>
              <input type="range" min={5} max={500} step={5} value={monthlyCusts} onChange={(e) => setMCusts(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <div className="rounded-lg border border-gold/40 bg-accent/20 p-4">
              <div className="text-[10px] uppercase tracking-widest text-gold-deep font-bold">Estimated monthly revenue</div>
              <div className="mt-2 font-display text-3xl font-bold">{fmt(monthlyCusts * avgValue)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{monthlyCusts} customers × {fmt(avgValue)}</div>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold">Review Health Audit</h2>
            <p className="text-xs text-muted-foreground">AI tools (ChatGPT, Google AI Mode, Perplexity) decide who to recommend based on review count AND recency.</p>
            <Field label={`Your reviews: ${yourReviews}`}>
              <input type="range" min={0} max={500} value={yourReviews} onChange={(e) => setYourRev(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label={`Top competitor reviews: ${compReviews}`}>
              <input type="range" min={0} max={1000} value={compReviews} onChange={(e) => setCompRev(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label={`Google rating: ${yourRating}`}>
              <input type="range" min={1} max={5} step={0.1} value={yourRating} onChange={(e) => setRating(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label="Last review received">
              <select value={lastReview} onChange={(e) => setLastRev(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {RECENCY.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
              </select>
            </Field>
            <div className="rounded-lg border border-crimson/40 bg-crimson/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-crimson font-bold">Revenue lost to review gap</div>
              <div className="mt-2 font-display text-3xl font-bold text-crimson">{fmt(reviewLost)}/mo</div>
            </div>
          </div>
        )}

        {tab === "speed" && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold">Speed to Lead</h2>
            <p className="text-xs text-muted-foreground">If nobody replies within 60 seconds to a new enquiry, 70%+ of leads book a competitor first.</p>
            <Field label={`Monthly online enquiries: ${monthlyEnq}`}>
              <input type="range" min={0} max={200} value={monthlyEnq} onChange={(e) => setEnq(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label="Typical response time">
              <select value={responseId} onChange={(e) => setResp(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {RESPONSE.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
              </select>
            </Field>
            <div className="rounded-lg border border-crimson/40 bg-crimson/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-crimson font-bold">Revenue lost to slow response</div>
              <div className="mt-2 font-display text-3xl font-bold text-crimson">{fmt(speedLost)}/mo</div>
            </div>
          </div>
        )}

        {tab === "calls" && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold">Missed Calls</h2>
            <p className="text-xs text-muted-foreground">85% of people who hit voicemail hang up and dial the next business.</p>
            <Field label={`Monthly calls received: ${monthlyCalls}`}>
              <input type="range" min={0} max={500} value={monthlyCalls} onChange={(e) => setCalls(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <Field label={`Missed call rate: ${missedPct}%`}>
              <input type="range" min={0} max={100} value={missedPct} onChange={(e) => setMissed(+e.target.value)} className="w-full accent-primary" />
            </Field>
            <div className="rounded-lg border border-crimson/40 bg-crimson/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-crimson font-bold">Revenue lost to missed calls</div>
              <div className="mt-2 font-display text-3xl font-bold text-crimson">{fmt(callLost)}/mo</div>
            </div>
          </div>
        )}

        {tab === "report" && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold">Revenue Recovery Report</h2>
            <p className="text-xs text-muted-foreground">Priority ranking based on annual recovery potential.</p>
            <div className="rounded-lg border border-gold/40 bg-accent/20 p-4">
              <div className="text-[10px] uppercase tracking-widest text-gold-deep font-bold">Total annual leak</div>
              <div className="mt-2 font-display text-4xl font-bold">{fmt(totalLost * 12)}</div>
            </div>
            <ol className="space-y-3">
              {[
                { name: "Google Review Automation", price: "$297–$497/mo", loss: reviewLost, gain: 0.15 },
                { name: "Speed-to-Lead Automation", price: "$197–$397/mo", loss: speedLost, gain: 0.35 },
                { name: "AI Voice Receptionist",     price: "$297–$497/mo", loss: callLost, gain: 0.30 },
              ]
                .sort((a, b) => b.loss - a.loss)
                .map((s, i) => (
                  <li key={s.name} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gold-deep">Priority {i + 1}</div>
                        <div className="font-display text-lg font-bold">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Est. recovery</div>
                        <div className="font-display text-xl font-bold text-emerald-500">{fmt(Math.round(s.loss * s.gain))}/mo</div>
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold mb-2">{label}</div>
      {children}
    </label>
  );
}
function MiniLoss({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold text-crimson">{fmt(value)}</div>
    </div>
  );
}
