import { useState, useMemo } from "react";

/* ============================================================
   DATA
   ============================================================ */

const PLATFORMS = [
  {
    rank: 1, icon: "🗂️", color: "#0D7A5F", name: "State Licensing Directories",
    tag: "Free · Highest leverage",
    tagline: "The single most systematic, most underused way to build a real target list — before you've visited a single website.",
    cost: "Free",
    time: "20–40 min for an initial regional pull",
    how: "Search \"[your state] department of health home care agency license lookup\" (or assisted living / hospice — most states run one). Results usually include the agency name, address, phone, license status, and often the administrator's name, filterable by county or city.",
    signal: "An active, in-good-standing license confirms this is a real, currently-operating business you can confidently approach — verified by the state, not by you.",
    tip: "Several states (Minnesota, Illinois, and Indiana are good examples) run one combined database covering home care, assisted living, and hospice together. Find your state's version once and you have a reusable master list across most of your 6 care types at the same time."
  },
  {
    rank: 2, icon: "🧓", color: "#7A5A00", name: "Area Agencies on Aging (AAA) Network",
    tag: "Free · Unique to this vertical",
    tagline: "A federally-mandated referral network that hands out exactly the list you're trying to build.",
    cost: "Free",
    time: "30–45 min for a call or visit",
    how: "Use the federal Eldercare Locator (eldercare.acl.gov) or search \"[your city or county] Area Agency on Aging\" — there are roughly 600–655 of these regional nonprofits nationwide, created under the Older Americans Act. Call or visit and ask for their referral list of local home care, assisted living, and disability support providers.",
    signal: "A single AAA conversation can surface dozens of pre-vetted, currently-operating local agencies at once — often the same list families themselves are handed when they call in.",
    tip: "This is also your best single source for Adult Day Care and Disability Support targets specifically, since most AAAs explicitly serve both the senior and disability populations."
  },
  {
    rank: 3, icon: "📍", color: "#8B2E1F", name: "Google Maps & Local Search",
    tag: "Free · Fastest starting point",
    tagline: "The exact view a searching family sees — which makes it the fastest sanity check on any city or care type.",
    cost: "Free",
    time: "15–25 min per care-type/city sweep",
    how: "Search \"[care type] near [city]\" the same way a real family would — \"home care agency near Tulsa,\" \"memory care near Springfield.\" Note review count, review recency, and star rating for each result.",
    signal: "Low review counts or stale, months-old reviews often mirror weak communication systems generally — and this is literally the same channel your mystery-shopper audit should start from.",
    tip: "Use this first, before you commit real audit time, just to see how crowded a given care type actually is in your target city."
  },
  {
    rank: 4, icon: "🏷️", color: "#C99A3B", name: "Home Care Franchise Territory Pages",
    tag: "Free · Ready-made owner list",
    tagline: "One familiar brand name hiding dozens of genuinely independent local decision-makers.",
    cost: "Free",
    time: "15 min per brand",
    how: "Visit the \"locations\" or \"find care near you\" page of major national home care franchise brands — Home Instead, Visiting Angels, Comfort Keepers, BrightStar Care, Right at Home, Senior Helpers, and Griswold Home Care are all genuinely independently-owned by territory — and note every local territory in your area.",
    signal: "Each territory is its own small business with its own owner making its own purchasing decisions, even though the sign out front says a national brand.",
    tip: "A franchise owner already trusts their brand's playbook. Frame your pitch as filling a gap the corporate system doesn't cover, not as competing with the franchise itself."
  },
  {
    rank: 5, icon: "🏛️", color: "#7A5A00", name: "Professional & Trade Association Directories",
    tag: "Free–low cost · Soft legitimacy signal",
    tagline: "Membership itself tells you something about how seriously an owner takes their operation.",
    cost: "Free, occasionally a small membership-tier fee to access full directories",
    time: "20–30 min",
    how: "AHCA/NCAL (assisted living), the National Alliance for Care at Home (hospice and home care — formerly NHPCO and NAHC), and your state's own home care association all maintain member directories, many of them public.",
    signal: "Association membership is a soft legitimacy and engagement signal — these are owners already investing time and money into doing things properly.",
    tip: "State-level chapters are usually more responsive and locally relevant than the national bodies. Start there before working up to national directories."
  },
  {
    rank: 6, icon: "🤝", color: "#0D7A5F", name: "In-Person & Local Community Touchpoints",
    tag: "Free–low cost · Strongest for approaching",
    tagline: "The highest-trust channel that exists in this industry, exactly as this system's own Week 4 already tells you.",
    cost: "Free, occasionally a small event entry fee",
    time: "Varies — half a day for an expo",
    how: "Senior health expos, Alzheimer's Association chapter events, hospital discharge-planner introductions, local chamber of commerce meetings, and faith communities all put you in the same room as decision-makers.",
    signal: "A face-to-face conversation, even a brief one, builds trust faster than any digital outreach in an industry built on personal referral.",
    tip: "Use directories 1–5 to build your list efficiently, then use this channel to actually approach the names on it — that's the order this system's Week 3 and Week 4 already follow."
  },
  {
    rank: 7, icon: "💬", color: "#8B0000", name: "Caregiver & Agency-Owner Online Communities",
    tag: "Free · Lowest volume, useful research",
    tagline: "Slower-burning than the other six, but genuinely useful for relationship-building and research.",
    cost: "Free",
    time: "15–20 min, a few times a week",
    how: "Facebook groups for home care agency owners and administrators, LinkedIn searches for \"administrator\" or \"owner\" plus a care-type keyword, and niche home care operator forums.",
    signal: "Someone actively posting about staffing or scheduling struggles is often dealing with the exact same communication gaps this system fixes.",
    tip: "Treat this as a relationship and research channel, not your primary source of new names — the first five channels will do most of the volume work."
  },
];

const CARE_TYPES = [
  {
    icon: "🏠", color: "#C99A3B", name: "Home Care Agencies",
    marketSize: "Roughly 12,000 Medicare-registered agencies, with estimates of 35,000+ once non-licensed private-pay agencies are included",
    buyerProfile: "Often small and independently owned, or a single local franchise territory — the owner or administrator is usually directly reachable",
    urgency: "The highest crisis-moment inquiry volume of any of the 6 — a fall, a hospital discharge, or a sudden decline usually starts the search",
    competition: "Many franchise brands often compete within the same metro area, so response speed is a genuine, provable differentiator",
    find: "State licensing directories, Google Maps \"home care agency near me,\" and franchise territory pages (Home Instead, Visiting Angels, Comfort Keepers, and similar)",
    note: "The single strongest fit for this system's core pitch — the Rapid-Response Intake System is built around exactly this care type's buying pattern."
  },
  {
    icon: "🏢", color: "#7A5A00", name: "Assisted Living Facilities",
    marketSize: "Roughly 30,000–32,500 communities nationwide, housing 800,000–1,000,000+ residents",
    buyerProfile: "Larger operations, from a single community to a regional chain — often a marketing or admissions director alongside the administrator",
    urgency: "Less single-moment crisis than home care, but a real ongoing need since residents live on-site and families expect regular updates",
    competition: "Families often tour 3–5 communities before deciding, so first-response speed still matters, but the Family Update Portal component tends to land harder here than pure intake speed",
    find: "State assisted living licensing directories, the AHCA/NCAL member directory, and National Investment Center (NIC) regional data",
    note: "Bigger budgets and longer sales cycles than home care — lead with the ongoing communication story, not just speed."
  },
  {
    icon: "🧠", color: "#8B2E1F", name: "Memory Care / Dementia Care Facilities",
    marketSize: "Often licensed as a distinct unit within assisted living, or standalone; Alzheimer's and related dementias are projected to affect nearly 14 million older Americans by 2060",
    buyerProfile: "Sometimes a dedicated memory-care wing of a larger assisted living operator, sometimes a standalone specialized facility",
    urgency: "The highest emotional register of any care type here — decisions are often made under acute distress, like a wandering incident or a caregiver reaching total burnout",
    competition: "Families researching memory care are often already exhausted, so a warm, unhurried tone matters more here than almost anywhere else on this list",
    find: "Alzheimer's Association local chapter resource lists, specialized memory care facility directories, and state licensing directories filtered by dementia-care endorsement",
    note: "This is where the source system's own \"warm and empathetic, never urgency-driven\" rule matters the most — read the room before you read the script."
  },
  {
    icon: "🕊️", color: "#0D7A5F", name: "Hospice & End-of-Life Care Organizations",
    marketSize: "Roughly 3,200–4,400 hospice organizations nationwide",
    buyerProfile: "Often part of a larger health system, or a standalone nonprofit or for-profit hospice",
    urgency: "Communication is the core service itself here, not an add-on — families are in active bereavement or anticipatory grief",
    competition: "Less shopping-around than home care, since referrals often come through a single hospital or physician — the pitch here is less about beating a competitor and more about relieving an already-stretched clinical staff",
    find: "The National Alliance for Care at Home member directory, state hospice licensing directories, and local hospital palliative-care department relationships",
    note: "Stay strictly in logistics and communication territory here, never care documentation — exactly as this system's own FAQ already draws that line."
  },
  {
    icon: "♿", color: "#7A5A00", name: "Disability Support Services",
    marketSize: "Harder to size as one category, since it spans many state-funded and private programs — the Area Agency on Aging network explicitly also serves adults with disabilities, not only seniors",
    buyerProfile: "Often smaller, mission-driven nonprofits or state-contracted providers",
    urgency: "The same crisis-driven intake dynamic as elder care — a family searching urgently for the right fit for a loved one's specific needs",
    competition: "Fewer providers per region than home care, but fit and specialization matter enormously, so clear communication during intake is unusually high-value",
    find: "State disability services directories, the Area Agency on Aging & Disability network, and state-funded care provider networks",
    note: "Genuinely underserved — probably the least likely of the 6 to have already been approached by anyone running a system like this."
  },
  {
    icon: "👶", color: "#0D7A5F", name: "Adult Day Care Centers",
    marketSize: "Smaller footprint than the other five, usually bundled into broader \"adult day services\" data rather than tracked on its own",
    buyerProfile: "Often small, single-location operations, frequently partnered with or physically located near a senior center",
    urgency: "Lower single-moment crisis than home care, but real ongoing operational pain across intake, family updates, and scheduling all at once",
    competition: "Usually fewer local options than home care, so this is less about beating a competitor and more about being the first person to ever offer to fix their back-office communication",
    find: "Senior center partnership listings, local Area Agency on Aging directories, and National Adult Day Services Association resources",
    note: "Often the easiest, lowest-stakes first client for a nervous first-time student — genuinely underserved, with straightforward operational needs."
  },
];

const RESPONSE_OPTIONS = [
  { id: "never", points: 40, label: "No response at all within 24 hours on your mystery-shopper audit" },
  { id: "slow", points: 28, label: "Responded, but took more than 2 hours and felt generic" },
  { id: "same_day", points: 14, label: "Responded within 2 hours, reasonably warm" },
  { id: "fast_warm", points: 0, label: "Responded within 15–30 minutes, warm and personal" },
];

const COMM_OPTIONS = [
  { id: "none", points: 25, label: "No system at all — phone and word of mouth only" },
  { id: "basic_email", points: 15, label: "Basic email only, nothing automated" },
  { id: "underused", points: 8, label: "Existing software, but clearly underused for family communication" },
  { id: "full", points: 0, label: "Full communication system already active and well-used" },
];

const FIT_OPTIONS = [
  { id: "small", points: 20, label: "Small — one location, owner is directly reachable" },
  { id: "medium", points: 12, label: "Medium — a few locations, still locally owned" },
  { id: "large", points: 3, label: "Large regional or national chain, corporate-controlled" },
];

const DISCOVERY_OPTIONS = [
  { id: "referral", points: 15, label: "Warm introduction or referral from another agency or AAA contact" },
  { id: "inperson", points: 10, label: "Already made an in-person visit or real conversation" },
  { id: "cold", points: 5, label: "Found via directory or Google search only, no contact yet" },
  { id: "unknown", points: 0, label: "Not sure yet" },
];

const DISQUALIFIERS = [
  { id: "greatSystem", points: -20, label: "Already has a comprehensive, well-used care communication platform", override: true,
    overrideMsg: "This agency is already doing right by their families — no pitch needed here. But their owner likely knows other local agencies who aren't there yet. This is a referral source, not a dead end." },
  { id: "noAccess", points: -15, label: "No realistic way to reach the actual decision-maker (corporate-only)", override: true,
    overrideMsg: "Not actionable yet — you can't pitch someone you can't reach. Keep this on your radar in case a local administrator role opens up, but don't spend more time here now." },
];

const TIER_META = {
  hot: { label: "Hot", emoji: "🔥", color: "#8B0000", action: "Reach out this week, ideally in person. Lead gently with your real audit data — the response time you found, said kindly, not as a gotcha." },
  warm: { label: "Warm", emoji: "⚡", color: "#C99A3B", action: "A strong candidate. Approach within your next outreach wave, once your Hot list is underway." },
  cool: { label: "Cool", emoji: "🌥️", color: "#7A5A00", action: "Not the best first conversation right now — but worth a warm check-in in a month or two, especially if their situation changes." },
  cold: { label: "Cold", emoji: "❄️", color: "#6E6459", action: "Deprioritize for a pitch. Consider asking this owner for a referral instead — well-run agencies usually know other agencies." },
};

const WEEKLY_RHYTHM = [
  { day: "Mon", title: "Pull Fresh Names", color: "#0D7A5F", text: "Run a state licensing directory search or an AAA call for your target region. Add every new agency to the Agency CRM as Identified." },
  { day: "Tue", title: "Audit and Score", color: "#7A5A00", text: "Mystery-shop 3–5 agencies from your list. Run each one through the scoring calculator the same day, while the call is fresh." },
  { day: "Wed", title: "Research Decision-Makers", color: "#C99A3B", text: "For anything Warm or above, find the owner or administrator's name and best contact method." },
  { day: "Thu", title: "Approach, In Person Where Possible", color: "#8B2E1F", text: "Visit or contact your Hot agencies first, then Warm. Update Relationship Stage as you go." },
  { day: "Fri", title: "Follow Up and Recap", color: "#7A5A00", text: "Follow up with anyone from earlier in the week who hasn't responded. Tally audits done, conversations started, and meetings booked." },
];

const PACKAGE_TIERS = [
  { id: "foundation", name: "Foundation", price: "$75–$150/mo", value: "$900–$1,800/yr", mid: 1350, desc: "Rapid-Response Intake System only", color: "#0D7A5F" },
  { id: "growth", name: "Growth", price: "$175–$350/mo", value: "$2,100–$4,200/yr", mid: 3150, desc: "Intake + Family Update Portal", color: "#7A5A00" },
  { id: "full", name: "Full Care System", price: "$350–$600/mo", value: "$4,200–$7,200/yr", mid: 5700, desc: "Everything, plus scheduling, referrals, and quarterly check-ins", color: "#8B2E1F" },
];

/* ============================================================
   SMALL SHARED COMPONENTS
   ============================================================ */

function Chevron({ open }) {
  return (
    <span style={{ color: "#D9CFBB", fontSize: 19, display: "inline-block",
      transform: open ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>›</span>
  );
}

function SLabel({ text, color }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase",
      letterSpacing: ".08em", marginBottom: 7 }}>{text}</div>
  );
}

function MetricPill({ label, value, color }) {
  return (
    <div style={{ background: color + "12", border: `1px solid ${color}30`, borderRadius: 7,
      padding: "6px 9px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase",
        letterSpacing: ".05em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#201A16", lineHeight: 1.35 }}>{value}</div>
    </div>
  );
}

function OptionGroup({ title, color, max, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <SLabel text={title} color={color} />
        <span style={{ fontSize: 10.5, color, fontWeight: 700 }}>
          {(options.find(o => o.id === value)?.points ?? 0)} / {max}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            display: "flex", alignItems: "center", gap: 9, textAlign: "left",
            background: value === o.id ? color + "14" : "#F8F5EE",
            border: `1px solid ${value === o.id ? color + "60" : "#FBF8F1"}`,
            borderRadius: 9, padding: "9px 11px", cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${value === o.id ? color : "#D9CFBB"}`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              {value === o.id && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />}
            </span>
            <span style={{ flex: 1, fontSize: 12.5, color: value === o.id ? "#201A16" : "#6E6459", lineHeight: 1.4 }}>{o.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>+{o.points}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   LEAD SCORE CALCULATOR
   ============================================================ */

function LeadScoreCalculator() {
  const [response, setResponse] = useState(null);
  const [comm, setComm] = useState(null);
  const [fit, setFit] = useState(null);
  const [discovery, setDiscovery] = useState("unknown");
  const [flags, setFlags] = useState({});

  const toggleFlag = (id) => setFlags(p => ({ ...p, [id]: !p[id] }));

  const result = useMemo(() => {
    const rPts = RESPONSE_OPTIONS.find(o => o.id === response)?.points ?? 0;
    const cPts = COMM_OPTIONS.find(o => o.id === comm)?.points ?? 0;
    const fPts = FIT_OPTIONS.find(o => o.id === fit)?.points ?? 0;
    const dPts = DISCOVERY_OPTIONS.find(o => o.id === discovery)?.points ?? 0;
    let flagTotal = 0;
    DISQUALIFIERS.forEach(d => { if (flags[d.id]) flagTotal += d.points; });

    const raw = rPts + cPts + fPts + dPts + flagTotal;
    const score = Math.max(0, Math.min(100, raw));

    const activeOverride = DISQUALIFIERS.find(d => d.override && flags[d.id]);
    let tier;
    if (activeOverride) tier = "cold";
    else if (!response || !comm || !fit) tier = null;
    else if (score >= 70) tier = "hot";
    else if (score >= 40) tier = "warm";
    else if (score >= 20) tier = "cool";
    else tier = "cold";

    return { score, tier, rPts, cPts, fPts, dPts, overrideMsg: activeOverride ? activeOverride.overrideMsg : null };
  }, [response, comm, fit, discovery, flags]);

  const answered = [response, comm, fit].filter(Boolean).length;
  const tm = result.tier ? TIER_META[result.tier] : null;

  return (
    <div>
      <div style={{ background: "#F5F0E4", border: `1px solid ${tm ? tm.color + "40" : "#FBF8F1"}`, borderRadius: 13,
        padding: "16px 16px 14px", marginBottom: 18 }}>
        {tm ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: tm.color, lineHeight: 1 }}>{result.score}</span>
                <span style={{ fontSize: 12, color: "#D9CFBB" }}>/ 100</span>
              </div>
              <div style={{ background: tm.color + "18", border: `1px solid ${tm.color}45`, borderRadius: 999,
                padding: "5px 13px", fontSize: 13, fontWeight: 700, color: tm.color, whiteSpace: "nowrap" }}>
                {tm.emoji} {tm.label}
              </div>
            </div>
            <div style={{ position: "relative", height: 10, borderRadius: 999, overflow: "hidden", marginBottom: 10,
              background: "linear-gradient(90deg, #6E6459 0%, #6E6459 20%, #7A5A00 20%, #7A5A00 40%, #C99A3B 40%, #C99A3B 70%, #8B0000 70%, #8B0000 100%)" }}>
              <div style={{ position: "absolute", left: `calc(${result.score}% - 2px)`, top: -2, width: 4, height: 14,
                background: "#fff", borderRadius: 2, boxShadow: "0 0 0 2px #F5F0E4" }} />
            </div>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.55 }}>
              <strong style={{ color: tm.color }}>Next step: </strong>
              {result.overrideMsg || tm.action}
            </p>
          </>
        ) : (
          <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: 0, lineHeight: 1.6 }}>
            Answer the three sections below — Response, Communication, and Fit — for one real agency you've audited. {answered} of 3 answered so far.
          </p>
        )}
      </div>

      <OptionGroup title="Response Gap — What Your Audit Found" color="#8B0000" max={40}
        options={RESPONSE_OPTIONS} value={response} onChange={setResponse} />

      <OptionGroup title="Current Communication — Matches Your Agency CRM Field" color="#C99A3B" max={25}
        options={COMM_OPTIONS} value={comm} onChange={setComm} />

      <OptionGroup title="Fit & Access — Agency Size" color="#7A5A00" max={20}
        options={FIT_OPTIONS} value={fit} onChange={setFit} />

      <OptionGroup title="Discovery Warmth — How You Found Them" color="#0D7A5F" max={15}
        options={DISCOVERY_OPTIONS} value={discovery} onChange={setDiscovery} />

      <div>
        <SLabel text="Disqualifiers" color="#6E6459" />
        <p style={{ fontSize: 11, color: "#D9CFBB", margin: "0 0 8px" }}>Check any that apply — these subtract, and both override the score entirely.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DISQUALIFIERS.map(d => (
            <button key={d.id} onClick={() => toggleFlag(d.id)} style={{
              display: "flex", alignItems: "center", gap: 9, textAlign: "left",
              background: flags[d.id] ? "#64748B18" : "#F8F5EE",
              border: `1px solid ${flags[d.id] ? "#64748B60" : "#FBF8F1"}`,
              borderRadius: 9, padding: "9px 11px", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${flags[d.id] ? "#6E6459" : "#D9CFBB"}`,
                background: flags[d.id] ? "#6E6459" : "transparent", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 10, color: "#F5F0E4", fontWeight: 800 }}>{flags[d.id] ? "✓" : ""}</span>
              <span style={{ flex: 1, fontSize: 12.5, color: flags[d.id] ? "#201A16" : "#6E6459", lineHeight: 1.4 }}>{d.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6E6459", flexShrink: 0 }}>{d.points}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 10, padding: "12px 14px" }}>
        <p style={{ fontSize: 11.5, color: "#D9CFBB", margin: 0, lineHeight: 1.6 }}>
          💡 The Response, Communication, and Discovery sections map directly onto your Agency CRM's own
          Audited Response Time, Current Communication, and Contact Method fields — filling in the CRM and
          scoring the lead are the same piece of work, not two separate ones.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   CLIENT MIX CALCULATOR
   ============================================================ */

function MixCalculator() {
  const [counts, setCounts] = useState({ foundation: 2, growth: 4, full: 4 });

  const total = counts.foundation + counts.growth + counts.full;

  const annual = useMemo(() => {
    return PACKAGE_TIERS.reduce((sum, t) => sum + (counts[t.id] || 0) * t.mid, 0);
  }, [counts]);

  const change = (id, delta) => setCounts(p => {
    const next = Math.max(0, p[id] + delta);
    return { ...p, [id]: next };
  });

  return (
    <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SLabel text="Build Your Agency Mix" color="#0D7A5F" />
        <span style={{ fontSize: 11, color: "#D9CFBB", fontWeight: 600 }}>{total} agencies</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {PACKAGE_TIERS.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#201A16" }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: "#D9CFBB" }}>{t.price}</div>
            </div>
            <button onClick={() => change(t.id, -1)} style={{ width: 26, height: 26, borderRadius: 7,
              border: "1px solid #FBF8F1", background: "#F5F0E4", color: "#6E6459", fontSize: 15,
              cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}>−</button>
            <span style={{ width: 20, textAlign: "center", fontSize: 14, fontWeight: 700, color: t.color }}>{counts[t.id]}</span>
            <button onClick={() => change(t.id, 1)} style={{ width: 26, height: 26, borderRadius: 7,
              border: "1px solid #FBF8F1", background: "#F5F0E4", color: "#6E6459", fontSize: 15,
              cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}>+</button>
          </div>
        ))}
      </div>
      <div style={{ background: "#F5F0E4", border: "1px solid #10B98130", borderRadius: 9, padding: "11px 13px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6E6459" }}>Projected annual revenue</span>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#0D7A5F" }}>${annual.toLocaleString()}</span>
      </div>
      <p style={{ fontSize: 11, color: "#D9CFBB", margin: "9px 0 0", lineHeight: 1.5 }}>
        Uses the midpoint of each package's price range from your Packages tab. Add agencies above 10 to see
        what it honestly takes to reach a bigger target — this is a planning tool, not a promise.
      </p>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function SeniorCareProspectingGuide() {
  const [tab, setTab] = useState("overview");
  const [openPlatform, setOpenPlatform] = useState(null);
  const [openCare, setOpenCare] = useState(null);

  const TABS = [
    { id: "overview", label: "🧭 Overview" },
    { id: "platforms", label: "🔍 Top 7 Platforms" },
    { id: "care", label: "🏥 Top 6 Care Types" },
    { id: "scoring", label: "🎯 Score Agencies" },
    { id: "prioritize", label: "📊 Prioritize & Scale" },
  ];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,-apple-system,sans-serif",
      background: "#F5F0E4", minHeight: "100vh", color: "#201A16" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding: "22px 16px 18px", borderBottom: "1px solid #FBF8F1" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#0D7A5F",
            textTransform: "uppercase", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0D7A5F",
              boxShadow: "0 0 6px #0D7A5F", display: "inline-block" }} />
            The Care Bridge — Companion Guide
          </div>
          <h1 style={{ margin: "0 0 7px", fontSize: "clamp(21px,4.5vw,33px)", fontWeight: 800,
            lineHeight: 1.15, background: "linear-gradient(135deg,#201A16 30%,#0D7A5F 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Senior & Home Care Communication Prospecting Guide
          </h1>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#D9CFBB", maxWidth: 620, lineHeight: 1.65 }}>
            Seven real places to find agencies, six care types fully profiled, and a real scoring system —
            so you spend your limited weekly hours on the agencies most likely to say yes, approached with
            the warmth this work deserves.
          </p>
          <div style={{ background: "#F5F0E4", border: "1px solid #14B8A630", borderRadius: 10, padding: "11px 14px" }}>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#0D7A5F" }}>How this fits your 45-Day Plan:</strong> this is the deep
              version of Week 3 (Days 15–21) — pick your care focus using the profiles here, build your list
              with the platforms below, then score every agency before you plan a single approach.
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

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>How This System Works</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Three steps, in order — and every step stays warm and empathetic, exactly as your Scripts tab
              already insists on. This is not urgency-driven sales.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {[
                { n: "1", title: "Find", color: "#0D7A5F", text: "Seven real places to build a list, ranked by how directly they confirm a genuine gap. Covered in Top 7 Platforms." },
                { n: "2", title: "Score", color: "#8B0000", text: "A 100-point rubric built from your own Agency CRM fields, with two built-in disqualifiers. Covered in Score Agencies." },
                { n: "3", title: "Prioritize", color: "#7A5A00", text: "A weekly rhythm that turns a scored list into real, respectful outreach, plus the honest math behind your income target. Covered in Prioritize & Scale." },
              ].map(s => (
                <div key={s.n} style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11,
                  padding: "13px 15px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: s.color + "18",
                    border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: s.color, flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#201A16", marginBottom: 3 }}>{s.title}</div>
                    <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.55 }}>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#F5F0E4", border: "1px solid #FBF8F1", borderRadius: 12, padding: "15px 16px", marginBottom: 16 }}>
              <SLabel text="A Fair Note On Competition" color="#C99A3B" />
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.65 }}>
                This market really is underserved — tens of thousands of home care agencies, over 30,000
                assisted living communities, and thousands of hospice organizations nationwide, and almost
                none of them have ever had a digital agency offer to fix their family communication
                specifically. That part of the original pitch holds up. What it doesn't mean is that agencies
                have no competition at all — they compete hard with each other for the same families, which
                is exactly why response speed is such a provable, persuasive story. Your real edge isn't the
                absence of competition; it's being early into a category almost nobody else is pitching yet.
              </p>
            </div>

            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 12, padding: "14px 16px" }}>
              <SLabel text="Where This Plugs Into Your Agency CRM" color="#7A5A00" />
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                The scoring calculator's three main sections use your Agency CRM's own fields directly —
                Audited Response Time, Current Communication, and Agency Size. Score a lead there and you're
                filling in the CRM at the same time, not doing the work twice.
              </p>
            </div>
          </div>
        )}

        {/* PLATFORMS */}
        {tab === "platforms" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Top 7 Prospecting Platforms</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Ranked for building your list efficiently. Use #1–#5 to find names at scale, then #6 to actually
              approach them — in-person is still your strongest channel once you know who to visit.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {PLATFORMS.map((p, i) => {
                const isOpen = openPlatform === i;
                return (
                  <div key={p.name} onClick={() => setOpenPlatform(isOpen ? null : i)}
                    style={{ background: isOpen ? "#FBF8F1" : "#F8F5EE",
                      border: `1px solid ${isOpen ? p.color : "#FBF8F1"}`,
                      borderRadius: 11, cursor: "pointer", overflow: "hidden" }}>
                    <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: p.color + "18",
                        border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: p.color, flexShrink: 0 }}>#{p.rank}</div>
                      <span style={{ fontSize: 19, flexShrink: 0 }}>{p.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#201A16" }}>{p.name}</div>
                        <div style={{ fontSize: 10.5, color: p.color, marginTop: 1, fontWeight: 600 }}>{p.tag}</div>
                      </div>
                      <Chevron open={isOpen} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 15px 16px", borderTop: "1px solid #FBF8F1" }}>
                        <p style={{ fontSize: 12.5, color: "#6E6459", margin: "12px 0", lineHeight: 1.6, fontStyle: "italic" }}>{p.tagline}</p>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                          <MetricPill label="Cost" value={p.cost} color={p.color} />
                          <MetricPill label="Time" value={p.time} color={p.color} />
                        </div>
                        {[
                          ["🛠️ How To Use It", p.how, "#7A5A00"],
                          ["🎯 Signal To Look For", p.signal, "#0D7A5F"],
                          ["💡 Pro Tip", p.tip, "#C99A3B"],
                        ].map(([lbl, val, col]) => (
                          <div key={lbl} style={{ marginTop: 11 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: col, textTransform: "uppercase",
                              letterSpacing: ".07em", marginBottom: 5 }}>{lbl}</div>
                            <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65,
                              borderLeft: `2px solid ${col}40`, paddingLeft: 10 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CARE TYPES */}
        {tab === "care" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Top 6 Care Specializations, Fully Profiled</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Same six care types as your Pick Your Care Focus tab, gone deep — market size, buyer profile,
              and exactly where to find them for each.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {CARE_TYPES.map((c, i) => {
                const isOpen = openCare === i;
                return (
                  <div key={c.name} onClick={() => setOpenCare(isOpen ? null : i)}
                    style={{ background: isOpen ? "#FBF8F1" : "#F8F5EE",
                      border: `1px solid ${isOpen ? c.color : "#FBF8F1"}`,
                      borderRadius: 11, cursor: "pointer", overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "#201A16" }}>{c.name}</span>
                      <Chevron open={isOpen} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 14px 16px", borderTop: "1px solid #FBF8F1" }}>
                        {[
                          ["📊 Market Size", c.marketSize, "#0D7A5F"],
                          ["👤 Buyer Profile", c.buyerProfile, "#7A5A00"],
                          ["⏱️ Urgency", c.urgency, "#8B0000"],
                          ["⚖️ Competition For Families", c.competition, "#7A5A00"],
                          ["📍 Where To Find Them", c.find, "#C99A3B"],
                          ["💡 Note", c.note, "#8B2E1F"],
                        ].map(([lbl, val, col]) => (
                          <div key={lbl} style={{ marginTop: 11 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: col, textTransform: "uppercase",
                              letterSpacing: ".07em", marginBottom: 5 }}>{lbl}</div>
                            <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65,
                              borderLeft: `2px solid ${col}40`, paddingLeft: 10 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCORING */}
        {tab === "scoring" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Score Every Agency Before You Approach</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Answer honestly for one real agency you've audited. The score updates live, and none of it
              changes how kindly you approach them — it just tells you who to approach first.
            </p>
            <LeadScoreCalculator />
          </div>
        )}

        {/* PRIORITIZE */}
        {tab === "prioritize" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Prioritize Your List, Then Scale</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              A weekly rhythm to turn a scored list into real, respectful outreach, plus the honest math
              behind your income target.
            </p>

            <SLabel text="Your Weekly Rhythm" color="#7A5A00" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {WEEKLY_RHYTHM.map(r => (
                <div key={r.day} style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 10,
                  padding: "11px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 38, fontSize: 10.5, fontWeight: 800, color: r.color, textTransform: "uppercase",
                    flexShrink: 0, paddingTop: 1 }}>{r.day}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#201A16", marginBottom: 2 }}>{r.title}</div>
                    <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.5 }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <SLabel text="Queue Rules By Tier" color="#8B0000" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {Object.entries(TIER_META).map(([k, t]) => (
                <div key={k} style={{ background: "#F8F5EE", border: `1px solid ${t.color}30`, borderRadius: 10,
                  padding: "10px 13px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ background: t.color + "18", border: `1px solid ${t.color}45`, borderRadius: 999,
                    padding: "3px 10px", fontSize: 11.5, fontWeight: 700, color: t.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                    {t.emoji} {t.label}
                  </span>
                  <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.5 }}>{t.action}</p>
                </div>
              ))}
            </div>

            <SLabel text="The Honest Math Behind Your Income Target" color="#0D7A5F" />
            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "14px 15px", marginBottom: 14 }}>
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: "0 0 10px", lineHeight: 1.6 }}>
                Worth saying plainly: at this system's own Packages pricing, 10 agencies — even all 10 on
                Full Care System at the top of its range — tops out around <strong style={{ color: "#201A16" }}>$72,000/year</strong>.
                That's a genuinely strong outcome, and not quite the same number as $100,000.
              </p>
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                $100,000/year is a realistic 12–18 month trajectory, not a first-10-clients number — it
                generally means growing past 10 active agencies, moving more of them into Full Care System as
                pilots prove out, or developing a higher tier for multi-location assisted living operators
                who can support more than a solo home care agency can. Treat your first 10 as proof and
                referral engine, not the ceiling.
              </p>
            </div>
            <MixCalculator />

            <div style={{ marginTop: 14, background: "#F5F0E4", border: "1px solid #FBF8F1", borderRadius: 11, padding: "13px 15px" }}>
              <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                Every pilot starts free, per your Scripts tab — the mix above assumes pilots convert to paid
                retainers and mature toward Full Care System over time. Master one or two care types to your
                first 5 agencies before widening, exactly as this system's own Week 3 already recommends.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
