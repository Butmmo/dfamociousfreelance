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

const PHASES = [
  {
    phase: "Phase 1", title: "Build Your Foundation", duration: "Week 1–2", color: "#6366F1", icon: "🏗️",
    steps: [
      "Pick 2 niches to start — recommended: Real Estate + Coaches (high deal value, clear pain)",
      "Pick 2 countries — recommended: USA + UK (English, highest rates, familiar tools)",
      "Build your portfolio site using Lovable or Lovable — use your own tools as proof",
      "Create 2–3 demo projects as case studies. Demos count. Clients want to see the work, not credentials.",
      "Record a Loom video walkthrough of each demo — this is your sales asset",
    ],
  },
  {
    phase: "Phase 2", title: "Data Harvest", duration: "Week 2–3", color: "#10B981", icon: "🔍",
    steps: [
      "Google Maps scraping → use Outscraper.com or PhantomBuster (both have free tiers)",
      "Target: businesses with no website, poor website, or no Google reviews",
      "Export: business name, email, phone, website → Google Sheets or Notion",
      "LinkedIn Sales Navigator (free trial) → filter: Owner/Founder + 1–50 employees + target country",
      "UK bonus: Companies House API — completely free public business database",
      "USA bonus: Yelp and Yellow Pages scraping via Outscraper adds thousands more leads",
    ],
  },
  {
    phase: "Phase 3", title: "Automated Outreach", duration: "Week 3–4", color: "#F59E0B", icon: "📧",
    steps: [
      "Apollo.io (free tier) → verify and enrich email addresses from your scraped data",
      "Instantly.ai or Lemlist → send cold email sequences using the PAS formula (see below)",
      "PhantomBuster or Expandi → LinkedIn DM automation for direct founder outreach",
      "Make.com master workflow: Outscraper → Apollo → Email tool → Notion CRM (fully automated)",
      "Calendly (free tier) → auto-schedule discovery calls directly from interested email replies",
    ],
  },
  {
    phase: "Phase 4", title: "CRM Pipeline Management", duration: "Ongoing", color: "#8B5CF6", icon: "⚙️",
    steps: [
      "Notion CRM — you already know this! Manage all leads in clear pipeline stages",
      "Stages: Scraped → Contacted → Replied → Discovery Call → Proposal Sent → Closed",
      "Go High Level nurture sequence → for leads who don't reply (value emails, case studies, tips)",
      "Make.com trigger: new lead auto-created in Notion + follow-up sequence fires automatically",
      "30-minute weekly review: move leads through stages, kill dead ones, test new subject lines",
    ],
  },
  {
    phase: "Phase 5", title: "Close & Build Recurring Revenue", duration: "Ongoing", color: "#EF4444", icon: "🏆",
    steps: [
      "Discovery call via Calendly → use SPIN selling: Situation, Problem, Implication, Need-Payoff",
      "Proposal template in Notion or Google Doc → always show 3 clear packages",
      "Stripe or Payoneer → collect 50% upfront, 50% on delivery. Non-negotiable.",
      "End of every project → pitch the monthly retainer. This is your income safety net.",
      "After first win → ask for exactly 2 referrals. Referrals compound faster than any ad spend.",
    ],
  },
];

const PACKAGES = [
  {
    name: "Starter", icon: "🌱", color: "#10B981", price: "$300–600",
    includes: ["Landing page or simple website", "Contact form + lead capture", "Basic on-page SEO setup", "Mobile responsive design"],
    bestFor: "Tradespeople, Solo professionals, Service providers",
  },
  {
    name: "Standard", icon: "⚡", color: "#6366F1", price: "$800–1,500",
    includes: ["Full multi-page website", "Notion CRM setup + pipeline", "Go High Level email automation", "Booking/calendar integration"],
    bestFor: "Coaches, Therapists, Accountants, Event Planners",
  },
  {
    name: "Premium", icon: "🚀", color: "#F59E0B", price: "$2,000–4,000",
    includes: ["Custom web app (Lovable)", "Full automation stack (Make.com/Zapier)", "CRM + email marketing", "Client portal or booking system"],
    bestFor: "Clinics, Law Firms, Real Estate, Restaurants",
  },
  {
    name: "Retainer", icon: "🔄", color: "#EC4899", price: "$200–500/mo",
    includes: ["Monthly maintenance & updates", "Marketing campaign management", "Monthly analytics report", "Priority support channel"],
    bestFor: "All clients post-delivery — your recurring monthly income",
  },
];

const INCOME_ROWS = [
  { label: "4 × Starter Packages", amount: "$2,000", color: "#10B981" },
  { label: "6 × Standard Packages", amount: "$7,200", color: "#6366F1" },
  { label: "2 × Premium Packages", amount: "$6,000", color: "#F59E0B" },
  { label: "4 × Retainers × 12 months", amount: "$14,400", color: "#EC4899" },
];

const SAY_DONT = [
  { dont: "I'll build it in Lovable / Base44.", say: "I'll engineer a custom system for your business." },
  { dont: "I use Cursor and Claude Code to write the code.", say: "I run an AI-accelerated engineering process most agencies haven't adopted yet." },
  { dont: "It's basically AI doing the work.", say: "AI helps me move faster — the architecture, integration, and judgment are mine." },
  { dont: "Anyone could learn to do this.", say: "Most people get 80% of the way there, then stall on the part that actually matters." },
  { dont: "I'm a freelancer / web developer.", say: "I'm a Digital Systems Engineer." },
];

const METHODOLOGY = [
  { step: "01", name: "Blueprint", duration: "1–2 days", icon: "📐", color: "#6366F1", desc: "Before any build starts, I map exactly what the business needs — data, workflows, integrations. This is the step AI tools skip and DIY builders miss entirely." },
  { step: "02", name: "Build", duration: "3–10 days", icon: "⚡", color: "#F59E0B", desc: "I run an AI-accelerated engineering process to move at a pace traditional agencies can't match — every output reviewed and refined, never auto-shipped." },
  { step: "03", name: "Bulletproof", duration: "2–5 days", icon: "🛡️", color: "#10B981", desc: "CRM, payments, and email tools connected. Tested across devices. Secured. You're trained on it. This is where most DIY AI projects quietly fall apart." },
];

const DIY_COMPARISON = [
  { factor: "Time to launch", diy: "40–80 hrs of trial, error, tutorials", you: "7–14 days, fully done for you" },
  { factor: "Data architecture", diy: "Generic, often breaks at scale", you: "Designed properly from day one" },
  { factor: "CRM / email / payments", diy: "Missing, or hacked together", you: "Fully integrated (Notion, Go High Level, Stripe)" },
  { factor: "Security & hosting", diy: "Overlooked until something breaks", you: "Handled, monitored, documented" },
  { factor: "Ongoing updates", diy: "You're on your own", you: "Retainer support included" },
  { factor: "Opportunity cost", diy: "2–3 weeks not spent on your business", you: "Zero — you stay focused on clients" },
];

const OBJECTION_SCRIPT = `"Honestly? You could start one yourself — I use these same kinds of tools to move fast. But here's what usually happens: most owners get to about 70–80% done, then hit the part that actually matters for a real business — connecting it to their CRM and email tools, securing customer data, integrating payments, making sure it works on every device, and maintaining it as things change. That's what I specialize in. Think of it like CAD software: anyone can open it, but you'd still hire an architect to design your building. I'm not selling you a tool — I'm selling you a finished system, and the support to keep it running."`;

const WEEKLY_PLAN = [
  {
    week: 1, title: "Foundation & Arsenal", color: "#6366F1", icon: "🏗️", range: "Days 1–7",
    days: [
      { d: "Day 1", focus: "Lock Your Focus", tasks: "Choose 2 launch countries (USA + UK recommended) and 2 niches (Real Estate + Coaches). Write your Blueprint → Build → Bulletproof pitch in your own words." },
      { d: "Day 2", focus: "Brand Setup", tasks: "Set up a professional email, update your LinkedIn headline to \"Digital Systems Engineer,\" create your free Calendly." },
      { d: "Day 3", focus: "Build Demo #1", tasks: "Build a real estate listing demo in Lovable — use a fictional or local agency as the subject." },
      { d: "Day 4", focus: "Build Demo #2", tasks: "Build a coaching or booking demo in Lovable or Lovable." },
      { d: "Day 5", focus: "Record & Package", tasks: "Record a 90-second Loom walkthrough of each demo. Write a short case-study style description for both." },
      { d: "Day 6", focus: "Portfolio Site", tasks: "Build your own site — homepage, 2 case studies, services framed as outcomes (never tool names), Calendly embed." },
      { d: "Day 7", focus: "Tool Stack Setup", tasks: "Create accounts on Outscraper, Apollo.io, and Instantly.ai. Build your Notion CRM pipeline: Scraped → Contacted → Replied → Call Booked → Proposal → Closed." },
    ],
  },
  {
    week: 2, title: "Lead Harvest", color: "#10B981", icon: "🔍", range: "Days 8–14",
    days: [
      { d: "Day 8", focus: "Scrape: USA Real Estate", tasks: "Google Maps via Outscraper — target 100 agencies across 3–4 mid-size cities." },
      { d: "Day 9", focus: "Scrape: USA Coaches", tasks: "Google Maps via Outscraper — target 100 coaches and consultants." },
      { d: "Day 10", focus: "Scrape: UK Market", tasks: "Google Maps for UK equivalents, plus a free pull from the Companies House registry." },
      { d: "Day 11", focus: "Enrich", tasks: "Run every scraped lead through Apollo.io for a verified email and LinkedIn URL." },
      { d: "Day 12", focus: "Clean & Prioritize", tasks: "Remove duplicates. Tag \"no website / weak website\" leads as Priority A — these convert fastest." },
      { d: "Day 13", focus: "Load the CRM", tasks: "Import the cleaned list into Notion CRM, tagged by niche, country, and priority." },
      { d: "Day 14", focus: "Build the Engine", tasks: "Write 2 email sequences (one per niche) into Instantly.ai. Connect Make.com: Outscraper → Apollo → Instantly → Notion, so future scraping auto-feeds the pipeline." },
    ],
  },
  {
    week: 3, title: "Outreach Launch", color: "#F59E0B", icon: "📧", range: "Days 15–21",
    days: [
      { d: "Day 15", focus: "Wave 1", tasks: "Send to your first 50 Priority-A leads (Real Estate, USA)." },
      { d: "Day 16", focus: "Deploy Your Secret Weapon", tasks: "Pick your 10 best leads from Wave 1 and build quick personalized AI previews for them — send as a follow-up touch (see AI Edge tab)." },
      { d: "Day 17", focus: "Wave 2 + LinkedIn", tasks: "Send to your next 50 leads (Coaches, USA). Start parallel LinkedIn DM outreach." },
      { d: "Day 18", focus: "Monitor & Adjust", tasks: "Check open and reply rates. Rewrite subject lines if opens are weak. Reply to anyone who responds within 2 hours." },
      { d: "Day 19", focus: "Book Calls", tasks: "Convert every reply into a booked discovery call through your Calendly link." },
      { d: "Day 20", focus: "UK Wave", tasks: "Launch your first UK sequence across both niches." },
      { d: "Day 21", focus: "Weekly Review", tasks: "Tally sent, opened, replied, and booked. Double down on whatever is converting best." },
    ],
  },
  {
    week: 4, title: "Conversion & Close", color: "#EC4899", icon: "🏆", range: "Days 22–30",
    days: [
      { d: "Day 22", focus: "Discovery Calls Begin", tasks: "Run calls using the SPIN framework. Take detailed notes on the exact pain point." },
      { d: "Day 23", focus: "Send Proposals", tasks: "Use your 3-tier package structure for every call held." },
      { d: "Day 24", focus: "Follow Up", tasks: "Chase proposals after 48 hours. Use your objection script if \"can't I just build this myself\" comes up." },
      { d: "Day 25", focus: "First Close", tasks: "Collect 50% deposit, send the agreement, schedule the kickoff call." },
      { d: "Day 26", focus: "Kickoff", tasks: "Begin the first paid project. Set the delivery timeline using Blueprint → Build → Bulletproof." },
      { d: "Day 27", focus: "Keep the Machine On", tasks: "Let Make.com keep feeding new leads in the background. Send Wave 3 to a new niche or country." },
      { d: "Day 28", focus: "Second Call Round", tasks: "Run discovery calls from this week's replies." },
      { d: "Day 29", focus: "Deliver & Ask", tasks: "If the first project is ready, deliver it — then request a testimonial and exactly 2 referrals." },
      { d: "Day 30", focus: "Month 1 Review", tasks: "Tally leads scraped, emails sent, replies, calls booked, deals closed, revenue collected. Set your Month 2 targets." },
    ],
  },
];

const MONTH1_TARGETS = [
  "300+ leads scraped across 2 countries",
  "150+ verified emails sent",
  "15–30 replies (a benchmark, not a guarantee — varies with list quality and follow-through)",
  "5–10 discovery calls booked",
  "1–3 proposals sent",
  "1+ deal closed",
];

function InfoRow({ color, children }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
      <span style={{ color, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
      <span style={{ fontSize: 13, color: "#6E6459", lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

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
  const [openWeek, setOpenWeek] = useState(0);


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

        {/* ─────────────── MACHINE TAB ─────────────── */}
        {tab === "machine" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#1A140F" }}>The Automated Lead Machine</h2>
              <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: 0, lineHeight: 1.6 }}>5 phases from zero leads to a full international pipeline — using tools you already know.</p>
            </div>

            {/* Stack flow */}
            <div style={{ background: "#FBF6E9", border: "1px solid #D9CFBB", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "", letterSpacing: "0.09em", marginBottom: 12 }}>🔄 Your Full Automation Stack (Make.com Flow)</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5 }}>
                {["Outscraper", "→", "Apollo.io", "→", "Instantly.ai", "→", "Make.com", "→", "Notion CRM", "→", "Go High Level"].map((item, i) => (
                  item === "→"
                    ? <span key={i} style={{ color: "#8A7C6D", fontSize: 15 }}>→</span>
                    : <span key={i} style={{ background: "#EDE7DA", border: "1px solid #1E2E46", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#A5B4FC", fontWeight: 500 }}>{item}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#8A7C6D", margin: "11px 0 0", lineHeight: 1.65 }}>
                Scrapes leads → enriches with emails → sends cold sequences → logs into CRM → nurtures non-responders. Set it up once. Let it run while you work on projects.
              </p>
            </div>

            {/* Cold email template */}
            <div style={{ background: "#FBF6E9", border: "1px solid #F59E0B25", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "", letterSpacing: "0.09em", marginBottom: 12 }}>📧 Cold Email Formula (PAS — Problem, Agitate, Solve)</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#6E6459", lineHeight: 1.85, borderLeft: "2px solid #F59E0B40", paddingLeft: 14 }}>
                <div style={{ color: "#201A16", fontWeight: 600 }}>Subject: [First Name] — your competitors are getting leads you're missing</div>
                <br />
                <div>Hi [Name],</div><br />
                <div>I noticed [Business Name] doesn't have [specific gap — e.g., online booking / a working website / email follow-up].</div><br />
                <div>Most [niche] businesses in [city] quietly lose 20–40% of potential clients because there's no digital follow-up when someone shows interest.</div><br />
                <div>I build websites and automation systems for [niche] owners that capture and convert leads 24/7 — no full-time tech team needed.</div><br />
                <div>I recently built [link to demo]. Took 2 weeks. The client now books 3x more appointments automatically.</div><br />
                <div>Worth a 15-minute call? [Calendly link]</div><br />
                <div>— Boluwatife</div>
              </div>
            </div>

            {/* Phases */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PHASES.map((p) => (
                <div key={p.phase} style={{ background: "#FFFFFF", borderLeft: `3px solid ${p.color}`, borderRadius: "0 12px 12px 0", border: `1px solid ${p.color}25`, borderLeftWidth: 3, padding: "16px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: p.color, textTransform: "", letterSpacing: "0.07em" }}>{p.phase}</span>
                        <span style={{ fontSize: 10.5, color: "#8A7C6D", background: "#EDE7DA", borderRadius: 5, padding: "2px 7px", fontWeight: 500 }}>{p.duration}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "#1A140F", marginTop: 2 }}>{p.title}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {p.steps.map((s, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: p.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 12.5, color: "#6E6459", lineHeight: 1.55 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Portfolio tip */}
            <div style={{ marginTop: 14, background: "#FBF6E9", border: "1px solid #10B98125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "", letterSpacing: "0.09em", marginBottom: 10 }}>💡 Build Your Portfolio Before You Have Clients</div>
              <p style={{ fontSize: 13, color: "#6E6459", margin: "0 0 10px", lineHeight: 1.6 }}>You don't need paying clients to start. Build 3 demo projects for your top niches:</p>
              {["A real estate listing site → Lovable (your proof of complex app building)", "A salon booking app → Lovable (your proof of mobile-first design)", "A coaching platform → Lovable (your proof of course + marketing automation)"].map((item, i) => (
                <InfoRow key={i} color="#10B981">{item}</InfoRow>
              ))}
              <p style={{ fontSize: 12.5, color: "#6E6459", margin: "10px 0 0", lineHeight: 1.6 }}>Host all three on your portfolio site. Record a Loom walkthrough of each. That's your social proof — and it costs you nothing but time.</p>
            </div>
          </div>
        )}

        {/* ─────────────── PRICING TAB ─────────────── */}
        {tab === "pricing" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#1A140F" }}>Pricing Strategy</h2>
              <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: 0, lineHeight: 1.6 }}>Four packages built to close fast, anchor value, and build recurring income. Always pitch the retainer.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PACKAGES.map((pkg) => (
                <div key={pkg.name} style={{ background: "#FFFFFF", border: `1px solid ${pkg.color}35`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "15px 16px", borderBottom: "1px solid #D9CFBB", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{pkg.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1A140F" }}>{pkg.name}</div>
                        <div style={{ fontSize: 11, color: "#8A7C6D", marginTop: 2 }}>Best for: {pkg.bestFor}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: pkg.color, whiteSpace: "nowrap" }}>{pkg.price}</div>
                  </div>
                  <div style={{ padding: "13px 16px" }}>
                    {pkg.includes.map((item, j) => (
                      <InfoRow key={j} color={pkg.color}>{item}</InfoRow>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pro tips */}
            <div style={{ marginTop: 16, background: "#FBF6E9", border: "1px solid #6366F125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "", letterSpacing: "0.09em", marginBottom: 12 }}>💡 Pricing Pro Tips</div>
              {[
                "Always show 3 packages — most clients pick the middle. Use this strategically.",
                "Charge 50% upfront, 50% on delivery. Non-negotiable. This protects you completely.",
                "Every finished project ends with a retainer pitch — it becomes your income safety net.",
                "Don't compete on price. Compete on the outcome and transformation you promise.",
                "Raise your rates every 3 clients. Scarcity and track record justify it.",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#6366F1", flexShrink: 0, fontWeight: 600, fontSize: 13 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: "#6E6459", lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Income projection */}
            <div style={{ marginTop: 14, background: "#FBF6E9", border: "1px solid #10B98125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "", letterSpacing: "0.09em", marginBottom: 14 }}>📈 Conservative Year 1 Income Projection</div>
              {INCOME_ROWS.map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #D9CFBB" }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#6E6459" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.amount}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 13 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1A140F" }}>Total Year 1</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>~$29,600</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#8A7C6D", marginTop: 7, lineHeight: 1.6 }}>
                Conservative — assumes you start slow and build. With your full stack and the pipeline above, this is a floor, not a ceiling. The retainers alone compound every month.
              </div>
            </div>
          </div>
        )}

        {/* ─────────────── POSITIONING TAB ─────────────── */}

        {/* ─────────────── CALENDAR TAB ─────────────── */}
        {tab === "calendar" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#1A140F" }}>Your 30-Day Action Calendar</h2>
              <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: 0, lineHeight: 1.6 }}>Tap a week to expand. Built around Google Maps scraping plus the platforms from the Countries tab.</p>
            </div>

            <div style={{ background: "#FBF6E9", border: "1px solid #D9CFBB", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "", letterSpacing: "0.09em", marginBottom: 10 }}>⏱️ Suggested Daily Rhythm (~2 hrs/day)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[{ t: "30 min", l: "CRM & replies" }, { t: "60 min", l: "Day's core task" }, { t: "30 min", l: "Outreach / follow-up" }].map((b, i) => (
                  <div key={i} style={{ background: "#EDE7DA", border: "1px solid #1E2E46", borderRadius: 8, padding: "8px 12px", flex: "1 1 100px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#A5B4FC" }}>{b.t}</div>
                    <div style={{ fontSize: 11, color: "#6E6459", marginTop: 2 }}>{b.l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: "#8A7C6D", margin: "10px 0 0", lineHeight: 1.5 }}>Running this alongside other commitments? Treat it as focused blocks rather than a full-time pivot — consistency matters more than hours.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {WEEKLY_PLAN.map((w, i) => (
                <div key={w.week} style={{ background: openWeek === i ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${openWeek === i ? w.color + "55" : "#D9CFBB"}`, borderRadius: 12, overflow: "hidden" }}>
                  <div onClick={() => setOpenWeek(openWeek === i ? null : i)} style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: w.color + "18", border: `1px solid ${w.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{w.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#1A140F" }}>Week {w.week}: {w.title}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#6E6459", marginTop: 2 }}>{w.range}</div>
                    </div>
                    <span style={{ color: "#8A7C6D", fontSize: 20, display: "inline-block", transform: openWeek === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {openWeek === i && (
                    <div style={{ padding: "2px 16px 16px", borderTop: "1px solid #D9CFBB" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                        {w.days.map((d, j) => (
                          <div key={j} style={{ display: "flex", gap: 11 }}>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: w.color, background: w.color + "15", borderRadius: 6, padding: "3px 8px", height: "fit-content", flexShrink: 0, whiteSpace: "nowrap", marginTop: 1 }}>{d.d}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#201A16", marginBottom: 2 }}>{d.focus}</div>
                              <div style={{ fontSize: 12, color: "#6E6459", lineHeight: 1.5 }}>{d.tasks}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, background: "#FBF6E9", border: "1px solid #10B98125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "", letterSpacing: "0.09em", marginBottom: 12 }}>✅ Month 1 Success Benchmarks</div>
              {MONTH1_TARGETS.map((t, i) => (
                <InfoRow key={i} color="#10B981">{t}</InfoRow>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

