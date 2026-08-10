// @ts-nocheck
// SMB Performance Calculator — DBI Regal palette.
// Content/model from SMBPerformanceCalculator v3 (population-driven market loss),
// restyled to the DBI design system. PDF export via jsPDF (per-tab pages, DBI + Claude AI branding).
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import {
  Download, Sparkles, Building2, Star, Zap, Phone, DollarSign, Loader2,
  Building, ChevronRight, Sunrise, CalendarDays, CalendarRange, Info,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/playbooks/smb-calculator")({
  head: () => ({ meta: [{ title: "SMB Performance Calculator — DBI" }] }),
  component: SmbCalculator,
});

/* ─── PRESETS (searchRate = est. monthly niche searches per 1,000 residents) ─── */
const PRESETS: Record<string, any> = {
  dental:     { label: "Dental / Medical Clinic",       avgValue: 350,  monthlyCusts: 80,  monthlyCalls: 150, monthlyEnq: 25, searchRate: 5 },
  realEstate: { label: "Real Estate Agent",             avgValue: 4500, monthlyCusts: 6,   monthlyCalls: 60,  monthlyEnq: 18, searchRate: 2 },
  salon:      { label: "Hair Salon / Beauty Studio",    avgValue: 140,  monthlyCusts: 130, monthlyCalls: 100, monthlyEnq: 12, searchRate: 10 },
  gym:        { label: "Gym / Fitness Studio",          avgValue: 75,   monthlyCusts: 70,  monthlyCalls: 80,  monthlyEnq: 30, searchRate: 6 },
  restaurant: { label: "Restaurant / Cafe",             avgValue: 60,   monthlyCusts: 420, monthlyCalls: 120, monthlyEnq: 35, searchRate: 45 },
  hvac:       { label: "HVAC / Plumber / Tradesperson", avgValue: 480,  monthlyCusts: 35,  monthlyCalls: 110, monthlyEnq: 22, searchRate: 6 },
  legal:      { label: "Law Firm / Solicitor",          avgValue: 1800, monthlyCusts: 12,  monthlyCalls: 70,  monthlyEnq: 14, searchRate: 1.5 },
  coach:      { label: "Business / Life Coach",         avgValue: 2200, monthlyCusts: 5,   monthlyCalls: 30,  monthlyEnq: 18, searchRate: 2 },
  other:      { label: "Other Local Business",          avgValue: 300,  monthlyCusts: 50,  monthlyCalls: 80,  monthlyEnq: 20, searchRate: 4 },
};

const CITY_SIZES = [
  { id: "town",  label: "Small Town (~30K)",     pop: 30000 },
  { id: "small", label: "Small City (~100K)",    pop: 100000 },
  { id: "mid",   label: "Mid-Size City (~300K)", pop: 300000 },
  { id: "large", label: "Large City (~800K)",    pop: 800000 },
  { id: "metro", label: "Major Metro (~2M)",     pop: 2000000 },
];

const RECENCY = [
  { id: "fresh",  label: "Less than 1 month ago", multiplier: 1.00 },
  { id: "recent", label: "1 – 3 months ago",      multiplier: 0.90 },
  { id: "stale",  label: "3 – 6 months ago",      multiplier: 0.74 },
  { id: "old",    label: "6 – 12 months ago",     multiplier: 0.55 },
  { id: "dead",   label: "Over 12 months ago",    multiplier: 0.35 },
];

const RESPONSE = [
  { id: "instant", label: "Under 60 seconds (automated)", keep: 0.92 },
  { id: "fast",    label: "Within 4 hours",               keep: 0.55 },
  { id: "today",   label: "Same day",                     keep: 0.30 },
  { id: "tmrw",    label: "Next day",                     keep: 0.16 },
  { id: "slow",    label: "2+ days or unknown",           keep: 0.07 },
];

const fmt  = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`);
const fmt1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
const fmtI = (n: number) => Math.round(n).toLocaleString();

const TABS = [
  { id: "profile", label: "Business",    icon: Building2 },
  { id: "reviews", label: "Reviews",     icon: Star },
  { id: "market",  label: "Market Loss", icon: Building },
  { id: "speed",   label: "Speed",       icon: Zap },
  { id: "calls",   label: "Calls",       icon: Phone },
  { id: "report",  label: "Report",      icon: DollarSign },
];

/* Accent classes mapped to the DBI palette */
const ACCENT: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  crimson: { text: "text-crimson",      bg: "bg-crimson/5",      border: "border-crimson/40",      bar: "bg-crimson" },
  gold:    { text: "text-gold-deep",    bg: "bg-accent/20",      border: "border-gold/40",         bar: "bg-gold" },
  emerald: { text: "text-emerald-600",  bg: "bg-emerald-500/5",  border: "border-emerald-500/40",  bar: "bg-emerald-500" },
  onyx:    { text: "text-foreground",   bg: "bg-muted",          border: "border-border",          bar: "bg-foreground" },
};

function SmbCalculator() {
  /* Identity / Market */
  const [businessName, setBizName] = useState("");
  const [competitorName, setCompName] = useState("");
  const [cityName, setCityName] = useState("");
  const [population, setPopulation] = useState(300000);

  /* Business profile */
  const [bizKey, setBizKey] = useState("dental");
  const [avgValue, setAvgValue] = useState(350);
  const [monthlyCusts, setMCusts] = useState(80);

  /* Reviews */
  const [yourReviews, setYourRev] = useState(28);
  const [compReviews, setCompRev] = useState(210);
  const [lastReview, setLastRev] = useState("stale");
  const [yourRating, setRating] = useState(4.2);

  /* Speed / calls */
  const [monthlyEnq, setEnq] = useState(22);
  const [responseId, setResp] = useState("today");
  const [monthlyCalls, setCalls] = useState(120);
  const [missedPct, setMissed] = useState(45);

  const [tab, setTab] = useState("profile");
  const [exporting, setExporting] = useState(false);
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);
  const [pdfSelection, setPdfSelection] = useState<Record<string, boolean>>({
    profile: true, reviews: true, market: true, speed: true, calls: true, report: true,
  });

  const niche = PRESETS[bizKey];
  const bizLabel = businessName.trim() || "This business";
  const compLabel = competitorName.trim() || "a nearby competitor";
  const cityLabel = cityName.trim() || "your city";

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    setBizKey(key);
    setAvgValue(p.avgValue); setMCusts(p.monthlyCusts);
    setCalls(p.monthlyCalls); setEnq(p.monthlyEnq);
  };

  const recMult = (id: string) => RECENCY.find((r) => r.id === id)?.multiplier ?? 0.5;

  /* Population + review-trust driven customer loss model */
  const market = useMemo(() => {
    const pop = Math.max(1000, population || 0);
    const rate = niche.searchRate;
    const monthlySearches = (pop * rate) / 1000;
    const highIntent = monthlySearches * 0.30;

    const ratingFactor = Math.min(1.0, Math.max(0.5, yourRating / 5));
    const yourTrust = Math.max(0.001, yourReviews) * recMult(lastReview) * ratingFactor;
    const compTrust = Math.max(0.001, compReviews) * 1.0;
    let share = yourTrust / (yourTrust + compTrust);
    share = Math.min(0.96, Math.max(0.04, share));

    const lostSearchers = highIntent * (1 - share);
    const monthlyCustomersLost = lostSearchers * 0.40;
    const weeklyCustomersLost = monthlyCustomersLost / 4.33;
    const dailyCustomersLost = monthlyCustomersLost / 30;
    const monthlyRevenueLost = monthlyCustomersLost * avgValue;

    return { pop, monthlySearches, highIntent, share, lostSearchers,
      monthlyCustomersLost, weeklyCustomersLost, dailyCustomersLost, monthlyRevenueLost };
  }, [population, bizKey, yourReviews, compReviews, lastReview, yourRating, avgValue]);

  const reviewLost = market.monthlyRevenueLost;

  const speedLost = useMemo(() => {
    const keep = RESPONSE.find((r) => r.id === responseId)?.keep || 0.07;
    return Math.round(monthlyEnq * (1 - keep) * 0.28 * avgValue);
  }, [responseId, monthlyEnq, avgValue]);

  const callLost = useMemo(() => {
    const missed = Math.round(monthlyCalls * (missedPct / 100));
    return Math.round(missed * 0.35 * avgValue * 0.22);
  }, [monthlyCalls, missedPct, avgValue]);

  const totalLost = reviewLost + speedLost + callLost;

  const priorities = useMemo(() => [
    {
      id: "reviews", loss: reviewLost, icon: "⭐", name: "Google Review Automation", price: "$297-$497/month",
      problem: `${bizLabel} has ${yourReviews} reviews vs ${compLabel} with ${compReviews}. Based on ${cityLabel}'s population and typical search behavior for ${niche.label.toLowerCase()} businesses, this gap is estimated to cost ${fmt1(market.dailyCustomersLost)} customers a day, ${fmtI(market.weeklyCustomersLost)} a week, and ${fmtI(market.monthlyCustomersLost)} a month — going to ${compLabel} instead.`,
      pitch: `"Right now, every time someone in ${cityLabel} searches for a ${niche.label.toLowerCase()}, ${compLabel} is far more likely to get chosen because of your review gap. Based on the size of ${cityLabel} alone, that's an estimated ${fmtI(market.monthlyCustomersLost)} customers a month. I can set up a system that automatically requests a review from every customer after every job — no manual effort, just a steady drip of fresh reviews every week. That's what closes this gap. Investment is $297 a month."`,
      tool: "GoHighLevel (GHL) — Reputation Management module. Free 30-day trial at gohighlevel.com",
      ghl: "GHL → Sub-account → Reputation → Settings → Request → Configure review link → Automations → 2-message SMS sequence (after job complete)",
      roiLine: `Recovering just 15% of ${bizLabel}'s estimated ${fmt(reviewLost)} monthly loss = ${fmt(Math.round(reviewLost * 0.15))} — pays for the $297 service ${Math.max(1, Math.round((reviewLost * 0.15) / 297) || 1)}x over every month`,
      accent: "gold",
    },
    {
      id: "speed", loss: speedLost, icon: "⚡", name: "Speed to Lead Automation", price: "$197-$397/month",
      problem: `${bizLabel} receives approximately ${monthlyEnq} online enquiries per month with a current response time of: "${RESPONSE.find((r) => r.id === responseId)?.label}". At this speed, industry data shows only ${Math.round((RESPONSE.find((r) => r.id === responseId)?.keep || 0) * 100)}% of potential leads are kept. The rest go to whoever called first.`,
      pitch: `"Here is a fact that shocks most business owners: if a potential client fills in your contact form and nobody calls them back within 60 seconds, there is a 70%+ chance they have already called your competitor and booked. I can set up an automation that calls your phone the moment a form is submitted — so you reach that lead before they even think of calling someone else. Takes about a day to set up. Runs on its own from there."`,
      tool: "GoHighLevel Workflows + your existing phone. No new phone number required.",
      ghl: "GHL → Automations → New Workflow → Trigger: Form submitted → Action: Send notification + Trigger call to owner's phone → If no answer: immediate SMS to lead",
      roiLine: `Recovering 35% of ${bizLabel}'s estimated ${fmt(speedLost)} monthly speed-loss = ${fmt(Math.round(speedLost * 0.35))}/month — clear ROI on day one`,
      accent: "emerald",
    },
    {
      id: "calls", loss: callLost, icon: "📞", name: "AI Voice Receptionist", price: "$297-$497/month",
      problem: `Approximately ${Math.round(monthlyCalls * (missedPct / 100))} calls per month to ${bizLabel} go unanswered (${missedPct}% miss rate). 85% of people who hit voicemail hang up and call a competitor. These are warm, ready-to-buy customers calling directly — the highest-intent leads possible.`,
      pitch: `"Did you know 62% of calls to small businesses go unanswered? I can set up an AI receptionist that answers every single call in under one second, sounds completely human, handles common questions, and books appointments directly into your calendar — 24 hours a day, 7 days a week, for less than the cost of a part-time employee. I'll build it and test it this week."`,
      tool: "GoHighLevel (missed-call text-back, basic) or Bland AI (blandai.com) for full AI receptionist at $0.14/minute",
      ghl: "GHL: Settings → Phone → Missed Call Text-Back (free, basic). For full AI: Bland AI → create agent → upload business knowledge base → connect Calendly → purchase phone number ($15/month) → attach to GHL",
      roiLine: `Recovering 30% of ${bizLabel}'s estimated ${fmt(callLost)} monthly missed-call loss = ${fmt(Math.round(callLost * 0.30))}/month — immediate, measurable result`,
      accent: "crimson",
    },
  ].sort((a, b) => b.loss - a.loss),
  [reviewLost, speedLost, callLost, bizLabel, compLabel, cityLabel, yourReviews, compReviews, lastReview, monthlyEnq, responseId, monthlyCalls, missedPct, avgValue, niche, market]);

  const topPriority = priorities[0];

  /* ─── PDF content per tab ─── */
  const tabContent = (id: string): { title: string; lines: Array<[string, string]>; footer?: string } => {
    if (id === "profile") return {
      title: "Business Profile",
      lines: [
        ["Business name", businessName.trim() || "—"],
        ["Top competitor", competitorName.trim() || "—"],
        ["City", cityName.trim() || "—"],
        ["City population", fmtI(population) + " people"],
        ["Business type", niche.label],
        ["Average price per service", fmt(avgValue)],
        ["Monthly customers / jobs", String(monthlyCusts)],
        ["Estimated monthly revenue", fmt(monthlyCusts * avgValue)],
      ],
    };
    if (id === "reviews") return {
      title: "Review Health Audit",
      lines: [
        [`${bizLabel} reviews`, String(yourReviews)],
        [`${compLabel} reviews`, String(compReviews)],
        ["Gap", `${Math.round(((compReviews - yourReviews) / Math.max(compReviews, 1)) * 100)}% behind`],
        ["Star rating", yourRating.toFixed(1)],
        ["Last review received", RECENCY.find((r) => r.id === lastReview)?.label ?? "—"],
        ["Est. customers lost / month", fmtI(market.monthlyCustomersLost)],
        ["Estimated monthly revenue lost", fmt(reviewLost)],
        ["Service to fix this", "Google Review Automation ($297 – $497/mo)"],
      ],
    };
    if (id === "market") return {
      title: `Market Loss — ${bizLabel}${cityName.trim() ? ` in ${cityLabel}` : ""}`,
      lines: [
        ["1. City population", fmtI(market.pop) + " people"],
        [`2. Est. monthly searches in ${cityLabel}`, fmtI(market.monthlySearches) + " searches"],
        ["3. High-intent searchers (~30%)", fmtI(market.highIntent) + "/month"],
        [`4. Visibility share vs ${compLabel}`, Math.round(market.share * 100) + "%"],
        ["5. Searchers choosing the competitor", fmtI(market.highIntent * (1 - market.share)) + "/month"],
        ["6. Customers lost (~40% convert)", fmtI(market.monthlyCustomersLost) + "/month"],
        ["Customers lost / day", fmt1(market.dailyCustomersLost)],
        ["Customers lost / week", fmtI(market.weeklyCustomersLost)],
        ["Revenue lost / month", fmt(market.monthlyRevenueLost)],
        ["Revenue lost / year", fmt(market.monthlyRevenueLost * 12)],
      ],
      footer: "Modeled estimate — combines population, local search frequency and review-trust gap. Directional, not scraped data.",
    };
    if (id === "speed") return {
      title: "Speed to Lead Audit",
      lines: [
        ["Monthly enquiries", `${monthlyEnq} leads`],
        ["Current response speed", RESPONSE.find((r) => r.id === responseId)?.label ?? "—"],
        ["Lead retention at this speed", Math.round((RESPONSE.find((r) => r.id === responseId)?.keep || 0) * 100) + "%"],
        ["Leads lost to slow response", Math.round(monthlyEnq * (1 - (RESPONSE.find((r) => r.id === responseId)?.keep || 0))) + " leads/month"],
        ["Estimated revenue lost monthly", fmt(speedLost)],
        ["Fix", "Speed to Lead Automation via GHL ($197 – $397/mo)"],
      ],
    };
    if (id === "calls") return {
      title: "Call Management Audit",
      lines: [
        ["Monthly inbound calls", String(monthlyCalls)],
        ["Missed calls per month", String(Math.round(monthlyCalls * (missedPct / 100)))],
        ["Lost to competitor (est.)", String(Math.round(monthlyCalls * (missedPct / 100) * 0.35))],
        ["Estimated revenue lost monthly", fmt(callLost)],
        ["Fix", "AI Voice Receptionist (Bland AI + GHL)"],
        ["Price", "$297 – $497/month + $0.14/min"],
      ],
    };
    return {
      title: `Full Revenue Report — ${bizLabel}`,
      lines: [
        ["Total monthly revenue at risk", fmt(totalLost)],
        ["Total annual revenue at risk", fmt(totalLost * 12)],
        ["Review gap loss", fmt(reviewLost)],
        ["Speed to lead loss", fmt(speedLost)],
        ["Missed call loss", fmt(callLost)],
        ["Customers lost / day", fmt1(market.dailyCustomersLost)],
        ["Customers lost / month", fmtI(market.monthlyCustomersLost)],
        ...priorities.map((p, i): [string, string] => [`Priority ${i + 1}: ${p.name}`, `${p.price} · leak ${fmt(p.loss)}/mo`]),
        ["12-month client value (full ladder)", fmt(1188 * 12)],
      ],
      footer: "Lead with the #1 priority only. Upsell the rest once trust is established.",
    };
  };

  const drawPage = (pdf: jsPDF, tabId: string, tabLabel: string, pageIdx: number, pageTotal: number) => {
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(122, 90, 0);
    pdf.rect(0, 0, pageW, 74, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
    pdf.text("DBI Citadel", 32, 30);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
    pdf.text("D'Famocious Business Incubator", 32, 46);
    pdf.setFontSize(8); pdf.setTextColor(240, 220, 170);
    pdf.text("Powered by D'Famocious Group", 32, 60);
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(9);
    pdf.text(`SMB Performance Calculator — ${tabLabel}`, pageW - 32, 30, { align: "right" });
    pdf.setFontSize(8); pdf.setTextColor(240, 220, 170);
    pdf.text("Powered by Claude AI", pageW - 32, 46, { align: "right" });
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(8);
    pdf.text(new Date().toLocaleString(), pageW - 32, 60, { align: "right" });

    const { title, lines, footer } = tabContent(tabId);
    let y = 108;
    pdf.setTextColor(26, 20, 16);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
    pdf.text(title, 32, y, { maxWidth: pageW - 64 });
    if (businessName.trim() || cityName.trim()) {
      y += 20;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.setTextColor(107, 93, 63);
      pdf.text(
        `Prospect: ${businessName.trim() || "—"}${cityName.trim() ? ` · ${cityName.trim()}` : ""}${competitorName.trim() ? ` · vs ${competitorName.trim()}` : ""}`,
        32, y, { maxWidth: pageW - 64 },
      );
    }
    y += 26;

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10.5);
    lines.forEach(([k, v]) => {
      if (y > pageH - 110) { pdf.addPage(); y = 60; }
      pdf.setFillColor(248, 245, 238);
      pdf.rect(32, y - 12, pageW - 64, 22, "F");
      pdf.setTextColor(107, 93, 63);
      pdf.text(k, 40, y + 3, { maxWidth: pageW * 0.55 });
      pdf.setTextColor(26, 20, 16);
      pdf.setFont("helvetica", "bold");
      pdf.text(v, pageW - 40, y + 3, { align: "right" });
      pdf.setFont("helvetica", "normal");
      y += 26;
    });

    if (tabId === "report") {
      if (y > pageH - 160) { pdf.addPage(); y = 60; }
      y += 12;
      pdf.setFillColor(184, 32, 32);
      pdf.rect(32, y, pageW - 64, 60, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
      pdf.text("MONTHLY REVENUE AT RISK", 44, y + 22);
      pdf.setFontSize(28);
      pdf.text(fmt(totalLost), 44, y + 50);
      y += 84;

      pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(26, 20, 16);
      pdf.text(`Lead with: ${topPriority.name}`, 32, y); y += 18;
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(9.5); pdf.setTextColor(80, 70, 55);
      const pitchLines = pdf.splitTextToSize(topPriority.pitch, pageW - 64);
      pitchLines.forEach((ln: string) => {
        if (y > pageH - 80) { pdf.addPage(); y = 60; }
        pdf.text(ln, 32, y); y += 13;
      });
    }

    if (footer) {
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(9); pdf.setTextColor(120, 110, 90);
      pdf.text(footer, 32, pageH - 60, { maxWidth: pageW - 64 });
    }
    pdf.setDrawColor(217, 207, 187);
    pdf.line(32, pageH - 40, pageW - 32, pageH - 40);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(140, 130, 110);
    pdf.text("D'Famocious Business Incubator — Confidential · Powered by D'Famocious Group", 32, pageH - 24);
    pdf.text(`Page ${pageIdx} / ${pageTotal}`, pageW - 32, pageH - 24, { align: "right" });
  };

  const exportPdf = async (mode: "current" | "selected" | "all") => {
    setExporting(true);
    setPdfMenuOpen(false);
    try {
      let ids: string[];
      if (mode === "current") ids = [tab];
      else if (mode === "all") ids = TABS.map((t) => t.id);
      else ids = TABS.map((t) => t.id).filter((id) => pdfSelection[id]);
      if (ids.length === 0) { toast.error("Select at least one tab."); return; }

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      ids.forEach((id, i) => {
        if (i > 0) pdf.addPage();
        const label = TABS.find((t) => t.id === id)?.label ?? id;
        drawPage(pdf, id, label, i + 1, ids.length);
      });
      const stem = (businessName || "smb").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      pdf.save(`dfs-smb-calculator-${stem}-${mode === "current" ? tab : mode}.pdf`);
      toast.success("PDF downloaded.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 pb-12">
      {/* HEADER */}
      <header className="mb-6">
        <div className="text-[10px] tracking-widest text-gold-deep flex items-center gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> SMB Revenue Leak Finder
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold text-foreground">SMB Performance Calculator</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Enter a client's numbers to discover exactly how much revenue — and how many real customers — they are
          losing to a named competitor. Use this live on a discovery call or record it as a Loom.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-accent/20 px-3 py-1 text-xs font-semibold text-gold-deep">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Claude AI
          </div>
          {businessName.trim() && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              Analyzing: {bizLabel}{cityName.trim() ? ` in ${cityLabel}` : ""}{competitorName.trim() ? ` vs ${compLabel}` : ""}
            </div>
          )}
        </div>
      </header>

      {/* LIVE SUMMARY */}
      {totalLost > 0 && (
        <div className="rounded-xl border border-crimson/40 bg-crimson/5 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[10px] tracking-widest text-crimson font-bold">Estimated monthly revenue at risk</div>
            <div className="mt-1 font-display text-3xl font-bold text-crimson">{fmt(totalLost)}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <MiniLoss label="Review Gap" value={reviewLost} />
            <MiniLoss label="Slow Response" value={speedLost} />
            <MiniLoss label="Missed Calls" value={callLost} />
          </div>
          <div className="ml-auto rounded-lg border border-gold/40 bg-accent/20 px-4 py-2 text-center">
            <div className="text-[10px] tracking-widest text-gold-deep font-bold">Lead with</div>
            <div className="text-sm font-semibold text-foreground">{topPriority.icon} {topPriority.name}</div>
          </div>
        </div>
      )}

      {/* TABS + PDF */}
      <div className="flex overflow-x-auto gap-1 border-b border-border mb-4 relative">
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
        <div className="ml-auto relative">
          <button
            onClick={() => setPdfMenuOpen((v) => !v)}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Download PDF
          </button>
          {pdfMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-40 w-72 rounded-xl border border-border bg-card shadow-regal p-3 text-xs">
              <button onClick={() => exportPdf("current")} className="w-full text-left rounded-md px-3 py-2 hover:bg-muted font-semibold">
                Current tab only ({TABS.find((t) => t.id === tab)?.label})
              </button>
              <button onClick={() => exportPdf("all")} className="w-full text-left rounded-md px-3 py-2 hover:bg-muted font-semibold">
                All tabs (single PDF)
              </button>
              <div className="mt-2 border-t border-border pt-2">
                <div className="text-[10px] tracking-widest text-muted-foreground mb-1.5">Pick specific tabs</div>
                {TABS.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox" checked={!!pdfSelection[t.id]}
                      onChange={(e) => setPdfSelection((s) => ({ ...s, [t.id]: e.target.checked }))}
                      className="accent-primary"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
                <button
                  onClick={() => exportPdf("selected")}
                  className="mt-2 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Download selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {/* BUSINESS PROFILE */}
        {tab === "profile" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">Business Profile</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Name the business, its competitor, and its city. This personalizes every pitch script and drives the Market Loss calculation.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business Name">
                <TextInput value={businessName} onChange={setBizName} placeholder="e.g. Smile Side Dental" />
              </Field>
              <Field label="Top Competitor's Name">
                <TextInput value={competitorName} onChange={setCompName} placeholder="e.g. Bright Smile Clinic" />
              </Field>
            </div>
            <Field label="City" hint="Used to personalize pitch scripts and label the report.">
              <TextInput value={cityName} onChange={setCityName} placeholder="e.g. Austin, TX" />
            </Field>
            <Field
              label={`City Population: ${fmtI(population)} people`}
              hint="Search '[city name] population' on Google — takes 5 seconds. Or tap a quick estimate below."
            >
              <input
                type="number" value={population} min={1000} max={20000000} step={1000}
                onChange={(e) => setPopulation(+e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {CITY_SIZES.map((c) => (
                  <button
                    key={c.id} onClick={() => setPopulation(c.pop)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      population === c.pop
                        ? "border-gold bg-accent/30 text-gold-deep"
                        : "border-border bg-background text-muted-foreground hover:border-gold/50 hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Business Type">
              <select value={bizKey} onChange={(e) => applyPreset(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {Object.entries(PRESETS).map(([k, v]: any) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </Field>
            <Field
              label={`Average Price Per Service: ${fmt(avgValue)}`}
              hint="The amount a single service or job is worth on average. For real estate use average commission."
            >
              <input type="range" min={50} max={10000} step={50} value={avgValue} onChange={(e) => setAvgValue(+e.target.value)} className="w-full accent-primary" />
              <Ends left="$50" right="$10,000" />
            </Field>
            <Field
              label={`Monthly Customers / Jobs Completed: ${monthlyCusts}`}
              hint="Approx how many paying customers or jobs does this business serve per month?"
            >
              <input type="range" min={5} max={500} step={5} value={monthlyCusts} onChange={(e) => setMCusts(+e.target.value)} className="w-full accent-primary" />
              <Ends left="5" right="500" />
            </Field>
            <div className="rounded-lg border border-gold/40 bg-accent/20 p-4">
              <div className="text-[10px] tracking-widest text-gold-deep font-bold">Estimated Monthly Revenue</div>
              <div className="mt-2 font-display text-3xl font-bold">{fmt(monthlyCusts * avgValue)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{monthlyCusts} customers × {fmt(avgValue)} avg value</div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">Review Health Audit</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                AI tools (ChatGPT, Google AI Mode, Perplexity) decide who to recommend based on review count AND recency. Both matter equally.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={`${bizLabel}'s Google Reviews`}>
                <input type="number" min={0} max={9999} value={yourReviews} onChange={(e) => setYourRev(+e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>
              <Field label={`${compLabel}'s Reviews`}>
                <input type="number" min={0} max={9999} value={compReviews} onChange={(e) => setCompRev(+e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>
            </div>
            <Field
              label="When was the last Google review posted?"
              hint="AI algorithms weight review recency extremely heavily — a stale review profile signals an inactive business."
            >
              <select value={lastReview} onChange={(e) => setLastRev(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {RECENCY.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
              </select>
            </Field>
            <Field label={`Current Star Rating: ${yourRating}`}>
              <input type="range" min={1} max={5} step={0.1} value={yourRating} onChange={(e) => setRating(+e.target.value)} className="w-full accent-primary" />
              <Ends left="1.0 ★" right="5.0 ★" />
            </Field>
            <div className={`rounded-xl border p-4 ${reviewLost > 500 ? "border-crimson/40 bg-crimson/5" : "border-border bg-background"}`}>
              <div className={`text-[10px] tracking-widest font-bold ${reviewLost > 500 ? "text-crimson" : "text-muted-foreground"}`}>
                Review Gap Diagnosis
              </div>
              <Rows rows={[
                [bizLabel, `${yourReviews} reviews`, "text-foreground"],
                [compLabel, `${compReviews} reviews`, "text-foreground"],
                ["Gap", `${Math.round(((compReviews - yourReviews) / Math.max(compReviews, 1)) * 100)}% behind`, "text-crimson"],
                ["Est. customers lost / month", fmtI(market.monthlyCustomersLost), "text-crimson"],
                ["Estimated monthly revenue lost", fmt(reviewLost), "text-crimson"],
                ["Service to fix this", "Google Review Automation", "text-gold-deep"],
                ["Price", "$297 – $497/month", "text-emerald-600"],
              ]} />
              <p className="mt-3 text-xs text-muted-foreground">
                See the <strong className="text-gold-deep">Market Loss</strong> tab for the full daily / weekly / monthly breakdown and the methodology behind these numbers.
              </p>
            </div>
          </div>
        )}

        {/* MARKET LOSS */}
        {tab === "market" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">
                Market Loss — {bizLabel}{cityName.trim() ? ` in ${cityLabel}` : ""}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Combining {cityLabel}'s population with typical local search behavior and the review-trust gap vs {compLabel},
                here is the estimated customer loss — broken down by day, week, and month.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatBlock icon={Sunrise} label="Customers Lost / Day" value={fmt1(market.dailyCustomersLost)} accent="crimson" />
              <StatBlock icon={CalendarDays} label="Customers Lost / Week" value={fmtI(market.weeklyCustomersLost)} accent="gold" />
              <StatBlock icon={CalendarRange} label="Customers Lost / Month" value={fmtI(market.monthlyCustomersLost)} accent="onyx" />
            </div>

            <div className="rounded-xl border border-crimson/40 bg-crimson/5 p-4">
              <div className="text-[10px] tracking-widest text-crimson font-bold">What This Means</div>
              <p className="mt-2 text-sm text-foreground leading-relaxed">
                {bizLabel} is losing an estimated <strong className="text-crimson">{fmt1(market.dailyCustomersLost)} customers every day</strong> to{" "}
                {compLabel} — worth roughly <strong className="text-crimson">{fmt(market.monthlyRevenueLost)} a month</strong>, or{" "}
                <strong className="text-crimson">{fmt(market.monthlyRevenueLost * 12)} a year</strong>, simply because of the review trust gap.
              </p>
            </div>

            <div>
              <div className="text-[10px] tracking-widest text-muted-foreground font-bold mb-2">How This Is Calculated</div>
              <div className="rounded-xl border border-border bg-background p-4">
                <Rows rows={[
                  ["1. City population", fmtI(market.pop) + " people", "text-foreground"],
                  [`2. Est. monthly ${niche.label.toLowerCase()} searches in ${cityLabel}`, fmtI(market.monthlySearches) + " searches", "text-foreground"],
                  ["3. High-intent (decision-ready) searchers (~30%)", fmtI(market.highIntent) + "/month", "text-foreground"],
                  [`4. ${bizLabel}'s visibility share vs ${compLabel}`, Math.round(market.share * 100) + "%", "text-gold-deep"],
                  ["5. Searchers choosing the competitor instead", fmtI(market.highIntent * (1 - market.share)) + "/month", "text-crimson"],
                  ["6. Of those, estimated real customers lost (~40% convert)", fmtI(market.monthlyCustomersLost) + "/month", "text-crimson"],
                ]} />
              </div>
            </div>

            <div className="rounded-xl border border-gold/40 bg-accent/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gold-deep">
                <Info className="h-3.5 w-3.5" /> How to Read This Number
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                This is a modeled estimate, not live scraped data. It combines {cityLabel}'s approximate population, typical local
                search frequency for a {niche.label.toLowerCase()}, and the trust gap between {bizLabel}'s review profile and {compLabel}'s.
                Use it to start an honest, directional conversation with the client — not as a scientifically verified figure.
              </p>
            </div>
          </div>
        )}

        {/* SPEED */}
        {tab === "speed" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">Speed to Lead Audit</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                If you get an inbound lead and have not called them within 60 seconds, that is not your lead anymore. Someone else has already claimed it.
              </p>
            </div>
            <Field
              label={`Monthly Online Enquiries (form fills, DMs, chats): ${monthlyEnq}`}
              hint="Estimate how many people fill in a contact form or send a message per month."
            >
              <input type="range" min={0} max={200} value={monthlyEnq} onChange={(e) => setEnq(+e.target.value)} className="w-full accent-primary" />
              <Ends left="0" right="200/month" />
            </Field>
            <Field
              label="How fast does the business currently respond to online enquiries?"
              hint="Be honest — if they are manually checking email twice a day, select 'same day' or worse."
            >
              <select value={responseId} onChange={(e) => setResp(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {RESPONSE.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
              </select>
            </Field>
            <div className={`rounded-xl border p-4 ${speedLost > 400 ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-background"}`}>
              <div className={`text-[10px] tracking-widest font-bold ${speedLost > 400 ? "text-emerald-600" : "text-muted-foreground"}`}>
                Speed Gap Diagnosis
              </div>
              <Rows rows={[
                ["Monthly enquiries", `${monthlyEnq} leads`, "text-foreground"],
                ["Current response speed", RESPONSE.find((r) => r.id === responseId)?.label ?? "", "text-gold-deep"],
                ["Lead retention at this speed", Math.round((RESPONSE.find((r) => r.id === responseId)?.keep || 0) * 100) + "%", "text-gold-deep"],
                ["Leads lost to slow response", Math.round(monthlyEnq * (1 - (RESPONSE.find((r) => r.id === responseId)?.keep || 0))) + " leads/month", "text-crimson"],
                ["Estimated revenue lost monthly", fmt(speedLost), "text-crimson"],
                ["Fix", "Speed to Lead Automation via GHL", "text-emerald-600"],
                ["Price", "$197 – $397/month", "text-emerald-600"],
              ]} />
            </div>
          </div>
        )}

        {/* CALLS */}
        {tab === "calls" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">Call Management Audit</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                62% of calls to small businesses go unanswered. 85% of people who reach voicemail hang up immediately and call a competitor.
              </p>
            </div>
            <Field label={`Estimated Monthly Inbound Calls: ${monthlyCalls}`}>
              <input type="range" min={10} max={500} step={5} value={monthlyCalls} onChange={(e) => setCalls(+e.target.value)} className="w-full accent-primary" />
              <Ends left="10" right="500/month" />
            </Field>
            <Field
              label={`Estimated % of Calls That Go Unanswered: ${missedPct}%`}
              hint="If they are a solo operator or small team, the real number is often 40-65%."
            >
              <input type="range" min={0} max={85} value={missedPct} onChange={(e) => setMissed(+e.target.value)} className="w-full accent-primary" />
              <Ends left="0%" right="85%" />
            </Field>
            <div className={`rounded-xl border p-4 ${callLost > 300 ? "border-gold/50 bg-accent/20" : "border-border bg-background"}`}>
              <div className={`text-[10px] tracking-widest font-bold ${callLost > 300 ? "text-gold-deep" : "text-muted-foreground"}`}>
                Missed Call Diagnosis
              </div>
              <Rows rows={[
                ["Monthly inbound calls", String(monthlyCalls), "text-foreground"],
                ["Missed calls per month", String(Math.round(monthlyCalls * (missedPct / 100))), "text-crimson"],
                ["Lost to competitor (est.)", String(Math.round(monthlyCalls * (missedPct / 100) * 0.35)), "text-crimson"],
                ["Estimated revenue lost monthly", fmt(callLost), "text-crimson"],
                ["Fix", "AI Voice Receptionist (Bland AI + GHL)", "text-gold-deep"],
                ["Price", "$297 – $497/month + $0.14/min (Bland AI)", "text-gold-deep"],
              ]} />
            </div>
          </div>
        )}

        {/* REPORT */}
        {tab === "report" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">Full Revenue Report — {bizLabel}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                This is your discovery call asset. Record a Loom of this screen with the client's numbers filled in. It closes better than any proposal.
              </p>
            </div>

            <div className="rounded-xl border border-crimson/40 bg-crimson/5 p-5">
              <div className="text-[10px] tracking-widest text-crimson font-bold">Total Estimated Monthly Revenue at Risk</div>
              <div className="mt-1 font-display text-4xl md:text-5xl font-bold text-crimson">{fmt(totalLost)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{fmt(totalLost * 12)} per year — if nothing changes</div>
              <div className="mt-4 space-y-3">
                <ScoreBar label="Review Gap Loss" value={reviewLost} max={totalLost || 1} accent="gold" />
                <ScoreBar label="Speed to Lead Loss" value={speedLost} max={totalLost || 1} accent="emerald" />
                <ScoreBar label="Missed Call Loss" value={callLost} max={totalLost || 1} accent="crimson" />
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-widest text-muted-foreground font-bold mb-2">Customers Lost to {compLabel}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatBlock icon={Sunrise} label="Per Day" value={fmt1(market.dailyCustomersLost)} accent="crimson" />
                <StatBlock icon={CalendarDays} label="Per Week" value={fmtI(market.weeklyCustomersLost)} accent="gold" />
                <StatBlock icon={CalendarRange} label="Per Month" value={fmtI(market.monthlyCustomersLost)} accent="onyx" />
              </div>
            </div>

            <div className="rounded-xl border border-gold/40 bg-accent/20 p-4">
              <div className="text-[10px] tracking-widest text-gold-deep font-bold">★ Your #1 Priority — Lead With This</div>
              <div className="mt-1 font-display text-lg font-bold">{topPriority.icon} {topPriority.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Biggest single leak: <strong className="text-crimson">{fmt(topPriority.loss)}/month</strong> estimated.
                Service price: <strong className="text-emerald-600">{topPriority.price}</strong>.
              </div>
              <div className="mt-2 text-xs font-semibold text-gold-deep">
                Do NOT pitch all three at once. Lead with this one only. Upsell the others once trust is established.
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-widest text-muted-foreground font-bold mb-2">All 3 Services — Ranked by Impact</div>
              <div className="space-y-3">
                {priorities.map((p, i) => (<ServiceCard key={p.id} {...p} isTop={i === 0} />))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-[10px] tracking-widest text-muted-foreground font-bold mb-3">
                12-Month Value Per Client (Full Upsell Ladder)
              </div>
              {[
                { m: "Month 1-2", s: "Reviews Service", running: 297, cls: "text-gold-deep" },
                { m: "Month 3-4", s: "+ Speed to Lead", running: 594, cls: "text-emerald-600" },
                { m: "Month 5-6", s: "+ AI Receptionist", running: 991, cls: "text-gold-deep" },
                { m: "Month 7+",  s: "+ Website / App Retainer", running: 1188, cls: "text-crimson" },
              ].map((r) => (
                <div key={r.m} className="flex items-center justify-between border-b border-border py-2.5">
                  <div>
                    <div className="text-[10px] tracking-widest text-muted-foreground">{r.m}</div>
                    <div className="text-sm font-medium text-foreground">{r.s}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] tracking-widest text-muted-foreground">Running total</div>
                    <div className={`font-display text-base font-bold ${r.cls}`}>{fmt(r.running)}/mo</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm font-bold text-foreground">12-Month Client Value</span>
                <span className="font-display text-2xl font-bold text-emerald-600">{fmt(1188 * 12)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Conservative. One client, fully upsold, staying 12 months = {fmt(1188 * 12)}. Five such clients = {fmt(1188 * 12 * 5)}/year in recurring revenue.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── UI PRIMITIVES (DBI styling) ─── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <div className="text-xs font-semibold text-foreground mb-1">{label}</div>
      {hint && <div className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{hint}</div>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: any) {
  return (
    <input
      type="text" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  );
}

function Ends({ left, right }: { left: string; right: string }) {
  return (
    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
      <span>{left}</span><span>{right}</span>
    </div>
  );
}

function Rows({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <div className="mt-3">
      {rows.map(([k, v, cls]) => (
        <div key={k} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
          <span className="text-xs text-muted-foreground">{k}</span>
          <span className={`text-xs font-semibold text-right ${cls}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function StatBlock({ icon: Icon, label, value, accent }: any) {
  const a = ACCENT[accent] ?? ACCENT.onyx;
  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-4 text-center`}>
      <Icon className={`mx-auto h-5 w-5 ${a.text}`} />
      <div className={`mt-2 font-display text-2xl font-bold ${a.text}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

function ScoreBar({ label, value, max, accent }: any) {
  const a = ACCENT[accent] ?? ACCENT.onyx;
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold ${a.text}`}>{fmt(value)}<span className="font-normal text-muted-foreground">/mo</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${a.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ServiceCard({ icon, name, price, problem, pitch, tool, ghl, roiLine, accent, isTop }: any) {
  const [open, setOpen] = useState(false);
  const a = ACCENT[accent] ?? ACCENT.onyx;
  return (
    <div
      onClick={() => setOpen((o) => !o)}
      className={`rounded-xl border cursor-pointer overflow-hidden transition ${isTop ? `${a.border} ${a.bg} shadow-regal` : "border-border bg-background hover:border-gold/50"}`}
    >
      <div className="flex items-center gap-3 p-4">
        {isTop && (
          <span className={`shrink-0 rounded-full border ${a.border} px-2 py-0.5 text-[10px] font-bold ${a.text}`}>★ TOP PRIORITY</span>
        )}
        <span className="text-xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-foreground">{name}</div>
          <div className={`text-xs font-semibold ${a.text}`}>{price}</div>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </div>
      {open && (
        <div className="border-t border-border px-4 pb-4">
          {[
            ["The Problem Signal", problem, "text-gold-deep"],
            ["The Pitch (word for word)", pitch, "text-emerald-600"],
            ["The Tool", tool, "text-gold-deep"],
            ["GHL Setup", ghl, "text-primary"],
            ["Expected ROI", roiLine, "text-crimson"],
          ].map(([lbl, val, cls]: any) => (
            <div key={lbl} className="mt-3">
              <div className={`text-[10px] font-bold tracking-widest ${cls}`}>{lbl}</div>
              <p className={`mt-1 border-l-2 border-border pl-3 text-xs leading-relaxed text-muted-foreground ${lbl.includes("Pitch") ? "italic" : ""}`}>
                {val}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniLoss({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[9px] tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold text-crimson">{fmt(value)}</div>
    </div>
  );
}
