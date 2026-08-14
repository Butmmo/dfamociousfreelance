import { useState, useEffect, useMemo, useCallback } from "react";
import { BpsCheckpoints, PhaseOverview, ScoutMethodsList, FocusPicker } from "@/components/paths/shared/primitives";
import { NICHES } from "./EcommerceProspecting";

const STORAGE_KEY = "revenue-progress-v1";

const RANKS = [
  { name:"Revenue Recruit", threshold:0, blurb:"Day 1. Klaviyo and dummy store live, zero spent." },
  { name:"Flow Scout", threshold:10, blurb:"The 4 money flows understood, first two demo flows built." },
  { name:"Niche Prospector", threshold:23, blurb:"A niche chosen, a Store CRM built, 15-20 scored prospects ready." },
  { name:"Revenue Apprentice", threshold:37, blurb:"Outreach sent to real stores. The pipeline is live." },
  { name:"Field Revenue Partner", threshold:51, blurb:"First discovery call run, real revenue-from-email numbers on the table." },
  { name:"Contract Revenue Engineer", threshold:66, blurb:"First retainer signed. A real store's flows, being built." },
  { name:"Certified Revenue Recovery Engineer", threshold:79, blurb:"45 days, one niche, one real store's flows live. This one's earned." },
];

/* BPS checkpoints — Belief (Day 16) → Affirmation (Day 30) → Evaluation (Day 45),
   the same three days as CareBridge and the SMB Optimisation Engine. */
const BPS_CHECKPOINTS = [
  { day:16, type:"Belief Goal", detail:"Commit to your personal scouting and outreach formula — how many stores you audit daily, how many DMs or emails you send weekly — chosen from your own Week 1-2 practice, not a guess." },
  { day:30, type:"Affirmation Goal", detail:"A 14-day honest effort report on your formula. Strict remark bands apply: 72%+ 'Effort is satisfactory, goal set to be achieved.' 60-71% 'Effort is minimal, goal not taken seriously.' Below 60% 'Effort is below requisite, failure of goal is imminent.'" },
  { day:45, type:"Evaluation Goal", detail:"The full 40-day evaluation from Belief Goal submission. 75%+ 'My effort is satisfactory, goal set will be achieved.' 60-74% 'My effort has been minimal, this goal may not be achieved.' Below 60% 'My effort has been poor, the goal is unmet.'" },
];

const WEEKS = [
  {
    "week": 1,
    "title": "Learn the System",
    "range": "Days 1-7",
    "icon": "⚡",
    "color": "#7A5A00",
    "goal": "Klaviyo fundamentals learned, dummy store live, first two flows built and tested — all at zero cost.",
    "days": [
      {
        "day": 1,
        "focus": "Free Account Setup",
        "icon": "⚡",
        "note": "Total cost today: $0. Klaviyo's free plan runs real, working automation flows — genuinely enough to build your entire demo.",
        "tasks": [
          {
            "id": "1a",
            "xp": 10,
            "text": "Create a free Klaviyo account — supports up to 250 profiles with real flows, no credit card required"
          },
          {
            "id": "1b",
            "xp": 10,
            "text": "Start a free Shopify trial to build a dummy demo store"
          },
          {
            "id": "1c",
            "xp": 10,
            "text": "Create a free Notion account — this becomes your Store Prospecting CRM"
          },
          {
            "id": "1d",
            "xp": 15,
            "text": "Create a Canva account (free) for email template design"
          }
        ]
      },
      {
        "day": 2,
        "focus": "Klaviyo Academy Fundamentals",
        "icon": "🎓",
        "note": "Klaviyo Academy is free and official — complete the core certification path before building anything.",
        "tasks": [
          {
            "id": "2a",
            "xp": 10,
            "text": "Complete the Klaviyo Academy 'Email Marketing Fundamentals' course"
          },
          {
            "id": "2b",
            "xp": 10,
            "text": "Complete the 'Flow Building Basics' module"
          },
          {
            "id": "2c",
            "xp": 15,
            "text": "Watch 2-3 YouTube walkthroughs of real abandoned cart flows for extra context"
          }
        ]
      },
      {
        "day": 3,
        "focus": "Understand the 4 Money Flows",
        "icon": "💡",
        "note": "Every ecommerce brand loses revenue in the same 4 places. Understand the WHY before you build the HOW.",
        "tasks": [
          {
            "id": "3a",
            "xp": 10,
            "text": "Study why Abandoned Cart flows exist — recovering revenue from people who almost bought"
          },
          {
            "id": "3b",
            "xp": 10,
            "text": "Study why Welcome Series exist — converting new subscribers into first-time buyers"
          },
          {
            "id": "3c",
            "xp": 10,
            "text": "Study why Post-Purchase flows exist — building trust and setting up the second sale"
          },
          {
            "id": "3d",
            "xp": 15,
            "text": "Study why Win-Back flows exist — re-engaging lapsed customers at near-zero cost"
          }
        ]
      },
      {
        "day": 4,
        "focus": "Build Your Dummy Store",
        "icon": "🏗️",
        "tasks": [
          {
            "id": "4a",
            "xp": 10,
            "text": "Set up a free Shopify trial store with a fictional but realistic brand name in your chosen niche"
          },
          {
            "id": "4b",
            "xp": 10,
            "text": "Add 5-8 sample products with real images and descriptions"
          },
          {
            "id": "4c",
            "xp": 15,
            "text": "Connect the Klaviyo-Shopify integration so customer and order data syncs properly"
          }
        ]
      },
      {
        "day": 5,
        "focus": "Build Demo Flow 1 — Abandoned Cart",
        "icon": "🛒",
        "note": "Always build this one first. It is the highest-ROI, easiest-to-explain flow that exists.",
        "tasks": [
          {
            "id": "5a",
            "xp": 10,
            "text": "Open Klaviyo → Flows → use the Abandoned Checkout template as your starting point"
          },
          {
            "id": "5b",
            "xp": 10,
            "text": "Customize into a 3-email sequence at 1 hour, 24 hours, and 72 hours after abandonment"
          },
          {
            "id": "5c",
            "xp": 10,
            "text": "Add a small discount incentive on the final email only"
          },
          {
            "id": "5d",
            "xp": 15,
            "text": "Test the entire flow yourself by abandoning a cart on your dummy store"
          }
        ]
      },
      {
        "day": 6,
        "focus": "Build Demo Flow 2 — Welcome Series",
        "icon": "👋",
        "tasks": [
          {
            "id": "6a",
            "xp": 10,
            "text": "Open Klaviyo → Flows → use the Welcome Series template"
          },
          {
            "id": "6b",
            "xp": 10,
            "text": "Customize into a 4-5 email sequence introducing the brand story and a first-purchase incentive"
          },
          {
            "id": "6c",
            "xp": 10,
            "text": "Connect it to a signup popup on your dummy store"
          },
          {
            "id": "6d",
            "xp": 15,
            "text": "Test by signing up as a new subscriber"
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
            "text": "Confirm both flows trigger correctly and render well on mobile"
          },
          {
            "id": "7b",
            "xp": 15,
            "text": "Note anything that felt confusing in Klaviyo — revisit the Academy module if needed"
          },
          {
            "id": "d7badge",
            "xp": 40,
            "badge": true,
            "emoji": "⚡",
            "text": "Flows Proven — your first two demo flows built, tested and firing correctly."
          }
        ]
      }
    ]
  },
  {
    "week": 2,
    "title": "Build Your Full Demo Portfolio",
    "range": "Days 8-14",
    "icon": "🎨",
    "color": "#0D7A5F",
    "goal": "All 4 flows built and working, a case study asset ready, and your Store CRM fully set up.",
    "days": [
      {
        "day": 8,
        "focus": "Build Demo Flow 3 — Post-Purchase",
        "icon": "📦",
        "tasks": [
          {
            "id": "8a",
            "xp": 13,
            "text": "Open Klaviyo → Flows → use the Post-Purchase template"
          },
          {
            "id": "8b",
            "xp": 13,
            "text": "Customize into thank-you, shipping update, and review-request emails timed after delivery"
          },
          {
            "id": "8c",
            "xp": 18,
            "text": "Add a cross-sell or replenishment suggestion to the final email"
          }
        ]
      },
      {
        "day": 9,
        "focus": "Build Demo Flow 4 — Win-Back",
        "icon": "🔄",
        "tasks": [
          {
            "id": "9a",
            "xp": 13,
            "text": "Open Klaviyo → Flows → use the Win-Back / Re-engagement template"
          },
          {
            "id": "9b",
            "xp": 13,
            "text": "Segment by 'no purchase in 60+ days' and customize a compelling return offer"
          },
          {
            "id": "9c",
            "xp": 18,
            "text": "Test all 4 flows end to end one final time"
          }
        ]
      },
      {
        "day": 10,
        "focus": "Design Professional Email Templates",
        "icon": "🎨",
        "tasks": [
          {
            "id": "10a",
            "xp": 13,
            "text": "Use Klaviyo's drag-and-drop editor or Canva to design clean, on-brand email templates"
          },
          {
            "id": "10b",
            "xp": 18,
            "text": "Keep design simple and mobile-first — cluttered templates hurt conversion"
          }
        ]
      },
      {
        "day": 11,
        "focus": "Record Loom Walkthroughs",
        "icon": "🎬",
        "note": "Your Loom is your closer. Keep it under 90 seconds per flow, explain the problem before the solution.",
        "tasks": [
          {
            "id": "11a",
            "xp": 13,
            "text": "Record a 60-90 second Loom walkthrough of the abandoned cart flow"
          },
          {
            "id": "11b",
            "xp": 18,
            "text": "Record a 60-90 second Loom walkthrough of the full 4-flow system"
          }
        ]
      },
      {
        "day": 12,
        "focus": "Build Your Case Study Page",
        "icon": "📄",
        "tasks": [
          {
            "id": "12a",
            "xp": 13,
            "text": "Create a simple one-page overview showing all 4 flows with screenshots"
          },
          {
            "id": "12b",
            "xp": 18,
            "text": "Write a 100-word description of what problem each flow solves"
          }
        ]
      },
      {
        "day": 13,
        "focus": "Set Up Your Store Prospecting CRM",
        "icon": "🗂️",
        "tasks": [
          {
            "id": "13a",
            "xp": 13,
            "text": "Build the full Notion database using every column in the Store CRM tab"
          },
          {
            "id": "13b",
            "xp": 18,
            "text": "Set up your 5 views for tracking prospects through the pipeline"
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
            "text": "Confirm you have 4 working flows, a Loom demo, a case study page, and a CRM ready to use"
          },
          {
            "id": "d14badge",
            "xp": 45,
            "badge": true,
            "emoji": "📁",
            "text": "Portfolio Complete — all 4 flows live, a case study ready, and your Store CRM built."
          }
        ]
      }
    ]
  },
  {
    "week": 3,
    "title": "Pick Your Niche and Prospect",
    "range": "Days 15-21",
    "icon": "🎯",
    "color": "#C99A3B",
    "goal": "A specific product category chosen and 30-40 real prospects identified, audited, and scored.",
    "days": [
      {
        "day": 15,
        "focus": "Choose Your Niche Specialization",
        "icon": "🎯",
        "note": "This single decision is what keeps you from competing with every other student running this same system. See the Pick Your Niche tab.",
        "tasks": [
          {
            "id": "15a",
            "xp": 16,
            "text": "Review the 8 niche options in the Pick Your Niche tab"
          },
          {
            "id": "15b",
            "xp": 16,
            "text": "Choose ONE product category to specialize in — do not target 'any ecommerce store'"
          },
          {
            "id": "15c",
            "xp": 21,
            "text": "Rebuild your dummy store's products to match this niche if they don't already"
          }
        ]
      },
      {
        "day": 16,
        "focus": "Learn to Scout Stores",
        "icon": "🔍",
        "tasks": [
          {
            "id": "16a",
            "xp": 16,
            "text": "Search your niche's hashtags on Instagram and TikTok Shop to find active brands"
          },
          {
            "id": "16b",
            "xp": 16,
            "text": "Check the Meta Ad Library for brands running paid ads in your niche — active ad spend signals real budget"
          },
          {
            "id": "16c",
            "xp": 21,
            "text": "Browse r/shopify and relevant ecommerce Facebook groups for visible brands"
          }
        ],
        "bpsCheckpoint": true
      },
      {
        "day": 17,
        "focus": "Build Your Prospect List",
        "icon": "📋",
        "tasks": [
          {
            "id": "17a",
            "xp": 16,
            "text": "Record 30-40 stores in your niche in a spreadsheet — name, URL, Instagram handle, follower count"
          }
        ]
      },
      {
        "day": 18,
        "focus": "Audit Each Prospect",
        "icon": "🔬",
        "note": "Add something to cart and abandon it on each site. Sign up for their list. This tells you exactly what's missing.",
        "tasks": [
          {
            "id": "18a",
            "xp": 16,
            "text": "Add a product to cart and leave — note whether any abandoned cart email arrives within 24 hours"
          },
          {
            "id": "18b",
            "xp": 21,
            "text": "Sign up for their email list — note whether a real welcome series arrives or just one generic email"
          }
        ]
      },
      {
        "day": 19,
        "focus": "Score and Prioritize",
        "icon": "🔥",
        "tasks": [
          {
            "id": "19a",
            "xp": 16,
            "text": "Tag each store: 🔥 Hot (no flows at all, active ad spend), ⚡ Warm (weak flows, some ad spend), ❄️ Cold (strong flows already running)"
          },
          {
            "id": "19b",
            "xp": 21,
            "text": "Focus only on Hot and Warm — Cold stores rarely convert into clients quickly"
          }
        ]
      },
      {
        "day": 20,
        "focus": "Enrich Your Top Prospects",
        "icon": "🔎",
        "tasks": [
          {
            "id": "20a",
            "xp": 16,
            "text": "Find the founder or marketing lead's name via the site's About page or Instagram bio"
          },
          {
            "id": "20b",
            "xp": 21,
            "text": "Note their Instagram handle for DM outreach and, if available, a contact email"
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
            "text": "Confirm you have 15-20 scored, enriched Hot and Warm prospects entered in Notion"
          }
        ]
      }
    ]
  },
  {
    "week": 4,
    "title": "Outreach Launch",
    "range": "Days 22-28",
    "icon": "📧",
    "color": "#8B2E1F",
    "goal": "First wave of outreach sent, replies being tracked, and discovery calls beginning to book.",
    "days": [
      {
        "day": 22,
        "focus": "Draft Personalized Outreach",
        "icon": "✍️",
        "note": "Instagram DM is your primary channel here — ecommerce founders live on Instagram, not necessarily their inbox.",
        "tasks": [
          {
            "id": "22a",
            "xp": 19,
            "text": "Open the Scripts tab — read the Instagram DM and cold email templates"
          },
          {
            "id": "22b",
            "xp": 24,
            "text": "Personalize the opening line for your top 10 prospects — mention something specific you noticed"
          }
        ]
      },
      {
        "day": 23,
        "focus": "Send Wave 1",
        "icon": "🚀",
        "tasks": [
          {
            "id": "23a",
            "xp": 19,
            "text": "Send Instagram DMs to your top 10 Hot prospects"
          },
          {
            "id": "23b",
            "xp": 24,
            "text": "Update Notion Stage to 'Contacted' for each, set Last Contacted date"
          },
          {
            "id": "d23badge",
            "xp": 50,
            "badge": true,
            "emoji": "🎯",
            "text": "First Contact — your first wave of outreach sent to real ecommerce stores."
          }
        ]
      },
      {
        "day": 24,
        "focus": "Send Wave 2",
        "icon": "🚀",
        "tasks": [
          {
            "id": "24a",
            "xp": 19,
            "text": "Send DMs or emails to your next 10 prospects"
          },
          {
            "id": "24b",
            "xp": 24,
            "text": "Update Notion for each"
          }
        ]
      },
      {
        "day": 25,
        "focus": "Monitor and Reply",
        "icon": "🔔",
        "note": "Reply to everything within 2 hours. Ecommerce founders move fast and expect the same.",
        "tasks": [
          {
            "id": "25a",
            "xp": 19,
            "text": "Reply to every response within 2 hours, positive or negative"
          },
          {
            "id": "25b",
            "xp": 24,
            "text": "For positive replies, send your Calendly link immediately"
          },
          {
            "id": "d25badge",
            "xp": 40,
            "badge": true,
            "emoji": "💬",
            "text": "First Reply — a real store owner responded to your outreach."
          }
        ]
      },
      {
        "day": 26,
        "focus": "Follow-Up Message",
        "icon": "📬",
        "tasks": [
          {
            "id": "26a",
            "xp": 19,
            "text": "Send the follow-up script to anyone from Wave 1 who has not replied after 3 days"
          }
        ]
      },
      {
        "day": 27,
        "focus": "Book Discovery Calls",
        "icon": "📅",
        "tasks": [
          {
            "id": "27a",
            "xp": 19,
            "text": "Confirm any booked calls, review each prospect's store again before the call"
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
            "text": "Tally messages sent, replies received, and calls booked"
          }
        ]
      }
    ]
  },
  {
    "week": 5,
    "title": "Close and Begin Delivery",
    "range": "Days 29-35",
    "icon": "🏆",
    "color": "#7A5A00",
    "goal": "Your first paying ecommerce client closed and the Blueprint phase underway.",
    "days": [
      {
        "day": 29,
        "focus": "Run the Discovery Call",
        "icon": "📞",
        "note": "Ask what % of their revenue currently comes from email. Most without flows sit under 3% — this number does the selling for you.",
        "tasks": [
          {
            "id": "29a",
            "xp": 22,
            "text": "Use the discovery call questions from the Scripts tab"
          },
          {
            "id": "29b",
            "xp": 27,
            "text": "Ask specifically what percentage of revenue currently comes from email"
          },
          {
            "id": "d29badge",
            "xp": 55,
            "badge": true,
            "emoji": "📞",
            "text": "First Discovery Call — ran your first real call, revenue-from-email question asked."
          }
        ]
      },
      {
        "day": 30,
        "focus": "Send Proposal",
        "icon": "📄",
        "tasks": [
          {
            "id": "30a",
            "xp": 22,
            "text": "Send your 3-tier package (Starter / Growth / Full Revenue System) within 24 hours of the call"
          }
        ],
        "bpsCheckpoint": true
      },
      {
        "day": 31,
        "focus": "Handle Objections",
        "icon": "🛡️",
        "tasks": [
          {
            "id": "31a",
            "xp": 22,
            "text": "Use the 'already have Klaviyo' and 'how much revenue' objection scripts as needed"
          }
        ]
      },
      {
        "day": 32,
        "focus": "Close Your First Client",
        "icon": "🤝",
        "tasks": [
          {
            "id": "32a",
            "xp": 22,
            "text": "Get agreement on package and price"
          },
          {
            "id": "32b",
            "xp": 27,
            "text": "Collect 50% deposit before starting real build work"
          },
          {
            "id": "d32badge",
            "xp": 80,
            "badge": true,
            "emoji": "🤝",
            "text": "First Client Signed — your first Klaviyo retainer closed and deposited."
          }
        ]
      },
      {
        "day": 33,
        "focus": "Blueprint Their Flows",
        "icon": "📐",
        "tasks": [
          {
            "id": "33a",
            "xp": 22,
            "text": "Map exactly which flows and segments their store needs based on the discovery call"
          }
        ]
      },
      {
        "day": 34,
        "focus": "Begin the Build",
        "icon": "🛠️",
        "tasks": [
          {
            "id": "34a",
            "xp": 22,
            "text": "Connect their Shopify store to Klaviyo"
          },
          {
            "id": "34b",
            "xp": 27,
            "text": "Begin building the abandoned cart flow first — fastest visible win"
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
            "text": "Confirm the first client is closed, paid, and the build is underway"
          }
        ]
      }
    ]
  },
  {
    "week": 6,
    "title": "Launch and Prove Value",
    "range": "Days 36-42",
    "icon": "🚀",
    "color": "#0D7A5F",
    "goal": "All flows live for the client with the first real revenue numbers to show.",
    "days": [
      {
        "day": 36,
        "focus": "Continue the Build",
        "icon": "🛠️",
        "tasks": [
          {
            "id": "36a",
            "xp": 25,
            "text": "Build the welcome series and post-purchase flow for the client"
          }
        ]
      },
      {
        "day": 37,
        "focus": "Finish the Build",
        "icon": "🛠️",
        "tasks": [
          {
            "id": "37a",
            "xp": 25,
            "text": "Build the win-back flow, completing all 4 core flows"
          }
        ]
      },
      {
        "day": 38,
        "focus": "Test Thoroughly",
        "icon": "🧪",
        "tasks": [
          {
            "id": "38a",
            "xp": 25,
            "text": "Test every flow end to end using real test purchases and signups"
          }
        ]
      },
      {
        "day": 39,
        "focus": "Launch Live",
        "icon": "🚀",
        "tasks": [
          {
            "id": "39a",
            "xp": 25,
            "text": "Activate all 4 flows for the live store"
          },
          {
            "id": "d39badge",
            "xp": 60,
            "badge": true,
            "emoji": "🚀",
            "text": "First Flows Live — the client's 4 flows activated on their real store."
          }
        ]
      },
      {
        "day": 40,
        "focus": "Monitor Early Performance",
        "icon": "👀",
        "tasks": [
          {
            "id": "40a",
            "xp": 25,
            "text": "Check open rates, click rates, and any early recovered revenue daily"
          }
        ]
      },
      {
        "day": 41,
        "focus": "Pull First Revenue Numbers",
        "icon": "📊",
        "tasks": [
          {
            "id": "41a",
            "xp": 25,
            "text": "Export the first week of revenue attributed directly to the new flows inside Klaviyo"
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
            "text": "Confirm the flows are running cleanly with real, positive early numbers"
          }
        ]
      }
    ]
  },
  {
    "week": 7,
    "title": "Upsell, Referral, and Scale",
    "range": "Days 43-45",
    "icon": "📈",
    "color": "#7A5A00",
    "goal": "First revenue report delivered, SMS upsold, and a referral or new prospect wave launched.",
    "days": [
      {
        "day": 43,
        "focus": "Present the Revenue Report",
        "icon": "📊",
        "note": "Klaviyo shows revenue-attributed numbers directly in the dashboard — screenshot this for every monthly check-in from now on.",
        "tasks": [
          {
            "id": "43a",
            "xp": 28,
            "text": "Send or present a simple report showing revenue recovered by each flow"
          }
        ]
      },
      {
        "day": 44,
        "focus": "Pitch SMS as an Upsell",
        "icon": "📱",
        "tasks": [
          {
            "id": "44a",
            "xp": 28,
            "text": "Use the SMS upsell script from the Scripts tab"
          },
          {
            "id": "44b",
            "xp": 33,
            "text": "Position it as the natural next layer now that email flows are proven"
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
            "text": "Ask if they know other stores in your niche who might benefit"
          },
          {
            "id": "45b",
            "xp": 33,
            "text": "Set your next 30-day targets — new prospects, new outreach volume, revenue goal"
          },
          {
            "id": "d45badge",
            "xp": 100,
            "badge": true,
            "emoji": "🏆",
            "text": "Certified — you completed the full 45-Day Revenue Recovery Engine."
          }
        ],
        "bpsCheckpoint": true
      }
    ]
  }
];

const NOTION_COLS = [
  {name:"Store Name",            type:"Title",    icon:"🏪", desc:"The ecommerce brand's name"},
  {name:"Store URL",             type:"URL",      icon:"🔗", desc:"Their live storefront link"},
  {name:"Niche / Category",      type:"Select",   icon:"🎯", desc:"Skincare / Supplements / Pet / Jewelry / Baby / Coffee / Fitness / Tech / Other"},
  {name:"Platform",              type:"Select",   icon:"🛒", desc:"Shopify / WooCommerce / Other"},
  {name:"Instagram Handle",      type:"Text",     icon:"📸", desc:"Their Instagram username for DM outreach"},
  {name:"Instagram Followers",   type:"Number",   icon:"👥", desc:"Rough follower count as a size signal"},
  {name:"Running Paid Ads?",     type:"Checkbox", icon:"💵", desc:"Checked via Meta Ad Library — signals active marketing budget"},
  {name:"Founder / Contact Name",type:"Text",     icon:"👤", desc:"Owner or marketing lead's name"},
  {name:"Contact Email",         type:"Email",    icon:"📧", desc:"Direct email if available"},
  {name:"Has Abandoned Cart Flow?",type:"Checkbox",icon:"🛒", desc:"Audit finding — did a recovery email arrive after abandoning a cart?"},
  {name:"Has Welcome Series?",   type:"Checkbox", icon:"👋", desc:"Audit finding — did a real sequence arrive after signing up?"},
  {name:"Current Platform",      type:"Select",   icon:"⚙️", desc:"None / Klaviyo / Mailchimp / Other"},
  {name:"Lead Score",            type:"Number",   icon:"🔥", desc:"1-10 based on flow gaps and ad spend signal"},
  {name:"Lead Priority",         type:"Select",   icon:"🎯", desc:"🔥 Hot · ⚡ Warm · ❄️ Cold"},
  {name:"Lead Stage",            type:"Select",   icon:"📊", desc:"Not Contacted → Contacted → Replied Positively → Replied Negatively → Call Booked → Proposal Sent → Closed → Retainer"},
  {name:"DM Sent",               type:"Checkbox", icon:"💬", desc:"Instagram DM outreach sent"},
  {name:"Email Sent",            type:"Checkbox", icon:"✉️", desc:"Cold email outreach sent"},
  {name:"Last Contacted",        type:"Date",     icon:"📅", desc:"Most recent outreach date"},
  {name:"Notes",                 type:"Text",     icon:"📝", desc:"Reply content, objections raised, anything relevant"},
];

const NOTION_VIEWS = [
  {name:"📋 All Prospects",      desc:"Master table — every store you've identified across all niches."},
  {name:"🔥 Hot Prospects",      desc:"Filter: Priority = Hot. No flows running, active ad spend — your highest-converting targets."},
  {name:"📬 Active Outreach",    desc:"Filter: Stage = Contacted or Replied Positively. Your live pipeline."},
  {name:"📊 Pipeline Board",     desc:"Kanban grouped by Lead Stage — drag prospects through as they progress."},
  {name:"💰 Active Clients",     desc:"Filter: Stage = Retainer. Your recurring revenue base and referral source list."},
];

/* Phase overview — the 7 weeks grouped into 3 arcs, same shape as every
   other rebuilt path's Start Here tab. Scorecards are the weeks' own real
   "goal" fields, combined, not new claims. */
const PHASE_META = [
  { name: "Phase 01 — Skill & Portfolio", range: "Weeks 1–2 · Days 1–14",
    scorecard: "By end of Day 14: Klaviyo fundamentals learned with a dummy store live, all 4 flows built and working, a case study asset ready, and your Store CRM fully set up." },
  { name: "Phase 02 — Niche, Prospect & Outreach", range: "Weeks 3–4 · Days 15–28",
    scorecard: "By end of Day 28: a specific product category chosen with 30–40 real prospects identified, audited and scored, and a first wave of outreach sent with replies tracked and discovery calls beginning to book." },
  { name: "Phase 03 — Close, Deliver & Prove", range: "Weeks 5–7 · Days 29–45",
    scorecard: "By end of Day 45: first paying client closed with all flows live and real revenue numbers to show, a first revenue report delivered, SMS upsold, and a referral or new prospect wave launched." },
];

/* "Pick a Focus" — sourced from the SAME NICHES catalog the E-commerce
   Prospecting Guide itself renders (8 product categories with real AOV,
   abandonment and psychology data), so nothing here is invented or drifts
   out of sync with that playbook. The beneficiary types up to 3 candidate
   niches; FocusPicker fetches the real stats for each. */
const FOCUS_FIELDS = [
  { key: "aov", label: "Average Order Value" },
  { key: "abandon", label: "Cart Abandonment" },
  { key: "repeat", label: "Repeat Purchase Rate" },
  { key: "competition", label: "Agency Competition" },
  { key: "why", label: "Why This Niche" },
  { key: "psychology", label: "Buyer Psychology" },
  { key: "find", label: "Where To Find Stores" },
  { key: "flow", label: "Strongest Opening Flow" },
  { key: "note", label: "Note" },
];

/* Scout Methods — genuinely different ways of finding real stores inside
   a niche, not sequential steps of one method. Drawn from the real "find"
   data already documented across NICHES, separated out as parallel,
   nameable options. */
const SCOUT_METHODS = [
  { name: "Hashtag & Sub-Niche Sweep", icon: "🏷️",
    detail: "Search the niche's own Instagram and TikTok hashtags, then go one layer deeper into sub-tags (\"clean beauty,\" \"K-beauty,\" \"men's grooming\" instead of just \"skincare\") — the deeper layer is where the real differentiation and lower competition live." },
  { name: "TikTok Shop Category Scan", icon: "🛍️",
    detail: "TikTok Shop's own category rankings surface stores with real, current sales velocity — especially strong for beauty, tech accessories and impulse-buy categories where \"as seen on TikTok\" is already the store's own marketing angle." },
  { name: "Meta Ad Library Keyword Search", icon: "📢",
    detail: "Search the Meta Ad Library for niche keywords (e.g. \"skincare routine\") to find stores actively spending on ads right now — active ad spend is a direct signal of real revenue and a real marketing budget to pitch into." },
  { name: "DTC-Alternative Brand Search", icon: "🔎",
    detail: "For every big-box or marketplace incumbent (Sephora, Chewy, PetSmart), search for the smaller independent DTC alternatives competing against it — these are exactly the under-resourced, single- or two-person teams this system is built to serve." },
  { name: "Subscribe-and-Save Audit", icon: "🔁",
    detail: "For naturally subscription-friendly niches (supplements, coffee), check whether a subscribe-and-save option even exists on the store — many offer it without a single flow actually supporting it, which is an immediate, provable gap to open the pitch with." },
];

const SERVICES_4 = [
  {icon:"🛒", color:"#7A5A00", name:"Abandoned Cart Recovery Flow", price:"Recovers 5-10% of otherwise-lost cart revenue",
   signal:"No abandoned cart flow currently running, or a single generic email instead of a full sequence.",
   pitch:"\"I added something to your cart and no follow-up ever came. For a store your size, that gap is usually costing $2,000-5,000+ a month sitting in abandoned carts. I can build a 3-email recovery sequence that runs automatically — most stores see 5-10% of that abandoned revenue recovered within the first month.\"",
   setup:"Klaviyo → Flows → Abandoned Checkout template → customize 3-email sequence at 1hr, 24hr, 72hr → add discount incentive on final email only → activate",
   upsell:"\"Once cart recovery is proven, the next flow that typically adds even more revenue is a proper welcome series — want me to build that next?\""},
  {icon:"👋", color:"#0D7A5F", name:"Welcome Series", price:"Typically converts 10-15% higher than no sequence at all",
   signal:"No popup or discount offer for new visitors, generic or missing welcome email after signup.",
   pitch:"\"Right now, someone who joins your list gets nothing, or one generic email. A proper welcome series introduces your brand story, builds trust, and converts meaningfully higher than sending nothing at all. I can build a 4-5 email series that runs the moment someone signs up.\"",
   setup:"Klaviyo → Flows → Welcome Series template → customize brand story + product highlights + first-purchase incentive → connect to signup popup → activate",
   upsell:"\"With welcome and cart recovery both running, the next gap is usually what happens AFTER someone buys — want me to build the post-purchase flow too?\""},
  {icon:"📦", color:"#C99A3B", name:"Post-Purchase Flow", price:"Increases repeat purchase rate and review volume",
   signal:"No follow-up after purchase beyond a basic shipping confirmation, no automated review request.",
   pitch:"\"After someone buys, does anything happen besides a shipping email? A good post-purchase flow builds trust, requests reviews at the right moment, and sets up the second purchase — brands with this running typically see meaningfully higher repeat purchase rates.\"",
   setup:"Klaviyo → Flows → Post-Purchase template → customize thank-you + shipping updates + review request timed to delivery + cross-sell suggestion → activate",
   upsell:"\"The last piece of the puzzle is bringing back customers who've gone quiet — want me to build a win-back flow next?\""},
  {icon:"🔄", color:"#8B2E1F", name:"Win-Back / Re-engagement Flow", price:"Recovers dead revenue at near-zero acquisition cost",
   signal:"No flow targeting customers who haven't purchased in 60-90+ days, a growing list of inactive subscribers.",
   pitch:"\"You likely have hundreds of past customers who haven't bought in months — reaching them again costs a fraction of acquiring someone brand new. I can build a win-back sequence that re-engages lapsed customers with a compelling reason to return.\"",
   setup:"Klaviyo → Flows → Win-Back template → segment by 'no purchase in 60+ days' → customize re-engagement offer sequence → activate",
   upsell:"\"This is typically the final core flow — from here, the conversation shifts to SMS as an additional revenue layer, or ongoing campaign management.\""},
];

const SCRIPTS = [
  {id:"dm", tag:"Instagram DM · Opening Message", color:"#8B2E1F",
   title:"Instagram DM Opener",
   note:"This is your primary channel — ecommerce founders live on Instagram far more than their inbox. Keep it short.",
   body:"Hey [Brand name]! Love what you're building with [specific product/post you noticed]. Quick question — when someone adds to cart but doesn't check out, does anything follow up with them automatically? I checked and couldn't find one running. That gap usually costs stores like yours $2,000-5,000+ a month in recoverable revenue. I build these recovery flows for [niche] brands — happy to send you a quick example if useful?"},
  {id:"email", tag:"Cold Email · PAS Formula", color:"#7A5A00",
   title:"Cold Email — The Gap",
   note:"Use this as a backup channel, or when a contact email is easier to find than an active Instagram DM.",
   body:"Subject: [Brand Name] — noticed something about your cart recovery\n\nHi [Name],\n\nI was checking out [Brand Name] and added something to cart to see what happens next — no follow-up email came.\n\nFor a store your size, that gap is usually costing $2,000-5,000+ a month in recoverable revenue sitting in abandoned carts alone.\n\nI build automated email systems for [niche] brands that recover this — abandoned cart, welcome series, post-purchase, and win-back flows, all running on autopilot inside Klaviyo.\n\nI put together a quick example of what this could look like for a store like yours: [Loom link]\n\nWorth a 15-minute look?\n\n[Calendly link]\n\n[Your name]"},
  {id:"follow", tag:"Follow-Up · Day 3", color:"#0D7A5F",
   title:"Follow-Up Message",
   note:"Send if no reply after 3 days. Leads with a number, not a reminder that you messaged before.",
   body:"Subject: One number worth seeing\n\nHi [Name],\n\nQuick follow-up — I ran a rough estimate based on typical [niche] store metrics: if you're doing [$X]/month in revenue, an abandoned cart flow alone typically recovers 5-10% of that automatically, every month, without any extra ad spend.\n\nHappy to show exactly how on a quick call: [Calendly link]\n\n[Your name]"},
  {id:"discovery", tag:"Discovery Call · Key Questions", color:"#C99A3B",
   title:"Discovery Call Questions",
   note:"The gap between their answer and the industry benchmark does the selling — you barely need to pitch after this.",
   body:"\"What percentage of your monthly revenue currently comes from email?\" (Industry average for stores WITH good flows sits at 15-30%. Most stores with none sit under 3%.)\n\n\"Do you have an abandoned cart flow running right now?\"\n\n\"What happens after someone makes their first purchase — anything automatic, or is that it?\"\n\n\"When was the last time you emailed people who haven't bought in 60+ days?\""},
  {id:"obj1", tag:"Objection · Already Have Klaviyo", color:"#7A5A00",
   title:"Objection: \"We Already Use Klaviyo\"",
   note:"This is actually an easier close than a store with nothing — they already believe in email, they just haven't finished building it.",
   body:"\"That's great — having the tool already means we can move even faster. A lot of stores have the tool but the flows inside are either basic default templates or not fully built out. Mind if I take a quick look at what's currently live? If it's already dialed in, I'll tell you honestly. Most of the time there's still real revenue sitting on the table even with an existing setup.\""},
  {id:"obj2", tag:"Objection · Revenue Uncertainty", color:"#0D7A5F",
   title:"Objection: \"How Much Revenue Will This Add?\"",
   note:"Never promise an exact number before seeing their data — the benchmark comparison is honest and persuasive on its own.",
   body:"\"Totally fair question. Industry benchmarks show email typically drives 15-30% of total revenue for stores with well-built flows, versus under 3% for stores with none. I won't promise an exact number before seeing your data, but I can show you your current cart abandonment rate and walk through the math live on a call — the numbers usually make the case better than I can.\""},
  {id:"sms", tag:"Upsell · SMS", color:"#7A5A00",
   title:"SMS Upsell Pitch",
   note:"Only pitch this after email flows have proven real results — never stack services before the first one is trusted.",
   body:"\"Now that your email flows are running and you're seeing [$X] in recovered revenue, the natural next step is SMS. Text messages get opened almost immediately — most stores see SMS convert even higher than email for cart recovery specifically. Want me to add that layer in?\""},
  {id:"referral", tag:"Growth · Referral Ask", color:"#8B2E1F",
   title:"Asking for a Referral",
   note:"Niche-specific referrals are gold — other brand owners in the same category often know each other.",
   body:"\"I'm really glad this has made a difference for [store name]. Do you know any other [niche] brands who might be leaving similar revenue on the table? I'd love an introduction — happy to run the same kind of quick audit for them.\""},
];

const PACKAGES = [
  {name:"Starter", icon:"🌱", color:"#0D7A5F", price:"$297-$397/month",
   includes:["Abandoned Cart Recovery flow only","Monthly performance check-in"],
   bestFor:"Brand new stores or very tight budgets testing the waters"},
  {name:"Growth", icon:"⚡", color:"#7A5A00", price:"$500-$700/month",
   includes:["All 4 core flows (Cart, Welcome, Post-Purchase, Win-Back)","1-2 promotional campaign sends per month","Monthly revenue report"],
   bestFor:"Established stores with steady traffic wanting to maximize revenue"},
  {name:"Full Revenue System", icon:"🏆", color:"#8B2E1F", price:"$800-$1,200/month",
   includes:["Everything in Growth","SMS flows added","Monthly A/B testing and optimization","Monthly strategy call"],
   bestFor:"Scaling brands wanting a complete retention marketing partner"},
];

const FAQS = [
  {q:"What if I've never run an online store myself?",
   a:"You don't need to have run a store — you need a working demo. Build a free dummy Shopify store, populate it with a few products in your chosen niche, and build real, working flows inside it. That dummy store becomes your proof of skill, exactly like your SMB Lovable demos."},
  {q:"What if a prospect asks for my portfolio and I don't have real clients yet?",
   a:"Show your dummy store demo and be honest: 'I built this specifically to show [niche] brands exactly what this looks like before working with real client data.' A working demo is more convincing than a portfolio of screenshots — it runs, it isn't just a photo."},
  {q:"Do I need to buy the Klaviyo paid plan to start?",
   a:"No. Klaviyo's free plan supports up to 250 active profiles with real automation flows — completely sufficient to build your demo and even onboard your first small client before you need to consider a paid tier."},
  {q:"How do I actually find good prospects instead of just guessing?",
   a:"Instagram and TikTok are your best free sources — search your niche's hashtags, check the Meta Ad Library for brands running paid ads (active spend signals real budget), then audit whether their store shows visible signs of missing flows."},
  {q:"What if they're already using Klaviyo but poorly?",
   a:"This is actually an easier sell than a store with nothing at all — they already believe in email marketing, they just haven't executed it well. Audit what's live, show the specific gaps, and position yourself as the person who finishes what's been started."},
  {q:"Should I charge a flat fee or a percentage of revenue?",
   a:"Start with a flat fee while you're building trust and don't yet have a track record with them specifically. Once you've proven results over 2-3 months, propose a hybrid model — smaller flat fee plus a percentage of email-attributed revenue — which rewards genuine performance."},
  {q:"What's a realistic first-month timeline?",
   a:"Following this plan consistently: first outreach replies typically arrive within the first week of sending. Discovery calls follow within days. Most beginners close their first client between day 28 and day 40 if outreach volume and follow-up stay consistent."},
  {q:"Can I do this for WooCommerce too, or only Shopify?",
   a:"Yes — Klaviyo integrates with WooCommerce as well as Shopify, plus several other platforms. Shopify is simply the most common and visible platform to find and demo on when you're starting out."},
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

export default function RevenueRecoveryEngine() {
  const [tab,setTab]             = useState("plan");
  const [openWeek,setOpenWeek]   = useState(0);
  const [openDay,setOpenDay]     = useState(null);
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
    {id:"start",   label:"🧭 Start Here"},
    {id:"focus",   label:"🎯 Pick a Focus"},
    {id:"scout",   label:"🔍 Scout Methods"},
    {id:"plan",    label:"📅 45-Day Plan"},
    {id:"notion",  label:"🗂️ Store CRM"},
    {id:"flows",   label:"📧 The 4 Flows"},
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
            The Revenue Recovery Engine — 45-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Ecommerce Email & SMS Revenue System
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#6E6459",maxWidth:580,lineHeight:1.65}}>
            Build automated Klaviyo flows that recover lost revenue for ecommerce brands — abandoned
            cart, welcome series, post-purchase, and win-back. No Google Maps, no phone calls.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F30",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this system exists:</strong> ecommerce brands buy
              on a completely different logic than local SMBs — they judge you by a number in a
              dashboard, not a Google review. Product category is nearly infinite, so two students
              both doing 'ecommerce email' never compete if one specializes in skincare and the other
              in pet products. Pick your niche and own it.
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

        {/* START HERE */}
        {tab==="start"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>How This System Works</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px",lineHeight:1.6}}>
              The Revenue Recovery Engine is a 45-day system for building a paid Klaviyo email/SMS retainer for
              one product niche — starting from a free dummy-store portfolio, through targeted store
              prospecting, a real outreach wave, and a converted flows-live retainer.
            </p>
            <PhaseOverview phases={PHASE_META}/>
            <div style={{background:"#F8F5EE",border:"1px solid #FBF8F1",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#7A5A00",margin:"0 0 8px"}}>How to run this system</p>
              <ol style={{margin:0,paddingLeft:18,fontSize:13,color:"#6E6459",lineHeight:1.8}}>
                <li>Read <strong style={{color:"#201A16"}}>Pick a Focus</strong> and commit to one product category before Day 15 — you can't prospect or pitch a target you haven't chosen.</li>
                <li>Learn <strong style={{color:"#201A16"}}>Scout Methods</strong> in Week 3 — they're the engine every later prospecting day runs on.</li>
                <li>Work the <strong style={{color:"#201A16"}}>45-Day Plan</strong> in order, checking off tasks as you go — your rank climbs automatically.</li>
                <li>Read <strong style={{color:"#201A16"}}>The 4 Flows</strong> whenever you're unsure what a retainer actually delivers.</li>
              </ol>
            </div>
            <div>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#7A5A00",margin:"0 0 8px"}}>BPS Checkpoints Inside the 45 Days</p>
              <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 10px",lineHeight:1.6}}>
                Three days in the plan are marked ★ — Belief (Day 16), Affirmation (Day 30), and Evaluation (Day 45).
              </p>
              <BpsCheckpoints checkpoints={BPS_CHECKPOINTS}/>
            </div>
          </div>
        )}

        {/* PICK A FOCUS */}
        {tab==="focus"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Pick a Focus</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Type up to 3 product niches you're drawn to from the E-commerce Prospecting Guide's full catalog.
              Fetch each one's real AOV, abandonment and psychology data, compare, then specialize deeply in
              one before Day 15.
            </p>
            <FocusPicker options={NICHES} getName={(o)=>o.name} fields={FOCUS_FIELDS} placeholder="e.g. Skincare & Beauty"/>
          </div>
        )}

        {/* SCOUT METHODS */}
        {tab==="scout"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Scout Methods</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Five genuinely different ways to find real stores inside your chosen niche — the engine behind
              every prospecting day in the 45-Day Plan.
            </p>
            <ScoutMethodsList methods={SCOUT_METHODS}/>
          </div>
        )}

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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Store Prospecting CRM</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Notion (free plan) tracks every store you audit, enrich, and pitch — from raw prospect
              to closed retainer.
            </p>
            <div style={{marginBottom:10}}>
              <SLabel text="All 19 Database Properties" color="#0D7A5F"/>
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

        {/* FLOWS */}
        {tab==="flows"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The 4 Core Flows</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Build these in this exact order — Abandoned Cart first, always. It is the fastest,
              easiest-to-explain win, and it funds trust for everything after it.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SERVICES_4.map((s,i)=>{
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
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{s.name}</div>
                        <div style={{fontSize:12,color:s.color,fontWeight:600,marginTop:2}}>{s.price}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["🔍 Signal — When to Lead With This",s.signal,"#7A5A00"],
                          ["🎤 Pitch Script",s.pitch,"#0D7A5F"],
                          ["⚙️ Setup Steps",s.setup,"#C99A3B"],
                          ["📈 Upsell Trigger",s.upsell,"#8B2E1F"],
                        ].map(([lbl,val,col])=>(
                          <div key={lbl} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"",
                              letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                            <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                              borderLeft:`2px solid ${col}40`,paddingLeft:10,
                              fontStyle:lbl.includes("Pitch")?"italic":"normal"}}>{val}</p>
                          </div>
                        ))}
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
              Instagram DM is your primary channel. Cold email is a solid backup. Personalize every
              bracketed section before sending.
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
              Start with a flat fee. Once results are proven over 2-3 months, offer a hybrid model —
              smaller flat fee plus a percentage of email-attributed revenue.
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
                {t:"Starter only",v:"$3,564-$4,764/year"},
                {t:"Growth tier",v:"$6,000-$8,400/year"},
                {t:"Full Revenue System",v:"$9,600-$14,400/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#6E6459",margin:"10px 0 0",lineHeight:1.6}}>
                Five clients on the Growth tier alone = $30,000-$42,000 a year in recurring revenue,
                built on a system that runs almost entirely on its own once live.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>FAQ</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px"}}>
              The questions every student asks before pitching their first ecommerce brand.
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
