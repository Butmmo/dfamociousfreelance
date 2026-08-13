// The Seven Paths of Digital Engineering.
// A beneficiary belongs to exactly one path. The super admin sees all of them.
import { lazy } from "react";

export type PathKey =
  | "smb"
  | "ascent"
  | "revenue"
  | "carebridge"
  | "ministry"
  | "broadcast"
  | "authority";

export interface PathDef {
  key: PathKey;
  name: string;
  short: string;
  tagline: string;
  summary: string;
  /** Who this path suits. */
  fit: string;
  /** All seven paths are live — playbooks installed for every path. */
  status: "live";
  /** Rank ladder used by this path. */
  ranks: "citadel" | "closer";
  accent: string;
  emoji: string;
}

export const PATHS: PathDef[] = [
  {
    key: "smb",
    name: "SMB Optimisation System",
    short: "SMB Optimisation",
    tagline: "Local service businesses · Google Review Automation",
    summary:
      "Win local service businesses in strong-currency markets with one entry product — Google Review Automation — then climb the upsell ladder into speed-to-lead, AI voice and full rebuilds.",
    fit: "You have outreach stamina, want recurring retainers, and can start with almost no capital.",
    status: "live",
    ranks: "citadel",
    accent: "from-amber-500/25 to-transparent",
    emoji: "🏪",
  },
  {
    key: "ascent",
    name: "High-Ticket Closing Machine",
    short: "The Ascent",
    tagline: "Commission-only closing for high-ticket offers",
    summary:
      "No product to build, no ads to run. You learn to scout, qualify and close other people's high-ticket offers for commission — the fastest route from zero capital to a real paycheck.",
    fit: "You want to be paid for persuasion, not production, and can handle rejection daily.",
    status: "live",
    ranks: "closer",
    accent: "from-yellow-600/25 to-transparent",
    emoji: "⛰️",
  },
  {
    key: "revenue",
    name: "Revenue Recovery Engine",
    short: "Revenue Recovery",
    tagline: "E-commerce abandoned-revenue recovery",
    summary:
      "Store owners are already losing money they've paid for. You install the flows that recover abandoned carts, browse sessions and lapsed buyers — and get paid from money you bring back.",
    fit: "You like measurable, provable wins and are comfortable inside e-commerce and email tooling.",
    status: "live",
    ranks: "citadel",
    accent: "from-emerald-600/25 to-transparent",
    emoji: "🛒",
  },
  {
    key: "carebridge",
    name: "The Care Bridge",
    short: "Care Bridge",
    tagline: "Senior & home-care rapid-response intake",
    summary:
      "Home-care agencies lose families to whoever answers first. You build the intake and rapid-response bridge that captures those enquiries — riding a demographic tailwind nobody can switch off.",
    fit: "You want meaningful work, have a warm local network, and can handle a slower, more human sale.",
    status: "live",
    ranks: "citadel",
    accent: "from-teal-600/25 to-transparent",
    emoji: "🤝",
  },
  {
    key: "ministry",
    name: "Digital Ministry Systems",
    short: "Ministry Systems",
    tagline: "Churches & ministries digital operations",
    summary:
      "Ministries run on volunteers and spreadsheets. You bring giving, follow-up, attendance and communications into one system — a market with trust-based referrals and unusually low churn.",
    fit: "You are inside or near a faith community and value long, relational client tenure.",
    status: "live",
    ranks: "citadel",
    accent: "from-indigo-600/25 to-transparent",
    emoji: "⛪",
  },
  {
    key: "broadcast",
    name: "The Broadcast Engine",
    short: "Broadcast Engine",
    tagline: "Podcast growth & monetisation systems",
    summary:
      "Shows have audiences but no machine behind them. You build the clip, distribution, sponsorship and list engine that turns listeners into revenue the host can actually see.",
    fit: "You are media-literate, fast with content workflows, and enjoy creator-side clients.",
    status: "live",
    ranks: "citadel",
    accent: "from-rose-600/25 to-transparent",
    emoji: "🎙️",
  },
  {
    key: "authority",
    name: "The Authority Engine",
    short: "Authority Engine",
    tagline: "Expert authority, content and lead engines",
    summary:
      "Coaches, consultants and advisors sell credibility. You build the prospecting and authority engine that fills their calendar — the highest-ticket per-client path of the seven.",
    fit: "You write well, think in positioning, and want fewer, larger clients.",
    status: "live",
    ranks: "citadel",
    accent: "from-violet-600/25 to-transparent",
    emoji: "📈",
  },
];

export const PATH_MAP = Object.fromEntries(PATHS.map((p) => [p.key, p])) as Record<PathKey, PathDef>;

export const getPath = (key?: string | null): PathDef | null =>
  key && key in PATH_MAP ? PATH_MAP[key as PathKey] : null;

/** Verbatim briefing artifacts, restyled to the Regal palette. */
export const BRIEFINGS: Record<PathKey, React.LazyExoticComponent<React.ComponentType<any>>> = {
  smb: lazy(() => import("@/components/briefings/smb-path-briefing.jsx")),
  ascent: lazy(() => import("@/components/briefings/TheAscentPathBriefing.jsx")),
  revenue: lazy(() => import("@/components/briefings/RevenueRecoveryEnginePathBriefing.jsx")),
  carebridge: lazy(() => import("@/components/briefings/CareBridgePathBriefing.jsx")),
  ministry: lazy(() => import("@/components/briefings/MinistrySystemsPathProfile.jsx")),
  broadcast: lazy(() => import("@/components/briefings/TheBroadcastEnginePathBriefing.jsx")),
  authority: lazy(() => import("@/components/briefings/TheProspectingEngine.jsx")),
};

export const CHOICE_WINDOW_HOURS = 24;
