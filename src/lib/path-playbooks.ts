// Which three playbooks belong to each of the Seven Paths.
// A beneficiary only ever sees the trio for their own path; the super admin
// sees the trio for whichever path they are currently inspecting.
import type { PathKey } from "@/lib/paths";

export interface PlaybookDef {
  slug: string;
  /** task_progress.playbook key — only used by checklist-bearing playbooks. */
  key?: string;
  title: string;
  tagline: string;
  body: string;
  icon: "globe" | "calendar" | "calculator";
  accent: string;
}

export const PATH_PLAYBOOKS: Record<PathKey, PlaybookDef[]> = {
  smb: [
    { slug: "global-smb-engine", key: "p_global", title: "SMB Prospecting Guide", tagline: "Markets · Boring Niches · Leads", body: "7 countries, the Tier-1 'boring' service niches nobody is fighting over, exact Google Maps searches, review-gap lead scoring and the Grand Slam offer builder.", icon: "globe", accent: "from-rose-500/25 to-transparent" },
    { slug: "plan", key: "p_45day", title: "SMB Optimisation Engine", tagline: "From Zero to First Client", body: "Day-by-day plan across 7 weeks — foundation, harvest, review-gap outreach, first close, deliver, scale, launch month 2.", icon: "calendar", accent: "from-indigo-500/25 to-transparent" },
    { slug: "smb-calculator", title: "SMB Performance Calculator", tagline: "Powered by Claude AI", body: "Enter a prospect's numbers → discover their revenue leak → export a branded PDF per tab.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
  ascent: [
    { slug: "ascent-targeting", title: "Global Targeting Manual", tagline: "Markets · Offers · Scouting", body: "Where the high-ticket offers live, which lanes pay, and how to scout partners worth closing for.", icon: "globe", accent: "from-amber-500/25 to-transparent" },
    { slug: "ascent-machine", key: "p_ascent", title: "The Ascent — Closing Machine", tagline: "From Zero to First Commission", body: "The full closer curriculum: pick your lane, scout, the 45 days, scripts, mastery, toolkit and day 46 onward.", icon: "calendar", accent: "from-yellow-600/25 to-transparent" },
    { slug: "ascent-calculator", title: "Ascent Performance Calculator", tagline: "Powered by Claude AI", body: "Model dials, calls, show rate and close rate into a realistic commission forecast.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
  revenue: [
    { slug: "ecommerce-prospecting", title: "E-commerce Prospecting Guide", tagline: "Markets · Niches · Leads", body: "Where the stores are, which niches leak the most revenue, and the exact way to find and score them.", icon: "globe", accent: "from-emerald-600/25 to-transparent" },
    { slug: "revenue-engine", key: "p_revenue", title: "Revenue Recovery Engine", tagline: "From Zero to First Client", body: "The 45-day build: learn the system, harvest stores, run outreach, install flows and prove recovered revenue.", icon: "calendar", accent: "from-indigo-500/25 to-transparent" },
    { slug: "ecommerce-calculator", title: "E-commerce Performance Calculator", tagline: "Powered by Claude AI", body: "Turn AOV, orders and abandonment into the recoverable revenue number that closes the deal.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
  carebridge: [
    { slug: "care-prospecting", title: "Senior Care Prospecting Guide", tagline: "Markets · Agencies · Leads", body: "The home-care landscape, who buys, and how to find agencies losing families to slow intake.", icon: "globe", accent: "from-teal-600/25 to-transparent" },
    { slug: "care-bridge", key: "p_carebridge", title: "The Care Bridge", tagline: "From Zero to First Client", body: "The 45-day build: learn the system, map agencies, run outreach, install the intake bridge and deliver.", icon: "calendar", accent: "from-indigo-500/25 to-transparent" },
    { slug: "care-calculator", title: "Home-Care Performance Calculator", tagline: "Powered by Claude AI", body: "Cost-of-care benchmarks turned into the exact dollar value of every missed enquiry.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
  ministry: [
    { slug: "ministry-prospecting", title: "Global Ministry Prospecting Guide", tagline: "Markets · Ministries · Leads", body: "Seven ministry types across the strongest markets, and how to reach them without breaking trust.", icon: "globe", accent: "from-indigo-600/25 to-transparent" },
    { slug: "ministry-systems", key: "p_ministry", title: "Digital Ministry Systems", tagline: "From Zero to First Client", body: "The 45-day build: audit your own ministry, package the system, run outreach, install and support.", icon: "calendar", accent: "from-indigo-500/25 to-transparent" },
    { slug: "ministry-calculator", title: "Ministry Performance Calculator", tagline: "Powered by Claude AI", body: "Visitors, enquiries and missed calls turned into the giving and retention a ministry is losing.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
  broadcast: [
    { slug: "podcast-prospecting", title: "Global Podcast Prospecting Guide", tagline: "Spaces · Shows · Leads", body: "Where shows actually grow, which hosts pay, and how to find the ones with audience but no machine.", icon: "globe", accent: "from-rose-600/25 to-transparent" },
    { slug: "broadcast-engine", key: "p_broadcast", title: "The Broadcast Engine", tagline: "From Zero to First Client", body: "The 45-day build: learn the system, build editing skill, harvest shows, pitch, install and scale.", icon: "calendar", accent: "from-indigo-500/25 to-transparent" },
    { slug: "podcast-calculator", title: "Podcast Performance Calculator", tagline: "Powered by Claude AI", body: "Downloads, CPM and discovery pool turned into the sponsorship revenue a show is leaving behind.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
  authority: [
    { slug: "authority-prospecting", title: "The Prospecting Engine", tagline: "Experts · Niches · Leads", body: "The expert markets worth pursuing, why they buy credibility, and how to find them at scale.", icon: "globe", accent: "from-violet-600/25 to-transparent" },
    { slug: "authority-engine", key: "p_authority", title: "The Authority Engine", tagline: "From Zero to First Client", body: "The 45-day build: writing foundation, positioning, outreach, content engine and retainer delivery.", icon: "calendar", accent: "from-indigo-500/25 to-transparent" },
    { slug: "authority-calculator", title: "Authority Performance Calculator", tagline: "Powered by Claude AI", body: "Audience, reach and conversion turned into the pipeline an expert is currently missing.", icon: "calculator", accent: "from-sky-500/25 to-transparent" },
  ],
};
