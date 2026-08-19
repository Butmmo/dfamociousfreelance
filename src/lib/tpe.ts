// TPE — twelve audio sessions on what actually runs an enterprise, end to
// end: not a checklist, a listen-and-apply series. Progress reuses the same
// task_progress table every other playbook writes to (playbook = "tpe"),
// so a TPE session marked listened counts toward XP, the escalation
// cadence and the Field Report exactly like any other playbook task —
// nothing new to wire up there. The one thing task_progress has no room
// for is a beneficiary's own written takeaway per session, which lives in
// tpe_reflections instead.

export interface TpeTopic {
  key: string;
  order: number;
  title: string;
  blurb: string;
  audioUrl: string;
}

export const TPE_TOPICS: TpeTopic[] = [
  {
    key: "order",
    order: 1,
    title: "Order in Enterprise",
    blurb: "The disciplines and structures that keep a growing enterprise from collapsing into chaos.",
    audioUrl: "/audio/tpe/topic-01-order.mp3",
  },
  {
    key: "intelligence",
    order: 2,
    title: "Intelligence in Enterprise",
    blurb: "How the sharpest operators actually think, and how to build informed judgment instead of guessing.",
    audioUrl: "/audio/tpe/topic-02-intelligence.mp3",
  },
  {
    key: "leadership_vision",
    order: 3,
    title: "Leadership & Vision in Enterprise",
    blurb: "Casting a vision worth following, and leading people toward it — not just managing them.",
    audioUrl: "/audio/tpe/topic-03-leadership-vision.mp3",
  },
  {
    key: "communication",
    order: 4,
    title: "Communication in Enterprise",
    blurb: "How the message actually lands: clarity, timing and audience — inside the business and out.",
    audioUrl: "/audio/tpe/topic-04-communication.mp3",
  },
  {
    key: "time_effort",
    order: 5,
    title: "Time & Effort in Enterprise",
    blurb: "Where your hours actually go, and the discipline of spending them on what compounds.",
    audioUrl: "/audio/tpe/topic-05-time-effort.mp3",
  },
  {
    key: "strategy_innovation",
    order: 6,
    title: "Strategy & Innovation in Enterprise",
    blurb: "Choosing where to compete, and staying ahead of a market that keeps moving under you.",
    audioUrl: "/audio/tpe/topic-06-strategy-innovation.mp3",
  },
  {
    key: "execution_discipline",
    order: 7,
    title: "Execution & Discipline in Enterprise",
    blurb: "The gap between a good plan and a plan that ships — and how to close it.",
    audioUrl: "/audio/tpe/topic-07-execution-discipline.mp3",
  },
  {
    key: "systems_building",
    order: 8,
    title: "Systems Building in Enterprise",
    blurb: "Replacing yourself with process, so the business runs without you standing over it.",
    audioUrl: "/audio/tpe/topic-08-systems-building.mp3",
  },
  {
    key: "adaptability_resilience",
    order: 9,
    title: "Adaptability & Resilience in Enterprise",
    blurb: "Absorbing shocks without breaking, and adjusting course without losing the plot.",
    audioUrl: "/audio/tpe/topic-09-adaptability-resilience.mp3",
  },
  {
    key: "financial_intelligence",
    order: 10,
    title: "Financial Intelligence in Enterprise",
    blurb: "Reading the numbers well enough that they warn you before a crisis does.",
    audioUrl: "/audio/tpe/topic-10-financial-intelligence.mp3",
  },
  {
    key: "culture_team_building",
    order: 11,
    title: "Culture & Team Building in Enterprise",
    blurb: "What actually holds a team together once the founder isn't the only one carrying it.",
    audioUrl: "/audio/tpe/topic-11-culture-team-building.mp3",
  },
  {
    key: "sustainability_ethics",
    order: 12,
    title: "Sustainability & Ethics in Enterprise",
    blurb: "Building something that lasts — and is still worth building once no one's watching.",
    audioUrl: "/audio/tpe/topic-12-sustainability-ethics.mp3",
  },
];

export const TPE_PLAYBOOK_KEY = "tpe";

export function tpeProgressPercent(completedKeys: Set<string>): number {
  if (TPE_TOPICS.length === 0) return 0;
  return Math.round((completedKeys.size / TPE_TOPICS.length) * 100);
}
