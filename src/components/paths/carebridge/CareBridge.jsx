// The Care Bridge — 45-Day Senior & Home-Care Communication System
// Rebuilt to the DBI Regal standard set by AscentMachine.jsx: per-task XP with
// milestone badges, percentage-based rank progression, real Supabase-backed
// persistence via useSyncedTaskMap, and the shared BPS (Belief/Affirmation/Evaluation)
// checkpoint cadence woven directly into the 45-day roadmap. Every original CareBridge
// system (care-focus scoring, the 4 Bridge Components, Agency CRM, scripts, packages,
// FAQ) is carried over in full — nothing dropped — plus the Scout Methods, PROVEN
// framework and BPS integration that were the actual point of this rebuild.

import { useState, useMemo, useCallback } from "react";
import {
  CREAM, CREAM_DEEP, BORDER, INK, MUTED, GOLD, GOLD_DEEP, CRIMSON, EMERALD,
  TONE, tone, h2Style, pStyle, eyebrowStyle, labelStyle,
  ScoreDots, CalloutBox, AccordionShell, NextLink, TaskRow, DayCard, BpsCheckpoints,
} from "@/components/paths/shared/primitives";
import { useSyncedTaskMap } from "@/lib/playbook-progress";

/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: "start", label: "🌉 Start Here" },
  { id: "care", label: "🏥 Pick Care Focus" },
  { id: "scouts", label: "🔍 Scout Methods" },
  { id: "days", label: "📅 45 Days" },
  { id: "services", label: "🌉 Bridge Components" },
  { id: "crm", label: "🗂️ Agency CRM" },
  { id: "scripts", label: "💬 Scripts" },
  { id: "toolkit", label: "🧰 Toolkit" },
  { id: "packages", label: "💰 Packages" },
  { id: "faq", label: "❓ FAQ" },
];

const RANKS = [
  {
    "name": "Bridge Recruit",
    "threshold": 0,
    "blurb": "You've just picked up the system. Everyone starts here."
  },
  {
    "name": "Care Scout",
    "threshold": 10,
    "blurb": "You've run real mystery-shop calls and started reading what the data tells you."
  },
  {
    "name": "Systems Prospector",
    "threshold": 23,
    "blurb": "You've tested more than one way of finding agencies — and you have real data on which ones work for you."
  },
  {
    "name": "Bridge Apprentice",
    "threshold": 37,
    "blurb": "You've committed to a personal formula and are running it daily, not guessing week to week."
  },
  {
    "name": "Field Systems Partner",
    "threshold": 51,
    "blurb": "Your formula is producing real conversations, consistently, not just occasionally."
  },
  {
    "name": "Contract Bridge Engineer",
    "threshold": 66,
    "blurb": "You've run the full PROVEN motion to a real close."
  },
  {
    "name": "Certified Care Systems Engineer",
    "threshold": 79,
    "blurb": "45 days, one proven formula, one real result. This one's earned."
  }
];

const DAYS = [
  {
    "day": 1,
    "phase": 1,
    "title": "Learn the System",
    "items": [
      {
        "id": "d1i1",
        "xp": 10,
        "text": "Read the CareBridge system overview — the Rapid-Response Intake gap and why it's the anchor problem."
      },
      {
        "id": "d1i2",
        "xp": 10,
        "text": "Watch the mystery-shop walkthrough video."
      },
      {
        "id": "d1i3",
        "xp": 10,
        "text": "Log today's binary: did you complete the overview? (1/0)"
      }
    ]
  },
  {
    "day": 2,
    "phase": 1,
    "title": "Build Your Demo Foundation",
    "items": [
      {
        "id": "d2i1",
        "xp": 10,
        "text": "Set up your own demo instance of the Rapid-Response Intake System."
      },
      {
        "id": "d2i2",
        "xp": 10,
        "text": "This is self-made proof, not free work for a real prospect — see the no-free-work standard."
      },
      {
        "id": "d2i3",
        "xp": 10,
        "text": "Binary: demo environment created? (1/0)"
      }
    ]
  },
  {
    "day": 3,
    "phase": 1,
    "title": "First Scoring Pass",
    "items": [
      {
        "id": "d3i1",
        "xp": 10,
        "text": "Review the six care-focus options. Pick the one that fits your local market best."
      },
      {
        "id": "d3i2",
        "xp": 10,
        "text": "Note why — which of the five scoring dimensions actually drove your choice."
      }
    ]
  },
  {
    "day": 4,
    "phase": 1,
    "title": "Scout Method 1 — Google Maps Sweep",
    "items": [
      {
        "id": "d4i1",
        "xp": 10,
        "text": "Run a Maps sweep for your chosen focus in your target radius."
      },
      {
        "id": "d4i2",
        "xp": 10,
        "text": "Log 10 agencies with phone numbers and review counts."
      },
      {
        "id": "d4i3",
        "xp": 10,
        "text": "Binary: 10 logged? (1/0)"
      }
    ]
  },
  {
    "day": 5,
    "phase": 1,
    "title": "Scout Method 1, Continued",
    "items": [
      {
        "id": "d5i1",
        "xp": 10,
        "text": "Mystery-shop call 3 agencies from yesterday's list. Time the response."
      },
      {
        "id": "d5i2",
        "xp": 10,
        "text": "Binary: 3 calls completed? (1/0). Note the response-time gap for each."
      }
    ]
  },
  {
    "day": 6,
    "phase": 1,
    "title": "Scout Method 2 — Licensing Directory",
    "items": [
      {
        "id": "d6i1",
        "xp": 10,
        "text": "Search your state/regional licensing directory for the same focus."
      },
      {
        "id": "d6i2",
        "xp": 10,
        "text": "Log 10 more agencies. Compare: did this method surface different, better, or overlapping targets versus Maps?"
      }
    ]
  },
  {
    "day": 7,
    "phase": 1,
    "title": "Week 1 Reflection + Weekly Report",
    "items": [
      {
        "id": "d7i1",
        "xp": 10,
        "text": "Submit your BPS weekly report: which scout method felt most natural, which produced the best data so far?"
      },
      {
        "id": "d7i2",
        "xp": 10,
        "text": "This is a data point for Day 16's Belief Goal — start noticing the pattern now."
      },
      {
        "id": "d7badge",
        "xp": 40,
        "badge": true,
        "emoji": "🔍",
        "text": "Four-Method Sweep — you scouted your first full week across every method this system teaches, not just one."
      }
    ]
  },
  {
    "day": 8,
    "phase": 1,
    "title": "Scout Method 3 — Warm Network",
    "items": [
      {
        "id": "d8i1",
        "xp": 10,
        "text": "List every person you know with any healthcare, eldercare, or social-work connection."
      },
      {
        "id": "d8i2",
        "xp": 10,
        "text": "Send at least 2 messages asking for an introduction."
      },
      {
        "id": "d8i3",
        "xp": 10,
        "text": "Binary: 2 sent? (1/0)"
      }
    ]
  },
  {
    "day": 9,
    "phase": 1,
    "title": "Scout Method 4 — LinkedIn Owner Outreach",
    "items": [
      {
        "id": "d9i1",
        "xp": 10,
        "text": "Search LinkedIn for agency owners in your focus and region."
      },
      {
        "id": "d9i2",
        "xp": 10,
        "text": "Send 5 specific, non-templated messages referencing something real about their agency."
      }
    ]
  },
  {
    "day": 10,
    "phase": 1,
    "title": "Mystery-Shop Round 2",
    "items": [
      {
        "id": "d10i1",
        "xp": 10,
        "text": "Call 5 more agencies across your combined lists."
      },
      {
        "id": "d10i2",
        "xp": 10,
        "text": "Score each Hot/Warm/Cold based on the response-time gap."
      }
    ]
  },
  {
    "day": 11,
    "phase": 1,
    "title": "Data Check-In",
    "items": [
      {
        "id": "d11i1",
        "xp": 10,
        "text": "Tally results so far by scout method: which produced the most Hot/Warm scores?"
      },
      {
        "id": "d11i2",
        "xp": 10,
        "text": "This is the evidence Day 16 will ask you to commit against."
      }
    ]
  },
  {
    "day": 12,
    "phase": 1,
    "title": "Practice the PROVEN Opening",
    "items": [
      {
        "id": "d12i1",
        "xp": 15,
        "text": "Record yourself delivering the Prove + Reveal steps for a Hot-scored agency — self-directed practice, not a real call yet."
      }
    ]
  },
  {
    "day": 13,
    "phase": 1,
    "title": "Offer-the-Demo Practice",
    "items": [
      {
        "id": "d13i1",
        "xp": 15,
        "text": "Run through demoing your system on your own demo instance, timed, until it's smooth."
      }
    ]
  },
  {
    "day": 14,
    "phase": 1,
    "title": "Finalize Your Target List",
    "items": [
      {
        "id": "d14i1",
        "xp": 15,
        "text": "Narrow to your top 8 Hot/Warm agencies across all four scout methods."
      }
    ]
  },
  {
    "day": 15,
    "phase": 1,
    "title": "Phase 1 Close — Rank Check",
    "items": [
      {
        "id": "d15i1",
        "xp": 10,
        "text": "Submit your weekly report with full Phase 1 data: which method(s) actually worked for you."
      },
      {
        "id": "d15i2",
        "xp": 10,
        "text": "Rank should read Care Scout or Systems Prospector by tonight, based on cumulative XP."
      },
      {
        "id": "d15badge",
        "xp": 50,
        "badge": true,
        "emoji": "📋",
        "text": "Foundation Built — demo live, target list ready, Phase 1 closed."
      }
    ]
  },
  {
    "day": 16,
    "phase": 2,
    "title": "Belief Goal — Commit to Your Formula",
    "bpsCheckpoint": true,
    "items": [
      {
        "id": "d16i1",
        "xp": 15,
        "text": "Submit your Belief Goal: your personal prospecting formula, named and specific — e.g., '70% licensing directory, 30% warm referral, mystery-shop within 24 hours of logging.'"
      },
      {
        "id": "d16i2",
        "xp": 15,
        "text": "Set up daily binary tracking for this formula specifically."
      },
      {
        "id": "d16badge",
        "xp": 40,
        "badge": true,
        "emoji": "🎯",
        "text": "Formula Committed — you named your own prospecting formula instead of guessing week to week."
      }
    ]
  },
  {
    "day": 17,
    "phase": 2,
    "title": "Run Your Formula, Day 1",
    "items": [
      {
        "id": "d17i1",
        "xp": 15,
        "text": "Execute today's formula-driven outreach. Binary: done? (1/0)"
      }
    ]
  },
  {
    "day": 18,
    "phase": 2,
    "title": "Run Your Formula, Day 2",
    "items": [
      {
        "id": "d18i1",
        "xp": 15,
        "text": "Same as yesterday — consistency is the actual test here, not novelty."
      }
    ]
  },
  {
    "day": 19,
    "phase": 2,
    "title": "First Real PROVEN Attempt",
    "items": [
      {
        "id": "d19i1",
        "xp": 15,
        "text": "Take your top Hot prospect through Prove → Reveal for real."
      },
      {
        "id": "d19i2",
        "xp": 15,
        "text": "This is a real prospect, real call — proof this isn't practice anymore."
      }
    ]
  },
  {
    "day": 20,
    "phase": 2,
    "title": "Run Your Formula, Day 3",
    "items": [
      {
        "id": "d20i1",
        "xp": 15,
        "text": "Continue daily formula execution."
      }
    ]
  },
  {
    "day": 21,
    "phase": 2,
    "title": "Week 3 Report",
    "items": [
      {
        "id": "d21i1",
        "xp": 15,
        "text": "Submit weekly report — formula adherence rate so far, and one honest note on what's not working yet."
      }
    ]
  },
  {
    "day": 22,
    "phase": 2,
    "title": "Offer + Verify, Real Prospect",
    "items": [
      {
        "id": "d22i1",
        "xp": 30,
        "text": "Run the demo for a real prospect. Present the trial offer — guarantee-backed for cold, genuinely free only if warm-referred."
      },
      {
        "id": "d22badge",
        "xp": 60,
        "badge": true,
        "emoji": "🌉",
        "text": "First Bridge Offered — you took a real agency through the full PROVEN motion and put a real trial in front of them."
      }
    ]
  },
  {
    "day": 23,
    "phase": 2,
    "title": "Run Your Formula, Day 4",
    "items": [
      {
        "id": "d23i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 24,
    "phase": 2,
    "title": "Run Your Formula, Day 5",
    "items": [
      {
        "id": "d24i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 25,
    "phase": 2,
    "title": "Second Prospect Pipeline",
    "items": [
      {
        "id": "d25i1",
        "xp": 25,
        "text": "Open PROVEN with a second Hot/Warm target in parallel — don't let the pipeline depend on one deal."
      }
    ]
  },
  {
    "day": 26,
    "phase": 2,
    "title": "Run Your Formula, Day 6",
    "items": [
      {
        "id": "d26i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 27,
    "phase": 2,
    "title": "Run Your Formula, Day 7",
    "items": [
      {
        "id": "d27i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 28,
    "phase": 2,
    "title": "Week 4 Report",
    "items": [
      {
        "id": "d28i1",
        "xp": 15,
        "text": "Submit weekly report. Rank check — Bridge Apprentice or Field Systems Partner territory."
      }
    ]
  },
  {
    "day": 29,
    "phase": 2,
    "title": "Pre-Affirmation Review",
    "items": [
      {
        "id": "d29i1",
        "xp": 15,
        "text": "Review your own binary tracking honestly before tomorrow's real score — no surprises, no self-narrative."
      }
    ]
  },
  {
    "day": 30,
    "phase": 2,
    "title": "Affirmation Goal",
    "bpsCheckpoint": true,
    "items": [
      {
        "id": "d30i1",
        "xp": 20,
        "text": "Score your 14-day formula effort. Percentage + the exact required remark language — no substitutions."
      },
      {
        "id": "d30i2",
        "xp": 20,
        "text": "If below 72%: this is a support conversation with your Rep, not a penalty. Adjust the formula, don't abandon the arc."
      },
      {
        "id": "d30badge",
        "xp": 50,
        "badge": true,
        "emoji": "📊",
        "text": "Midpoint Scored — 14 days of honest formula data, scored and submitted."
      }
    ]
  },
  {
    "day": 31,
    "phase": 3,
    "title": "Refine the Formula",
    "items": [
      {
        "id": "d31i1",
        "xp": 25,
        "text": "Adjust your formula based on Affirmation feedback. Note explicitly what's changing and why."
      }
    ]
  },
  {
    "day": 32,
    "phase": 3,
    "title": "Run Refined Formula, Day 1",
    "items": [
      {
        "id": "d32i1",
        "xp": 15,
        "text": "Execute the adjusted formula."
      }
    ]
  },
  {
    "day": 33,
    "phase": 3,
    "title": "Run Refined Formula, Day 2",
    "items": [
      {
        "id": "d33i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 34,
    "phase": 3,
    "title": "Push Toward Close — Prospect 1",
    "items": [
      {
        "id": "d34i1",
        "xp": 30,
        "text": "Move your lead prospect through Expand — present trial results, anchor the retainer price to the specific number."
      }
    ]
  },
  {
    "day": 35,
    "phase": 3,
    "title": "Week 5 Report",
    "items": [
      {
        "id": "d35i1",
        "xp": 15,
        "text": "Submit weekly report."
      }
    ]
  },
  {
    "day": 36,
    "phase": 3,
    "title": "Run Refined Formula, Day 3",
    "items": [
      {
        "id": "d36i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 37,
    "phase": 3,
    "title": "Push Toward Close — Prospect 2",
    "items": [
      {
        "id": "d37i1",
        "xp": 30,
        "text": "Advance your second pipeline prospect in parallel."
      }
    ]
  },
  {
    "day": 38,
    "phase": 3,
    "title": "Run Refined Formula, Day 4",
    "items": [
      {
        "id": "d38i1",
        "xp": 15,
        "text": "Continue."
      }
    ]
  },
  {
    "day": 39,
    "phase": 3,
    "title": "Network — Referral Practice",
    "items": [
      {
        "id": "d39i1",
        "xp": 15,
        "text": "Draft your referral ask for whichever prospect is closest to closing."
      }
    ]
  },
  {
    "day": 40,
    "phase": 3,
    "title": "Real Close Attempt",
    "items": [
      {
        "id": "d40i1",
        "xp": 40,
        "text": "Run the full PROVEN motion to an actual close on your lead prospect."
      },
      {
        "id": "d40badge",
        "xp": 70,
        "badge": true,
        "emoji": "🤝",
        "text": "Real Close Attempt — you ran the full PROVEN motion to an actual close."
      }
    ]
  },
  {
    "day": 41,
    "phase": 3,
    "title": "Week 6 Report",
    "items": [
      {
        "id": "d41i1",
        "xp": 15,
        "text": "Submit weekly report. Rank check — Contract Bridge Engineer territory if a close landed."
      }
    ]
  },
  {
    "day": 42,
    "phase": 3,
    "title": "Network, For Real",
    "items": [
      {
        "id": "d42i1",
        "xp": 25,
        "text": "Ask your closed (or closest) client for a referral. Log the response."
      }
    ]
  },
  {
    "day": 43,
    "phase": 3,
    "title": "Document Your Formula",
    "items": [
      {
        "id": "d43i1",
        "xp": 15,
        "text": "Write down your final personal formula in full — this becomes part of Day 45's reflection."
      }
    ]
  },
  {
    "day": 44,
    "phase": 3,
    "title": "Final Push",
    "items": [
      {
        "id": "d44i1",
        "xp": 25,
        "text": "Close whatever's still open. If nothing's closed yet, this is the day to push hardest, not to panic."
      }
    ]
  },
  {
    "day": 45,
    "phase": 3,
    "title": "Evaluation Goal + Reflection",
    "bpsCheckpoint": true,
    "items": [
      {
        "id": "d45i1",
        "xp": 25,
        "text": "Submit your 40-day Evaluation Goal — full percentage and required remark language."
      },
      {
        "id": "d45i2",
        "xp": 25,
        "text": "The system assembles your reflection: every scout method you tried, the formula you built, your first real result, and what it means for the DFY period ahead."
      },
      {
        "id": "d45badge",
        "xp": 100,
        "badge": true,
        "emoji": "🏆",
        "text": "Certified — you completed the full 45-day CareBridge system."
      }
    ]
  }
];

const PHASE_META = {
  "1": {
    "name": "Phase 01 — Discover",
    "range": "Days 1–15",
    "rank": "Care Scout → Systems Prospector",
    "scorecard": "By end of Day 15: demo of the Rapid-Response Intake system live · at least 25 agencies scouted across all four methods · 8+ Hot/Warm targets shortlisted."
  },
  "2": {
    "name": "Phase 02 — Personalize",
    "range": "Days 16–30",
    "rank": "Bridge Apprentice → Field Systems Partner",
    "scorecard": "By end of Day 30: a personal prospecting formula committed and run for 14 straight days · at least one real PROVEN attempt on a live agency · Affirmation Goal scored and submitted."
  },
  "3": {
    "name": "Phase 03 — Master",
    "range": "Days 31–45",
    "rank": "Contract Bridge Engineer → Certified Care Systems Engineer",
    "scorecard": "By end of Day 45: at least one real trial offered and pushed toward a close · Evaluation Goal scored and submitted · your own formula documented for the DFY period ahead."
  }
};

const BPS_CHECKPOINTS = [
  {
    "day": 16,
    "type": "Belief Goal",
    "detail": "Commit to your personal prospecting formula — a specific, weighted combination of the methods from Phase 1, chosen from your own logged data, not a guess."
  },
  {
    "day": 30,
    "type": "Affirmation Goal",
    "detail": "A 14-day honest effort report on your formula. Strict remark bands apply: 72%+ 'Effort is satisfactory, goal set to be achieved.' 60-71% 'Effort is minimal, goal not taken seriously.' Below 60% 'Effort is below requisite, failure of goal is imminent.'"
  },
  {
    "day": 45,
    "type": "Evaluation Goal",
    "detail": "The full 40-day evaluation from Belief Goal submission. 75%+ 'My effort is satisfactory, goal set will be achieved.' 60-74% 'My effort has been minimal, this goal may not be achieved.' Below 60% 'My effort has been poor, the goal is unmet.'"
  }
];

const CARE_FOCUS = [
  {
    "icon": "🏠",
    "name": "Home Care Agencies",
    "responseGap": 5,
    "budgetFit": 4,
    "decisionSpeed": 5,
    "competition": 2,
    "durability": 4,
    "why": "The most numerous and accessible type — small, locally owned, decision-maker usually reachable directly, and the highest volume of crisis-moment new inquiries.",
    "find": "Local business directories, Google Maps search 'home care agency,' independently-owned franchise territories of national brands."
  },
  {
    "icon": "🏢",
    "name": "Assisted Living Facilities",
    "responseGap": 4,
    "budgetFit": 4,
    "decisionSpeed": 3,
    "competition": 3,
    "durability": 5,
    "why": "Larger budgets than solo home care agencies, with an ongoing need for both fast intake response and regular family communication since residents live on-site.",
    "find": "State assisted living facility directories (most regions require licensing, making these searchable), local senior resource guides."
  },
  {
    "icon": "🧠",
    "name": "Memory Care / Dementia Care Facilities",
    "responseGap": 5,
    "budgetFit": 4,
    "decisionSpeed": 3,
    "competition": 2,
    "durability": 5,
    "why": "Families here are under exceptional emotional strain, making warm, fast communication even more valued and differentiating than in general elder care.",
    "find": "Alzheimer's Association local chapter resource lists, specialized memory care facility directories."
  },
  {
    "icon": "🕊️",
    "name": "Hospice & End-of-Life Care Organizations",
    "responseGap": 4,
    "budgetFit": 3,
    "decisionSpeed": 3,
    "competition": 2,
    "durability": 5,
    "why": "Communication with families is the core of the service itself, not an add-on — this vertical values thoughtful family communication more than almost any other.",
    "find": "National hospice and palliative care association member directories, local hospice referral networks."
  },
  {
    "icon": "♿",
    "name": "Disability Support Services",
    "responseGap": 4,
    "budgetFit": 3,
    "decisionSpeed": 4,
    "competition": 2,
    "durability": 4,
    "why": "The same crisis-driven intake dynamic as elder care — families searching urgently for the right fit for a loved one's specific needs.",
    "find": "Local disability services directories, state-funded care provider networks."
  },
  {
    "icon": "👶",
    "name": "Adult Day Care Centers",
    "responseGap": 3,
    "budgetFit": 2,
    "decisionSpeed": 4,
    "competition": 1,
    "durability": 3,
    "why": "Smaller and often overlooked by agencies, but genuinely underserved with straightforward operational needs — intake, family updates, and scheduling.",
    "find": "Senior center partnership listings, local Area Agency on Aging directories."
  }
];

const SCORE_LABELS = [
  { key: "responseGap", label: "Response Gap" },
  { key: "budgetFit", label: "Budget Fit" },
  { key: "decisionSpeed", label: "Decision Speed" },
  { key: "competition", label: "Low Competition" },
  { key: "durability", label: "Durability" },
];

const SCOUT_METHODS = [
  {
    "name": "Google Maps Sweep",
    "detail": "Search the niche + your target radius, log every result with a phone number, prioritize by review count (more reviews = more inquiry volume = the gap matters more)."
  },
  {
    "name": "Licensing Directory Search",
    "detail": "State/regional licensing boards publish licensed-provider lists — often more complete than Maps, and signals real, compliant operators."
  },
  {
    "name": "Warm Healthcare-Network Referral",
    "detail": "Ask anyone you know in healthcare, eldercare, or social work — a single warm introduction here changes the Verify step entirely (a genuinely free pilot applies)."
  },
  {
    "name": "LinkedIn Owner Outreach",
    "detail": "Search your chosen focus + 'owner' + region; a direct, short message referencing something specific about their agency outperforms a cold call for this channel specifically."
  }
];

const PROVEN_FRAMEWORK = [
  {
    "letter": "P",
    "word": "Prove",
    "detail": "The mystery-shop call. Real, timed data on their actual response time — not an assumption, a fact."
  },
  {
    "letter": "R",
    "word": "Reveal",
    "detail": "Present what you found, plainly. The gap does the persuading; you don't need to oversell it."
  },
  {
    "letter": "O",
    "word": "Offer the Demo",
    "detail": "Show them what the system looks like running — a live demo beats a description every time."
  },
  {
    "letter": "V",
    "word": "Verify (De-risk)",
    "detail": "For a cold, researched agency: a small, guarantee-backed trial, not a free pilot. For a warm referral: a genuinely free pilot is fine — trust already exists."
  },
  {
    "letter": "E",
    "word": "Expand (Grow)",
    "detail": "Pilot results, presented with the specific before/after number, anchor the retainer price directly."
  },
  {
    "letter": "N",
    "word": "Network (Referral)",
    "detail": "Ask for the introduction. This is also where your next warm lead usually comes from."
  }
];

const BRIDGE_COMPONENTS = [
  {
    "icon": "🚨",
    "color": "#EC4899",
    "name": "Rapid-Response Intake System",
    "price": "$100-175/month",
    "signal": "Agency takes an hour or more to respond to new inquiries, no automated acknowledgment exists, families report frustration reaching them.",
    "pitch": "When a family calls you in the middle of a care crisis, how fast do you actually get back to them? I tested this myself — [X hours]. Families are calling 3-4 agencies within the same hour, and the first one to respond clearly and quickly usually wins the client. I can build a system that acknowledges every inquiry within minutes and alerts your team instantly, so you never lose a family to slower response time again.",
    "setup": "Google Form or website form → Zapier or Make automation → instant SMS/email acknowledgment to the family + instant alert to staff phone → Sheet log for follow-up tracking.",
    "upsell": "Now that new inquiries are being caught instantly, the next thing families ask for once they're a client is regular updates — want me to set that up too?"
  },
  {
    "icon": "💌",
    "color": "#6366F1",
    "name": "Family Update Portal",
    "price": "$100-200/month",
    "signal": "No systematic way for families to receive updates, families calling in constantly for status checks, staff time consumed by repetitive update calls.",
    "pitch": "Right now, how do families find out how their loved one is doing day to day? If it's only through them calling in, that's time your staff could spend on actual care. I can set up automated weekly update messages — a simple, warm summary sent directly to family members — so they feel reassured without needing to call, and your staff gets that time back.",
    "setup": "Klaviyo or similar email/SMS tool → automated periodic update template → staff fills in brief notes → system sends personalized update to the family contact list.",
    "upsell": "With families feeling well-informed, the next gap I noticed is how your staff schedule gets communicated internally — want me to look at that too?"
  },
  {
    "icon": "📅",
    "color": "#F59E0B",
    "name": "Staff Scheduling & Shift Communication",
    "price": "$100-200/month",
    "signal": "Scheduling done manually by phone, missed shifts due to poor communication, no automated reminder system.",
    "pitch": "How much time does scheduling and confirming shifts take every week right now? I can set up a simple system that sends automatic shift reminders to your caregivers, reduces missed shifts, and gives you a clear view of coverage at a glance.",
    "setup": "Google Sheets schedule → Zapier or Make automation → automated SMS reminder 24 hours and 2 hours before each shift → confirmation tracking.",
    "upsell": "Now that scheduling runs smoothly, the last piece is making sure happy families actually tell others about you — want me to set up a referral system?"
  },
  {
    "icon": "🌟",
    "color": "#10B981",
    "name": "Referral & Testimonial System",
    "price": "$100-175/month",
    "signal": "No systematic way to collect family testimonials or generate referrals, relying purely on unstructured word of mouth.",
    "pitch": "Families who've had a genuinely good experience with your care are your most powerful marketing asset, but right now nothing is capturing that. I can set up an automated system that reaches out to families after a positive milestone, asks for a quick testimonial or review, and makes it easy for them to refer other families going through the same situation.",
    "setup": "Trigger after a care milestone → automated testimonial or review request → referral ask built into the same message.",
    "upsell": "This is typically the final piece — from here, the conversation naturally shifts to whether other agencies in your network might want the same system."
  }
];

const NOTION_COLS = [
  {
    "name": "Agency Name",
    "type": "Title",
    "icon": "🏥",
    "desc": "The home care agency or facility's name"
  },
  {
    "name": "Agency Type",
    "type": "Select",
    "icon": "🏷️",
    "desc": "Home Care / Assisted Living / Memory Care / Hospice / Disability Support / Adult Day Care"
  },
  {
    "name": "Location",
    "type": "Text",
    "icon": "📍",
    "desc": "City or region the agency serves"
  },
  {
    "name": "Owner / Administrator",
    "type": "Text",
    "icon": "👤",
    "desc": "The decision-maker's name"
  },
  {
    "name": "Contact Method",
    "type": "Select",
    "icon": "📱",
    "desc": "Phone / Email / In-Person / LinkedIn"
  },
  {
    "name": "Audited Response Time",
    "type": "Text",
    "icon": "⏱️",
    "desc": "What you found when you mystery-shopped a real inquiry"
  },
  {
    "name": "Current Communication",
    "type": "Select",
    "icon": "💬",
    "desc": "Phone only / Basic email / No system / Existing software"
  },
  {
    "name": "Agency Size",
    "type": "Select",
    "icon": "📏",
    "desc": "Small (1 location) / Medium (multiple locations) / Large (regional chain)"
  },
  {
    "name": "Biggest Pain Point",
    "type": "Select",
    "icon": "⚠️",
    "desc": "Slow Inquiry Response / No Family Updates / Staff Scheduling Chaos / No Referral System"
  },
  {
    "name": "Relationship Stage",
    "type": "Select",
    "icon": "📊",
    "desc": "Identified → Audited → Approached → Meeting Booked → Trial Proposed → Trial Running → Trial Proven → Closed → Retainer"
  },
  {
    "name": "Package Tier",
    "type": "Select",
    "icon": "💰",
    "desc": "Foundation / Growth / Full Care System"
  },
  {
    "name": "Monthly Retainer",
    "type": "Number",
    "icon": "💵",
    "desc": "Agreed monthly amount, once closed"
  },
  {
    "name": "Trial Start Date",
    "type": "Date",
    "icon": "📅",
    "desc": "When the pilot or guarantee-backed trial began"
  },
  {
    "name": "Trial Results",
    "type": "Text",
    "icon": "📈",
    "desc": "Response time before/after, and any new clients won during the trial"
  },
  {
    "name": "Testimonial Quote",
    "type": "Text",
    "icon": "🗣️",
    "desc": "The owner or administrator's exact words after the trial"
  },
  {
    "name": "Next Action",
    "type": "Text",
    "icon": "➡️",
    "desc": "What needs to happen next with this agency"
  },
  {
    "name": "Next Action Date",
    "type": "Date",
    "icon": "⏰",
    "desc": "When the next action is due"
  },
  {
    "name": "Notes",
    "type": "Text",
    "icon": "📝",
    "desc": "Anything else relevant — conversation history, family stories, context"
  }
];

const NOTION_VIEWS = [
  {
    "name": "🏥 All Agencies",
    "desc": "Master table — every agency you've identified and audited."
  },
  {
    "name": "🔥 Hot Prospects",
    "desc": "Filter: audited response time is slow and the gap is clear. Your highest-converting targets."
  },
  {
    "name": "🔬 Active Trials",
    "desc": "Filter: Stage = Trial Proposed or Trial Running. What you're currently proving out."
  },
  {
    "name": "💰 Active Retainers",
    "desc": "Filter: Stage = Retainer. Your recurring revenue base and referral source list."
  },
  {
    "name": "📊 Pipeline Board",
    "desc": "Kanban grouped by Relationship Stage — drag agencies through as they progress."
  }
];

const SCRIPTS = [
  {
    "id": "intro",
    "tag": "Warm Approach · Introducing Yourself",
    "color": "#EC4899",
    "title": "Introducing Yourself to an Agency",
    "note": "Lead with real data from your mystery-shop audit, not a generic pitch. It shows you've already done the work.",
    "body": "Hi, I'm [Name] — I help home care agencies make sure they never lose a family to slow response time. I actually called in as a mystery inquiry last week and noticed it took [X time] to hear back. I know how competitive it is out there when families are calling multiple agencies at once. I'd love to show you a simple system that could fix that — would you have 10 minutes this week?"
  },
  {
    "id": "trial",
    "tag": "The Guarantee-Backed Trial Offer",
    "color": "#10B981",
    "title": "Presenting the Trial (Cold Prospect)",
    "note": "Small and guarantee-backed, not free — free work for a cold, researched prospect trains them to expect free work. A genuinely free pilot is reserved for warm referrals only (see the intro-referral variant below).",
    "body": "Here's what I'd propose — a two-week trial of the rapid-response system on your next set of new inquiries, at [small trial price]. If your response time doesn't visibly improve, I'll refund it in full, no questions asked. That way you're only paying for something that's already working. Does that sound fair?"
  },
  {
    "id": "trial-warm",
    "tag": "The Trial Offer (Warm Referral)",
    "color": "#14B8A6",
    "title": "Presenting the Trial (Warm Referral Only)",
    "note": "Use this variant only when real, pre-existing trust already exists — an actual referral, not a cold contact you're calling warm.",
    "body": "Since [referrer name] connected us, let me just set this up for your next 5 new inquiries, completely free, no commitment. If it genuinely helps you respond faster, we can talk about making it permanent. If not, no harm done."
  },
  {
    "id": "obj1",
    "tag": "Objection · Already Have Software",
    "color": "#8B5CF6",
    "title": "Objection: \"We Already Have a System\"",
    "note": "Most care software handles scheduling and documentation, rarely instant family communication specifically.",
    "body": "That's great — having something in place already means we're not starting from zero. A lot of agencies have a system but it's either underused or not built around speed specifically. Would you mind if I took a quick look at how it currently handles a new inquiry? If it's already fast and clear, I'll tell you honestly. If there's a gap, I can show you exactly where."
  },
  {
    "id": "obj2",
    "tag": "Objection · No Budget",
    "color": "#F59E0B",
    "title": "Objection: \"We Don't Have Budget for This\"",
    "note": "The guarantee is what removes this objection, not a free giveaway — reference the refund, not \"no cost.\"",
    "body": "Completely understand — that's exactly why the trial is guarantee-backed. If your response time doesn't visibly improve, you get every cent back. The only real risk is a few minutes of setup time on your end. Want to see it in action first?"
  },
  {
    "id": "results",
    "tag": "Presenting Trial Results",
    "color": "#14B8A6",
    "title": "Presenting Trial Results",
    "note": "Lead with the specific before/after number — it does more persuading than any pitch.",
    "body": "Here's what happened over the trial — average response time went from [X] to [Y], and [specific outcome, e.g. you converted 4 out of 5 trial inquiries into new clients]. I think this is worth making a permanent part of how you operate — want to talk about what that looks like going forward?"
  },
  {
    "id": "convert",
    "tag": "Converting Trial to Retainer",
    "color": "#6366F1",
    "title": "Converting the Trial to a Paid Retainer",
    "note": "Anchor the price directly to the trial result they just witnessed.",
    "body": "Based on the trial results, I'd suggest starting with the [tier name] package at $[price] a month — that covers [specific components]. This keeps the system running exactly as it did during the trial, plus [additional benefit of the paid tier]."
  },
  {
    "id": "referral",
    "tag": "Growth · Referral Ask",
    "color": "#EC4899",
    "title": "Asking for a Referral",
    "note": "Agency owners in this space often know each other through local senior-care networks and referral partnerships.",
    "body": "I'm really glad this has made a difference for [agency name]. Do you know any other home care agencies or assisted living facilities who might be dealing with the same response-time challenge? I'd love an introduction — happy to run the same trial for them."
  }
];

const TOOLKIT = [
  {
    "need": "Agency CRM / pipeline tracker",
    "paid": "Notion paid tier, Airtable — $10-24/mo",
    "free": "Notion free plan",
    "manual": "A plain Google Sheet with the same 18 columns works fully — update it by hand after every call."
  },
  {
    "need": "Intake automation",
    "paid": "Zapier or Make paid tier — $20-30/mo",
    "free": "Zapier or Make free tier (limited monthly tasks, enough for one demo agency)",
    "manual": "Google Form -> Google Sheet, checked manually a few times a day until volume justifies automating."
  },
  {
    "need": "Family update messaging",
    "paid": "Klaviyo paid tier, Twilio — $20-50/mo",
    "free": "Klaviyo free tier (limited contacts, enough for a demo)",
    "manual": "A templated email or text sent by hand on a fixed weekly schedule."
  },
  {
    "need": "Shift scheduling & reminders",
    "paid": "When I Work, Deputy — $20-40/mo",
    "free": "Google Sheets + Zapier/Make free tier",
    "manual": "A shared Google Sheet schedule with manual reminder texts the day before each shift."
  },
  {
    "need": "Loom walkthroughs & case study",
    "paid": "Loom Business",
    "free": "Loom free tier, or your phone camera",
    "manual": "Record on your phone, trim with a free video editor app, embed the file link in your case study doc."
  },
  {
    "need": "Mystery-shop call log",
    "paid": "Otter.ai paid, Gong",
    "free": "Otter.ai free tier (limited minutes)",
    "manual": "Time the call on your phone's stopwatch and log the result by hand — the number is what matters, not the recording."
  }
];

const PACKAGES = [
  {
    "name": "Foundation",
    "icon": "🌱",
    "color": "#10B981",
    "price": "$100-200/month",
    "includes": [
      "Rapid-Response Intake System only",
      "Monthly response-time report"
    ],
    "bestFor": "Small agencies wanting to fix their single biggest gap first"
  },
  {
    "name": "Growth",
    "icon": "⚡",
    "color": "#6366F1",
    "price": "$250-450/month",
    "includes": [
      "Rapid-Response Intake System",
      "Family Update Portal",
      "Monthly performance report"
    ],
    "bestFor": "Growing agencies wanting to reduce staff workload and reassure families"
  },
  {
    "name": "Full Care System",
    "icon": "🏆",
    "color": "#EC4899",
    "price": "$500-850/month",
    "includes": [
      "Everything in Growth",
      "Staff Scheduling & Shift Communication",
      "Referral & Testimonial System",
      "Quarterly strategy check-in"
    ],
    "bestFor": "Established agencies wanting a complete operational and growth partner"
  }
];

const ANNUAL_VALUE = [
  { t: "Foundation only", v: "$1,200–$2,400/year" },
  { t: "Growth tier", v: "$3,000–$5,400/year" },
  { t: "Full Care System", v: "$6,000–$10,200/year" },
];

const FAQS = [
  {
    "q": "What if I don't have any personal connection to elder care?",
    "a": "You don't need direct experience to build genuine empathy here — nearly everyone has a family story somewhere close to this. Spend time understanding a real family's experience searching for care before your first outreach; that understanding will come through in how you pitch."
  },
  {
    "q": "How do I audit an agency's response time without seeming intrusive?",
    "a": "This is simply a mystery-shopper approach — call or message as a genuine potential inquiry, note how long it takes to hear back, and use that real data respectfully in your pitch. This is standard, ethical market research, not intrusive."
  },
  {
    "q": "What if the agency already uses expensive care management software?",
    "a": "Most care management software handles scheduling and documentation, not necessarily instant family communication or rapid inquiry response. Ask what's currently automated versus manual — there's almost always a real gap even with existing software in place."
  },
  {
    "q": "Is this appropriate to pitch given how emotionally sensitive this space is?",
    "a": "Yes, as long as your tone matches the stakes. You're not selling a marketing gimmick — you're helping agencies respond to families in genuine need faster and more warmly. Lead with empathy in every conversation, not urgency or pressure."
  },
  {
    "q": "What if a family shares sensitive medical information — do I need to worry about privacy or compliance?",
    "a": "Keep all systems focused on logistics and communication — appointment times, response acknowledgments, general updates — not detailed medical records. If an agency wants to go further into care documentation, that's a conversation for a specialized healthcare compliance tool, not something to build yourself without proper guidance."
  },
  {
    "q": "How do I find agencies to approach if I don't live near many of them?",
    "a": "Start with whatever city or region you do have some connection to, even loosely. This system scales well to any city with an aging population, which is virtually everywhere — you are not limited to your immediate neighborhood."
  },
  {
    "q": "What if the trial doesn't show a clear win?",
    "a": "Use it as real data regardless. If response time didn't improve much, look at where the bottleneck actually was — sometimes it's staff follow-through, not the system itself. Refine and offer a second trial period before concluding it isn't a fit."
  },
  {
    "q": "Can this work for other care-adjacent businesses, like disability care or childcare?",
    "a": "Yes, the same core problem — families in a moment of need who reward whoever responds first and clearest — applies to disability care providers, childcare centers, and similar care-based small businesses."
  }
];
/* ---------------------------------------------------------------------- */
/* TABS                                                                    */
/* ---------------------------------------------------------------------- */

function StartTab() {
  return (
    <div>
      <h2 style={h2Style}>How This System Works</h2>
      <p style={pStyle}>
        CareBridge is a 45-day system for building recurring communication infrastructure inside home-care,
        assisted-living, and hospice agencies — starting from a free demo you build yourself, through scouted
        outreach, a real trial, and a converted retainer.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {[1, 2, 3].map((p) => {
          const meta = PHASE_META[p];
          return (
            <div key={p} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px 16px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <p style={{ fontWeight: 700, fontSize: 13.5, color: INK, margin: 0 }}>{meta.name}</p>
                <p style={{ fontSize: 11, color: GOLD_DEEP, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>{meta.range}</p>
              </div>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{meta.scorecard}</p>
            </div>
          );
        })}
      </div>

      <CalloutBox toneKey="good" eyebrow="🌉 Why this market, specifically">
        Families searching for elder care are in crisis, not casually browsing — that changes the entire emotional
        register of this pitch. Nearly every student has some personal connection to this world through their own
        extended family, giving CareBridge the same warm-network advantage as Digital Ministry Systems, in a market
        virtually no professional digital agency bothers to serve.
      </CalloutBox>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
        <p style={{ ...eyebrowStyle, color: GOLD_DEEP }}>How to run this system</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: MUTED, lineHeight: 1.8 }}>
          <li>Read <strong style={{ color: INK }}>Pick Care Focus</strong> and lock a specialization before Day 3.</li>
          <li>Learn <strong style={{ color: INK }}>Scout Methods</strong> in the first week — they feed every outreach day after.</li>
          <li>Work <strong style={{ color: INK }}>45 Days</strong> in order, checking off tasks as you go — your rank climbs automatically.</li>
          <li>Read <strong style={{ color: INK }}>Bridge Components</strong> and <strong style={{ color: INK }}>Scripts</strong> before your first real approach.</li>
        </ol>
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>BPS checkpoints inside the 45 days</p>
      <BpsCheckpoints checkpoints={BPS_CHECKPOINTS} />
    </div>
  );
}

function CareTab() {
  const [openCare, setOpenCare] = useState(null);
  return (
    <div>
      <h2 style={h2Style}>Pick Your Care Focus</h2>
      <p style={pStyle}>Six care types, graded honestly on the same five factors. Pick one before Day 3 — your case study, scripts, and outreach all get sharper the more agencies you sign in the same category.</p>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Care Focus</th>
              {SCORE_LABELS.map((s) => (
                <th key={s.key} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED, whiteSpace: "nowrap" }}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CARE_FOCUS.map((n) => (
              <tr key={n.name} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{n.icon} {n.name}</td>
                {SCORE_LABELS.map((s) => (
                  <td key={s.key} style={{ padding: "10px" }}><ScoreDots value={n[s.key]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CARE_FOCUS.map((n) => {
          const open = openCare === n.name;
          return (
            <AccordionShell key={n.name} isOpen={open} onToggle={() => setOpenCare(open ? null : n.name)}
              header={
                <span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: INK, display: "block" }}>{n.icon} {n.name}</span>
                </span>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 12 }}>
                <div>
                  <p style={labelStyle}>Why this works</p>
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{n.why}</p>
                </div>
                <div>
                  <p style={labelStyle}>Where to find them</p>
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{n.find}</p>
                </div>
              </div>
            </AccordionShell>
          );
        })}
      </div>
    </div>
  );
}

function ScoutTab() {
  return (
    <div>
      <h2 style={h2Style}>Scout Methods</h2>
      <p style={pStyle}>Four ways to build a real, tiered agency list before you ever pick up the phone — the engine behind every outreach day in the 45-Day Plan.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {SCOUT_METHODS.map((m) => (
          <div key={m.name} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: "0 0 6px" }}>{m.name}</p>
            <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{m.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DaysTab({ checked, onToggle }) {
  const [expandedDay, setExpandedDay] = useState(1);
  const phases = [1, 2, 3];
  return (
    <div>
      <h2 style={h2Style}>The 45-Day Plan</h2>
      <p style={pStyle}>Every day builds on the last. Days marked ★ carry a BPS checkpoint — check off each task as you go, and your rank updates automatically.</p>

      {phases.map((p) => {
        const meta = PHASE_META[p];
        const daysInPhase = DAYS.filter((d) => d.phase === p);
        return (
          <div key={p} style={{ marginBottom: 22 }}>
            <div style={{ background: "rgba(201,154,59,0.08)", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "12px 15px", marginBottom: 10 }}>
              <p style={{ fontWeight: 800, fontSize: 13.5, color: GOLD_DEEP, margin: "0 0 2px" }}>{meta.name}</p>
              <p style={{ fontSize: 11, color: MUTED, textTransform: "", letterSpacing: "0.06em", margin: "0 0 8px" }}>{meta.range} · {meta.rank}</p>
              <p style={{ fontSize: 12, color: INK, lineHeight: 1.6, margin: 0 }}>{meta.scorecard}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {daysInPhase.map((d) => (
                <DayCard key={d.day} dayData={d} checked={checked} onToggle={onToggle}
                  expanded={expandedDay === d.day} onExpand={() => setExpandedDay(expandedDay === d.day ? null : d.day)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServicesTab() {
  return (
    <div>
      <h2 style={{ ...h2Style, marginBottom: 4 }}>🌉 The 4 Bridge Components</h2>
      <p style={pStyle}>Always start with Rapid-Response Intake — it's the fastest, most measurable win, and it earns the trust that makes every upsell after it easier.</p>
      {BRIDGE_COMPONENTS.map((s) => (
        <div key={s.name} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
            <strong style={{ fontSize: 14, color: INK }}>{s.icon} {s.name}</strong>
            <span style={{ color: GOLD_DEEP, fontWeight: 700, fontSize: 13 }}>{s.price}</span>
          </div>
          <p style={{ fontSize: 12.5, margin: "8px 0 4px", color: MUTED, lineHeight: 1.6 }}><strong style={{ color: INK }}>Signal:</strong> {s.signal}</p>
          <p style={{ fontSize: 12.5, margin: "4px 0", color: INK, fontStyle: "italic", lineHeight: 1.6, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px" }}>"{s.pitch}"</p>
          <p style={{ fontSize: 12, margin: "8px 0 0", color: MUTED, lineHeight: 1.6 }}><strong style={{ color: INK }}>Setup:</strong> {s.setup}</p>
          <p style={{ fontSize: 12, margin: "4px 0 0", color: MUTED, lineHeight: 1.6 }}><strong style={{ color: INK }}>Upsell:</strong> {s.upsell}</p>
        </div>
      ))}
    </div>
  );
}

function CrmTab() {
  return (
    <div>
      <h2 style={h2Style}>Agency CRM</h2>
      <p style={pStyle}>Notion (free plan) tracks every agency you audit, approach, and trial — from mystery-shop call to closed retainer.</p>
      <p style={{ ...labelStyle, fontSize: 11 }}>All 18 database properties</p>
      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "6px 16px", marginBottom: 18 }}>
        {NOTION_COLS.map((c, i) => (
          <div key={c.name} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ fontSize: 13, color: INK }}>{c.name}</strong>
                <span style={{ fontSize: 10, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 5, padding: "1px 7px", color: GOLD_DEEP, fontWeight: 600 }}>{c.type}</span>
              </div>
              <p style={{ fontSize: 12, color: MUTED, margin: "3px 0 0", lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ ...labelStyle, fontSize: 11 }}>The 5 views to create</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {NOTION_VIEWS.map((v) => (
          <div key={v.name} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 14px" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 4 }}>{v.name}</div>
            <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScriptsTab() {
  return (
    <div>
      <h2 style={h2Style}>The PROVEN Framework &amp; Scripts</h2>
      <p style={pStyle}>CareBridge's sales motion, kept distinct from "The 4 Bridge Components" (what you sell) so the two don't get conflated — plus every ready-to-use script.</p>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>The PROVEN Framework</p>
      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
        {PROVEN_FRAMEWORK.map((c, i) => (
          <div key={c.letter} style={{ display: "flex", gap: 12, padding: "12px 16px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
            <span style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: "rgba(201,154,59,0.14)", color: GOLD_DEEP,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800,
            }}>{c.letter}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: INK, margin: "0 0 3px" }}>{c.word}</p>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>Scripts</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SCRIPTS.map((s) => (
          <div key={s.id} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "", letterSpacing: "0.05em" }}>{s.tag}</div>
            <strong style={{ fontSize: 13, color: INK }}>{s.title}</strong>
            <p style={{ fontSize: 12, color: MUTED, margin: "4px 0" }}>{s.note}</p>
            <p style={{ fontSize: 13, margin: "8px 0 0", color: INK, background: "#FFFFFF", border: `1px solid ${BORDER}`, padding: 10, borderRadius: 6, lineHeight: 1.6 }}>"{s.body}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolkitTab() {
  return (
    <div>
      <h2 style={h2Style}>Toolkit &amp; Resources</h2>
      <p style={pStyle}>Every tool this system needs has a $0 path. Paid tiers speed things up — they're never required to run the demo.</p>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: MUTED }}>Need</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: MUTED }}>Paid Option</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: EMERALD }}>Free Option</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: MUTED }}>$0 Manual Path</th>
            </tr>
          </thead>
          <tbody>
            {TOOLKIT.map((r) => (
              <tr key={r.need} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: INK, verticalAlign: "top" }}>{r.need}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: MUTED, verticalAlign: "top" }}>{r.paid}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: EMERALD, verticalAlign: "top" }}>{r.free}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: MUTED, verticalAlign: "top" }}>{r.manual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackagesTab() {
  return (
    <div>
      <h2 style={h2Style}>Packages</h2>
      <p style={pStyle}>Nothing in this system is priced below $100/month. Start with a short, guarantee-backed paid trial on 5 real inquiries — small enough to say yes to, real enough that agencies never learn to expect free work.</p>
      {PACKAGES.map((pkg) => (
        <div key={pkg.name} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{pkg.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{pkg.name}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Best for: {pkg.bestFor}</div>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: GOLD_DEEP, whiteSpace: "nowrap" }}>{pkg.price}</div>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {pkg.includes.map((item) => (
              <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: GOLD_DEEP, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
        <p style={labelStyle}>12-Month Value Per Agency</p>
        {ANNUAL_VALUE.map((r) => (
          <div key={r.t} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 13, color: MUTED }}>{r.t}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: GOLD_DEEP }}>{r.v}</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: MUTED, margin: "10px 0 0", lineHeight: 1.6 }}>
          Five agencies on the Growth tier alone = $15,000–$27,000 a year in recurring revenue, in a market
          virtually no other digital agency is competing for.
        </p>
      </div>
    </div>
  );
}

function FaqTab() {
  return (
    <div>
      <h2 style={h2Style}>FAQ</h2>
      <p style={pStyle}>The questions every student asks before approaching their first care agency.</p>
      {FAQS.map((f) => (
        <div key={f.q} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px 16px", marginBottom: 10 }}>
          <strong style={{ fontSize: 13.5, color: INK }}>{f.q}</strong>
          <p style={{ fontSize: 12.5, margin: "6px 0 0", color: MUTED, lineHeight: 1.65 }}>{f.a}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                     */
/* ---------------------------------------------------------------------- */

export default function TheCareBridge() {
  const [activeTab, setActiveTab] = useState("start");
  const [checked, setChecked, syncMeta] = useSyncedTaskMap("p_carebridge");
  const [confirmingReset, setConfirmingReset] = useState(false);

  const toggle = useCallback((id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, [setChecked]);

  const handleReset = () => {
    if (!confirmingReset) { setConfirmingReset(true); return; }
    setChecked({});
    setConfirmingReset(false);
  };

  const allItems = useMemo(() => DAYS.flatMap((d) => d.items), []);
  const totalXP = useMemo(() => allItems.reduce((s, i) => s + i.xp, 0), [allItems]);
  const earnedXP = useMemo(() => allItems.reduce((s, i) => s + (checked[i.id] ? i.xp : 0), 0), [allItems, checked]);
  const pct = totalXP ? (earnedXP / totalXP) * 100 : 0;

  const currentRank = useMemo(() => {
    let r = RANKS[0];
    for (const rank of RANKS) { if (pct >= rank.threshold) r = rank; }
    return r;
  }, [pct]);
  const nextRank = useMemo(() => RANKS.find((r) => r.threshold > currentRank.threshold), [currentRank]);

  const badgeItems = useMemo(() => allItems.filter((i) => i.badge), [allItems]);

  const syncStatusText = useMemo(() => {
    if (syncMeta.status === "saving") return "Saving…";
    if (syncMeta.status === "error") return "Save failed — check your connection";
    if (syncMeta.status === "saved" && syncMeta.lastSavedAt) {
      const secs = Math.floor((Date.now() - syncMeta.lastSavedAt.getTime()) / 1000);
      if (secs < 10) return "Saved just now";
      if (secs < 60) return `Saved ${secs}s ago`;
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `Saved ${mins}m ago`;
      return `Saved at ${syncMeta.lastSavedAt.toLocaleTimeString()}`;
    }
    return "Progress syncs to your account automatically";
  }, [syncMeta.status, syncMeta.lastSavedAt]);

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #FDF9F0 0%, ${CREAM_DEEP} 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "24px 18px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: EMERALD, textTransform: "", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, boxShadow: `0 0 6px ${GOLD}`, display: "inline-block" }} />
            45-Day Senior &amp; Home-Care Communication System
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: `linear-gradient(130deg, #1A140F 20%, ${GOLD} 70%, ${EMERALD} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Care Bridge
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, maxWidth: 660, lineHeight: 1.7 }}>
            Rapid-response intake, family updates, staff scheduling, and referrals — built for home care agencies
            and assisted living facilities. A market almost no digital agency serves.
          </p>

          {/* RANK / XP */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, margin: "0 0 3px" }}>Current Rank</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: GOLD_DEEP, margin: 0 }}>{currentRank.name}</p>
              <p style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 0", maxWidth: 380, lineHeight: 1.5 }}>{currentRank.blurb}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, margin: "0 0 3px" }}>Progress</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: INK, margin: 0 }}>{Math.round(pct)}%</p>
              {nextRank && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{Math.max(0, nextRank.threshold - Math.round(pct))}% to {nextRank.name}</p>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ height: 6, flex: 1, borderRadius: 3, background: i < Math.round(pct / 5) ? GOLD : "transparent", border: i < Math.round(pct / 5) ? "none" : `1px solid ${BORDER}` }} />
            ))}
          </div>

          {/* BADGES */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {badgeItems.map((b) => {
              const earned = !!checked[b.id];
              return (
                <span key={b.id} title={b.text} style={{
                  width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, background: earned ? GOLD : "#FFFFFF", border: earned ? "none" : `1px solid ${BORDER}`,
                  opacity: earned ? 1 : 0.5,
                }}>{b.emoji}</span>
              );
            })}
            <button onClick={handleReset} style={{
              marginLeft: "auto", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
              fontSize: 11, color: confirmingReset ? CRIMSON : MUTED, textDecoration: "underline",
            }}>
              {confirmingReset ? "Click again to confirm reset" : "Reset progress"}
            </button>
          </div>

          {/* SYNC STATUS */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
            background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 12px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", display: "inline-block", flexShrink: 0,
                background: syncMeta.status === "error" ? CRIMSON : syncMeta.status === "saving" ? GOLD : EMERALD,
              }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: syncMeta.status === "error" ? CRIMSON : MUTED }}>
                {syncStatusText}
              </span>
              {syncMeta.pendingCount > 0 && (
                <span style={{ fontSize: 10, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 5, padding: "1px 7px", color: GOLD_DEEP, fontWeight: 600 }}>
                  {syncMeta.pendingCount} unsaved change{syncMeta.pendingCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <button
              onClick={() => syncMeta.saveNow()}
              disabled={syncMeta.status === "saving"}
              style={{
                background: GOLD, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 11.5, fontWeight: 700,
                color: "#FFFFFF", cursor: syncMeta.status === "saving" ? "default" : "pointer",
                opacity: syncMeta.status === "saving" ? 0.6 : 1, fontFamily: "inherit", flexShrink: 0,
              }}
            >
              {syncMeta.status === "saving" ? "Saving…" : "Save progress"}
            </button>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setConfirmingReset(false); }}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: activeTab === t.id ? `2px solid ${GOLD}` : "2px solid transparent",
                  color: activeTab === t.id ? GOLD_DEEP : "#8A7C6D",
                  padding: "11px 13px", fontSize: 12.5, fontWeight: activeTab === t.id ? 700 : 500,
                  whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
        {activeTab === "start" && <StartTab />}
        {activeTab === "care" && <CareTab />}
        {activeTab === "scouts" && <ScoutTab />}
        {activeTab === "days" && <DaysTab checked={checked} onToggle={toggle} />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "crm" && <CrmTab />}
        {activeTab === "scripts" && <ScriptsTab />}
        {activeTab === "toolkit" && <ToolkitTab />}
        {activeTab === "packages" && <PackagesTab />}
        {activeTab === "faq" && <FaqTab />}
      </div>

      {/* CTA FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: "#FFFFFF" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 16px 40px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, marginBottom: 12 }}>Go Deeper</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <NextLink to="/playbooks/care-prospecting" icon="🔍" title="Care Prospecting" body="Mystery-shop scoring, agency scripts, and the full outreach workflow in one guide." />
            <NextLink to="/playbooks/care-calculator" icon="🧮" title="Care Calculator" body="Model your real monthly and annual revenue across Foundation, Growth, and Full Care System tiers." />
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            🛡️ Progress saves to your account automatically — use the Save button above any time to sync immediately. This system replaces guesswork with a scored, scouted pipeline — it doesn't replace doing the work.
          </p>
        </div>
      </div>
    </div>
  );
}
