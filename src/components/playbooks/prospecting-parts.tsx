// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
import { useState } from "react";

/* ─── DATA ──────────────────────────────────────────────── */

const SEARCHES = [
  {
    niche: "Garage Door Repair", icon: "🚪",
    us: ["garage door repair", "garage door opener installation", "garage door spring repair", "overhead door company"],
    uk: ["garage door repair", "garage door installation", "roller shutter repair", "electric garage doors"],
    au: ["garage door repair", "garage door service", "roller door repair", "garage door motor"],
    ca: ["garage door repair", "garage door installation", "overhead door service"],
    signals: ["Under 50 total Google reviews", "No owner replies under any review", "Most recent review older than 4 weeks", "Independently owned, one or two vans", "Top competitor in the map pack has 5× their review count"],
    skip: ["Precision Door, Overhead Door and other national franchise locations", "Anything with 300+ reviews and regular owner replies"],
    tip: "Emergency intent + high ticket + almost zero agency competition. This is the single best beginner niche in the entire system.",
  },
  {
    niche: "Tree Services & Arborists", icon: "🌳",
    us: ["tree removal", "tree service", "stump grinding", "arborist", "emergency tree removal"],
    uk: ["tree surgeon", "tree removal", "stump grinding", "arborist"],
    au: ["tree lopping", "tree removal", "arborist", "stump grinding"],
    ca: ["tree removal", "tree service", "arborist", "stump grinding"],
    signals: ["Under 50 reviews with $1,500–8,000 average tickets", "Zero owner responses to existing reviews", "No new review in the last month", "Listing has fewer than 10 photos"],
    skip: ["Regional chains running multiple crews with a marketing manager"],
    tip: "Pitch just before storm season. Review velocity decides who takes the emergency calls when the wind hits.",
  },
  {
    niche: "Junk Removal & Hauling", icon: "🚛",
    us: ["junk removal", "hauling service", "furniture removal", "dumpster rental"],
    uk: ["rubbish removal", "house clearance", "waste clearance", "skip hire"],
    au: ["rubbish removal", "junk removal", "skip bin hire", "house clearance"],
    ca: ["junk removal", "waste removal", "bin rental", "hauling"],
    signals: ["Independent operator competing with 1-800-GOT-JUNK", "Under 40 reviews", "No owner replies", "Phone-only booking"],
    skip: ["1-800-GOT-JUNK, College Hunks and other franchise units"],
    tip: "Cheapest jobs to service and fastest to close — a great first paying client to build your case study on.",
  },
  {
    niche: "Septic, Drainage & Portable Toilets", icon: "🚽",
    us: ["septic pumping", "septic tank service", "grease trap cleaning", "portable toilet rental"],
    uk: ["drainage services", "septic tank emptying", "blocked drain specialist", "portable toilet hire"],
    au: ["septic tank pumping", "drain cleaning", "portable toilet hire"],
    ca: ["septic pumping", "septic service", "drain cleaning", "portable toilet rental"],
    signals: ["Rural or semi-rural monopoly with almost no digital presence", "Under 30 reviews", "No website or a single-page site from 2012", "Has literally never been pitched by an agency"],
    skip: ["Municipal contractors and council-run services"],
    tip: "Nobody markets to this niche. Your email is often the first agency email the owner has ever received.",
  },
  {
    niche: "Water Damage & Mold Remediation", icon: "💧",
    us: ["water damage restoration", "mold remediation", "flood cleanup", "fire damage restoration"],
    uk: ["water damage restoration", "damp and mould specialist", "flood restoration"],
    au: ["water damage restoration", "mould removal", "flood restoration"],
    ca: ["water damage restoration", "mold removal", "flood cleanup"],
    signals: ["Insurance-funded jobs at $5,000–20,000", "24/7 claim on the listing but slow response in reviews", "Under 60 reviews", "No owner replies"],
    skip: ["SERVPRO, Servicemaster and other franchise territories"],
    tip: "Highest ticket value in Tier 1. Lead with reviews, then upsell speed-to-lead in month 3 — a missed 2am call here is thousands lost.",
  },
  {
    niche: "Asphalt Sealing & Paving", icon: "🛣️",
    us: ["driveway sealing", "asphalt paving", "asphalt repair", "parking lot striping"],
    uk: ["driveway resurfacing", "tarmac driveways", "block paving", "car park surfacing"],
    au: ["driveway resurfacing", "asphalt paving", "concrete driveways"],
    ca: ["driveway sealing", "asphalt paving", "parking lot maintenance"],
    signals: ["Seasonal operator with under 40 reviews", "No job photos on the listing", "Reviews stale over the winter", "Independently owned"],
    skip: ["Commercial contractors bidding municipal work"],
    tip: "Ask for reviews with a photo of the finished driveway — photo reviews lift map ranking faster than text alone.",
  },
  {
    niche: "Chimney, Fireplace & Gutter Services", icon: "🔥",
    us: ["chimney sweep", "chimney repair", "fireplace installation", "gutter cleaning"],
    uk: ["chimney sweep", "chimney repair", "gutter cleaning", "log burner installation"],
    au: ["chimney sweep", "gutter cleaning", "gutter guard installation"],
    ca: ["chimney sweep", "chimney repair", "gutter cleaning", "eavestrough"],
    signals: ["Safety-driven service with under 30 reviews", "No owner replies at all", "Solo operator", "Seasonal review gaps of 5+ months"],
    skip: ["Multi-crew roofing companies with in-house marketing"],
    tip: "Trust is everything when someone climbs on a customer's roof. Reviews are the only trust signal they have.",
  },
  {
    niche: "Pest & Wildlife Control", icon: "🐜",
    us: ["pest control", "exterminator", "wildlife removal", "termite treatment", "bed bug treatment"],
    uk: ["pest control", "rodent control", "wasp nest removal", "bed bug treatment"],
    au: ["pest control", "termite inspection", "possum removal", "spider treatment"],
    ca: ["pest control", "exterminator", "wildlife removal", "rodent control"],
    signals: ["Recurring contract model — high lifetime value", "Under 60 reviews vs a national brand with 500+", "No review responses", "Single-location independent"],
    skip: ["Terminix, Rentokil, Orkin franchise branches"],
    tip: "Recurring contracts mean the client can easily justify $297–497/month. Their LTV per customer is measured in years.",
  },
  {
    niche: "Window Cleaning & Pressure Washing", icon: "🪟",
    us: ["window cleaning", "pressure washing", "soft wash", "roof cleaning", "gutter cleaning"],
    uk: ["window cleaning", "jet washing", "driveway cleaning", "render cleaning"],
    au: ["window cleaning", "pressure cleaning", "house washing", "solar panel cleaning"],
    ca: ["window cleaning", "pressure washing", "exterior cleaning"],
    signals: ["Owner-operator with high job frequency and low review count", "Under 40 reviews despite years in business", "Bookings by phone or Facebook only"],
    skip: ["Commercial facilities-management contractors"],
    tip: "12+ jobs a week and almost no review asks — the review-automation maths sells itself on the very first call.",
  },
  {
    niche: "Locksmiths & Security Installers", icon: "🔒",
    us: ["locksmith", "emergency locksmith", "car locksmith", "security camera installation"],
    uk: ["locksmith", "emergency locksmith", "uPVC door repair", "CCTV installation"],
    au: ["locksmith", "emergency locksmith", "security door installation", "CCTV installation"],
    ca: ["locksmith", "emergency locksmith", "security system installation"],
    signals: ["Genuine local operator surrounded by spam listings", "Verified address with under 50 reviews", "No owner replies", "Emergency service claim with no proof"],
    skip: ["Listings with no verified address (likely lead-gen spam)"],
    tip: "Real reviews are the only way a legitimate locksmith separates from the spam listings around them. Frame it exactly that way.",
  },
  {
    niche: "HVAC, Plumbing & Electrical — Independents Only", icon: "❄️",
    us: ["HVAC repair", "AC repair", "emergency plumber", "water heater installation", "electrician"],
    uk: ["boiler repair", "emergency plumber", "gas engineer", "electrician"],
    au: ["air conditioning repair", "emergency plumber", "hot water repair", "electrician"],
    ca: ["furnace repair", "HVAC service", "emergency plumber", "electrician"],
    signals: ["One or two locations only — never 5+", "Under 100 reviews against a PE-backed competitor with 1,000+", "Owner answers the phone personally", "No review responses"],
    skip: ["Any brand with 5+ locations or private-equity ownership — they have full marketing departments"],
    tip: "Do not try to beat the big shops on ads. Sell review velocity: it is the one lever an independent can still win with.",
  },
  {
    niche: "Moving Companies & Storage", icon: "🚚",
    us: ["movers", "moving company", "local movers", "storage units"],
    uk: ["removals company", "man and van", "house removals", "self storage"],
    au: ["removalists", "furniture removals", "self storage"],
    ca: ["movers", "moving company", "storage units"],
    signals: ["High-anxiety purchase with under 80 reviews", "National competitor holding 900+ reviews", "Negative reviews left unanswered", "Independent, family-run"],
    skip: ["Two Men and a Truck and other franchise units"],
    tip: "Unanswered negative reviews are your strongest opener here — offer the response system alongside the review requests.",
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
    <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "", letterSpacing: "0.08em", marginBottom: 7 }}>
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
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 14px" }}>Twelve Tier-1 "boring" niches — map-reliant, high-ticket, and almost never pitched. Tap one for country-specific searches, green-light signals, and red flags.</p>

            <div style={{ background: "#0A1020", border: "1px solid #6366F120", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#A5B4FC", marginBottom: 3 }}>How to run these searches</div>
                <p style={{ fontSize: 12, color: "#6E6459", margin: 0, lineHeight: 1.6 }}>
                  Open Google Maps → type the search term + city name, e.g. <em style={{ color: "#201A16" }}>"garage door repair Austin TX"</em> or <em style={{ color: "#201A16" }}>"tree surgeon Manchester"</em>.
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

