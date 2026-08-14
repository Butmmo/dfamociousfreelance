import { useState, useEffect, useMemo, useCallback } from "react";
import { BpsCheckpoints } from "@/components/paths/shared/primitives";

const STORAGE_KEY = "authority-progress-v1";

const RANKS = [
  { name:"Authority Recruit", threshold:0, blurb:"Day 1. Notion CRM live, first creators bookmarked to study." },
  { name:"Voice Scout", threshold:10, blurb:"Hooks and structures studied, first practice posts written." },
  { name:"Persona Prospector", threshold:23, blurb:"A full practice portfolio in one chosen persona's real voice." },
  { name:"Ghostwriting Apprentice", threshold:37, blurb:"Free samples sent to real targets — your written-word demo, out in the world." },
  { name:"Field Authority Partner", threshold:51, blurb:"First discovery call run, the sample's real performance as your proof." },
  { name:"Contract Authority Strategist", threshold:66, blurb:"First retainer signed. A real client's voice, captured and documented." },
  { name:"Certified Authority Engineer", threshold:79, blurb:"45 days, one persona, one real client posting live. This one's earned." },
];

/* BPS checkpoints — Belief (Day 16) → Affirmation (Day 30) → Evaluation (Day 45),
   the same three days as CareBridge and the SMB Optimisation Engine. */
const BPS_CHECKPOINTS = [
  { day:16, type:"Belief Goal", detail:"Commit to your personal engagement and outreach formula — how many targets you engage daily, how many free samples you send weekly — chosen from your own Week 1-2 practice, not a guess." },
  { day:30, type:"Affirmation Goal", detail:"A 14-day honest effort report on your formula. Strict remark bands apply: 72%+ 'Effort is satisfactory, goal set to be achieved.' 60-71% 'Effort is minimal, goal not taken seriously.' Below 60% 'Effort is below requisite, failure of goal is imminent.'" },
  { day:45, type:"Evaluation Goal", detail:"The full 40-day evaluation from Belief Goal submission. 75%+ 'My effort is satisfactory, goal set will be achieved.' 60-74% 'My effort has been minimal, this goal may not be achieved.' Below 60% 'My effort has been poor, the goal is unmet.'" },
];

const WEEKS = [
  {
    "week": 1,
    "title": "Build Your Writing Foundation",
    "range": "Days 1-7",
    "icon": "✍️",
    "color": "#7A5A00",
    "goal": "Free tools set up, hook and structure patterns studied, and your first two practice posts written.",
    "days": [
      {
        "day": 1,
        "focus": "Free Tool Setup",
        "icon": "⚡",
        "note": "Total cost today: $0. No new platform to master here — just Notion, a writing tool, and LinkedIn itself.",
        "tasks": [
          {
            "id": "1a",
            "xp": 10,
            "text": "Create a free Notion account — this becomes your content calendar and Prospect CRM"
          },
          {
            "id": "1b",
            "xp": 10,
            "text": "Set up ChatGPT or Claude for accelerating first drafts"
          },
          {
            "id": "1c",
            "xp": 10,
            "text": "Create a free Canva account for the occasional graphic"
          },
          {
            "id": "1d",
            "xp": 15,
            "text": "Bookmark 10-15 high-performing LinkedIn creators to study over the next week"
          }
        ]
      },
      {
        "day": 2,
        "focus": "Study Hook Writing",
        "icon": "🎣",
        "note": "The first 1-2 lines decide whether someone clicks 'see more.' This is the single highest-leverage skill in this entire system.",
        "tasks": [
          {
            "id": "2a",
            "xp": 10,
            "text": "Study what makes a LinkedIn hook stop the scroll before the 'see more' cutoff"
          },
          {
            "id": "2b",
            "xp": 10,
            "text": "Analyze 10 high-performing posts and note their hook patterns"
          },
          {
            "id": "2c",
            "xp": 15,
            "text": "Write down 5 hook formulas you notice repeating across different creators"
          }
        ]
      },
      {
        "day": 3,
        "focus": "Study Post Structure",
        "icon": "🏗️",
        "tasks": [
          {
            "id": "3a",
            "xp": 10,
            "text": "Learn the common structures — Story→Lesson, Listicle, Contrarian Take, Before/After, Question→Answer"
          },
          {
            "id": "3b",
            "xp": 15,
            "text": "Break down 5 real posts and identify which structure each one uses"
          }
        ]
      },
      {
        "day": 4,
        "focus": "Study Voice Capture",
        "icon": "🎙️",
        "note": "This is what separates real ghostwriting from generic AI output — capturing a specific person's actual opinions and stories.",
        "tasks": [
          {
            "id": "4a",
            "xp": 10,
            "text": "Learn how to interview someone to extract their authentic voice, opinions, and stories"
          },
          {
            "id": "4b",
            "xp": 15,
            "text": "Draft your own Voice Capture Questionnaire — 10-15 questions you'll ask every future client"
          }
        ]
      },
      {
        "day": 5,
        "focus": "Write Practice Post 1",
        "icon": "📝",
        "tasks": [
          {
            "id": "5a",
            "xp": 10,
            "text": "Pick a persona and write your first practice post using a Story→Lesson structure"
          }
        ]
      },
      {
        "day": 6,
        "focus": "Write Practice Post 2",
        "icon": "📝",
        "tasks": [
          {
            "id": "6a",
            "xp": 10,
            "text": "Write a second practice post using a different structure"
          }
        ]
      },
      {
        "day": 7,
        "focus": "Week 1 Review",
        "icon": "✅",
        "tasks": [
          {
            "id": "7a",
            "xp": 10,
            "text": "Review both posts honestly — are the hooks strong? Does the voice feel distinct, not generic?"
          },
          {
            "id": "d7badge",
            "xp": 40,
            "badge": true,
            "emoji": "✍️",
            "text": "Voice Found — your first two practice posts written, hooks studied, structures learned."
          }
        ]
      }
    ]
  },
  {
    "week": 2,
    "title": "Build Your Portfolio",
    "range": "Days 8-14",
    "icon": "📁",
    "color": "#0D7A5F",
    "goal": "A specific persona chosen and 15-20 practice posts ready as your portfolio.",
    "days": [
      {
        "day": 8,
        "focus": "Choose Your Niche Persona",
        "icon": "🎭",
        "note": "This decision is what keeps you from competing with every other student running this system. See the Pick Your Persona tab.",
        "tasks": [
          {
            "id": "8a",
            "xp": 13,
            "text": "Review the 8 persona options in the Pick Your Persona tab"
          },
          {
            "id": "8b",
            "xp": 18,
            "text": "Choose ONE persona to specialize in — do not write generically for 'any professional'"
          }
        ]
      },
      {
        "day": 9,
        "focus": "Write 5 More Practice Posts",
        "icon": "📝",
        "tasks": [
          {
            "id": "9a",
            "xp": 13,
            "text": "Write 5 posts in your chosen persona's authentic voice, using different structures"
          }
        ]
      },
      {
        "day": 10,
        "focus": "Write 5 More Practice Posts",
        "icon": "📝",
        "tasks": [
          {
            "id": "10a",
            "xp": 13,
            "text": "Continue building volume — 5 more posts today"
          }
        ]
      },
      {
        "day": 11,
        "focus": "Write Your Final 5 Posts",
        "icon": "📝",
        "tasks": [
          {
            "id": "11a",
            "xp": 13,
            "text": "Round out to 15-20 total practice posts in your chosen persona"
          }
        ]
      },
      {
        "day": 12,
        "focus": "Build Your Portfolio Page",
        "icon": "🎨",
        "tasks": [
          {
            "id": "12a",
            "xp": 13,
            "text": "Compile your best 8-10 posts into a simple, clean portfolio document"
          }
        ]
      },
      {
        "day": 13,
        "focus": "Refine Your Discovery Call Script",
        "icon": "📋",
        "tasks": [
          {
            "id": "13a",
            "xp": 13,
            "text": "Build your voice-capture call framework using the Scripts tab as a starting point"
          }
        ]
      },
      {
        "day": 14,
        "focus": "Week 2 Review",
        "icon": "✅",
        "tasks": [
          {
            "id": "14a",
            "xp": 13,
            "text": "Confirm you have a strong portfolio and a clearly chosen persona"
          },
          {
            "id": "d14badge",
            "xp": 45,
            "badge": true,
            "emoji": "📁",
            "text": "Portfolio Complete — 15-20 practice posts ready in your chosen persona's authentic voice."
          }
        ]
      }
    ]
  },
  {
    "week": 3,
    "title": "Identify and Engage",
    "range": "Days 15-21",
    "icon": "🎯",
    "color": "#C99A3B",
    "goal": "20-30 target profiles identified, your CRM live, and genuine engagement running for a full week.",
    "days": [
      {
        "day": 15,
        "focus": "Build Your Target List",
        "icon": "🎯",
        "tasks": [
          {
            "id": "15a",
            "xp": 16,
            "text": "Search LinkedIn for people in your chosen persona who post inconsistently or with weak engagement"
          },
          {
            "id": "15b",
            "xp": 21,
            "text": "List 20-30 target profiles"
          }
        ]
      },
      {
        "day": 16,
        "focus": "Set Up Your Prospect CRM",
        "icon": "🗂️",
        "tasks": [
          {
            "id": "16a",
            "xp": 16,
            "text": "Build the full Notion database using every column in the Prospect CRM tab"
          }
        ],
        "bpsCheckpoint": true
      },
      {
        "day": 17,
        "focus": "Begin Genuine Engagement",
        "icon": "💬",
        "note": "Generic praise gets ignored. Specific, thoughtful comments get noticed and remembered.",
        "tasks": [
          {
            "id": "17a",
            "xp": 16,
            "text": "Comment thoughtfully on 3-5 posts from your target list — genuine and specific, never generic"
          }
        ]
      },
      {
        "day": 18,
        "focus": "Continue Engagement",
        "icon": "💬",
        "tasks": [
          {
            "id": "18a",
            "xp": 16,
            "text": "Continue commenting daily on 3-5 target posts"
          }
        ]
      },
      {
        "day": 19,
        "focus": "Continue Engagement",
        "icon": "💬",
        "tasks": [
          {
            "id": "19a",
            "xp": 16,
            "text": "Continue commenting daily and note which targets are most active or responsive"
          }
        ]
      },
      {
        "day": 20,
        "focus": "Continue Engagement",
        "icon": "💬",
        "tasks": [
          {
            "id": "20a",
            "xp": 16,
            "text": "Keep the engagement streak going — consistency here builds real recognition"
          }
        ]
      },
      {
        "day": 21,
        "focus": "Week 3 Review",
        "icon": "✅",
        "tasks": [
          {
            "id": "21a",
            "xp": 16,
            "text": "Confirm consistent engagement across your target list for a full week"
          }
        ]
      }
    ]
  },
  {
    "week": 4,
    "title": "The Free Sample Approach",
    "range": "Days 22-28",
    "icon": "🎁",
    "color": "#8B2E1F",
    "goal": "Free sample rewrites sent to your top 10 targets — this is your written-word equivalent of a Lovable demo.",
    "days": [
      {
        "day": 22,
        "focus": "Pick Your Top 10",
        "icon": "🔟",
        "tasks": [
          {
            "id": "22a",
            "xp": 19,
            "text": "From your engaged targets, pick the top 10 most promising — active posters, clear audience, visible gap"
          }
        ]
      },
      {
        "day": 23,
        "focus": "Write Free Sample Rewrites",
        "icon": "✍️",
        "note": "Rewrite one of their real existing posts using a stronger hook and structure. This is your demo — make it genuinely better.",
        "tasks": [
          {
            "id": "23a",
            "xp": 19,
            "text": "Rewrite one existing post per target using an improved hook and structure"
          }
        ]
      },
      {
        "day": 24,
        "focus": "Send the Free Samples — Batch 1",
        "icon": "📤",
        "tasks": [
          {
            "id": "24a",
            "xp": 19,
            "text": "Send DMs with the free sample rewrite to your first 5 targets"
          },
          {
            "id": "24b",
            "xp": 24,
            "text": "Update Notion Stage to 'Sample Sent' for each"
          },
          {
            "id": "d24badge",
            "xp": 50,
            "badge": true,
            "emoji": "🎯",
            "text": "First Contact — your first 5 free sample rewrites sent to real targets."
          }
        ]
      },
      {
        "day": 25,
        "focus": "Send the Free Samples — Batch 2",
        "icon": "📤",
        "tasks": [
          {
            "id": "25a",
            "xp": 19,
            "text": "Send DMs to your remaining 5 targets"
          }
        ]
      },
      {
        "day": 26,
        "focus": "Monitor Responses",
        "icon": "🔔",
        "tasks": [
          {
            "id": "26a",
            "xp": 19,
            "text": "Reply within 2 hours to anything positive"
          },
          {
            "id": "d26badge",
            "xp": 40,
            "badge": true,
            "emoji": "💬",
            "text": "First Reply — a real prospect responded to your free sample."
          }
        ]
      },
      {
        "day": 27,
        "focus": "Follow Up",
        "icon": "📬",
        "tasks": [
          {
            "id": "27a",
            "xp": 19,
            "text": "Follow up with anyone who hasn't responded after 2-3 days"
          }
        ]
      },
      {
        "day": 28,
        "focus": "Week 4 Review",
        "icon": "✅",
        "tasks": [
          {
            "id": "28a",
            "xp": 19,
            "text": "Tally samples sent, replies received, and positive responses"
          }
        ]
      }
    ]
  },
  {
    "week": 5,
    "title": "Close Your First Client",
    "range": "Days 29-35",
    "icon": "🏆",
    "color": "#7A5A00",
    "goal": "Your first paying LinkedIn ghostwriting client closed and a full voice-capture interview completed.",
    "days": [
      {
        "day": 29,
        "focus": "Book Discovery Calls",
        "icon": "📅",
        "tasks": [
          {
            "id": "29a",
            "xp": 22,
            "text": "Schedule calls with anyone who responded positively to their free sample"
          }
        ]
      },
      {
        "day": 30,
        "focus": "Run Your First Discovery Call",
        "icon": "📞",
        "tasks": [
          {
            "id": "30a",
            "xp": 22,
            "text": "Use the discovery call script — reference how the sample post performed as your opening proof"
          },
          {
            "id": "d30badge",
            "xp": 55,
            "badge": true,
            "emoji": "📞",
            "text": "First Discovery Call — ran your first real call, referencing the sample's performance as proof."
          }
        ],
        "bpsCheckpoint": true
      },
      {
        "day": 31,
        "focus": "Send Proposal",
        "icon": "📄",
        "tasks": [
          {
            "id": "31a",
            "xp": 22,
            "text": "Send your 3-tier package (Starter / Growth / Authority) within 24 hours of the call"
          }
        ]
      },
      {
        "day": 32,
        "focus": "Handle Objections",
        "icon": "🛡️",
        "tasks": [
          {
            "id": "32a",
            "xp": 22,
            "text": "Use the authenticity and trust objection scripts as needed"
          }
        ]
      },
      {
        "day": 33,
        "focus": "Close Your First Client",
        "icon": "🤝",
        "tasks": [
          {
            "id": "33a",
            "xp": 22,
            "text": "Get agreement on package and price"
          },
          {
            "id": "33b",
            "xp": 27,
            "text": "Collect 50% deposit before beginning the full voice-capture process"
          },
          {
            "id": "d33badge",
            "xp": 80,
            "badge": true,
            "emoji": "🤝",
            "text": "First Client Signed — your first ghostwriting retainer closed and deposited."
          }
        ]
      },
      {
        "day": 34,
        "focus": "Full Voice-Capture Interview",
        "icon": "🎙️",
        "note": "This single conversation determines whether every future post sounds authentically like them or generically like anyone.",
        "tasks": [
          {
            "id": "34a",
            "xp": 22,
            "text": "Run the full Voice Capture Questionnaire with your new client, take detailed notes"
          }
        ]
      },
      {
        "day": 35,
        "focus": "Week 5 Review",
        "icon": "✅",
        "tasks": [
          {
            "id": "35a",
            "xp": 22,
            "text": "Confirm your first client is closed, paid, and their voice is documented"
          }
        ]
      }
    ]
  },
  {
    "week": 6,
    "title": "Deliver",
    "range": "Days 36-42",
    "icon": "🚀",
    "color": "#0D7A5F",
    "goal": "A 30-day content calendar built, first posts written and approved, and posting live.",
    "days": [
      {
        "day": 36,
        "focus": "Build the 30-Day Content Calendar",
        "icon": "📅",
        "tasks": [
          {
            "id": "36a",
            "xp": 25,
            "text": "Plan out topics and structures for the first month, drawing from the voice-capture interview"
          }
        ]
      },
      {
        "day": 37,
        "focus": "Write First Batch of Posts",
        "icon": "✍️",
        "tasks": [
          {
            "id": "37a",
            "xp": 25,
            "text": "Write the first week's worth of posts — 3-5 depending on the package"
          }
        ]
      },
      {
        "day": 38,
        "focus": "Continue Writing",
        "icon": "✍️",
        "tasks": [
          {
            "id": "38a",
            "xp": 25,
            "text": "Finish the first batch and review each post against the voice-capture notes"
          }
        ]
      },
      {
        "day": 39,
        "focus": "Client Review",
        "icon": "👀",
        "tasks": [
          {
            "id": "39a",
            "xp": 25,
            "text": "Send drafts for approval before anything goes live"
          }
        ]
      },
      {
        "day": 40,
        "focus": "Launch Posting",
        "icon": "🚀",
        "tasks": [
          {
            "id": "40a",
            "xp": 25,
            "text": "Begin posting per the agreed schedule"
          },
          {
            "id": "d40badge",
            "xp": 60,
            "badge": true,
            "emoji": "🚀",
            "text": "First Post Live — the client's content calendar launched and posting."
          }
        ]
      },
      {
        "day": 41,
        "focus": "Monitor Engagement",
        "icon": "📊",
        "tasks": [
          {
            "id": "41a",
            "xp": 25,
            "text": "Track likes, comments, and profile views on each new post"
          }
        ]
      },
      {
        "day": 42,
        "focus": "Week 6 Review",
        "icon": "✅",
        "tasks": [
          {
            "id": "42a",
            "xp": 25,
            "text": "Confirm the first week of live posting went smoothly with positive early engagement"
          }
        ]
      }
    ]
  },
  {
    "week": 7,
    "title": "Prove Value, Upsell, Referral",
    "range": "Days 43-45",
    "icon": "📈",
    "color": "#7A5A00",
    "goal": "First results presented, an upsell conversation opened, and a referral requested.",
    "days": [
      {
        "day": 43,
        "focus": "Present First Results",
        "icon": "📊",
        "tasks": [
          {
            "id": "43a",
            "xp": 28,
            "text": "Share engagement metrics, follower growth, and any inbound opportunities the posts generated"
          }
        ]
      },
      {
        "day": 44,
        "focus": "Pitch the Upsell",
        "icon": "📈",
        "tasks": [
          {
            "id": "44a",
            "xp": 28,
            "text": "Use the upsell script — propose increased posting frequency or engagement management"
          }
        ]
      },
      {
        "day": 45,
        "focus": "Ask for a Referral and Set Next Targets",
        "icon": "🎯",
        "tasks": [
          {
            "id": "45a",
            "xp": 28,
            "text": "Ask if they know other professionals in your persona who might want the same presence"
          },
          {
            "id": "45b",
            "xp": 33,
            "text": "Set your next 30-day targets — new prospects, new outreach, revenue goal"
          },
          {
            "id": "d45badge",
            "xp": 100,
            "badge": true,
            "emoji": "🏆",
            "text": "Certified — you completed the full 45-Day Authority Engine."
          }
        ],
        "bpsCheckpoint": true
      }
    ]
  }
];

const NOTION_COLS = [
  {name:"Prospect Name",         type:"Title",    icon:"👤", desc:"The professional's full name"},
  {name:"LinkedIn Profile URL",  type:"URL",      icon:"🔗", desc:"Direct link to their LinkedIn profile"},
  {name:"Persona / Niche",       type:"Select",   icon:"🎭", desc:"Real Estate / Fitness / SaaS Founder / Financial / Executive Coach / Recruiter / Marketing / Legal"},
  {name:"Current Follower Count",type:"Number",   icon:"👥", desc:"Rough size signal at time of research"},
  {name:"Posting Frequency",     type:"Select",   icon:"📅", desc:"Never / Rarely / Weekly / Multiple times a week"},
  {name:"Content Quality Signal",type:"Select",   icon:"🔍", desc:"Strong but inconsistent / Weak structure / No hooks / Ghost account"},
  {name:"Engagement Started",    type:"Date",     icon:"💬", desc:"Date you first began genuinely commenting on their posts"},
  {name:"Genuine Comments Made", type:"Number",   icon:"🗨️", desc:"Running count of real engagement before any outreach"},
  {name:"Free Sample Sent?",     type:"Checkbox", icon:"🎁", desc:"Has the free rewritten post been sent?"},
  {name:"Sample Sent Date",      type:"Date",     icon:"📅", desc:"Date the free sample was sent"},
  {name:"Response to Sample",    type:"Select",   icon:"📨", desc:"No Response / Positive / Negative"},
  {name:"Lead Stage",            type:"Select",   icon:"📊", desc:"Identified → Engaging → Sample Sent → Replied Positively → Replied Negatively → Call Booked → Proposal Sent → Closed → Retainer"},
  {name:"Package Tier",          type:"Select",   icon:"💰", desc:"Starter / Growth / Authority"},
  {name:"Monthly Retainer",      type:"Number",   icon:"💵", desc:"Agreed monthly amount, once closed"},
  {name:"Voice Notes",           type:"Text",     icon:"🎙️", desc:"Key personality traits, opinions, and stories captured during voice capture"},
  {name:"Next Action",           type:"Text",     icon:"➡️", desc:"What needs to happen next with this prospect or client"},
  {name:"Next Action Date",      type:"Date",     icon:"⏰", desc:"When the next action is due"},
  {name:"Notes",                 type:"Text",     icon:"📝", desc:"Anything else relevant — call notes, objections, context"},
];

const NOTION_VIEWS = [
  {name:"🎯 All Prospects",      desc:"Master table — every professional you've identified across your chosen persona."},
  {name:"💬 Actively Engaging",  desc:"Filter: Stage = Engaging. Your warm-up list — genuine comments in progress."},
  {name:"🎁 Samples Sent",       desc:"Filter: Stage = Sample Sent. Waiting on a response to your free rewrite."},
  {name:"📊 Pipeline Board",     desc:"Kanban grouped by Lead Stage — drag prospects through as they progress."},
  {name:"💰 Active Clients",     desc:"Filter: Stage = Retainer. Your recurring revenue base and referral source list."},
];

const PERSONAS = [
  {icon:"🏠", name:"Real Estate Coaches & Agents",
   why:"A high-ticket industry where personal brand drives referrals directly — agents who post consistently visibly outperform those who don't.",
   find:"LinkedIn search 'real estate coach,' real estate Facebook groups cross-referenced with a LinkedIn presence, real estate conference speaker lists"},
  {icon:"💪", name:"Fitness & Health Coaches",
   why:"Transformation stories and client wins perform exceptionally well — the audience is naturally primed to engage with authentic content.",
   find:"LinkedIn search 'fitness coach' or 'wellness coach,' Instagram fitness coaches who are underutilizing LinkedIn"},
  {icon:"💻", name:"B2B SaaS Founders",
   why:"Thought leadership content directly drives inbound sales leads — founders know this but rarely have time to write consistently themselves.",
   find:"LinkedIn search by job title 'Founder' plus 'SaaS,' Product Hunt launches where founders are actively building an audience"},
  {icon:"💰", name:"Financial Advisors & Consultants",
   why:"Trust-building content is essential in this industry — consistent posting differentiates advisors in an otherwise commoditized market.",
   find:"LinkedIn search 'financial advisor,' CFP professional groups"},
  {icon:"🎯", name:"Executive & Leadership Coaches",
   why:"Authority-building is the entire product for this persona — contrarian, high-conviction takes perform unusually well.",
   find:"LinkedIn search 'executive coach' or 'leadership coach,' ICF member directories"},
  {icon:"🧑‍💼", name:"Recruiters & HR Consultants",
   why:"Hiring trends and career advice content has broad, highly engaged audience appeal — visible expertise directly drives referrals.",
   find:"LinkedIn search 'recruiter' or 'talent acquisition,' HR conference attendee lists"},
  {icon:"📈", name:"Marketing & Sales Consultants",
   why:"Tactical how-to content and case studies perform extremely well — this audience actively studies and shares good marketing content.",
   find:"LinkedIn search 'marketing consultant' or 'fractional CMO,' marketing agency owner profiles"},
  {icon:"⚖️", name:"Legal Professionals & Consultants",
   why:"Educational, myth-busting content builds trust in a traditionally opaque industry — underserved compared to other professional niches.",
   find:"LinkedIn search by practice area plus 'attorney' or 'legal consultant,' bar association directories"},
];

const SERVICE_COMPONENTS = [
  {icon:"🎙️", color:"#7A5A00", name:"Voice Capture Interview",
   desc:"A structured, one-time onboarding interview that captures their real opinions, stories, and unique perspective — the raw material every post is built from.",
   why:"Without this, ghostwritten content sounds generic and gets flagged by the client as 'not sounding like me.' This single conversation is what makes everything after it work."},
  {icon:"✍️", color:"#0D7A5F", name:"Weekly Ghostwriting",
   desc:"3-5 posts per week written in their voice, using proven hook and structure patterns, sent for approval before anything goes live.",
   why:"Consistency is what actually builds a LinkedIn following. Most professionals fail at this not because they lack ideas, but because they post sporadically."},
  {icon:"💬", color:"#C99A3B", name:"Engagement & Comment Management",
   desc:"Responding to comments on their posts within a few hours, in their voice, to keep conversations alive.",
   why:"Engagement signals to LinkedIn's algorithm that a post is worth showing to more people, and it builds real relationships with the people commenting."},
  {icon:"📊", color:"#8B2E1F", name:"Monthly Growth Reporting",
   desc:"A simple report showing follower growth, average engagement, and top-performing posts from the month.",
   why:"This is what justifies the retainer renewal every single month — visible proof the system is working, exactly like your SMB revenue reports."},
];

const SCRIPTS = [
  {id:"sample", tag:"Free Sample · Opening DM", color:"#8B2E1F",
   title:"The Free Sample DM",
   note:"This is your demo, in written form — the same psychological principle as a Lovable demo, just on the page instead of the screen.",
   body:"Hey [Name], I've been following your posts on [topic] — really enjoyed your take on [specific post]. I actually rewrote one of your recent posts using a structure I use for [persona] clients, just to show you what it could look like. No pressure at all, just thought you might find it interesting: [link to rewritten post/doc]. Let me know what you think!"},
  {id:"followup", tag:"Follow-Up · No Response", color:"#0D7A5F",
   title:"Follow-Up DM",
   note:"Send once, gently, after 2-3 days. Never chase more than twice.",
   body:"Hey [Name], just wanted to follow up in case that got buried — no worries if it's not useful right now, but I'd love to hear your thoughts if you get a chance to look at it."},
  {id:"voice", tag:"Voice Capture · Interview Questions", color:"#7A5A00",
   title:"Voice Capture Questionnaire",
   note:"Run this in full before writing a single real post. Take detailed notes — this becomes your reference for every future draft.",
   body:"\"What's one opinion you hold about [industry] that most people in your field would disagree with?\"\n\n\"What's a story from your career that changed how you think about your work?\"\n\n\"What's a mistake you made early on that taught you something valuable?\"\n\n\"Who do you most want to reach with your content — describe that person specifically?\"\n\n\"What's a question you get asked constantly that you wish more people understood the real answer to?\"\n\n\"What tone feels most like you — direct and no-nonsense, warm and encouraging, witty and irreverent, or something else?\""},
  {id:"discovery", tag:"Discovery Call · Transition to Paid", color:"#C99A3B",
   title:"Discovery Call — Sample to Paid",
   note:"Reference the sample's real performance as your opening proof — let the result speak before you ever mention price.",
   body:"\"So now that you've seen what the rewritten post looks like — that's basically a small taste of what consistent posting could do for you. Right now you're posting [X times a month], and even that one rewritten post probably got more engagement than usual. Imagine that happening 3-4 times every single week. That's what I'd build for you — want me to walk through what that looks like?\""},
  {id:"obj1", tag:"Objection · Authenticity Concern", color:"#0D7A5F",
   title:"Objection: \"I Don't Want It to Sound Fake\"",
   note:"This is the single most common objection in ghostwriting. Address it directly and calmly every time.",
   body:"\"That's exactly the right concern to have, and it's why I always start with a real voice-capture interview before writing anything. I'm not writing generic LinkedIn content — I'm writing YOUR opinions and YOUR stories, just structured in a way that performs well. If something doesn't sound like you, you flag it and I rewrite it. You approve every post before it goes out, always.\""},
  {id:"obj2", tag:"Objection · Trust in Your Ability", color:"#7A5A00",
   title:"Objection: \"How Do I Know You'll Get This Right?\"",
   note:"You already have proof — point back to it rather than making a new promise.",
   body:"\"Fair question — that's exactly why I sent you a free sample first, using your own real content, before ever asking for payment. If you want, I'm happy to write one more free sample based on a topic you choose, so you can see the process work in real time before committing to anything.\""},
  {id:"upsell", tag:"Upsell · Frequency or Engagement", color:"#7A5A00",
   title:"Upsell Pitch",
   note:"Only pitch this after real, visible results — never stack scope before the first tier has proven itself.",
   body:"\"Your posts are performing well — [specific metric, e.g. averaging 40 comments versus your old average of 5]. A lot of that momentum comes from consistency, and right now we're only posting [X] times a week. Want to talk about moving to [X+2] a week, or adding comment management so every conversation on your posts gets a timely, thoughtful reply?\""},
  {id:"referral", tag:"Growth · Referral Ask", color:"#8B2E1F",
   title:"Asking for a Referral",
   note:"Persona-specific referrals compound quickly — professionals in the same niche often know each other well.",
   body:"\"I'm really glad this has been working for you. Do you know any other [persona] professionals who might want the same kind of consistent presence on LinkedIn? I'd love an introduction — happy to send them a free sample too.\""},
];

const PACKAGES = [
  {name:"Starter", icon:"🌱", color:"#0D7A5F", price:"$500-$700/month",
   includes:["3 posts per week","Voice capture interview included","Client approves every post before it goes live"],
   bestFor:"Professionals just starting to build a consistent LinkedIn presence"},
  {name:"Growth", icon:"⚡", color:"#7A5A00", price:"$800-$1,200/month",
   includes:["Everything in Starter","5 posts per week","Basic comment engagement (replies within 24 hours)","Monthly growth report"],
   bestFor:"Professionals ready to build real authority and inbound opportunities"},
  {name:"Authority", icon:"🏆", color:"#8B2E1F", price:"$1,300-$1,800/month",
   includes:["Everything in Growth","Full engagement and DM management","Monthly growth report plus strategy call","Quarterly content pillar refresh"],
   bestFor:"Established professionals wanting a complete personal brand partner"},
];

const FAQS = [
  {q:"What if I'm not naturally a great writer?",
   a:"Ghostwriting is a learnable structure, not raw talent. Most high-performing LinkedIn posts follow just a handful of repeatable formats — hook, story, lesson, call-to-action. Study 20-30 real examples, practice the structures, and use AI tools to accelerate drafts. Skill compounds fast with repetition here."},
  {q:"How do I convince someone to let me write AS them — isn't that a big trust ask?",
   a:"This is exactly why the free sample approach exists. Nobody hands over their voice to a stranger on faith — they hand it over after seeing a real example that sounds genuinely like an improved version of themselves. Trust is earned through the demo, not the pitch."},
  {q:"What if the client wants to heavily edit everything I write?",
   a:"Early on, this is normal and even healthy — it's part of you learning their real voice faster. Treat every edit as data. If heavy editing continues past the first month, revisit your voice capture notes together and refine your understanding of their tone and opinions."},
  {q:"Should I ghostwrite for free to build my portfolio, or only ever charge?",
   a:"Your dummy portfolio posts, written for a fictional persona, should be free practice. But once you're approaching a real prospect, the free sample is the only unpaid work you do — a single rewritten post, never an ongoing commitment. Never run a full unpaid retainer; the sample alone is proof enough."},
  {q:"What if I run out of content ideas for a client?",
   a:"This rarely happens if your voice capture interview was thorough — most people have far more opinions and stories than they realize. Keep a running idea bank in Notion from every conversation, and revisit the original interview whenever you need a fresh angle."},
  {q:"How is this different from just using ChatGPT myself?",
   a:"The client could technically type prompts into ChatGPT themselves — but they won't, the same reason SMB owners don't build their own websites. You bring the interview process, the structural knowledge of what performs, the consistency of actually posting on schedule, and the judgment to know what sounds authentically like them versus generic AI output."},
  {q:"What if a client's post doesn't perform well?",
   a:"Not every post goes viral, and that's normal — LinkedIn's algorithm rewards consistency over any single post. Use underperforming posts as data: was the hook weak, was the topic too niche, did it post at a low-traffic time? Adjust the next one accordingly and keep the client focused on the trend over weeks, not any single post."},
  {q:"Can I ghostwrite for multiple clients in the same persona?",
   a:"Yes, as long as you keep their voices genuinely distinct — this is where your voice capture notes matter most. If two clients in the same niche start sounding identical, that's a sign to slow down and reinterview, not to take on more clients in that lane too quickly."},
];

function Chevron({open}) {
  return <span style={{color:"#6E6459",fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function Check({checked,color}) {
  return (
    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?color:"#6E6459"}`,
      background:checked?color:"transparent",display:"flex",alignItems:"center",
      justifyContent:"center",flexShrink:0,marginTop:2,fontSize:11,
      color:"#F5F0E4",fontWeight:800,transition:"all .15s"}}>
      {checked?"✓":""}
    </div>
  );
}

function ProgressBar({value,color,height=6}) {
  return (
    <div style={{background:"#FBF8F1",borderRadius:999,height,overflow:"hidden"}}>
      <div style={{width:`${value}%`,height:"100%",background:color,
        borderRadius:999,transition:"width .3s"}}/>
    </div>
  );
}

function SLabel({text,color}) {
  return (
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

export default function TheAuthorityEngine() {
  const [tab,setTab]             = useState("plan");
  const [openWeek,setOpenWeek]   = useState(0);
  const [openDay,setOpenDay]     = useState(null);
  const [openPersona,setOpenPersona] = useState(null);
  const [openSvc,setOpenSvc]     = useState(null);
  const [openScript,setOpenScript]= useState(null);
  const [openFaq,setOpenFaq]     = useState(null);
  const [done,setDone]           = useState({});
  const [loaded,setLoaded]       = useState(false);
  const [confirmingReset,setConfirmingReset] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setDone(JSON.parse(res.value).done || {});
      } catch (e) { /* no saved progress yet */ }
      finally { setLoaded(true); }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify({ done: next, savedAt: Date.now() }), false); }
    catch (e) { /* best effort */ }
  }, []);

  const toggle = id=>setDone(p=>{ const next={...p,[id]:!p[id]}; persist(next); return next; });
  const handleReset = () => {
    if (!confirmingReset) { setConfirmingReset(true); return; }
    setDone({}); persist({}); setConfirmingReset(false);
  };

  const allTasks = useMemo(()=>WEEKS.flatMap(w=>w.days.flatMap(d=>d.tasks)),[]);
  const totalTasks     = allTasks.length;
  const completedTasks = allTasks.filter(t=>done[t.id]).length;
  const totalXP  = useMemo(()=>allTasks.reduce((s,t)=>s+t.xp,0),[allTasks]);
  const earnedXP = useMemo(()=>allTasks.reduce((s,t)=>s+(done[t.id]?t.xp:0),0),[allTasks,done]);
  const pct = totalXP?(earnedXP/totalXP)*100:0;
  const progress = Math.round(pct);
  const progressColor = progress>=70?"#0D7A5F":progress>=35?"#C99A3B":"#7A5A00";
  const weekPct = w=>{
    const t=w.days.flatMap(d=>d.tasks);
    return t.length>0?Math.round((t.filter(x=>done[x.id]).length/t.length)*100):0;
  };
  const currentRank = useMemo(()=>{ let r=RANKS[0]; for(const rank of RANKS){ if(pct>=rank.threshold) r=rank; } return r; },[pct]);
  const nextRank = useMemo(()=>RANKS.find(r=>r.threshold>currentRank.threshold),[currentRank]);
  const badgeItems = useMemo(()=>allTasks.filter(t=>t.badge),[allTasks]);

  if (!loaded) return <div style={{background:"#F5F0E4",minHeight:"100vh"}}/>;

  const TABS=[
    {id:"plan",    label:"📅 45-Day Plan"},
    {id:"notion",  label:"🗂️ Prospect CRM"},
    {id:"persona", label:"🎭 Pick Your Persona"},
    {id:"services",label:"✍️ Service Components"},
    {id:"scripts", label:"💬 Scripts"},
    {id:"pricing", label:"💰 Packages"},
    {id:"faq",     label:"❓ FAQ"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:"#F5F0E4",minHeight:"100vh",color:"#201A16"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:"#0D7A5F",
            textTransform:"",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#0D7A5F",
              boxShadow:"0 0 6px #0D7A5F",display:"inline-block"}}/>
            The Authority Engine — 45-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            LinkedIn Ghostwriting & Personal Brand System
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#6E6459",maxWidth:580,lineHeight:1.65}}>
            Write consistent, high-performing LinkedIn content in a client's authentic voice.
            No automation tools to master — this system runs on writing skill and relationship.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F30",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this system exists:</strong> this is the one
              system here that isn't about automation at all — it's about writing and relationship.
              Persona specialization means two students both doing "LinkedIn ghostwriting" never
              compete if one writes for real estate coaches and the other writes for SaaS founders.
              It also gives your more relational, less technical students a real path that needs no
              GHL or Klaviyo mastery at all.
            </p>
          </div>
          <div style={{background:"#F8F5EE",borderRadius:10,padding:"14px 16px",border:"1px solid #FBF8F1"}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:10}}>
              <div>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#6E6459",margin:"0 0 3px"}}>Current Rank</p>
                <p style={{fontSize:17,fontWeight:800,color:"#7A5A00",margin:0}}>{currentRank.name}</p>
                <p style={{fontSize:11,color:"#6E6459",margin:"2px 0 0",maxWidth:360,lineHeight:1.5}}>{currentRank.blurb}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#6E6459",margin:"0 0 3px"}}>Progress</p>
                <p style={{fontSize:17,fontWeight:800,color:progressColor,margin:0}}>{progress}%</p>
                {nextRank && <p style={{fontSize:10.5,color:"#6E6459",margin:"2px 0 0"}}>{Math.max(0,nextRank.threshold-progress)}% to {nextRank.name}</p>}
              </div>
            </div>
            <div style={{display:"flex",gap:2,marginBottom:12}}>
              {Array.from({length:20}).map((_,i)=>(
                <div key={i} style={{height:6,flex:1,borderRadius:3,
                  background:i<Math.round(pct/5)?"#C99A3B":"transparent",
                  border:i<Math.round(pct/5)?"none":"1px solid #FBF8F1"}}/>
              ))}
            </div>
            <div style={{fontSize:11,color:"#6E6459",marginBottom:8}}>{completedTasks} / {totalTasks} tasks complete</div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {badgeItems.map(b=>{
                const earned=!!done[b.id];
                return (
                  <span key={b.id} title={b.text} style={{
                    width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,background:earned?"#C99A3B":"#FFFFFF",
                    border:earned?"none":"1px solid #FBF8F1",opacity:earned?1:0.5,
                  }}>{b.emoji}</span>
                );
              })}
              <button onClick={handleReset} style={{
                marginLeft:"auto",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",
                fontSize:11,color:confirmingReset?"#8B2E1F":"#6E6459",textDecoration:"underline",
              }}>{confirmingReset?"Click again to confirm reset":"Reset progress"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:880,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid #7A5A00":"2px solid transparent",
              color:tab===t.id?"#C99A3B":"#D9CFBB",
              padding:"12px 13px",fontSize:12.5,fontWeight:tab===t.id?600:500,
              cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s",fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:880,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* PLAN */}
        {tab==="plan"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>45-Day Action Plan</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px"}}>
              Tap a week → tap a day → tick tasks as you complete them. Days marked ★ carry a BPS checkpoint.
            </p>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#7A5A00",marginBottom:8}}>
                BPS Checkpoints Inside the 45 Days
              </div>
              <BpsCheckpoints checkpoints={BPS_CHECKPOINTS}/>
            </div>
            {WEEKS.map((w,wi)=>{
              const wp=weekPct(w); const wOpen=openWeek===wi;
              return (
                <div key={w.week} style={{marginBottom:9}}>
                  <div onClick={()=>setOpenWeek(wOpen?null:wi)}
                    style={{background:wOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${wOpen?w.color+"55":"#FBF8F1"}`,
                      borderRadius:wOpen?"11px 11px 0 0":11,cursor:"pointer",
                      padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:37,height:37,borderRadius:9,background:w.color+"18",
                      border:`1px solid ${w.color}35`,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:18,flexShrink:0}}>{w.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                        <span style={{fontWeight:700,fontSize:14,color:"#201A16"}}>Week {w.week}: {w.title}</span>
                        <span style={{fontSize:10,color:"#6E6459",background:"#FBF8F1",
                          borderRadius:4,padding:"1px 6px"}}>{w.range}</span>
                        {wp>0&&<span style={{fontSize:10.5,fontWeight:700,color:w.color}}>{wp}%</span>}
                      </div>
                      <p style={{fontSize:11.5,color:"#6E6459",margin:"0 0 6px",lineHeight:1.4}}>{w.goal}</p>
                      <ProgressBar value={wp} color={w.color} height={3}/>
                    </div>
                    <Chevron open={wOpen}/>
                  </div>
                  {wOpen&&(
                    <div style={{background:"#F5F0E4",border:`1px solid ${w.color}25`,
                      borderTop:"none",borderRadius:"0 0 11px 11px",padding:"8px 11px 13px"}}>
                      {w.days.map(d=>{
                        const dk=`${wi}-${d.day}`; const dOpen=openDay===dk;
                        const dDone=d.tasks.filter(t=>done[t.id]).length;
                        const dComplete=dDone===d.tasks.length&&d.tasks.length>0;
                        return (
                          <div key={d.day} style={{marginTop:7}}>
                            <div onClick={()=>setOpenDay(dOpen?null:dk)}
                              style={{background:dOpen?"#FBF8F1":"#F5F0E4",
                                border:`1px solid ${dComplete?w.color+"60":"#FBF8F1"}`,
                                borderRadius:dOpen?"9px 9px 0 0":9,cursor:"pointer",
                                padding:"10px 12px",display:"flex",alignItems:"center",gap:9}}>
                              <span style={{fontSize:16,flexShrink:0}}>{dComplete?"✅":d.icon}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                                  <span style={{fontSize:10,fontWeight:700,color:w.color,
                                    background:w.color+"18",borderRadius:4,padding:"1px 6px"}}>Day {d.day}</span>
                                  <span style={{fontSize:13,fontWeight:600,color:"#201A16"}}>{d.focus}{d.bpsCheckpoint?" ★":""}</span>
                                </div>
                                <div style={{fontSize:11,color:"#6E6459",marginTop:2}}>{dDone}/{d.tasks.length} tasks</div>
                              </div>
                              <Chevron open={dOpen}/>
                            </div>
                            {dOpen&&(
                              <div style={{background:"#F5F0E4",border:"1px solid #FBF8F1",
                                borderTop:"none",borderRadius:"0 0 9px 9px",padding:"10px 12px 12px"}}>
                                {d.note&&(
                                  <div style={{background:w.color+"10",border:`1px solid ${w.color}22`,
                                    borderRadius:7,padding:"7px 10px",marginBottom:10,
                                    fontSize:12,color:w.color+"CC",lineHeight:1.5}}>💡 {d.note}</div>
                                )}
                                {d.tasks.map(t=>t.badge?(
                                  <div key={t.id} onClick={()=>toggle(t.id)}
                                    style={{display:"flex",gap:10,alignItems:"center",
                                      padding:"9px 11px",margin:"6px 0",borderRadius:9,
                                      border:`1px solid ${done[t.id]?"#C99A3B":"#FBF8F1"}`,
                                      background:done[t.id]?"rgba(201,154,59,0.10)":"#FFFFFF",cursor:"pointer"}}>
                                    <span style={{flexShrink:0,width:30,height:30,borderRadius:"50%",
                                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,
                                      background:done[t.id]?"#C99A3B":"#FFFFFF",
                                      border:done[t.id]?"none":"1px solid #FBF8F1"}}>{t.emoji}</span>
                                    <span style={{flex:1,fontSize:13,fontWeight:600,color:done[t.id]?"#7A5A00":"#201A16"}}>{t.text}</span>
                                    <span style={{flexShrink:0,fontSize:11,fontWeight:700,color:"#7A5A00"}}>+{t.xp} XP</span>
                                  </div>
                                ):(
                                  <div key={t.id} onClick={()=>toggle(t.id)}
                                    style={{display:"flex",gap:9,alignItems:"flex-start",
                                      padding:"8px 0",borderBottom:"1px solid #FBF8F1",cursor:"pointer"}}>
                                    <Check checked={!!done[t.id]} color={w.color}/>
                                    <span style={{flex:1,fontSize:13,lineHeight:1.55,
                                      color:done[t.id]?"#D9CFBB":"#6E6459",
                                      textDecoration:done[t.id]?"line-through":"none",
                                      transition:"all .15s"}}>{t.text}</span>
                                    <span style={{flexShrink:0,fontSize:10.5,color:"#6E6459",paddingTop:1}}>+{t.xp}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NOTION CRM */}
        {tab==="notion"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Prospect CRM</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Notion (free plan) tracks every professional you engage with, sample, and pitch — from
              first genuine comment to closed retainer.
            </p>
            <div style={{marginBottom:10}}>
              <SLabel text="All 18 Database Properties" color="#0D7A5F"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:22}}>
              {NOTION_COLS.map((c,i)=>(
                <div key={i} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",
                  borderRadius:9,padding:"10px 13px",display:"flex",gap:11,alignItems:"flex-start"}}>
                  <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13.5,fontWeight:700,color:"#201A16"}}>{c.name}</span>
                      <span style={{fontSize:10.5,background:"#FBF8F1",border:"1px solid #FBF8F1",
                        borderRadius:5,padding:"1px 7px",color:"#7A5A00",fontWeight:600}}>{c.type}</span>
                    </div>
                    <p style={{fontSize:12,color:"#6E6459",margin:0,lineHeight:1.5}}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <SLabel text="The 5 Views to Create" color="#C99A3B"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {NOTION_VIEWS.map((v,i)=>(
                <div key={i} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",
                  borderRadius:9,padding:"11px 14px"}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:"#201A16",marginBottom:4}}>{v.name}</div>
                  <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.5}}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERSONA */}
        {tab==="persona"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Pick Your Persona</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              This is the decision that keeps you from competing with every other student running
              this system. Choose one professional persona and specialize deeply.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {PERSONAS.map((n,i)=>{
                const isOpen=openPersona===i;
                return (
                  <div key={i} onClick={()=>setOpenPersona(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?"#0D7A5F":"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>
                      <span style={{flex:1,fontWeight:600,fontSize:14,color:"#201A16"}}>{n.name}</span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 16px",borderTop:"1px solid #FBF8F1"}}>
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#0D7A5F",textTransform:"",
                            letterSpacing:".07em",marginBottom:5}}>💡 Why This Works</div>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.6,
                            borderLeft:"2px solid #0D7A5F40",paddingLeft:10}}>{n.why}</p>
                        </div>
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#C99A3B",textTransform:"",
                            letterSpacing:".07em",marginBottom:5}}>📍 Where to Find Them</div>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.6,
                            borderLeft:"2px solid #C99A3B40",paddingLeft:10}}>{n.find}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SERVICE COMPONENTS */}
        {tab==="services"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The 4 Service Components</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Unlike a system with independent flows, this is one retainer service built from 4
              layered components — each package on the Packages tab bundles these differently.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SERVICE_COMPONENTS.map((s,i)=>{
                const isOpen=openSvc===i;
                return (
                  <div key={i} onClick={()=>setOpenSvc(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?s.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:s.color+"18",
                        border:`1px solid ${s.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
                      <div style={{flex:1,fontWeight:700,fontSize:14,color:"#201A16"}}>{s.name}</div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:s.color,textTransform:"",
                            letterSpacing:".07em",marginBottom:5}}>What It Is</div>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                            borderLeft:`2px solid ${s.color}40`,paddingLeft:10}}>{s.desc}</p>
                        </div>
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#C99A3B",textTransform:"",
                            letterSpacing:".07em",marginBottom:5}}>Why It Matters</div>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                            borderLeft:"2px solid #C99A3B40",paddingLeft:10}}>{s.why}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCRIPTS */}
        {tab==="scripts"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Scripts and Templates</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px",lineHeight:1.6}}>
              These are relationship-first, never cold-sales in tone. Personalize every bracketed
              section before sending.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SCRIPTS.map((s,i)=>{
                const isOpen=openScript===i;
                return (
                  <div key={i} onClick={()=>setOpenScript(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?s.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                          <span style={{fontWeight:700,fontSize:13.5,color:"#201A16"}}>{s.title}</span>
                          <span style={{fontSize:10,color:s.color,background:s.color+"18",
                            borderRadius:4,padding:"1px 6px",fontWeight:600}}>{s.tag}</span>
                        </div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 14px",borderTop:"1px solid #FBF8F1"}}>
                        <p style={{background:"#F5F0E4",borderRadius:8,padding:"12px 13px",
                          marginTop:12,fontFamily:"'Courier New',monospace",fontSize:12,
                          color:"#6E6459",lineHeight:1.85,borderLeft:`2px solid ${s.color}40`,
                          whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{s.body}</p>
                        <div style={{marginTop:9,background:s.color+"10",border:`1px solid ${s.color}25`,
                          borderRadius:7,padding:"7px 10px",fontSize:12,color:s.color,lineHeight:1.5}}>
                          💡 {s.note}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRICING */}
        {tab==="pricing"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Pricing Packages</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Every package includes the voice capture interview and full approval before anything
              posts. The difference is posting frequency and engagement depth.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {PACKAGES.map((pkg)=>(
                <div key={pkg.name} style={{background:"#F8F5EE",border:`1px solid ${pkg.color}35`,
                  borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"15px 16px",borderBottom:"1px solid #FBF8F1",
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{pkg.icon}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#201A16"}}>{pkg.name}</div>
                        <div style={{fontSize:11,color:"#6E6459",marginTop:2}}>Best for: {pkg.bestFor}</div>
                      </div>
                    </div>
                    <div style={{fontSize:16,fontWeight:800,color:pkg.color,whiteSpace:"nowrap"}}>{pkg.price}</div>
                  </div>
                  <div style={{padding:"13px 16px"}}>
                    {pkg.includes.map((item,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                        <span style={{color:pkg.color,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
                        <span style={{fontSize:13,color:"#6E6459",lineHeight:1.55}}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,background:"#F5F0E4",border:"1px solid #0D7A5F25",
              borderRadius:12,padding:"16px"}}>
              <SLabel text="12-Month Value Per Client" color="#0D7A5F"/>
              {[
                {t:"Starter only",v:"$6,000-$8,400/year"},
                {t:"Growth tier",v:"$9,600-$14,400/year"},
                {t:"Authority tier",v:"$15,600-$21,600/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#6E6459",margin:"10px 0 0",lineHeight:1.6}}>
                Five clients on the Growth tier alone = $48,000-$72,000 a year in recurring revenue,
                built entirely on writing skill and relationship — no automation tools required.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>FAQ</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px"}}>
              The questions every student asks before pitching their first ghostwriting client.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FAQS.map((f,i)=>{
                const isOpen=openFaq===i;
                return (
                  <div key={i} onClick={()=>setOpenFaq(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?"#7A5A00":"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:9}}>
                      <span style={{color:"#7A5A00",fontSize:13,fontWeight:800,flexShrink:0,marginTop:1}}>Q</span>
                      <span style={{flex:1,fontSize:13.5,fontWeight:600,color:"#201A16",lineHeight:1.45}}>{f.q}</span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 13px",borderTop:"1px solid #FBF8F1"}}>
                        <div style={{display:"flex",gap:9,marginTop:11,alignItems:"flex-start"}}>
                          <span style={{color:"#0D7A5F",fontSize:13,fontWeight:800,flexShrink:0}}>A</span>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65}}>{f.a}</p>
                        </div>
                      </div>
                    )}
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
