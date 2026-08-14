// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
import { useState } from "react";

const COUNTRIES = [
  {
    flag: "🇺🇸", name: "United States", tagline: "The Biggest Prize",
    smbs: "33M+ SMBs", currency: "USD — $75–200/hr freelance rates",
    highlight: "Highest rates + largest SMB pool on Earth. Every major city has hundreds of businesses needing your exact stack.",
    reasons: [
      "Highest freelance rates globally — $75–200/hr is completely normal",
      "Massive no-code movement — Lovable's largest community is here",
      "Every city has hundreds of businesses needing CRM, websites, and automation",
      "Huge appetite for email marketing (Go High Level) and workflow automation",
    ],
    niches: ["Garage Door Repair", "Tree Services", "Water Damage Restoration", "Junk Removal"],
    platforms: ["Google Maps", "Yelp", "LinkedIn", "Alignable"],
    color: "#3B82F6",
  },
  {
    flag: "🇬🇧", name: "United Kingdom", tagline: "Cultural Bridge",
    smbs: "5.5M+ SMBs", currency: "GBP (£) — strong against NGN",
    highlight: "Post-Brexit repositioning + Nigerian diaspora creates warm intro pathways unlike any other market.",
    reasons: [
      "Post-Brexit digital repositioning creates urgent demand for new systems",
      "Nigerian diaspora creates cultural bridges and real referral networks",
      "GDPR compliance pushes businesses to build proper digital infrastructure",
      "London, Manchester, Birmingham — dense, hungry SMB clusters",
    ],
    niches: ["Roofing & Guttering", "Drainage & Septic", "Pest Control", "Driveway & Paving"],
    platforms: ["Google Maps", "Companies House (free DB!)", "LinkedIn", "Checkatrade"],
    color: "#DC2626",
  },
  {
    flag: "🇨🇦", name: "Canada", tagline: "The Loyal Client Market",
    smbs: "1.2M+ SMBs", currency: "CAD — less competitive than USA",
    highlight: "Famously loyal long-term clients + government grants actively funding SMB digitization.",
    reasons: [
      "Canadians are famously loyal — low churn once you earn their trust",
      "Federal government actively funds SMB digital transformation grants",
      "Very open to offshore talent with zero stigma attached",
      "Less competitive than USA for international freelancers right now",
    ],
    niches: ["Snow & Ice Removal", "Tree Services", "Junk Removal", "Chimney & Fireplace"],
    platforms: ["Google Maps", "LinkedIn", "Clutch.co"],
    color: "#EA580C",
  },
  {
    flag: "🇦🇺", name: "Australia", tagline: "The Hidden Goldmine",
    smbs: "2.4M+ SMBs", currency: "AUD — high per-project budgets",
    highlight: "Australian SMBs are notoriously behind on digital adoption. The gap is huge and the competition for international freelancers is low.",
    reasons: [
      "Australian SMBs are NOTORIOUSLY behind on digital tools — massive gap to fill",
      "Government ASBFEO grants exist for SMB tech adoption",
      "High spending per business, generous project budgets",
      "Far less competition from international freelancers than US/UK",
    ],
    niches: ["Pest Control", "Pressure Washing", "Septic & Plumbing", "Garage Doors"],
    platforms: ["Google Maps", "TrueLocal", "LinkedIn", "Yellow Pages AU"],
    color: "#D97706",
  },
  {
    flag: "🇩🇪", name: "Germany", tagline: "The Mittelstand Giant",
    smbs: "3.5M+ SMBs", currency: "EUR (€) — highest EU contract values",
    highlight: "Germany's 3.5M 'Mittelstand' SMBs are one of the world's strongest business cultures. Digital transformation is national policy.",
    reasons: [
      "Germany's 'Mittelstand' SMB sector is one of the world's strongest",
      "Digital transformation is Federal Government agenda — subsidies available",
      "Highest average contract values across all of Europe",
      "Most SMB decision-makers speak English fluently",
    ],
    niches: ["Locksmiths", "Heating & Sanitär", "Roofing", "Damage Restoration"],
    platforms: ["Google Maps", "XING (Germany's LinkedIn)", "LinkedIn"],
    color: "#CA8A04",
  },
  {
    flag: "🇳🇱", name: "Netherlands", tagline: "Europe's English-First Market",
    smbs: "1.9M+ SMBs", currency: "EUR (€) — tech-forward spending",
    highlight: "95%+ English proficiency among business owners. Zero language barrier + highest startup density in Europe.",
    reasons: [
      "95%+ of Dutch business owners speak fluent English — zero language barrier",
      "One of Europe's highest startup densities — constant demand for digital tools",
      "Extremely tech-forward culture, early adopters of no-code platforms",
      "Amsterdam, Rotterdam, Utrecht packed with digitally hungry SMBs",
    ],
    niches: ["Window Cleaning", "Moving Companies", "Pest Control", "Paving"],
    platforms: ["Google Maps", "LinkedIn", "KVK Business Registry (free!)"],
    color: "#EA580C",
  },
  {
    flag: "🇦🇪", name: "United Arab Emirates", tagline: "The High-Spend Hub",
    smbs: "557K+ SMBs", currency: "AED — highest spend-per-client",
    highlight: "English is the business language. Aggressive government-backed digitalization + highest client budgets on this list.",
    reasons: [
      "English is the de facto language of business — no barrier whatsoever",
      "Post-COVID aggressive digitalization backed by government mandate",
      "Highest spend-per-client of any market on this list",
      "African-Middle East connection gives you a unique positioning edge",
    ],
    niches: ["AC & HVAC Servicing", "Movers & Storage", "Pest Control", "Deep Cleaning"],
    platforms: ["Google Maps", "LinkedIn", "Dubizzle", "Bayut"],
    color: "#059669",
  },
];

// TIER 1 — the "boring goldmine". Map-reliant, high-ticket, emergency-driven local
// services with weak reputations and almost no agency competition. Every entry sells
// the SAME first product: the Google Review Automation System.
const BUSINESSES = [
  {
    id: 1, icon: "🚪", name: "Garage Door Repair", deal: "$297–497/mo",
    pain: "Emergency-driven, 100% map-reliant. Under 50 reviews, owner never replies, and the top competitor has 400+ reviews eating every 'garage door repair near me' search.",
    product: "Google Review Automation System (GHL Reputation workflow: job completed → 2h wait → SMS check-in → 2h wait → review link).",
    pitch: '"You\'re at 38 reviews. The shop three miles from you is at 412 — so Google and ChatGPT both hand them the call before your phone ever rings. I install a system that asks every customer for a review automatically after every job."',
    find: "Google Maps: \"garage door repair [city]\", \"garage door opener installation [city]\"",
    tools: ["Go High Level", "Notion", "Lovable", "Make / Zapier / n8n"],
  },
  {
    id: 2, icon: "🌳", name: "Tree Services & Arborists", deal: "$297–497/mo",
    pain: "$1,500–8,000 tickets decided almost entirely by review count. Seasonal spikes, no CRM, reviews stale for months.",
    product: "Google Review Automation System — review velocity is the single lever that moves them into the 3-pack.",
    pitch: '"Storm season is when your whole year is made — and the crew with the freshest reviews takes the calls. Your last review was 4 months ago. I fix that permanently."',
    find: "Google Maps: \"tree removal [city]\", \"tree service [city]\", \"stump grinding [city]\"",
    tools: ["Go High Level", "Notion", "Lovable", "Make / Zapier / n8n"],
  },
  {
    id: 3, icon: "🚛", name: "Junk Removal & Hauling", deal: "$297–397/mo",
    pain: "Fragmented, owner-operated, competing against 1-800-GOT-JUNK's review wall with 20 reviews and no replies.",
    product: "Google Review Automation System + review-response templates.",
    pitch: '"The franchise beating you has one advantage: reviews. Every job you finish is a review you never ask for. I automate the ask so it happens on every single job."',
    find: "Google Maps: \"junk removal [city]\", \"rubbish removal [city]\", \"hauling service [city]\"",
    tools: ["Go High Level", "Notion", "Lovable"],
  },
  {
    id: 4, icon: "🚽", name: "Septic Pumping & Portable Toilets", deal: "$297–497/mo",
    pain: "Zero digital presence, rural monopolies, urgent jobs. Almost no one in this niche has ever been pitched by an agency.",
    product: "Google Review Automation System.",
    pitch: '"When a tank backs up, nobody shops around — they call the top result with the most reviews. Right now that isn\'t you, and it\'s a one-system fix."',
    find: "Google Maps: \"septic pumping [city]\", \"septic tank service [city]\", \"portable toilet rental [city]\"",
    tools: ["Go High Level", "Notion"],
  },
  {
    id: 5, icon: "💧", name: "Water Damage & Mold Remediation", deal: "$397–497/mo",
    pain: "Insurance-funded $5,000–20,000 jobs, 24/7 emergency intent, and the win goes to whoever ranks with fresh social proof.",
    product: "Google Review Automation System (then speed-to-lead as the month-3 upsell).",
    pitch: '"A flooded basement at 2am is the highest-intent search there is. The homeowner picks from three names with review stars next to them. Let\'s make sure yours is one of them."',
    find: "Google Maps: \"water damage restoration [city]\", \"mold remediation [city]\", \"flood cleanup [city]\"",
    tools: ["Go High Level", "Notion", "Make / Zapier / n8n"],
  },
  {
    id: 6, icon: "🛣️", name: "Asphalt Sealing & Paving", deal: "$297–397/mo",
    pain: "Seasonal, driveway and lot work at $2,000–15,000 a job, decided by trust signals. Listings are usually half-empty with no photos.",
    product: "Google Review Automation System + photo-with-review prompts (job photos lift map ranking).",
    pitch: '"Homeowners spending $6,000 on a driveway read every review first. You have 14. Let\'s make every finished job add one — with a photo attached."',
    find: "Google Maps: \"driveway sealing [city]\", \"asphalt paving [city]\", \"parking lot striping [city]\"",
    tools: ["Go High Level", "Notion", "Lovable"],
  },
  {
    id: 7, icon: "🔥", name: "Chimney Sweeping & Fireplace Service", deal: "$297–397/mo",
    pain: "Safety-driven and seasonal. Tiny operators, listings with under 30 reviews, no owner replies at all.",
    product: "Google Review Automation System.",
    pitch: '"Safety work sells on trust. Every homeowner checks the reviews before letting someone on their roof — and yours stopped growing last winter."',
    find: "Google Maps: \"chimney sweep [city]\", \"chimney repair [city]\", \"fireplace installation [city]\"",
    tools: ["Go High Level", "Notion"],
  },
  {
    id: 8, icon: "🐜", name: "Pest & Wildlife Control", deal: "$297–497/mo",
    pain: "Recurring contracts, urgent calls, brutal map competition — and independents lose purely on review velocity.",
    product: "Google Review Automation System.",
    pitch: '"Every treatment you finish is a five-star review you never asked for. Over twelve months that gap is why the national brand outranks you."',
    find: "Google Maps: \"pest control [city]\", \"exterminator [city]\", \"wildlife removal [city]\"",
    tools: ["Go High Level", "Notion", "Make / Zapier / n8n"],
  },
  {
    id: 9, icon: "🪟", name: "Window Cleaning & Pressure Washing", deal: "$197–397/mo",
    pain: "Low barrier, owner-operated, entirely map- and word-of-mouth driven. Perfect first client — fast to close, easy to prove.",
    product: "Google Review Automation System.",
    pitch: '"You do 12 jobs a week and ask for maybe one review a month. Same work, automated ask — that\'s 40+ new reviews a year and the top of the map pack."',
    find: "Google Maps: \"window cleaning [city]\", \"pressure washing [city]\", \"soft wash [city]\"",
    tools: ["Go High Level", "Notion"],
  },
  {
    id: 10, icon: "🔒", name: "Locksmiths & Security Installers", deal: "$297–397/mo",
    pain: "Pure emergency intent, spam-heavy category — genuine local operators desperately need verified social proof to stand out.",
    product: "Google Review Automation System.",
    pitch: '"Your category is full of fake listings. Real, recent, verified reviews are the only way customers can tell you\'re the legitimate local one."',
    find: "Google Maps: \"locksmith [city]\", \"emergency locksmith [city]\", \"security camera installation [city]\"",
    tools: ["Go High Level", "Notion"],
  },
  {
    id: 11, icon: "❄️", name: "HVAC, Plumbing & Electrical (Independents Only)", deal: "$397–497/mo",
    pain: "Highest ticket values in the trades, but PE-backed brands buy every ad slot. Independents win only through review velocity and local proximity.",
    product: "Google Review Automation System, then speed-to-lead in month 3.",
    pitch: '"You can\'t outbid the private-equity shop on Google Ads. You can out-review them — and reviews are free, permanent, and compound every month."',
    find: "Google Maps: \"HVAC repair [city]\", \"emergency plumber [city]\", \"electrician [city]\" — skip anything with 5+ locations",
    tools: ["Go High Level", "Notion", "Make / Zapier / n8n"],
  },
  {
    id: 12, icon: "🚚", name: "Moving Companies & Storage", deal: "$297–497/mo",
    pain: "High-anxiety purchase, decided almost entirely on reviews. Independents sit at 40–80 reviews against 1,000-review national brands.",
    product: "Google Review Automation System.",
    pitch: '"Nobody hands their whole house to a company with 41 reviews when the alternative has 900. Closing that gap is the entire job — and it takes one system."',
    find: "Google Maps: \"movers [city]\", \"moving company [city]\", \"storage units [city]\"",
    tools: ["Go High Level", "Notion", "Lovable"],
  },
];


/* ── Tier 1 alternatives — the wider boring-goldmine list ── */
const T1 = (id, icon, name, deal, pain, product, pitch, find) => ({
  id, icon, name, deal, pain, product, pitch, find,
  tools: ["Go High Level", "Notion", "Make / Zapier / n8n"],
});
const TIER1_EXTRA = [
  T1(13, "🔧", "Mobile Diesel Mechanics", "$297–497/mo", "Fleet and owner-operator work worth thousands per call, decided on Google in a breakdown emergency. Listings are thin and reviews are rare.", "Google Review Automation System.", '"A truck down is money burning by the hour. Whoever has the reviews gets that call — and right now that is not you."', 'Google Maps: "mobile diesel mechanic [city]", "truck repair [city]"'),
  T1(14, "🍳", "Commercial Grease Trap Cleaning", "$297–497/mo", "Compliance-driven recurring contracts with restaurants. Almost zero agency competition and virtually no review activity.", "Google Review Automation System.", '"Every restaurant manager googles this once and signs a contract for years. The top three listings take almost all of it."', 'Google Maps: "grease trap cleaning [city]", "grease trap service [city]"'),
  T1(15, "🏚️", "Foundation & Crawlspace Repair", "$397–497/mo", "$8,000–40,000 tickets on a fear purchase. Homeowners read every review before letting anyone near the structure.", "Google Review Automation System, then speed-to-lead.", '"Nobody spends $20,000 on a foundation from a company with 19 reviews. Closing that gap is the whole job."', 'Google Maps: "foundation repair [city]", "crawlspace repair [city]"'),
  T1(16, "✨", "Luxury Garage Epoxy", "$297–497/mo", "$4,000–12,000 aesthetic upgrades sold on photos and proof. Most operators never ask for a review or a photo.", "Google Review Automation System with photo-attached review prompts.", '"Your work is beautiful and completely invisible online. Every finished floor should be a reviewed, photographed proof."', 'Google Maps: "garage floor epoxy [city]", "epoxy flooring [city]"'),
  T1(17, "🏠", "Gutter Guard & Gutter Cleaning", "$197–397/mo", "Seasonal, repeatable, entirely map-driven. Small crews with stale listings and no follow-up.", "Google Review Automation System.", '"You finish eight jobs a week and ask for nothing. Automated, that is 300+ reviews over three years."', 'Google Maps: "gutter cleaning [city]", "gutter guard installation [city]"'),
  T1(18, "🧹", "Commercial Office Cleaning", "$297–497/mo", "Recurring monthly contracts. Decision makers shortlist from the map and check reviews before requesting a quote.", "Google Review Automation System + review-response templates.", '"Office managers pick from three names with stars beside them. Reviews are the entire shortlist."', 'Google Maps: "commercial cleaning [city]", "office cleaning services [city]"'),
  T1(19, "🗑️", "Dumpster Rental", "$297–397/mo", "Contractor and homeowner demand, urgent and price-checked on the map. Reviews decide who gets the call.", "Google Review Automation System.", '"Same-day rentals go to whoever looks safest on the map. That is a review count, not a price."', 'Google Maps: "dumpster rental [city]", "roll off dumpster [city]"'),
  T1(20, "🍽️", "Restaurant Hood Cleaning", "$297–497/mo", "Fire-code compliance means guaranteed recurring work. Operators are technicians, not marketers.", "Google Review Automation System.", '"Every kitchen in this city needs you twice a year. They just cannot find you above the two shops with reviews."', 'Google Maps: "hood cleaning [city]", "kitchen exhaust cleaning [city]"'),
  T1(21, "🚰", "Water Well Drilling & Pumps", "$397–497/mo", "Rural monopolies, $5,000–20,000 jobs, emergency pump failures. Digital presence is often a single unclaimed listing.", "Google Review Automation System.", '"When a pump fails there is no shopping around — they call the first credible name. Let us make that yours."', 'Google Maps: "well drilling [city]", "well pump repair [city]"'),
  T1(22, "📄", "Document Shredding", "$297–397/mo", "Compliance-driven B2B contracts with law, medical and finance offices. Nearly no review activity in the category.", "Google Review Automation System.", '"Your buyers are compliance officers. Reviews are how they justify choosing you to their partner."', 'Google Maps: "document shredding [city]", "paper shredding service [city]"'),
  T1(23, "📦", "Pallet Recycling & Supply", "$297–397/mo", "Steady industrial demand, thin competition, buyers who search once and stay for years.", "Google Review Automation System.", '"One warehouse contract pays for this system for a decade. It starts with being the visible option."', 'Google Maps: "pallet supplier [city]", "pallet recycling [city]"'),
  T1(24, "🪵", "Stump Grinding", "$197–397/mo", "Fast, repeatable jobs adjacent to tree work. Owner-operators with almost no online follow-up.", "Google Review Automation System.", '"Every stump is a five-star review you never asked for. Automated, that is your map ranking."', 'Google Maps: "stump grinding [city]", "stump removal [city]"'),
  T1(25, "🛻", "Towing & Roadside Assistance", "$297–497/mo", "Pure emergency intent, brutal spam competition. Verified recent reviews are the only trust signal.", "Google Review Automation System.", '"Stranded drivers pick the top result with real reviews. Nothing else is even read."', 'Google Maps: "towing [city]", "roadside assistance [city]"'),
  T1(26, "🚿", "Emergency Plumbing & Drain Snaking", "$397–497/mo", "24/7 high-intent searches and PE-backed competitors buying every ad. Independents win on review velocity only.", "Google Review Automation System, then speed-to-lead.", '"You cannot outbid them on ads. You can out-review them, and reviews never expire."', 'Google Maps: "emergency plumber [city]", "drain cleaning [city]" — skip 5+ location brands'),
  T1(27, "🪟", "Window Screen Repair", "$197–297/mo", "Tiny, overlooked category with steady seasonal demand and virtually no digital competition at all.", "Google Review Automation System.", '"You are one of three people in this city doing this. Reviews make you the obvious one."', 'Google Maps: "window screen repair [city]", "screen replacement [city]"'),
  T1(28, "🏗️", "Forklift Repair & Rental", "$297–497/mo", "Industrial B2B contracts, urgent downtime calls, and listings that look abandoned.", "Google Review Automation System.", '"A dead forklift stops a warehouse. That search goes to whoever looks most reliable on the map."', 'Google Maps: "forklift repair [city]", "forklift rental [city]"'),
  T1(29, "☢️", "Radon Mitigation", "$297–497/mo", "Health-and-safety purchase tied to home sales. Buyers are anxious and read every single review.", "Google Review Automation System.", '"This is a safety decision made in a week-long window. Reviews are the whole decision."', 'Google Maps: "radon mitigation [city]", "radon testing [city]"'),
  T1(30, "🐾", "Pet Cremation & Aftercare", "$297–397/mo", "Deeply emotional, trust-led purchase. Families choose almost entirely on how the reviews read.", "Google Review Automation System with a gentle, timing-sensitive ask.", '"Families choose you on tone and trust. Real reviews from real families are the only way they can see that."', 'Google Maps: "pet cremation [city]", "pet aftercare [city]"'),
  T1(31, "🏎️", "Specialty Auto Repair", "$297–497/mo", "European, performance and classic specialists with loyal customers who never leave reviews.", "Google Review Automation System.", '"Your customers love you and say nothing publicly. That silence is your ranking problem."', 'Google Maps: "european auto repair [city]", "transmission specialist [city]"'),
  T1(32, "⛵", "Boat & Marine Repair", "$297–497/mo", "Seasonal, high-ticket, and concentrated around a handful of marinas. Reviews decide the season.", "Google Review Automation System.", '"Your entire year is decided in a three-month window. Fresh reviews going into season is the lever."', 'Google Maps: "boat repair [city]", "marine mechanic [city]"'),
  T1(33, "🔌", "Appliance Repair", "$197–397/mo", "High call volume, low ticket, fiercely map-dependent. Independents sit far behind franchise review walls.", "Google Review Automation System.", '"You do six calls a day. Six review requests a day changes your map position in one quarter."', 'Google Maps: "appliance repair [city]", "refrigerator repair [city]"'),
  T1(34, "🔎", "Home Inspectors", "$297–497/mo", "Referral- and map-driven, tied to every property sale. Reviews are what agents check before recommending.", "Google Review Automation System + agent-referral review prompts.", '"Agents recommend whoever they can defend to a client. Reviews are that defence."', 'Google Maps: "home inspector [city]", "home inspection [city]"'),
];

/* ── Previously excluded, kept for reference: saturated categories ── */
const HC = (id, icon, name, deal, pain, find) => ({
  id, icon, name, deal, pain, find, competitive: true,
  product: "Google Review Automation System — same product, far harder sale.",
  pitch: '"Only pitch this category once you already have proof and referrals. Cold, you are the fifth agency to message them this week."',
  tools: ["Go High Level", "Notion"],
});
const HIGH_COMPETITION = [
  HC(101, "🦷", "Dentists & Orthodontists", "$497–997/mo", "High ticket and high value, but pitched by an agency almost daily. Gatekeepers block cold outreach and most already run a review tool.", 'Google Maps: "dentist [city]", "orthodontist [city]"'),
  HC(102, "💇", "Hair Salons & Barbershops", "$197–397/mo", "Very low ticket, very high agency saturation, owners behind the chair all day and rarely reachable.", 'Google Maps: "hair salon [city]", "barbershop [city]"'),
  HC(103, "🍽️", "Restaurants & Cafés", "$197–397/mo", "Thin margins, constant vendor pitches, and reviews already driven by delivery platforms rather than by you.", 'Google Maps: "restaurant [city]", "cafe [city]"'),
  HC(104, "🎯", "Coaches & Consultants", "$297–997/mo", "They sell marketing themselves, so they argue with your pitch and often build it in-house.", 'LinkedIn and Instagram rather than Google Maps'),
  HC(105, "🏋️", "Gyms & Fitness Studios", "$297–497/mo", "Saturated with agency offers, heavy churn, and owners who already run their own ads.", 'Google Maps: "gym [city]", "fitness studio [city]"'),
  HC(106, "🏡", "Real Estate Agents", "$297–497/mo", "Individually tiny budgets, brokerage-level tooling already in place, and relentless vendor noise.", 'Google Maps: "real estate agent [city]"'),
  HC(107, "⚖️", "Law Firms", "$497–1,500/mo", "Excellent ticket size, but the most agency-saturated local category there is, with long procurement and compliance review.", 'Google Maps: "personal injury lawyer [city]", "family lawyer [city]"'),
  HC(108, "💉", "Med Spas & Aesthetic Clinics", "$497–997/mo", "Strong budgets, but almost every clinic is already under contract with a specialist marketing agency.", 'Google Maps: "med spa [city]", "botox clinic [city]"'),
  HC(109, "🦴", "Chiropractors", "$297–497/mo", "Long-standing target of local marketing agencies; most have been burned once and are defensive.", 'Google Maps: "chiropractor [city]"'),
  HC(110, "🏠", "Roofing Contractors", "$497–997/mo", "Huge tickets, but storm-chaser marketers have saturated the category and driven acquisition costs up hard.", 'Google Maps: "roofing contractor [city]"'),
  HC(111, "🌿", "Landscaping & Lawn Care", "$197–397/mo", "Extremely crowded, heavily seasonal, and price-shopped by homeowners at the bottom end.", 'Google Maps: "landscaping [city]", "lawn care [city]"'),
  HC(112, "🚗", "Auto Detailing", "$197–297/mo", "Low ticket, high churn, and a constant stream of competing agency and software offers.", 'Google Maps: "auto detailing [city]", "mobile car wash [city]"'),
];

const ALL_BUSINESSES = [...BUSINESSES, ...TIER1_EXTRA, ...HIGH_COMPETITION];


function Block({ label, color, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#6E6459", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export function GlobalParts({ tab }) {
  const [openCountry, setOpenCountry] = useState(null);
  const [openBiz, setOpenBiz] = useState(null);


  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201A16" }}>

      {/* PAGE CONTENT */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "22px 14px 56px" }}>

        {/* ─────────────── COUNTRIES TAB ─────────────── */}
        {tab === "countries" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#1A140F" }}>Top 7 Target Countries</h2>
              <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: 0 }}>Tap a country to expand — reasons, best niches, and where to find leads.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COUNTRIES.map((c, i) => (
                <div key={c.name}
                  onClick={() => setOpenCountry(openCountry === i ? null : i)}
                  style={{ background: openCountry === i ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${openCountry === i ? c.color + "55" : "#D9CFBB"}`, borderRadius: 12, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}>

                  <div style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
                    <span style={{ fontSize: 30 }}>{c.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#1A140F" }}>{c.name}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: c.color, background: c.color + "18", border: `1px solid ${c.color}35`, borderRadius: 20, padding: "2px 9px", whiteSpace: "nowrap" }}>{c.tagline}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#6E6459", marginTop: 3 }}>{c.smbs} &nbsp;·&nbsp; {c.currency}</div>
                    </div>
                    <span style={{ color: "#8A7C6D", fontSize: 20, display: "inline-block", transform: openCountry === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {openCountry === i && (
                    <div style={{ padding: "4px 16px 18px", borderTop: "1px solid #D9CFBB" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.color, textTransform: "", letterSpacing: "0.08em", marginTop: 14, marginBottom: 5 }}>⚡ Why This Market</div>
                      <p style={{ fontSize: 13, color: "#6E6459", margin: "0 0 14px", lineHeight: 1.6 }}>{c.highlight}</p>

                      <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "", letterSpacing: "0.08em", marginBottom: 8 }}>Specific Reasons</div>
                      <div style={{ marginBottom: 16 }}>
                        {c.reasons.map((r, j) => (
                          <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                            <span style={{ color: c.color, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                            <span style={{ fontSize: 13, color: "#6E6459", lineHeight: 1.55 }}>{r}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "#F8F5EE", borderRadius: 8, padding: "12px 13px", border: "1px solid #D9CFBB" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "", letterSpacing: "0.07em", marginBottom: 8 }}>Best Niches</div>
                          {c.niches.map((n, j) => (
                            <div key={j} style={{ fontSize: 12, color: "#6E6459", marginBottom: 5, display: "flex", gap: 6 }}>
                              <span style={{ color: "#10B981" }}>•</span> {n}
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "#F8F5EE", borderRadius: 8, padding: "12px 13px", border: "1px solid #D9CFBB" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "", letterSpacing: "0.07em", marginBottom: 8 }}>Find Leads On</div>
                          {c.platforms.map((p, j) => (
                            <div key={j} style={{ fontSize: 12, color: "#6E6459", marginBottom: 5, display: "flex", gap: 6 }}>
                              <span style={{ color: "#F59E0B" }}>→</span> {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────── BUSINESSES TAB ─────────────── */}
        {tab === "businesses" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#1A140F" }}>Tier 1 — The Boring Goldmine</h2>
              <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: 0 }}>Map-reliant, emergency-driven trades with high tickets, weak reputations and almost no agency competition — start here. Tier 2, the saturated categories every other agency already pitches, is listed further down so you know exactly what you're choosing against if you go there. Tap one for the pain, the single product you sell, the pitch and how to find them.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {ALL_BUSINESSES.map((b, i) => {
                const prev = ALL_BUSINESSES[i - 1];
                const isTier2Start = !!b.competitive && !prev?.competitive;
                return (
                <div key={b.id}>
                  {isTier2Start && (
                    <div style={{ margin: "18px 0 11px" }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#1A140F" }}>Tier 2 — Highly Competitive Market</h2>
                      <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: 0 }}>Real budgets, real deal sizes — but pitched by an agency almost daily. Only work this tier once you already have proof, referrals, or a warm-enough intro that you aren't the fifth cold message this week.</p>
                    </div>
                  )}
                  <div
                    onClick={() => setOpenBiz(openBiz === i ? null : i)}
                    style={{ background: openBiz === i ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${openBiz === i ? "#6366F1" : "#D9CFBB"}`, borderRadius: 12, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}>

                    <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: "#EDE7DA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1A140F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: b.competitive ? "#8A7C6D" : "#0D7A5F", fontWeight: 600 }}>Avg deal: {b.deal}</span>
                          {b.competitive && (
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: "#8B0000", background: "#8B000012", border: "1px solid #8B000030", borderRadius: 5, padding: "1px 6px", letterSpacing: "0.03em" }}>Tier 2 · Highly Competitive Market</span>
                          )}
                        </div>
                      </div>
                      <span style={{ color: "#8A7C6D", fontSize: 20, display: "inline-block", transform: openBiz === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                    </div>

                    {openBiz === i && (
                      <div style={{ padding: "4px 15px 18px", borderTop: "1px solid #D9CFBB" }}>
                        <Block label="🔥 Their Pain Point" color="#EF4444">{b.pain}</Block>
                        <Block label="🛠️ Your Product to Build" color="#6366F1">{b.product}</Block>
                        <Block label="🎤 Pitch Script" color="#10B981">
                          <em style={{ color: "#6EE7B7" }}>{b.pitch}</em>
                        </Block>
                        <Block label="📍 How to Find Them" color="#F59E0B">{b.find}</Block>
                        <div style={{ marginTop: 14 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "", letterSpacing: "0.08em", marginBottom: 7 }}>Your Stack for This</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {b.tools.map(t => (
                              <span key={t} style={{ fontSize: 11.5, background: "#EDE7DA", border: "1px solid #1E2E46", borderRadius: 6, padding: "3px 9px", color: "#6E6459" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

