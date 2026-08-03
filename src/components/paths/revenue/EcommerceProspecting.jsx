import { useState, useMemo } from "react";

/* ============================================================
   DATA
   ============================================================ */

const PLATFORMS = [
  {
    rank: 1, icon: "📢", color: "#0D7A5F", name: "Meta Ad Library",
    tag: "Free · Pure budget signal",
    tagline: "The purest buying-power signal in ecommerce prospecting, and it costs nothing.",
    cost: "Free",
    time: "15–30 min / session",
    how: "Go to facebook.com/ads/library, pick a country, leave the category on \"All ads,\" then search a niche keyword like \"skincare routine\" or \"protein powder.\" Filter to Active ads first. An ad still running after 2+ weeks without stopping is almost always profitable for the brand — that's the real signal, not the creative itself.",
    signal: "An active ad plus a Shopify or WooCommerce checkout on the landing page confirms real budget and confirms platform, in under a minute, before you've even visited their site.",
    tip: "Check Inactive ads for the same brand too. A pattern of started-and-stopped campaigns with no recovery email ever landing in your inbox is often the loudest \"nothing is automated here\" signal there is."
  },
  {
    rank: 2, icon: "🧬", color: "#7A5A00", name: "Store Tech-Stack Lookup",
    tag: "Free tier · Highest leverage",
    tagline: "The only channel that confirms your #1 \"no flows installed\" criteria at scale, before you open a single store.",
    cost: "Free tier (Koala Inspector, BuiltWith) · paid tiers from ~$295/mo for bulk exports",
    time: "5–10 min for 50–100 candidate domains",
    how: "Install the free Koala Inspector Chrome extension and click it on any Shopify store to see every app they run instantly. For bulk discovery, use BuiltWith's free lookup at trends.builtwith.com to search \"Shopify\" plus a niche term, or reverse-search which stores are NOT running Klaviyo, Omnisend, or Attentive. In a pinch, Google's site:myshopify.com \"[niche keyword]\" works too.",
    signal: "Confirmed platform plus a confirmed absence of any email or SMS tool is your single strongest Hot criterion — and this is the only channel here that verifies it before you've spent time manually visiting a site.",
    tip: "This is the highest-leverage, most underused channel on this list — most students only think to check Instagram. Pair it with the Ad Library and you've effectively pre-qualified a lead without opening their website once."
  },
  {
    rank: 3, icon: "📸", color: "#8B2E1F", name: "Instagram & TikTok Shop",
    tag: "Free · Discovery + outreach in one",
    tagline: "Your discovery channel and your outreach channel, in the same app.",
    cost: "Free",
    time: "20–40 min / niche sweep",
    how: "Search your niche's hashtags and browse TikTok Shop's category tabs directly. Look past follower count — an account posting consistently with real comments, not just likes, beats a bigger, quieter one every time. Every profile you save here is also where you'll eventually send your DM, so treat each stop as research and future outreach at once.",
    signal: "Consistent posting plus real engagement means an actual operating team who checks their inbox, not an abandoned side project.",
    tip: "TikTok Shop's U.S. sales have roughly doubled year over year for several years running, with electronics and beauty among its fastest-growing categories — it's genuinely under-scouted relative to how many brands now sell through it."
  },
  {
    rank: 4, icon: "💬", color: "#C99A3B", name: "Niche Communities",
    tag: "Free · Self-identifying pain",
    tagline: "Where prospects announce their own problem in public, for free.",
    cost: "Free",
    time: "15–20 min, a few times / week",
    how: "r/shopify and r/ecommerce on Reddit, Shopify's own Community forums, and large Facebook groups like Ecommerce Entrepreneurs (roughly 50,000 members) or Shopify Entrepreneurs (100,000+ members) are full of founders describing exactly what's broken in their store. Search inside them for phrases like \"abandoned cart,\" \"email isn't converting,\" or \"just installed Klaviyo, now what\" — every hit is a founder narrating their own problem.",
    signal: "Someone posting their own struggle publicly is about as warm as a lead gets — they've already admitted the problem to a room full of strangers.",
    tip: "This channel doubles as a referral engine. Genuinely useful, non-salesy replies build a visible reputation in these groups that keeps paying off for months."
  },
  {
    rank: 5, icon: "⭐", color: "#8B0000", name: "App Review Mining",
    tag: "Free · Least-competed channel",
    tagline: "The most contrarian, least-competed channel on this list.",
    cost: "Free",
    time: "20–30 min, occasional",
    how: "Open the Shopify App Store listing for any Klaviyo alternative, sort reviews by 1 and 2 stars, and read the complaints. These are named, identifiable merchants publicly describing exactly what isn't working — often in more detail than they'd give you on a first call.",
    signal: "A public complaint about their current email or SMS tool means they're already sold on the category — they just haven't been sold on you yet. That's a faster close than educating someone from zero.",
    tip: "Almost nobody prospects this way, which is exactly why it works. Cross-reference the reviewer's store name against your niche list before reaching out."
  },
];

const NICHES = [
  {
    icon: "🧴", color: "#C99A3B", name: "Skincare & Beauty",
    aov: "$55–$140", abandon: "High", repeat: "High", competition: "High",
    why: "One of the largest DTC categories that exists, with purchase frequency doing more work than any single order size. Win-back and post-purchase repurchase reminders often outperform cart recovery alone here.",
    psychology: "Buyers respond to ingredient education and routine-building content. Discount-only messaging trains people to wait for sales — flows built around the routine convert better long-term.",
    find: "Instagram and TikTok beauty hashtags, sub-tags like \"clean beauty,\" \"K-beauty,\" or \"men's grooming,\" and the Meta Ad Library keyword \"skincare routine.\" Beauty is also one of TikTok Shop's largest categories by sales.",
    flow: "Post-Purchase + Win-Back",
    note: "The single most-picked niche among students running this system — go two layers deeper than \"skincare\" (clean, sensitive-skin, men's) to actually stand out."
  },
  {
    icon: "💊", color: "#0D7A5F", name: "Supplements & Wellness",
    aov: "$45–$120", abandon: "Medium", repeat: "Very High", competition: "High",
    why: "The most naturally subscription-friendly niche on this list — replenishment subscriptions in this category typically churn only around 5–8% a month, meaning win-back and reorder-timing flows have outsized lifetime-value impact.",
    psychology: "Trust and credibility drive this category more than urgency. A welcome series that builds trust (third-party testing, sourcing, reviews) before the first pitch outperforms aggressive discounting.",
    find: "Wellness influencer partner brands, \"third-party tested\" language on-site, and TikTok wellness hashtags. Check whether a subscribe-and-save option even exists — many stores offer it without a single flow supporting it.",
    flow: "Win-Back / Replenishment Reminder",
    note: "Crowded at the top by large national brands — smaller, condition-specific or regional supplement brands are the better fit for a solo operator."
  },
  {
    icon: "🐾", color: "#7A5A00", name: "Pet Products",
    aov: "$55–$110", abandon: "Lower than most niches here", repeat: "High", competition: "Medium",
    why: "Cart abandonment actually runs lower here than in almost any other category, so don't lead your pitch with broken cart recovery — lead with win-back and replenishment instead. That's the more accurate, more convincing angle for this specific niche.",
    psychology: "An emotionally attached buyer base drives unusually high email open rates. Content featuring the pet, not just the product, consistently outperforms.",
    find: "Pet hashtags, breed- or type-specific sub-niches (\"senior dog,\" \"cats only\"), and DTC alternatives to Chewy or PetSmart.",
    flow: "Win-Back + Replenishment Reminder",
    note: "Medium competition; a breed- or condition-specific angle differentiates faster than \"pet products\" broadly."
  },
  {
    icon: "💍", color: "#8B2E1F", name: "Jewelry & Accessories",
    aov: "$180–$436 — the highest of any niche here", abandon: "High", repeat: "Lower, but occasion-driven", competition: "Medium",
    why: "The highest average order value on this list means every recovered cart is worth the most in real dollars — a single recovered $300 cart can cover a month of retainer. This is the strongest pure abandoned-cart pitch of the eight.",
    psychology: "Price hesitation — the internal \"is this worth it\" debate — is the number one abandonment driver. Flows that reduce risk (return policy reminders, sizing guides, social proof) outperform discount-only sequences.",
    find: "Instagram Shop tags, TikTok Shop jewelry creators, and gift-guide search terms. Outreach volume should spike ahead of major gifting windows — November through December, February, and May.",
    flow: "Abandoned Cart",
    note: "Medium competition, but strongly seasonal — plan your heaviest prospecting pushes 6–8 weeks ahead of gifting season."
  },
  {
    icon: "👶", color: "#0D7A5F", name: "Baby & Kids Products",
    aov: "Often $70–$150+, higher with bundles", abandon: "Medium", repeat: "Medium to High", competition: "Medium",
    why: "Parents re-purchase as kids age through stages — newborn to toddler to kids' items — creating a natural, recurring buying window most other niches don't have.",
    psychology: "Safety and trust content outperforms discounting. New-parent urgency (needing something now) makes fast abandoned-cart timing unusually valuable here.",
    find: "Parenting hashtags, baby registry brands, and \"newborn essentials\" search terms. Baby showers and registries also create a natural referral loop worth asking about.",
    flow: "Welcome Series + Abandoned Cart",
    note: "Medium competition; sub-niching by age stage (newborn vs. toddler vs. big-kid) narrows the field fast."
  },
  {
    icon: "☕", color: "#7A5A00", name: "Coffee & Specialty Food",
    aov: "$45–$147, the lower end of the range", abandon: "Medium", repeat: "Very High", competition: "Lower",
    why: "Lower order value, but the highest realistic purchase frequency of any niche here — this is a resupply category by nature. Win-back flows are close to automatic once built, because the trigger (running out) is completely predictable.",
    psychology: "Origin story and ritual content outperform discounting. \"You're probably running low\" messaging timed to typical consumption cycles converts extremely well.",
    find: "Specialty food and coffee hashtags, farmers-market vendors expanding online, and subscription-box coffee brands.",
    flow: "Win-Back / Resupply Reminder",
    note: "Genuinely underrated pick — fewer students gravitate here than to beauty or supplements, so competition among agencies is lower too."
  },
  {
    icon: "🏋️", color: "#7A5A00", name: "Athletic & Fitness Apparel",
    aov: "$80–$200", abandon: "High — apparel is consistently one of the highest-abandonment categories in ecommerce", repeat: "Medium", competition: "High",
    why: "Community and identity-driven purchasing supports strong loyalty and VIP-segment flows beyond the core four, once the basics are in place.",
    psychology: "Social proof (UGC, community tags) and size or fit anxiety are the two biggest abandonment drivers here. Flows addressing fit confidence convert disproportionately well.",
    find: "Fitness influencer partner brands, gym-adjacent DTC startups, and TikTok fitness hashtags.",
    flow: "Abandoned Cart, with a loyalty/VIP flow as the natural upsell",
    note: "High competition on both sides — merchants and agencies. A sport-specific or body-type-specific angle differentiates faster than \"fitness apparel.\""
  },
  {
    icon: "📱", color: "#8B0000", name: "Tech Accessories & Gadgets",
    aov: "$120–$348, the second-highest of the eight", abandon: "High — impulse-buy, comparison-shopping category", repeat: "Lower, but strong accessory cross-sell cycles", competition: "Medium",
    why: "A high price point plus impulse-driven discovery, often from a single viral video, is the exact combination that produces \"add to cart, then talk myself out of it ten minutes later.\" It's close to the textbook case for abandoned cart recovery.",
    psychology: "Urgency and social proof (\"X people bought this today\") work better here than almost anywhere else on this list.",
    find: "TikTok Shop viral gadget brands and \"as seen on TikTok\" search terms — electronics is one of TikTok Shop's fastest-growing categories by percentage growth.",
    flow: "Abandoned Cart",
    note: "Medium competition — many of these brands run lean, one- or two-person teams that spend heavily on ads but remain genuinely underserved on lifecycle marketing."
  },
];

const SCORE_GROUPS = {
  gap: { label: "Gap Signal", sub: "What's missing from their current setup", color: "#8B0000", max: 35 },
  power: { label: "Buying Power", sub: "Can they actually pay you", color: "#C99A3B", max: 25 },
  fit: { label: "Fit & Access", sub: "Is this your lane, and can you reach them", color: "#7A5A00", max: 25 },
};

const SCORE_CRITERIA = [
  { id: "noCart", group: "gap", points: 15, label: "No abandoned cart flow currently running" },
  { id: "weakWelcome", group: "gap", points: 10, label: "No real welcome series — generic, single email, or none at all" },
  { id: "noWinback", group: "gap", points: 5, label: "No win-back or post-purchase flow in place" },
  { id: "noTool", group: "gap", points: 5, label: "Tech-stack check confirms zero email/SMS tool installed" },
  { id: "runningAds", group: "power", points: 15, label: "Actively running paid ads for 2+ weeks" },
  { id: "sizeSignal", group: "power", points: 10, label: "Meaningful size signal — 5K+ followers or an estimated $10K+/month in revenue" },
  { id: "nicheMatch", group: "fit", points: 15, label: "Matches your chosen specialization niche" },
  { id: "contactFound", group: "fit", points: 5, label: "Decision-maker's name identified" },
  { id: "channelOpen", group: "fit", points: 5, label: "A direct contact channel is open — DM or email" },
];

const DISCOVERY_OPTIONS = [
  { id: "complaint", points: 15, label: "Public complaint or negative review about their current tool" },
  { id: "community", points: 8, label: "Active engagement in a niche community" },
  { id: "cold", points: 3, label: "Cold discovery only — ad library or tech lookup" },
  { id: "none", points: 0, label: "Not sure yet / no contact made" },
];

const DISQUALIFIERS = [
  { id: "inactive", points: -15, label: "Store looks inactive — no posts in 60+ days" },
  { id: "strongFlows", points: -20, label: "Audit shows flows are already strong and complete", override: true,
    overrideMsg: "Flows are already built and running — not a fit for this offer regardless of score. Pitch SMS or optimization instead, or pass." },
  { id: "noReach", points: -15, label: "No realistic contact path found yet", override: true,
    overrideMsg: "No contact path yet, so this lead isn't actionable no matter the score. Keep researching before spending more time." },
];

const TIER_META = {
  hot: { label: "Hot", emoji: "🔥", color: "#8B0000", action: "Contact within 24 hours. Personalize the opener and send it today — top of your queue." },
  warm: { label: "Warm", emoji: "⚡", color: "#C99A3B", action: "Contact within the week. Standard sequence, batched with your other Warm leads." },
  cool: { label: "Cool", emoji: "🌥️", color: "#7A5A00", action: "Not yet. Park it in nurture and re-check its signals in 30–60 days." },
  cold: { label: "Cold", emoji: "❄️", color: "#6E6459", action: "Deprioritize. Only revisit if something changes — new ad spend, a tool gets uninstalled, a complaint appears." },
};

const WEEKLY_RHYTHM = [
  { day: "Mon", title: "Refresh Your Lists", color: "#0D7A5F", text: "Run a fresh tech-stack sweep and scan the Meta Ad Library for your niche. Add every new candidate to the CRM as Not Contacted." },
  { day: "Tue", title: "Score and Enrich", color: "#7A5A00", text: "Run every new candidate through the scoring calculator. Find a decision-maker's name and a contact channel for anything Warm or above." },
  { day: "Wed", title: "Audit the Hot Ones", color: "#C99A3B", text: "Add-to-cart and sign-up audit every Hot lead before writing a single outreach message." },
  { day: "Thu", title: "Send the Waves", color: "#8B2E1F", text: "Send personalized outreach to Hot leads first, then Warm. Update Stage to Contacted for each as you go." },
  { day: "Fri", title: "Follow Up and Recap", color: "#7A5A00", text: "Send the Day-3 follow-up script to anyone from last week who hasn't replied. Tally sends, replies, and calls booked." },
];

const CAPACITY_TIERS = [
  { id: "starter", name: "Starter", range: "$297–$397/mo", mid: 347, color: "#0D7A5F" },
  { id: "growth", name: "Growth", range: "$500–$700/mo", mid: 600, color: "#7A5A00" },
  { id: "full", name: "Full Revenue System", range: "$800–$1,200/mo", mid: 1000, color: "#8B2E1F" },
];

const FUNNEL_STEPS = [
  { label: "Weekly outreach sent", val: "20", note: "Hot + Warm leads from your queue" },
  { label: "Replies", val: "~15–25%", note: "of sends — placeholder, log your real rate" },
  { label: "Calls booked", val: "~30–40%", note: "of replies — placeholder" },
  { label: "Clients closed", val: "~30–50%", note: "of calls — depends heavily on the discovery call" },
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
      padding: "6px 9px", flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase",
        letterSpacing: ".05em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#201A16", lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

/* ============================================================
   LEAD SCORE CALCULATOR
   ============================================================ */

function LeadScoreCalculator() {
  const [on, setOn] = useState({});
  const [discovery, setDiscovery] = useState("none");
  const toggle = (id) => setOn((p) => ({ ...p, [id]: !p[id] }));

  const result = useMemo(() => {
    let raw = 0;
    const byGroup = { gap: 0, power: 0, fit: 0 };
    SCORE_CRITERIA.forEach((c) => {
      if (on[c.id]) { raw += c.points; byGroup[c.group] += c.points; }
    });
    const dOpt = DISCOVERY_OPTIONS.find((d) => d.id === discovery);
    const discoveryPts = dOpt ? dOpt.points : 0;
    raw += discoveryPts;
    let flagTotal = 0;
    DISQUALIFIERS.forEach((d) => { if (on[d.id]) flagTotal += d.points; });
    raw += flagTotal;
    const score = Math.max(0, Math.min(100, raw));

    const activeOverride = DISQUALIFIERS.find((d) => d.override && on[d.id]);
    let tier;
    if (activeOverride) tier = "cold";
    else if (score >= 70) tier = "hot";
    else if (score >= 40) tier = "warm";
    else if (score >= 20) tier = "cool";
    else tier = "cold";

    return { score, tier, byGroup, discoveryPts, overrideMsg: activeOverride ? activeOverride.overrideMsg : null };
  }, [on, discovery]);

  const tm = TIER_META[result.tier];

  return (
    <div>
      <div style={{ background: "#F5F0E4", border: `1px solid ${tm.color}40`, borderRadius: 13,
        padding: "16px 16px 14px", marginBottom: 18 }}>
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
      </div>

      {Object.entries(SCORE_GROUPS).map(([gid, g]) => (
        <div key={gid} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
            <SLabel text={g.label} color={g.color} />
            <span style={{ fontSize: 10.5, color: g.color, fontWeight: 700 }}>{byGroupSafe(result.byGroup, gid)} / {g.max}</span>
          </div>
          <p style={{ fontSize: 11, color: "#D9CFBB", margin: "0 0 8px" }}>{g.sub}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SCORE_CRITERIA.filter((c) => c.group === gid).map((c) => (
              <button key={c.id} onClick={() => toggle(c.id)} style={{
                display: "flex", alignItems: "center", gap: 9, textAlign: "left",
                background: on[c.id] ? g.color + "14" : "#F8F5EE",
                border: `1px solid ${on[c.id] ? g.color + "60" : "#FBF8F1"}`,
                borderRadius: 9, padding: "9px 11px", cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${on[c.id] ? g.color : "#D9CFBB"}`,
                  background: on[c.id] ? g.color : "transparent", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 10, color: "#F5F0E4", fontWeight: 800 }}>{on[c.id] ? "✓" : ""}</span>
                <span style={{ flex: 1, fontSize: 12.5, color: on[c.id] ? "#201A16" : "#6E6459", lineHeight: 1.4 }}>{c.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: g.color, flexShrink: 0 }}>+{c.points}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
          <SLabel text="Discovery Warmth" color="#0D7A5F" />
          <span style={{ fontSize: 10.5, color: "#0D7A5F", fontWeight: 700 }}>{result.discoveryPts} / 15</span>
        </div>
        <p style={{ fontSize: 11, color: "#D9CFBB", margin: "0 0 8px" }}>How did you find this lead? Pick one.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DISCOVERY_OPTIONS.map((d) => (
            <button key={d.id} onClick={() => setDiscovery(d.id)} style={{
              display: "flex", alignItems: "center", gap: 9, textAlign: "left",
              background: discovery === d.id ? "#0D7A5F14" : "#F8F5EE",
              border: `1px solid ${discovery === d.id ? "#0D7A5F60" : "#FBF8F1"}`,
              borderRadius: 9, padding: "9px 11px", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${discovery === d.id ? "#0D7A5F" : "#D9CFBB"}`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {discovery === d.id && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0D7A5F" }} />}
              </span>
              <span style={{ flex: 1, fontSize: 12.5, color: discovery === d.id ? "#201A16" : "#6E6459", lineHeight: 1.4 }}>{d.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0D7A5F", flexShrink: 0 }}>+{d.points}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SLabel text="Disqualifiers" color="#6E6459" />
        <p style={{ fontSize: 11, color: "#D9CFBB", margin: "0 0 8px" }}>Check any that apply — these subtract, and two of them override the score entirely.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DISQUALIFIERS.map((d) => (
            <button key={d.id} onClick={() => toggle(d.id)} style={{
              display: "flex", alignItems: "center", gap: 9, textAlign: "left",
              background: on[d.id] ? "#6E645918" : "#F8F5EE",
              border: `1px solid ${on[d.id] ? "#6E645960" : "#FBF8F1"}`,
              borderRadius: 9, padding: "9px 11px", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${on[d.id] ? "#6E6459" : "#D9CFBB"}`,
                background: on[d.id] ? "#6E6459" : "transparent", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 10, color: "#F5F0E4", fontWeight: 800 }}>{on[d.id] ? "✓" : ""}</span>
              <span style={{ flex: 1, fontSize: 12.5, color: on[d.id] ? "#201A16" : "#6E6459", lineHeight: 1.4 }}>{d.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6E6459", flexShrink: 0 }}>{d.points}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 10, padding: "12px 14px" }}>
        <p style={{ fontSize: 11.5, color: "#D9CFBB", margin: 0, lineHeight: 1.6 }}>
          💡 To match this against your Store CRM's 1–10 Lead Score field, divide this number by 10 and round.
          A score of 74 here is roughly a 7 there — and the Hot / Warm / Cold tiers map directly onto your
          existing Lead Priority field (fold Cool into Cold if you'd rather keep exactly three buckets).
        </p>
      </div>
    </div>
  );
}

function byGroupSafe(byGroup, gid) {
  return byGroup && typeof byGroup[gid] === "number" ? byGroup[gid] : 0;
}

/* ============================================================
   CLIENT MIX CALCULATOR
   ============================================================ */

function MixCalculator() {
  const [counts, setCounts] = useState({ starter: 0, growth: 4, full: 6 });

  const total = counts.starter + counts.growth + counts.full;

  const annual = useMemo(() => {
    return CAPACITY_TIERS.reduce((sum, t) => sum + (counts[t.id] || 0) * t.mid * 12, 0);
  }, [counts]);

  const change = (id, delta) => setCounts((p) => {
    const next = Math.max(0, p[id] + delta);
    const currentTotal = p.starter + p.growth + p.full;
    const nextTotal = currentTotal - p[id] + next;
    if (nextTotal > 10) return p;
    return { ...p, [id]: next };
  });

  return (
    <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SLabel text="Build Your Client Mix" color="#0D7A5F" />
        <span style={{ fontSize: 11, color: total >= 10 ? "#8B0000" : "#D9CFBB", fontWeight: 600 }}>{total} / 10 clients</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {CAPACITY_TIERS.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#201A16" }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: "#D9CFBB" }}>{t.range}</div>
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
      <div style={{ background: "#F5F0E4", border: "1px solid #0D7A5F30", borderRadius: 9, padding: "11px 13px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6E6459" }}>Projected annual revenue</span>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#0D7A5F" }}>${annual.toLocaleString()}</span>
      </div>
      <p style={{ fontSize: 11, color: "#D9CFBB", margin: "9px 0 0", lineHeight: 1.5 }}>
        Uses the midpoint of each package's price range from your Packages tab. Real results depend on
        retention, upsells, and how many clients you actually close — this is a planning target, not a promise.
      </p>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function EcommerceProspectingGuide() {
  const [tab, setTab] = useState("overview");
  const [openPlatform, setOpenPlatform] = useState(null);
  const [openNiche, setOpenNiche] = useState(null);

  const TABS = [
    { id: "overview", label: "🧭 Overview" },
    { id: "platforms", label: "🔍 Top 5 Platforms" },
    { id: "niches", label: "🎯 Top 8 Niches" },
    { id: "scoring", label: "🔥 Score Leads" },
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
            Revenue Recovery Engine — Companion Guide
          </div>
          <h1 style={{ margin: "0 0 7px", fontSize: "clamp(21px,4.5vw,33px)", fontWeight: 800,
            lineHeight: 1.15, background: "linear-gradient(135deg,#201A16 30%,#0D7A5F 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Prospecting & Lead Scoring Playbook
          </h1>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#D9CFBB", maxWidth: 600, lineHeight: 1.65 }}>
            Five real channels to find ecommerce prospects, eight fully profiled niches to specialize in,
            and a real scoring system so you spend your limited weekly hours on the accounts most likely to say yes.
          </p>
          <div style={{ background: "#F5F0E4", border: "1px solid #0D7A5F30", borderRadius: 10, padding: "11px 14px" }}>
            <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#0D7A5F" }}>How this fits your 45-Day Plan:</strong> this is the deep
              version of Week 3 (Days 15–21) — pick your niche using the profiles here, find your 30–40
              prospects with the platforms below, then score every one before you write a single message.
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: "#F8F5EE", borderBottom: "1px solid #FBF8F1", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", padding: "0 8px", overflowX: "auto" }}>
          {TABS.map((t) => (
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
              Three steps, in order. Skipping the middle one is the single most common reason outreach feels random.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {[
                { n: "1", title: "Find", color: "#0D7A5F", text: "Five channels, ranked by how directly they confirm budget and gap in one look. Covered in Top 5 Platforms." },
                { n: "2", title: "Score", color: "#8B0000", text: "A 100-point rubric across gap, budget, fit, and how you found them, with built-in disqualifiers. Covered in Score Leads." },
                { n: "3", title: "Prioritize", color: "#7A5A00", text: "A weekly rhythm that turns a scored list into an actual outreach queue, plus the real math behind your income target. Covered in Prioritize & Scale." },
              ].map((s) => (
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
                Shopify alone runs several million active stores worldwide, and that's before WooCommerce and
                everyone else — the market is genuinely large enough for this. But "ecommerce email flows" isn't
                empty space either; Klaviyo's own onboarding, other freelancers, and other agencies are all selling
                into the same lane. Your niche specialization (Day 15) is still the real edge, because two students
                in different niches never compete for the same prospect. Inside your niche, though, you won't be
                the only option a founder considers. The system on this page exists so that when you are one of
                several people they could hire, you're the one who shows up first, with the sharpest read on their
                actual gap, backed by a working demo. That's the durable advantage — not the absence of
                competition, but speed and precision inside it.
              </p>
            </div>

            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 12, padding: "14px 16px" }}>
              <SLabel text="Where This Plugs Into Your Store CRM" color="#7A5A00" />
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                Every lead you score on the Score Leads tab maps directly to two fields already in your Notion
                CRM: divide this system's 0–100 score by 10 and round for the <strong style={{ color: "#201A16" }}>Lead Score</strong> field,
                and use the tier — Hot, Warm, Cool, or Cold — for <strong style={{ color: "#201A16" }}>Lead Priority</strong> (fold
                Cool into Cold there if you'd rather keep exactly three buckets).
              </p>
            </div>
          </div>
        )}

        {/* PLATFORMS */}
        {tab === "platforms" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Top 5 Prospecting Platforms</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Ranked by how directly each one confirms both a real gap and a real budget. Use #1 and #2 to build
              volume, #3 to verify and reach out, #4 and #5 for your highest-intent minority.
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

        {/* NICHES */}
        {tab === "niches" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Top 8 Niches, Fully Profiled</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Same eight categories as your Pick Your Niche tab, gone deep — market data, buyer psychology,
              and exactly where to find them for each.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {NICHES.map((n, i) => {
                const isOpen = openNiche === i;
                return (
                  <div key={n.name} onClick={() => setOpenNiche(isOpen ? null : i)}
                    style={{ background: isOpen ? "#FBF8F1" : "#F8F5EE",
                      border: `1px solid ${isOpen ? n.color : "#FBF8F1"}`,
                      borderRadius: 11, cursor: "pointer", overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "#201A16" }}>{n.name}</span>
                      <Chevron open={isOpen} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 14px 16px", borderTop: "1px solid #FBF8F1" }}>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "12px 0 7px" }}>
                          <MetricPill label="AOV" value={n.aov} color={n.color} />
                          <MetricPill label="Abandonment" value={n.abandon} color={n.color} />
                        </div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                          <MetricPill label="Repeat Fit" value={n.repeat} color={n.color} />
                          <MetricPill label="Competition" value={n.competition} color={n.color} />
                        </div>
                        {[
                          ["💡 Why This Works", n.why, "#0D7A5F"],
                          ["🧠 Buyer Psychology", n.psychology, "#7A5A00"],
                          ["📍 Where To Find Them", n.find, "#C99A3B"],
                          ["📧 Lead-With Flow", n.flow, "#8B2E1F"],
                          ["⚖️ Competition Note", n.note, "#7A5A00"],
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
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Score Every Lead Before You Message Them</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              Toggle what's true about a real prospect you're evaluating. The score updates live.
            </p>
            <LeadScoreCalculator />
          </div>
        )}

        {/* PRIORITIZE */}
        {tab === "prioritize" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#201A16" }}>Prioritize Your Queue, Then Scale</h2>
            <p style={{ fontSize: 12.5, color: "#D9CFBB", margin: "0 0 16px", lineHeight: 1.6 }}>
              A weekly rhythm to turn a scored list into real outreach, plus the actual math behind a $100K year.
            </p>

            <SLabel text="Your Weekly Rhythm" color="#7A5A00" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {WEEKLY_RHYTHM.map((r) => (
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

            <SLabel text="Recycling Cool & Cold Leads" color="#7A5A00" />
            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "13px 15px", marginBottom: 20 }}>
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                Re-run every Cool and Cold lead through the scoring calculator every 30–60 days. A store with
                zero ad spend today might be running ads next month; a founder with strong flows today might
                switch tools after a bad renewal. Signals change — your score should too.
              </p>
            </div>

            <SLabel text="A Worked Example — Replace With Your Real Numbers" color="#C99A3B" />
            <div style={{ background: "#F8F5EE", border: "1px solid #FBF8F1", borderRadius: 11, padding: "14px 15px", marginBottom: 20 }}>
              <p style={{ fontSize: 11.5, color: "#D9CFBB", margin: "0 0 12px", lineHeight: 1.6 }}>
                These are placeholder rates for illustration only, not researched averages — track your actual
                numbers in the CRM Pipeline Board after 2–3 weeks and use those instead.
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {FUNNEL_STEPS.map((f, i) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0", borderBottom: i < FUNNEL_STEPS.length - 1 ? "1px solid #FBF8F1" : "none" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#C99A3B18", border: "1px solid #C99A3B40",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#C99A3B", flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#201A16" }}>{f.label}</div>
                      <div style={{ fontSize: 10.5, color: "#D9CFBB" }}>{f.note}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#C99A3B", flexShrink: 0 }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: "#D9CFBB", margin: "12px 0 0", lineHeight: 1.6 }}>
                At the low end of these placeholder ranges, that's roughly one new client every 5–6 weeks. At
                the high end, faster. Either way — ten clients a year is realistic on a steady weekly rhythm,
                not a single lucky week.
              </p>
            </div>

            <SLabel text="The Math Behind Your $100K Target" color="#0D7A5F" />
            <p style={{ fontSize: 12, color: "#D9CFBB", margin: "0 0 10px", lineHeight: 1.6 }}>
              Play with the mix below — it uses your own Packages tab pricing, not a made-up number.
            </p>
            <MixCalculator />

            <div style={{ marginTop: 14, background: "#F5F0E4", border: "1px solid #FBF8F1", borderRadius: 11, padding: "13px 15px" }}>
              <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                Most students start clients on Starter, prove results in 2–3 months, then upsell to Growth or
                Full Revenue System, per your Packages tab. The mix above assumes that upsell path succeeded —
                it's a target the packages are built to support, not a guarantee. One niche, mastered to your
                first 3–5 clients, comes before a second niche. Widen only once your first lane is consistently converting.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
