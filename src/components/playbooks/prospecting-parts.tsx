// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
import { useState } from "react";

/* ─── DATA ──────────────────────────────────────────────── */

const SEARCHES = [
  {
    niche: "Real Estate Agencies & Agents", icon: "🏠",
    us: ["real estate agent", "realtor", "real estate broker", "property management company", "buyers agent"],
    uk: ["estate agent", "letting agent", "property agent", "chartered surveyor", "property management"],
    au: ["real estate agent", "property agent", "buyers advocate", "property management"],
    ca: ["real estate agent", "realtor", "property management", "real estate broker"],
    signals: ["No website link in the Google listing", "Website exists but clearly outdated / not mobile", "Under 25 reviews total", "Single-agent or small team (not a chain)", "Reviews mention 'hard to contact' or 'no online booking'"],
    skip: ["RE/MAX, Keller Williams, Century 21 chain offices — corporate dictates their tech", "Agencies with slick modern sites and 200+ reviews"],
    tip: "Add a suburb or neighbourhood for density: \"estate agent Manchester Northern Quarter\" hits boutique agencies the big ones miss.",
  },
  {
    niche: "Business & Life Coaches", icon: "🎯",
    us: ["business coach", "life coach", "executive coach", "career coach", "leadership coach", "business consultant"],
    uk: ["business coach", "life coach", "executive coach", "business consultant", "management consultant"],
    au: ["business coach", "life coach", "executive coach", "career counsellor", "business consultant"],
    ca: ["business coach", "life coach", "business consultant", "career coach", "executive coach"],
    signals: ["Phone number only, no website or booking link", "Website is a basic Wix with no booking calendar", "Instagram-only presence", "Solo practitioner listing"],
    skip: ["Large coaching firms with multiple staff and a branded site"],
    tip: "\"Coach\" and \"consultant\" pull completely different results — run both separately in every city.",
  },
  {
    niche: "Dental & Medical Clinics", icon: "🦷",
    us: ["dentist", "dental clinic", "family dentist", "chiropractor", "optometrist", "private medical clinic", "urgent care"],
    uk: ["private dentist", "dental practice", "private clinic", "physiotherapy clinic", "osteopath", "optician"],
    au: ["dental clinic", "dentist", "medical centre", "physiotherapy", "chiropractic clinic", "optometrist"],
    ca: ["dentist", "dental clinic", "chiropractor", "physiotherapy clinic", "optometrist"],
    signals: ["No online booking button on listing or website", "Reviews say 'hard to get appointment'", "Solo practitioner or under 5 chairs / beds", "No patient intake form online"],
    skip: ["NHS GP surgeries (UK) — limited discretionary budget", "Large hospital-affiliated chains (Aspen Dental, Mydentist)"],
    tip: "\"Private\" + niche filters to fee-paying clinics with real budgets: \"private dentist [city]\".",
  },
  {
    niche: "Fitness Studios & Gyms", icon: "💪",
    us: ["gym", "fitness studio", "personal trainer", "yoga studio", "pilates studio", "crossfit gym", "boxing gym"],
    uk: ["gym", "fitness studio", "personal trainer", "yoga studio", "pilates", "boxing gym", "martial arts"],
    au: ["gym", "fitness studio", "personal trainer", "yoga", "pilates", "crossfit", "boxing gym"],
    ca: ["gym", "fitness centre", "personal trainer", "yoga studio", "pilates studio", "crossfit"],
    signals: ["No app or booking system mentioned", "Booking still by phone or walk-in only", "Instagram active but no website link", "Under 100 reviews, independently owned"],
    skip: ["PureGym, Planet Fitness, Anytime Fitness — franchise chains with central IT teams"],
    tip: "\"Personal trainer [city]\" is gold — solo trainers close fast and make great case studies for upselling salons and clinics.",
  },
  {
    niche: "Solo Law Firms & Solicitors", icon: "⚖️",
    us: ["attorney", "law firm", "lawyer", "legal services", "family lawyer", "immigration attorney", "personal injury lawyer"],
    uk: ["solicitor", "law firm", "barrister", "legal services", "family solicitor", "immigration solicitor"],
    au: ["solicitor", "law firm", "lawyer", "legal practitioner", "conveyancer"],
    ca: ["lawyer", "law firm", "attorney", "legal services", "barrister"],
    signals: ["Website looks like it was built pre-2015", "No online consultation booking", "No client portal", "1–5 people listed on the team page"],
    skip: ["Magic Circle / BigLaw / national chains — full internal IT and procurement processes"],
    tip: "Solo practitioners and boutique firms under 10 staff are the sweet spot. High-ticket, long relationships, and they desperately want to look bigger than they are.",
  },
  {
    niche: "Restaurants & Cafes", icon: "🍽️",
    us: ["restaurant", "cafe", "bistro", "catering company", "food truck", "bakery", "bar and grill"],
    uk: ["restaurant", "cafe", "bistro", "catering", "tearoom", "pub restaurant", "takeaway"],
    au: ["restaurant", "cafe", "bistro", "catering", "bakery", "coffee shop", "eatery"],
    ca: ["restaurant", "cafe", "bistro", "catering", "bakery", "diner", "food truck"],
    signals: ["Ordering only through Uber Eats / Just Eat — no own site", "No loyalty or email list", "50–500 reviews (established but no marketing team)", "Seasonal menus updated on Facebook only"],
    skip: ["Franchise chains (McDonald's, Nando's, Pizza Hut)", "Restaurant groups with multiple locations and a GM"],
    tip: "50–500 reviews is your sweet spot: busy enough to have budget, too small to have an agency on retainer.",
  },
  {
    niche: "Beauty, Spas & Aesthetic Clinics", icon: "💆",
    us: ["hair salon", "beauty salon", "nail salon", "day spa", "med spa", "barbershop", "aesthetic clinic", "lash studio"],
    uk: ["hair salon", "beauty salon", "nail bar", "day spa", "aesthetic clinic", "barbershop", "beauty therapist"],
    au: ["hair salon", "beauty salon", "nail salon", "day spa", "aesthetic clinic", "barber shop"],
    ca: ["hair salon", "beauty salon", "nail salon", "spa", "med spa", "barbershop"],
    signals: ["Booking by phone or walk-in only", "No loyalty / rewards programme", "Instagram active but website missing or basic", "Solo or 2–3 staff"],
    skip: ["Toni & Guy, Supercuts, Regis — salon franchise chains with central systems"],
    tip: "\"Med spa [city]\" is high-ticket gold — high-margin aesthetic treatments, almost always underdigitised, and owners have real budget.",
  },
  {
    niche: "Accountants & Financial Advisors", icon: "📊",
    us: ["accountant", "CPA", "bookkeeper", "tax preparer", "financial advisor", "tax consultant", "accounting firm"],
    uk: ["accountant", "chartered accountant", "bookkeeper", "tax advisor", "IFA", "financial planner"],
    au: ["accountant", "CPA", "bookkeeper", "tax agent", "financial advisor", "financial planner"],
    ca: ["accountant", "CPA", "bookkeeper", "tax consultant", "financial advisor"],
    signals: ["No client portal", "Outdated website, no online contact form", "Solo practitioner or under 5 staff", "No newsletter or email list"],
    skip: ["Big 4 and Top 10 accounting firms — full IT and procurement departments"],
    tip: "These clients tend to become long-term — one good relationship can run for years as a retainer.",
  },
  {
    niche: "Therapists & Counsellors", icon: "🧠",
    us: ["therapist", "psychologist", "counsellor", "mental health clinic", "psychotherapy", "marriage therapist", "LCSW"],
    uk: ["therapist", "counsellor", "psychologist", "psychotherapy", "CBT therapist"],
    au: ["psychologist", "therapist", "counsellor", "mental health clinic", "psychotherapy"],
    ca: ["therapist", "psychologist", "counsellor", "psychotherapy", "clinical social worker"],
    signals: ["Booking by phone or email only", "Outdated site with no online intake form", "Listed on Psychology Today but no personal site", "Solo practice"],
    skip: ["Large mental health clinics with admin and operations teams"],
    tip: "Most therapists have near-zero time for admin — always lead with \"I'll save you X hours a week\" over any feature.",
  },
  {
    niche: "Event Planners & Coordinators", icon: "🎊",
    us: ["event planner", "wedding planner", "event coordinator", "party planner", "event management"],
    uk: ["event planner", "wedding planner", "event coordinator", "event management company"],
    au: ["event planner", "wedding planner", "event coordinator", "event management"],
    ca: ["event planner", "wedding planner", "event coordinator", "party planner"],
    signals: ["Portfolio is only an Instagram page", "No professional website", "All enquiries via WhatsApp or DM", "Under 50 reviews"],
    skip: ["Large event companies with in-house design, social, and PM teams"],
    tip: "Wedding planners are especially strong — high per-event value, referral-driven, and always looking credible matters to them.",
  },
  {
    niche: "Contractors & Tradespeople", icon: "🔧",
    us: ["plumber", "electrician", "HVAC contractor", "roofer", "landscaper", "general contractor", "painter", "carpenter"],
    uk: ["plumber", "electrician", "builder", "roofer", "landscape gardener", "decorator", "gas engineer"],
    au: ["plumber", "electrician", "builder", "roofer", "landscaper", "plasterer", "painter"],
    ca: ["plumber", "electrician", "HVAC", "roofer", "contractor", "landscaper", "painter"],
    signals: ["No website at all — just a phone number", "Under 30 reviews, minimal listing photos", "Only reachable by call or WhatsApp", "Google listing largely incomplete"],
    skip: ["Large construction companies with dedicated PM and admin teams"],
    tip: "Tradespeople rarely check email — a short WhatsApp or LinkedIn voice note often outperforms cold email for this niche.",
  },
  {
    niche: "Boutiques & Independent Retail", icon: "🛒",
    us: ["boutique", "gift shop", "clothing store", "jewellery shop", "toy store", "home decor shop", "vintage shop"],
    uk: ["boutique", "gift shop", "clothing shop", "jeweller", "homeware shop", "deli", "antique shop"],
    au: ["boutique", "gift shop", "clothing store", "jewellery", "homeware store", "artisan shop"],
    ca: ["boutique", "gift shop", "clothing store", "jewellery shop", "home decor store"],
    signals: ["Physical shop but no e-commerce website", "Selling only on Etsy or Depop", "Instagram-only presence", "Under 50 reviews"],
    skip: ["Chain retail stores and shops clearly part of a larger brand"],
    tip: "Filter for listings that say \"family-owned\" or \"independent\" in the description — those are decision-makers you can reach directly.",
  },
];

const EMAIL_STEPS = [
  { n: "01", icon: "📍", color: "#6366F1", title: "Check the Google Listing Directly",
    body: "Many SMBs list their email right on their Google Business Profile under the 'About' tab or in the description. Always check here first — it's 5 seconds and gives you the most deliverable address with zero tool cost." },
  { n: "02", icon: "🌐", color: "#3B82F6", title: "Visit Their Website Contact or Footer",
    body: "If they have a site, go to /contact, /about-us, or the footer. 70% of the time the owner's direct email is right there. Takes 30 seconds. Always do this before touching a tool." },
  { n: "03", icon: "⚙️", color: "#10B981", title: "Bulk Scrape with Outscraper",
    body: "Your main workhorse. Outscraper.com pulls business name, phone, website, email, and address directly from Google Maps in bulk. Free tier: 50 rows/month. Paid: from ~$3 per 1,000 leads. Export CSV, import to Notion CRM.",
    url: "outscraper.com" },
  { n: "04", icon: "🔍", color: "#F59E0B", title: "Enrich Missing Emails with Apollo.io",
    body: "For leads where Outscraper found no email, paste their website domain into Apollo.io. It cross-references LinkedIn and 20+ data sources to find the decision-maker's direct address. Free: 50 verified emails/month.",
    url: "apollo.io" },
  { n: "05", icon: "🎯", color: "#EC4899", title: "Fall Back to Hunter.io",
    body: "If Apollo draws a blank, run the domain through Hunter.io. It surfaces all publicly associated emails for that domain with a confidence score. Only use addresses rated 80%+ confidence. Free: 25/month.",
    url: "hunter.io" },
  { n: "06", icon: "💼", color: "#8B5CF6", title: "Last Resort: LinkedIn DM",
    body: "Search the company name, find the Owner / Founder / Director, send a short connection request. Once connected, DM directly. Alternatively, reply to one of their posts — this bypasses the message-request filter entirely." },
];

const HOT_SIGNALS = [
  { pts: "+3", label: "No website link in Google listing", why: "They're invisible online — you ARE the solution" },
  { pts: "+2", label: "Website exists but is outdated or not mobile-friendly", why: "They know the problem exists but haven't fixed it" },
  { pts: "+2", label: "Under 25 Google reviews", why: "Low digital engagement = low digital sophistication" },
  { pts: "+2", label: "Independently owned, single location", why: "You'll be emailing the decision-maker directly" },
  { pts: "+2", label: "Reviews mention 'hard to book' or 'difficult to contact'", why: "Customers are screaming for a digital fix" },
  { pts: "+1", label: "Business age 3–10 years (visible on listing or site)", why: "Established enough to have budget, too busy to have fixed it" },
  { pts: "+1", label: "High-margin niche (dental, legal, med spa, real estate)", why: "ROI on your work is fast and obvious to justify" },
];

const COLD_SIGNALS = [
  { pts: "-3", label: "Part of a franchise chain", why: "Corporate controls their tech — skip immediately" },
  { pts: "-3", label: "Government or municipal entity", why: "Procurement cycles are months, not days" },
  { pts: "-2", label: "Already has a fast, modern, mobile website", why: "Likely already has someone managing this" },
  { pts: "-2", label: "200+ reviews with recent, regular responses", why: "They have a marketing team or active agency" },
  { pts: "-1", label: "No physical address (online-only)", why: "Harder to verify; lower trust baseline" },
];

const OFFER_PARTS = [
  { icon: "🌟", color: "#F59E0B", part: "Dream Outcome", q: "What does the client ultimately want?", a: "More customers, more revenue, less admin chaos — NOT 'a website'. Sell the outcome, not the deliverable." },
  { icon: "🎯", color: "#6366F1", part: "Perceived Likelihood", q: "Why should they believe YOU can deliver it?", a: "A demo built with their actual business name before you pitch. A short Loom walkthrough. A case study. Proof beats promises every time." },
  { icon: "⚡", color: "#10B981", part: "Time to Value", q: "How fast do they see results?", a: "A 14-day delivery deadline turns a 'maybe' into a 'yes'. State it upfront and mean it." },
  { icon: "🛋️", color: "#EC4899", part: "Effort & Sacrifice", q: "How little do THEY have to do?", a: "\"I need one hour of your time for onboarding. I handle everything else.\" Reduce their friction to near zero." },
];

const HOOKS = [
  { tier: "Starter Hook", headline: "\"Your Business Found Online — In 10 Days\"", target: "Tradespeople · Solo coaches · Small salons", bonus: "Free Google Business Profile audit included" },
  { tier: "Standard Hook", headline: "\"A Booking System That Fills Your Calendar Automatically\"", target: "Clinics · Gyms · Therapists · Accountants", bonus: "First 3 months of Go High Level email setup free" },
  { tier: "Premium Hook", headline: "\"Stop Paying Third Parties a Cut. Own Your Entire Sales System.\"", target: "Restaurants · Real estate agencies · E-commerce brands", bonus: "90-day check-in call + analytics report included" },
];

const LADDER = [
  { rung: 1, icon: "🌱", color: "#10B981", name: "Quick Win", price: "$300–600", yours: true,
    what: "Landing page, Google-optimised, contact form, mobile-first. Delivered in under 10 days.",
    upsell: "\"Now let's add CRM so you don't lose a single lead that comes through this page.\"" },
  { rung: 2, icon: "🌐", color: "#3B82F6", name: "Full Presence", price: "$800–1,500", yours: true,
    what: "Multi-page website + Notion CRM setup + Calendly booking integration.",
    upsell: "\"Now let's add email marketing so those visitors become repeat customers.\"" },
  { rung: 3, icon: "⚡", color: "#8B5CF6", name: "Custom System", price: "$2,000–4,000", yours: true,
    what: "Custom Lovable or Lovable app + Make.com automation + CRM + Go High Level email marketing.",
    upsell: "\"Let me stay on as your tech partner so this keeps performing and growing.\"" },
  { rung: 4, icon: "🔄", color: "#F59E0B", name: "Care Retainer", price: "$200–400/mo", yours: true,
    what: "Monthly updates, uptime monitoring, content changes, priority support.",
    upsell: "\"Want me to also run your email campaigns every month?\"" },
  { rung: 5, icon: "📈", color: "#EC4899", name: "Growth Retainer", price: "$400–800/mo", yours: true,
    what: "Go High Level campaigns designed and sent monthly + analytics report + CRM hygiene.",
    upsell: "\"Want me to bring in a specialist who can run paid ads that feed directly into this system?\"" },
  { rung: 6, icon: "📣", color: "#4B5563", name: "Paid Ads Management", price: "Refer out + fee", yours: false,
    what: "Partner with a trusted Google / Meta ads specialist. You earn a referral fee or revenue share. Stay as the relationship owner.",
    upsell: null },
  { rung: 7, icon: "🔎", color: "#4B5563", name: "Advanced SEO", price: "Refer out + fee", yours: false,
    what: "Content strategy, link-building, technical audits. Partner with an SEO specialist — don't attempt this solo while still learning CRM.",
    upsell: null },
];

const TOOLS = [
  { cat: "Lead Scraping", color: "#6366F1", items: [
    { name: "Outscraper", tier: "Free → ~$3/1K", url: "outscraper.com", desc: "Bulk Google Maps extraction — your primary lead source. Set search + city, export CSV." },
    { name: "PhantomBuster", tier: "Free trial", url: "phantombuster.com", desc: "LinkedIn + Google Maps automation for targeted niche/location scraping." },
  ]},
  { cat: "Email Finding", color: "#10B981", items: [
    { name: "Apollo.io", tier: "Free (50/mo)", url: "apollo.io", desc: "Email + LinkedIn enrichment from any domain name. Your first stop after scraping." },
    { name: "Hunter.io", tier: "Free (25/mo)", url: "hunter.io", desc: "Domain-to-email finder with confidence scores. Use for anything Apollo misses." },
    { name: "Snov.io", tier: "Free (50/mo)", url: "snov.io", desc: "Email finder + verifier backup. Useful third option if the other two draw blanks." },
  ]},
  { cat: "Cold Outreach", color: "#F59E0B", items: [
    { name: "Instantly.ai", tier: "From $37/mo", url: "instantly.ai", desc: "Cold email at scale with AI personalisation and unlimited sending accounts." },
    { name: "Lemlist", tier: "From $39/mo", url: "lemlist.com", desc: "Cold email + LinkedIn + personalised image thumbnails in each email." },
  ]},
  { cat: "Automation", color: "#3B82F6", items: [
    { name: "Make.com", tier: "Free (1K ops/mo)", url: "make.com", desc: "Connect everything: Outscraper → Apollo → Instantly → Notion. Your silent engine." },
  ]},
  { cat: "CRM & Nurture", color: "#EC4899", items: [
    { name: "Notion CRM", tier: "Free (3 users)", url: "notion.com/crm", desc: "Your lead pipeline — you already know this. Stages: Scraped → Contacted → Replied → Call → Proposal → Closed." },
    { name: "Go High Level", tier: "Free (<250 contacts)", url: "klaviyo.com", desc: "Nurture sequence for leads who don't reply. You already know this too — use it!" },
  ]},
  { cat: "Close & Deliver", color: "#14B8A6", items: [
    { name: "Calendly", tier: "Free", url: "calendly.com", desc: "Auto-schedule discovery calls from email replies. Embed in your cold email signature." },
    { name: "Loom", tier: "Free (5-min vids)", url: "loom.com", desc: "Record personalised 90-second video pitches and demo walkthroughs. Higher reply rates than text." },
    { name: "Payoneer", tier: "Transaction %", url: "payoneer.com", desc: "Receive international USD/GBP/EUR payments from clients. Better than PayPal for Nigeria." },
    { name: "Stripe", tier: "Transaction %", url: "stripe.com", desc: "Embed payment links in proposals. For clients who prefer card over bank transfer." },
  ]},
];

const MONTH1_COST = [
  { tool: "Outscraper (1,000 leads)", cost: "~$3" },
  { tool: "Apollo.io", cost: "$0" },
  { tool: "Hunter.io", cost: "$0" },
  { tool: "Make.com", cost: "$0" },
  { tool: "Notion CRM", cost: "$0" },
  { tool: "Go High Level", cost: "$0" },
  { tool: "Calendly", cost: "$0" },
  { tool: "Loom", cost: "$0" },
  { tool: "Instantly.ai (when you're ready)", cost: "$37/mo" },
];

/* ─── HELPERS ────────────────────────────────────────────── */

function Tag({ children, color, bg }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function SectionLabel({ color, children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
      {children}
    </div>
  );
}

function Row({ color, icon, children }) {
  return (
    <div style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "flex-start" }}>
      <span style={{ color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 12.5, color: "#6E6459", lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────── */

export function ProspectingParts({ tab }) {
  const [openNiche, setOpenNiche] = useState(0);
  const [openRung, setOpenRung] = useState(null);
  const [score, setScore] = useState({});

  const total = Object.entries(score).reduce((sum, [k, v]) => {
    if (!v) return sum;
    const pts = parseInt(k.split("|")[0]);
    return sum + pts;
  }, 0);

  const rating = total >= 7 ? { label: "🔥 HOT LEAD", color: "#10B981" }
    : total >= 4 ? { label: "⚡ WARM LEAD", color: "#F59E0B" }
    : { label: "❄️ COLD — SKIP", color: "#6B7280" };


  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201A16" }}>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 14px 60px" }}>

        {/* ────────── MAPS ────────── */}
        {tab === "maps" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", color: "#1A140F" }}>Exact Google Maps Search Terms</h2>
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 14px" }}>Tap a niche for country-specific searches, green-light signals, and red flags.</p>

            <div style={{ background: "#0A1020", border: "1px solid #6366F120", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#A5B4FC", marginBottom: 3 }}>How to run these searches</div>
                <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                  Open Google Maps → type the search term + city name, e.g. <em style={{ color: "#201A16" }}>"dentist Austin TX"</em> or <em style={{ color: "#201A16" }}>"estate agent Manchester"</em>.
                  For bulk scraping, paste the same string into <strong style={{ color: "#10B981" }}>Outscraper.com</strong> and it exports hundreds of leads as a CSV in minutes.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SEARCHES.map((s, i) => (
                <div key={s.niche} onClick={() => setOpenNiche(openNiche === i ? null : i)}
                  style={{ background: openNiche === i ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${openNiche === i ? "#6366F1" : "#D9CFBB"}`, borderRadius: 11, cursor: "pointer", overflow: "hidden" }}>
                  <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "#1A140F" }}>{s.niche}</span>
                    <span style={{ color: "#8A7C6D", fontSize: 19, display: "inline-block", transform: openNiche === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {openNiche === i && (
                    <div style={{ padding: "0 15px 16px", borderTop: "1px solid #D9CFBB" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                        {[["🇺🇸 USA", s.us], ["🇬🇧 UK", s.uk], ["🇦🇺 Australia", s.au], ["🇨🇦 Canada", s.ca]].map(([country, terms]) => (
                          <div key={country} style={{ background: "#F8F5EE", borderRadius: 8, padding: "10px 12px", border: "1px solid #D9CFBB" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#A5B4FC", marginBottom: 7 }}>{country}</div>
                            {terms.map((t, j) => (
                              <div key={j} style={{ fontSize: 11.5, color: "#6E6459", marginBottom: 4, display: "flex", gap: 4 }}>
                                <span style={{ color: "#6366F1" }}>"</span>{t}<span style={{ color: "#6366F1" }}>"</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 10, background: "#F8F5EE", borderRadius: 8, padding: "10px 12px", border: "1px solid #10B98120" }}>
                        <SectionLabel color="#10B981">✅ Green-Light Signals</SectionLabel>
                        {s.signals.map((sg, j) => <Row key={j} color="#10B981" icon="✓">{sg}</Row>)}
                      </div>

                      <div style={{ marginTop: 8, background: "#F8F5EE", borderRadius: 8, padding: "10px 12px", border: "1px solid #EF444420" }}>
                        <SectionLabel color="#EF4444">🚫 Skip These</SectionLabel>
                        {s.skip.map((sk, j) => <Row key={j} color="#EF4444" icon="✕">{sk}</Row>)}
                      </div>

                      <div style={{ marginTop: 8, background: "#F8F5EE", borderRadius: 8, padding: "10px 12px", border: "1px solid #F59E0B20" }}>
                        <SectionLabel color="#F59E0B">⚡ Pro Tip</SectionLabel>
                        <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.55 }}>{s.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────── EMAIL ────────── */}


      </div>
    </div>
  );
}

