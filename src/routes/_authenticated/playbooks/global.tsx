// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
import { createFileRoute } from "@tanstack/react-router";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { useState } from "react";

const COUNTRIES = [
  {
    flag: "🇺🇸", name: "United States", tagline: "The Biggest Prize",
    smbs: "33M+ SMBs", currency: "USD — $75–200/hr freelance rates",
    highlight: "Highest rates + largest SMB pool on Earth. Every major city has hundreds of businesses needing your exact stack.",
    reasons: [
      "Highest freelance rates globally — $75–200/hr is completely normal",
      "Massive no-code movement — Bubble.io's largest community is here",
      "Every city has hundreds of businesses needing CRM, websites, and automation",
      "Huge appetite for email marketing (Klaviyo) and workflow automation",
    ],
    niches: ["Coaches", "Real Estate Agents", "Fitness Studios", "E-commerce"],
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
    niches: ["Law Firms", "Real Estate", "Restaurants", "Consultants"],
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
    niches: ["Wellness Businesses", "Coaches", "E-commerce", "Financial Advisors"],
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
    niches: ["Tradespeople", "Beauty Salons", "Real Estate", "Restaurants"],
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
    niches: ["Manufacturing SMBs", "E-commerce", "Professional Services", "Clinics"],
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
    niches: ["Startups", "Coaches", "E-commerce", "Wellness"],
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
    niches: ["Restaurants", "Real Estate", "Event Planners", "Luxury Retail"],
    platforms: ["Google Maps", "LinkedIn", "Dubizzle", "Bayut"],
    color: "#059669",
  },
];

const BUSINESSES = [
  {
    id: 1, icon: "🏠", name: "Real Estate Agencies & Agents", deal: "$1,200–2,500",
    pain: "Tons of listings and leads — zero tracking. No CRM, no automated follow-up, outdated or nonexistent website.",
    product: "Property listing site (Bubble.io) + Zoho CRM pipeline + Klaviyo email drip sequences for lead nurturing",
    pitch: '"You\'re losing warm leads every week because nothing follows them up automatically. I\'ll build a system that captures, tracks, and converts leads 24/7."',
    find: "Google Maps: \"real estate agent [city]\", Zillow agent directory, local estate agency networks",
    tools: ["Bubble.io", "Zoho CRM", "Klaviyo", "Zapier"],
  },
  {
    id: 2, icon: "🎯", name: "Business & Life Coaches", deal: "$800–2,000",
    pain: "Selling expertise but stuck with manual booking, no course platform, no email sequences, and zero upsell funnel.",
    product: "Kajabi or Bubble.io course + coaching website + Klaviyo email sequences + booking calendar integration",
    pitch: '"Your expertise deserves better infrastructure. Let me build a system where clients book, pay, and access your content automatically — even while you sleep."',
    find: "LinkedIn, Google Maps: \"business coach [city]\", Instagram, coaching directory sites",
    tools: ["Kajabi", "Bubble.io", "Klaviyo", "Zapier"],
  },
  {
    id: 3, icon: "🦷", name: "Dental & Medical Clinics", deal: "$1,500–3,500",
    pain: "No online booking, no automated reminders, chaotic patient management, generic or missing website.",
    product: "Adalo/Bubble.io booking app + clinic website + Zoho CRM for patient management + SMS/email reminders",
    pitch: '"Clinics lose up to 30% of appointments to no-shows. An automated SMS + email reminder system pays for itself in the first month alone."',
    find: "Google Maps: \"dentist / doctor / clinic [city]\", Yelp, Healthgrades, Zocdoc",
    tools: ["Adalo", "Bubble.io", "Zoho CRM", "Zapier"],
  },
  {
    id: 4, icon: "💪", name: "Fitness Studios & Personal Trainers", deal: "$900–2,000",
    pain: "Class scheduling, membership management, and new client acquisition are all completely manual.",
    product: "Adalo/FlutterFlow class booking app + membership website + Klaviyo retention campaigns + Zoho CRM",
    pitch: '"Let your members book classes, track progress, and renew memberships without you lifting a finger. I\'ll build the whole system in 2 weeks."',
    find: "Google Maps: \"gym / fitness studio [city]\", Instagram, Mindbody directory",
    tools: ["Adalo", "FlutterFlow", "Klaviyo", "Zoho CRM"],
  },
  {
    id: 5, icon: "⚖️", name: "Solo Law Firms & Small Legal Practices", deal: "$1,500–4,000",
    pain: "Drowning in manual intake, no digital client portal, prestigious firm with a website that looks like 2005.",
    product: "Professional law firm website + client intake portal (Bubble.io) + Zoho CRM + appointment scheduling",
    pitch: '"Your firm deserves a digital presence that matches your expertise. I\'ll also save your staff 10+ hours a week with automated client intake — right away."',
    find: "Google Maps: \"solicitor [UK] / attorney [US] [city]\", Martindale-Hubbell, Avvo",
    tools: ["Bubble.io", "CMS Builder", "Zoho CRM", "Zapier"],
  },
  {
    id: 6, icon: "🛒", name: "Independent E-Commerce Sellers", deal: "$700–1,800",
    pain: "Selling on Etsy/Amazon but don't own their customer data. Every sale enriches the platform, not them.",
    product: "Own e-commerce store (Bubble.io/CMS) + Klaviyo email marketing + Zoho CRM for customer data ownership",
    pitch: '"Every time someone buys on Etsy, that customer data goes to Etsy — not you. Let me build you a store you own, plus a marketing machine that brings them back repeatedly."',
    find: "Etsy sellers, local markets, Instagram sellers, Google Maps: \"boutique / shop [city]\"",
    tools: ["Bubble.io", "CMS Builder", "Klaviyo", "Zoho CRM"],
  },
  {
    id: 7, icon: "🍽️", name: "Restaurants & Food Businesses", deal: "$1,000–2,500",
    pain: "Paying Uber Eats/DoorDash 15–30% commission per order. No loyalty system. No way to re-engage past customers.",
    product: "Custom ordering platform (Bubble.io) + loyalty/rewards system + Klaviyo promotions + restaurant website",
    pitch: '"Stop paying Uber Eats 30% per order. Own your ordering system and keep your full margins. I can have it live in 3 weeks."',
    find: "Google Maps: \"restaurant [city]\", Yelp, TripAdvisor, OpenTable listings",
    tools: ["Bubble.io", "Klaviyo", "Zapier", "Zoho CRM"],
  },
  {
    id: 8, icon: "🧠", name: "Therapists & Mental Health Professionals", deal: "$600–1,500",
    pain: "Extremely busy, minimal tech skills. Need automation for booking, intake forms, session reminders, and secure client communication.",
    product: "Booking website + digital intake forms + Zoho CRM + Zapier/Klaviyo automated session reminders",
    pitch: '"You focus on healing people. I\'ll build a system that fills your calendar, sends reminders, and handles your admin — so you can focus on what matters."',
    find: "Psychology Today directory, Google Maps: \"therapist / counsellor [city]\"",
    tools: ["Bubble.io", "CMS Builder", "Zoho CRM", "Zapier"],
  },
  {
    id: 9, icon: "📊", name: "Accountants & Financial Advisors", deal: "$1,000–2,500",
    pain: "Independent practices trying to compete with big firms but no digital client portal, no professional presence, outdated website.",
    product: "Professional website + secure client document portal (Bubble.io) + Zoho CRM + Klaviyo financial tips newsletter",
    pitch: '"Your big competitors have polished digital client portals. I can give your practice the exact same experience at a fraction of their overhead cost."',
    find: "LinkedIn, Google Maps: \"accountant / financial advisor [city]\", AICPA / ICAEW directories",
    tools: ["Bubble.io", "Zoho CRM", "Klaviyo", "CMS Builder"],
  },
  {
    id: 10, icon: "🎊", name: "Event Planners & Wedding Coordinators", deal: "$800–2,000",
    pain: "Juggling vendors, clients, timelines, budgets — all in messy spreadsheets. No CRM. Portfolio website absent or outdated.",
    product: "Portfolio website + Zoho CRM for vendor/client management + Klaviyo seasonal campaigns + Zapier automations",
    pitch: '"Let your website do the selling while you focus on running brilliant events. I\'ll also build you a system where vendors and clients always know exactly what\'s happening."',
    find: "Google Maps: \"wedding planner / event coordinator [city]\", The Knot, WeddingWire",
    tools: ["CMS Builder", "Zoho CRM", "Klaviyo", "Zapier"],
  },
  {
    id: 11, icon: "💆", name: "Beauty Salons, Spas & Aesthetic Clinics", deal: "$700–1,800",
    pain: "Booking still done by phone. Loyal clients with zero retention system. Reviews and referrals happen purely by chance.",
    product: "Adalo/Bubble.io booking system + CMS website + Klaviyo birthday promos + rebooking campaigns + Zoho CRM",
    pitch: '"Imagine your salon filling up automatically every week because the system sends \"time for your next appointment\" messages. That\'s exactly what I\'ll build you."',
    find: "Google Maps: \"hair salon / spa / med spa [city]\", Instagram, Fresha directory",
    tools: ["Adalo", "Bubble.io", "Klaviyo", "Zoho CRM"],
  },
  {
    id: 12, icon: "🔧", name: "Contractors & Home Service Providers", deal: "$500–1,200",
    pain: "Plumbers, electricians, HVAC — booked by word of mouth, no website, losing leads daily with zero digital presence.",
    product: "Professional CMS website + Zoho CRM + Zapier quote-request automation + Google review request system",
    pitch: '"When someone searches \"electrician near me\" at 11 PM, your website should appear and capture their details automatically. Right now you\'re completely invisible online."',
    find: "Google Maps: \"plumber / electrician / HVAC [city]\", HomeAdvisor (US), Checkatrade (UK), hipages (AU)",
    tools: ["CMS Builder", "Zoho CRM", "Zapier"],
  },
];

const PHASES = [
  {
    phase: "Phase 1", title: "Build Your Foundation", duration: "Week 1–2", color: "#6366F1", icon: "🏗️",
    steps: [
      "Pick 2 niches to start — recommended: Real Estate + Coaches (high deal value, clear pain)",
      "Pick 2 countries — recommended: USA + UK (English, highest rates, familiar tools)",
      "Build your portfolio site using Bubble.io or Lovable — use your own tools as proof",
      "Create 2–3 demo projects as case studies. Demos count. Clients want to see the work, not credentials.",
      "Record a Loom video walkthrough of each demo — this is your sales asset",
    ],
  },
  {
    phase: "Phase 2", title: "Data Harvest", duration: "Week 2–3", color: "#10B981", icon: "🔍",
    steps: [
      "Google Maps scraping → use Outscraper.com or PhantomBuster (both have free tiers)",
      "Target: businesses with no website, poor website, or no Google reviews",
      "Export: business name, email, phone, website → Google Sheets or Airtable",
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
      "Make.com master workflow: Outscraper → Apollo → Email tool → Zoho CRM (fully automated)",
      "Calendly (free tier) → auto-schedule discovery calls directly from interested email replies",
    ],
  },
  {
    phase: "Phase 4", title: "CRM Pipeline Management", duration: "Ongoing", color: "#8B5CF6", icon: "⚙️",
    steps: [
      "Zoho CRM — you already know this! Manage all leads in clear pipeline stages",
      "Stages: Scraped → Contacted → Replied → Discovery Call → Proposal Sent → Closed",
      "Klaviyo nurture sequence → for leads who don't reply (value emails, case studies, tips)",
      "Make.com trigger: new lead auto-created in Zoho + follow-up sequence fires automatically",
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
    includes: ["Full multi-page website", "Zoho CRM setup + pipeline", "Klaviyo email automation", "Booking/calendar integration"],
    bestFor: "Coaches, Therapists, Accountants, Event Planners",
  },
  {
    name: "Premium", icon: "🚀", color: "#F59E0B", price: "$2,000–4,000",
    includes: ["Custom web app (Bubble.io)", "Full automation stack (Make.com/Zapier)", "CRM + email marketing", "Client portal or booking system"],
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
  { factor: "CRM / email / payments", diy: "Missing, or hacked together", you: "Fully integrated (Zoho, Klaviyo, Stripe)" },
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
      { d: "Day 3", focus: "Build Demo #1", tasks: "Build a real estate listing demo in Bubble.io — use a fictional or local agency as the subject." },
      { d: "Day 4", focus: "Build Demo #2", tasks: "Build a coaching or booking demo in Kajabi or Adalo." },
      { d: "Day 5", focus: "Record & Package", tasks: "Record a 90-second Loom walkthrough of each demo. Write a short case-study style description for both." },
      { d: "Day 6", focus: "Portfolio Site", tasks: "Build your own site — homepage, 2 case studies, services framed as outcomes (never tool names), Calendly embed." },
      { d: "Day 7", focus: "Tool Stack Setup", tasks: "Create accounts on Outscraper, Apollo.io, and Instantly.ai. Build your Zoho CRM pipeline: Scraped → Contacted → Replied → Call Booked → Proposal → Closed." },
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
      { d: "Day 13", focus: "Load the CRM", tasks: "Import the cleaned list into Zoho CRM, tagged by niche, country, and priority." },
      { d: "Day 14", focus: "Build the Engine", tasks: "Write 2 email sequences (one per niche) into Instantly.ai. Connect Make.com: Outscraper → Apollo → Instantly → Zoho, so future scraping auto-feeds the pipeline." },
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
      <span style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

function Block({ label, color, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function GlobalPlaybook() {
  const [tab, setTab] = useState("countries");
  const [openCountry, setOpenCountry] = useState(null);
  const [openBiz, setOpenBiz] = useState(null);
  const [openWeek, setOpenWeek] = useState(0);

  const tabs = [
    { id: "countries", label: "🌍 Countries" },
    { id: "businesses", label: "💼 Niches" },
    { id: "machine", label: "⚙️ Lead Machine" },
    { id: "positioning", label: "🤖 AI Edge" },
    { id: "pricing", label: "💰 Pricing" },
    { id: "calendar", label: "📅 30-Day Plan" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#080E1A", minHeight: "100vh", color: "#E2E8F0" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg, #0F1629 0%, #0C1320 60%, #080E1A 100%)", padding: "28px 20px 22px", borderBottom: "1px solid #1A2840" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#10B981", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            International Expansion Playbook
          </div>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, background: "linear-gradient(135deg, #FFFFFF 30%, #818CF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Your Global Freelance Machine
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: "#4B6080", maxWidth: 580, lineHeight: 1.65 }}>
            7 countries · 12 niches · lead pipeline · AI-edge positioning · pricing · 30-day calendar — built around your stack: Bubble.io, Zoho, Klaviyo, Make, Kajabi, Adalo, FlutterFlow.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: "#0C1420", borderBottom: "1px solid #1A2840", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", padding: "0 8px", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #6366F1" : "2px solid transparent",
              color: tab === t.id ? "#A5B4FC" : "#374151",
              padding: "13px 15px",
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "22px 14px 56px" }}>

        {/* ─────────────── COUNTRIES TAB ─────────────── */}
        {tab === "countries" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#F1F5F9" }}>Top 7 Target Countries</h2>
              <p style={{ fontSize: 12.5, color: "#374151", margin: 0 }}>Tap a country to expand — reasons, best niches, and where to find leads.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COUNTRIES.map((c, i) => (
                <div key={c.name}
                  onClick={() => setOpenCountry(openCountry === i ? null : i)}
                  style={{ background: openCountry === i ? "#0F1C30" : "#0C1520", border: `1px solid ${openCountry === i ? c.color + "55" : "#1A2840"}`, borderRadius: 12, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}>

                  <div style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
                    <span style={{ fontSize: 30 }}>{c.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#F1F5F9" }}>{c.name}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: c.color, background: c.color + "18", border: `1px solid ${c.color}35`, borderRadius: 20, padding: "2px 9px", whiteSpace: "nowrap" }}>{c.tagline}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#4B6080", marginTop: 3 }}>{c.smbs} &nbsp;·&nbsp; {c.currency}</div>
                    </div>
                    <span style={{ color: "#374151", fontSize: 20, display: "inline-block", transform: openCountry === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {openCountry === i && (
                    <div style={{ padding: "4px 16px 18px", borderTop: "1px solid #1A2840" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.color, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 14, marginBottom: 5 }}>⚡ Why This Market</div>
                      <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 14px", lineHeight: 1.6 }}>{c.highlight}</p>

                      <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Specific Reasons</div>
                      <div style={{ marginBottom: 16 }}>
                        {c.reasons.map((r, j) => (
                          <div key={j} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                            <span style={{ color: c.color, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                            <span style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.55 }}>{r}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "#080E1A", borderRadius: 8, padding: "12px 13px", border: "1px solid #1A2840" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Best Niches</div>
                          {c.niches.map((n, j) => (
                            <div key={j} style={{ fontSize: 12, color: "#94A3B8", marginBottom: 5, display: "flex", gap: 6 }}>
                              <span style={{ color: "#10B981" }}>•</span> {n}
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "#080E1A", borderRadius: 8, padding: "12px 13px", border: "1px solid #1A2840" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Find Leads On</div>
                          {c.platforms.map((p, j) => (
                            <div key={j} style={{ fontSize: 12, color: "#94A3B8", marginBottom: 5, display: "flex", gap: 6 }}>
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
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#F1F5F9" }}>12 Business Types to Target</h2>
              <p style={{ fontSize: 12.5, color: "#374151", margin: 0 }}>Tap a niche for the pain, product to build, pitch script, and how to find them.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {BUSINESSES.map((b, i) => (
                <div key={b.id}
                  onClick={() => setOpenBiz(openBiz === i ? null : i)}
                  style={{ background: openBiz === i ? "#0F1C30" : "#0C1520", border: `1px solid ${openBiz === i ? "#6366F1" : "#1A2840"}`, borderRadius: 12, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}>

                  <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: "#111C2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginTop: 2 }}>Avg deal: {b.deal}</div>
                    </div>
                    <span style={{ color: "#374151", fontSize: 20, display: "inline-block", transform: openBiz === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {openBiz === i && (
                    <div style={{ padding: "4px 15px 18px", borderTop: "1px solid #1A2840" }}>
                      <Block label="🔥 Their Pain Point" color="#EF4444">{b.pain}</Block>
                      <Block label="🛠️ Your Product to Build" color="#6366F1">{b.product}</Block>
                      <Block label="🎤 Pitch Script" color="#10B981">
                        <em style={{ color: "#6EE7B7" }}>{b.pitch}</em>
                      </Block>
                      <Block label="📍 How to Find Them" color="#F59E0B">{b.find}</Block>
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Your Stack for This</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {b.tools.map(t => (
                            <span key={t} style={{ fontSize: 11.5, background: "#111C2E", border: "1px solid #1E2E46", borderRadius: 6, padding: "3px 9px", color: "#94A3B8" }}>{t}</span>
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

        {/* ─────────────── MACHINE TAB ─────────────── */}
        {tab === "machine" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#F1F5F9" }}>The Automated Lead Machine</h2>
              <p style={{ fontSize: 12.5, color: "#374151", margin: 0, lineHeight: 1.6 }}>5 phases from zero leads to a full international pipeline — using tools you already know.</p>
            </div>

            {/* Stack flow */}
            <div style={{ background: "#0A1020", border: "1px solid #1A2840", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>🔄 Your Full Automation Stack (Make.com Flow)</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5 }}>
                {["Outscraper", "→", "Apollo.io", "→", "Instantly.ai", "→", "Make.com", "→", "Zoho CRM", "→", "Klaviyo"].map((item, i) => (
                  item === "→"
                    ? <span key={i} style={{ color: "#374151", fontSize: 15 }}>→</span>
                    : <span key={i} style={{ background: "#111C2E", border: "1px solid #1E2E46", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#A5B4FC", fontWeight: 500 }}>{item}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#374151", margin: "11px 0 0", lineHeight: 1.65 }}>
                Scrapes leads → enriches with emails → sends cold sequences → logs into CRM → nurtures non-responders. Set it up once. Let it run while you work on projects.
              </p>
            </div>

            {/* Cold email template */}
            <div style={{ background: "#0A1020", border: "1px solid #F59E0B25", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>📧 Cold Email Formula (PAS — Problem, Agitate, Solve)</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#94A3B8", lineHeight: 1.85, borderLeft: "2px solid #F59E0B40", paddingLeft: 14 }}>
                <div style={{ color: "#E2E8F0", fontWeight: 600 }}>Subject: [First Name] — your competitors are getting leads you're missing</div>
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
                <div key={p.phase} style={{ background: "#0C1520", borderLeft: `3px solid ${p.color}`, borderRadius: "0 12px 12px 0", border: `1px solid ${p.color}25`, borderLeftWidth: 3, padding: "16px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: p.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{p.phase}</span>
                        <span style={{ fontSize: 10.5, color: "#374151", background: "#111C2E", borderRadius: 5, padding: "2px 7px", fontWeight: 500 }}>{p.duration}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "#F1F5F9", marginTop: 2 }}>{p.title}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {p.steps.map((s, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: p.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 12.5, color: "#94A3B8", lineHeight: 1.55 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Portfolio tip */}
            <div style={{ marginTop: 14, background: "#0A1020", border: "1px solid #10B98125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>💡 Build Your Portfolio Before You Have Clients</div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 10px", lineHeight: 1.6 }}>You don't need paying clients to start. Build 3 demo projects for your top niches:</p>
              {["A real estate listing site → Bubble.io (your proof of complex app building)", "A salon booking app → Adalo (your proof of mobile-first design)", "A coaching platform → Kajabi (your proof of course + marketing automation)"].map((item, i) => (
                <InfoRow key={i} color="#10B981">{item}</InfoRow>
              ))}
              <p style={{ fontSize: 12.5, color: "#94A3B8", margin: "10px 0 0", lineHeight: 1.6 }}>Host all three on your portfolio site. Record a Loom walkthrough of each. That's your social proof — and it costs you nothing but time.</p>
            </div>
          </div>
        )}

        {/* ─────────────── PRICING TAB ─────────────── */}
        {tab === "pricing" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#F1F5F9" }}>Pricing Strategy</h2>
              <p style={{ fontSize: 12.5, color: "#374151", margin: 0, lineHeight: 1.6 }}>Four packages built to close fast, anchor value, and build recurring income. Always pitch the retainer.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PACKAGES.map((pkg) => (
                <div key={pkg.name} style={{ background: "#0C1520", border: `1px solid ${pkg.color}35`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "15px 16px", borderBottom: "1px solid #1A2840", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{pkg.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>{pkg.name}</div>
                        <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>Best for: {pkg.bestFor}</div>
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
            <div style={{ marginTop: 16, background: "#0A1020", border: "1px solid #6366F125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>💡 Pricing Pro Tips</div>
              {[
                "Always show 3 packages — most clients pick the middle. Use this strategically.",
                "Charge 50% upfront, 50% on delivery. Non-negotiable. This protects you completely.",
                "Every finished project ends with a retainer pitch — it becomes your income safety net.",
                "Don't compete on price. Compete on the outcome and transformation you promise.",
                "Raise your rates every 3 clients. Scarcity and track record justify it.",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#6366F1", flexShrink: 0, fontWeight: 600, fontSize: 13 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Income projection */}
            <div style={{ marginTop: 14, background: "#0A1020", border: "1px solid #10B98125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>📈 Conservative Year 1 Income Projection</div>
              {INCOME_ROWS.map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #1A2840" }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.amount}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 13 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>Total Year 1</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>~$29,600</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#374151", marginTop: 7, lineHeight: 1.6 }}>
                Conservative — assumes you start slow and build. With your full stack and the pipeline above, this is a floor, not a ceiling. The retainers alone compound every month.
              </div>
            </div>
          </div>
        )}

        {/* ─────────────── POSITIONING TAB ─────────────── */}
        {tab === "positioning" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#F1F5F9" }}>Your AI Edge, Positioned Right</h2>
              <p style={{ fontSize: 12.5, color: "#374151", margin: 0, lineHeight: 1.6 }}>The tools are your advantage in private. In front of clients, you sell outcomes and a process — never the tool names.</p>
            </div>

            <div style={{ background: "#0A1020", border: "1px solid #6366F125", borderRadius: 12, padding: "16px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>💡 The Core Principle</div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.65 }}>
                An architect uses CAD software, but nobody skips hiring an architect because "I could open AutoCAD myself." The software is how they work — the value is the judgment, the integration, and the accountability. That's exactly how to position Claude Code, Lovable, Base44, Cursor, and Gemini: as how you deliver, never as what you're selling.
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 3 }}>Your Named Process</div>
              <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.5 }}>Give clients a proprietary-sounding system instead of a list of tools.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
              {METHODOLOGY.map((m, i) => (
                <div key={m.name} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color + "18", border: `1px solid ${m.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
                    {i < METHODOLOGY.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: "#1A2840", marginTop: 4, marginBottom: 4 }} />}
                  </div>
                  <div style={{ background: "#0C1520", border: "1px solid #1A2840", borderRadius: 10, padding: "11px 14px", flex: 1, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.step}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9" }}>{m.name}</span>
                      <span style={{ fontSize: 10.5, color: "#374151", background: "#111C2E", borderRadius: 5, padding: "2px 7px" }}>{m.duration}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#94A3B8", margin: 0, lineHeight: 1.55 }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 3 }}>Say This, Not That</div>
              <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.5 }}>Exact phrasing for proposals, calls, and your website.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {SAY_DONT.map((s, i) => (
                <div key={i} style={{ background: "#0C1520", border: "1px solid #1A2840", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                    <span style={{ color: "#EF4444", fontSize: 13, flexShrink: 0 }}>✕</span>
                    <span style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.5, textDecoration: "line-through" }}>{s.dont}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#10B981", fontSize: 13, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.5, fontWeight: 500 }}>{s.say}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, #0A1020 0%, #0F1A14 100%)", border: "1px solid #10B98135", borderRadius: 12, padding: "16px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>🎯 Your Secret Weapon: The Personalized Preview</div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 11px", lineHeight: 1.65 }}>
                Most freelancers pitch with words. You can pitch with a working preview. For your top 10–15 leads each week, spend 20–30 minutes building a lightweight clickable mockup using their real business name, pulling colors or logo straight from their Google listing.
              </p>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#6EE7B7", lineHeight: 1.7, borderLeft: "2px solid #10B98140", paddingLeft: 12, marginBottom: 10 }}>
                "I noticed [Business Name] didn't have online booking, so I went ahead and mocked this up for you — no obligation, just wanted you to see what's possible. [link / 60-sec Loom]"
              </div>
              <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.55 }}>
                This is tangible proof instead of a sales pitch, and almost nobody else moves fast enough to do this at scale. Reserve it for your highest-value leads — it's a time investment, not a mass tactic.
              </p>
            </div>

            <div style={{ background: "#0A1020", border: "1px solid #F59E0B25", borderRadius: 12, padding: "16px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>🗣️ When They Ask: "Can't I Just Build This Myself With AI?"</div>
              <div style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.7, fontStyle: "italic", borderLeft: "2px solid #F59E0B40", paddingLeft: 13 }}>
                {OBJECTION_SCRIPT}
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 3 }}>DIY With AI vs. Hiring You</div>
              <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.5 }}>Keep this mental model handy on every call.</p>
            </div>
            <div style={{ background: "#0C1520", border: "1px solid #1A2840", borderRadius: 12, overflow: "hidden" }}>
              {DIY_COMPARISON.map((row, i) => (
                <div key={i} style={{ padding: "12px 14px", borderBottom: i < DIY_COMPARISON.length - 1 ? "1px solid #1A2840" : "none" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#F1F5F9", marginBottom: 7 }}>{row.factor}</div>
                  <div style={{ display: "flex", gap: 7, marginBottom: 5, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", background: "#EF444415", borderRadius: 5, padding: "1px 6px", flexShrink: 0, marginTop: 1 }}>DIY</span>
                    <span style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{row.diy}</span>
                  </div>
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#10B98115", borderRadius: 5, padding: "1px 6px", flexShrink: 0, marginTop: 1 }}>YOU</span>
                    <span style={{ fontSize: 12.5, color: "#94A3B8", lineHeight: 1.5 }}>{row.you}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────── CALENDAR TAB ─────────────── */}
        {tab === "calendar" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 5px", color: "#F1F5F9" }}>Your 30-Day Action Calendar</h2>
              <p style={{ fontSize: 12.5, color: "#374151", margin: 0, lineHeight: 1.6 }}>Tap a week to expand. Built around Google Maps scraping plus the platforms from the Countries tab.</p>
            </div>

            <div style={{ background: "#0A1020", border: "1px solid #1A2840", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>⏱️ Suggested Daily Rhythm (~2 hrs/day)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[{ t: "30 min", l: "CRM & replies" }, { t: "60 min", l: "Day's core task" }, { t: "30 min", l: "Outreach / follow-up" }].map((b, i) => (
                  <div key={i} style={{ background: "#111C2E", border: "1px solid #1E2E46", borderRadius: 8, padding: "8px 12px", flex: "1 1 100px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#A5B4FC" }}>{b.t}</div>
                    <div style={{ fontSize: 11, color: "#4B6080", marginTop: 2 }}>{b.l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: "#374151", margin: "10px 0 0", lineHeight: 1.5 }}>Running this alongside other commitments? Treat it as focused blocks rather than a full-time pivot — consistency matters more than hours.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {WEEKLY_PLAN.map((w, i) => (
                <div key={w.week} style={{ background: openWeek === i ? "#0F1C30" : "#0C1520", border: `1px solid ${openWeek === i ? w.color + "55" : "#1A2840"}`, borderRadius: 12, overflow: "hidden" }}>
                  <div onClick={() => setOpenWeek(openWeek === i ? null : i)} style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: w.color + "18", border: `1px solid ${w.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{w.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#F1F5F9" }}>Week {w.week}: {w.title}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#4B6080", marginTop: 2 }}>{w.range}</div>
                    </div>
                    <span style={{ color: "#374151", fontSize: 20, display: "inline-block", transform: openWeek === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {openWeek === i && (
                    <div style={{ padding: "2px 16px 16px", borderTop: "1px solid #1A2840" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                        {w.days.map((d, j) => (
                          <div key={j} style={{ display: "flex", gap: 11 }}>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: w.color, background: w.color + "15", borderRadius: 6, padding: "3px 8px", height: "fit-content", flexShrink: 0, whiteSpace: "nowrap", marginTop: 1 }}>{d.d}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>{d.focus}</div>
                              <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{d.tasks}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, background: "#0A1020", border: "1px solid #10B98125", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>✅ Month 1 Success Benchmarks</div>
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

export const Route = createFileRoute("/_authenticated/playbooks/global")({
  head: () => ({ meta: [{ title: "GlobalPlaybook — DFS Citadel" }] }),
  component: GlobalPlaybook,
});
