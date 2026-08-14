import { useState, useEffect, useMemo, useCallback } from "react";
import { BpsCheckpoints } from "@/components/paths/shared/primitives";

const STORAGE_KEY = "broadcast-progress-v1";

const RANKS = [
  { name:"Broadcast Recruit", threshold:0, blurb:"Day 1. Audacity and CapCut installed, shows bookmarked to study." },
  { name:"Production Scout", threshold:10, blurb:"Core editing techniques learned, first practice episode edited." },
  { name:"Genre Prospector", threshold:23, blurb:"A full demo portfolio — episodes, clips, show notes and a genre chosen." },
  { name:"Broadcast Apprentice", threshold:37, blurb:"Outreach sent to real hosts. The pipeline is live." },
  { name:"Field Production Partner", threshold:51, blurb:"First discovery call run, real workflow gaps understood." },
  { name:"Contract Broadcast Engineer", threshold:66, blurb:"First retainer signed. A real show, onboarded." },
  { name:"Certified Broadcast Engineer", threshold:79, blurb:"45 days, one genre, one real episode published. This one's earned." },
];

/* BPS checkpoints — Belief (Day 16) → Affirmation (Day 30) → Evaluation (Day 45),
   the same three days as CareBridge and the SMB Optimisation Engine. */
const BPS_CHECKPOINTS = [
  { day:16, type:"Belief Goal", detail:"Commit to your personal prospecting formula — how many shows you audit daily, how many outreach messages you send weekly — chosen from your own Week 1-2 practice, not a guess." },
  { day:30, type:"Affirmation Goal", detail:"A 14-day honest effort report on your formula. Strict remark bands apply: 72%+ 'Effort is satisfactory, goal set to be achieved.' 60-71% 'Effort is minimal, goal not taken seriously.' Below 60% 'Effort is below requisite, failure of goal is imminent.'" },
  { day:45, type:"Evaluation Goal", detail:"The full 40-day evaluation from Belief Goal submission. 75%+ 'My effort is satisfactory, goal set will be achieved.' 60-74% 'My effort has been minimal, this goal may not be achieved.' Below 60% 'My effort has been poor, the goal is unmet.'" },
];

const WEEKS = [
  {
    "week": 1,
    "title": "Learn the System, Build Your Editing Skills",
    "range": "Days 1-7",
    "icon": "🎧",
    "color": "#7A5A00",
    "goal": "Free tools set up, core editing techniques learned, and your first practice episode edited.",
    "days": [
      {
        "day": 1,
        "focus": "Free Tool Setup",
        "icon": "⚡",
        "note": "Total cost today: $0. Audacity is unlimited and genuinely professional — no watermarks, no time caps.",
        "tasks": [
          {
            "id": "1a",
            "xp": 10,
            "text": "Download Audacity — free, unlimited, no time or feature restrictions"
          },
          {
            "id": "1b",
            "xp": 10,
            "text": "Create a free CapCut account for social clip creation"
          },
          {
            "id": "1c",
            "xp": 10,
            "text": "Create a free Notion account — this becomes your Show CRM"
          },
          {
            "id": "1d",
            "xp": 15,
            "text": "Bookmark 10-15 podcasts across genres you're considering, to study production quality"
          }
        ]
      },
      {
        "day": 2,
        "focus": "Learn Audacity Basics",
        "icon": "🎛️",
        "tasks": [
          {
            "id": "2a",
            "xp": 10,
            "text": "Complete a beginner Audacity tutorial covering noise reduction, leveling, and cutting dead air"
          }
        ]
      },
      {
        "day": 3,
        "focus": "Study Podcast Editing Standards",
        "icon": "🔍",
        "note": "Train your ear before you train your hands. Knowing what 'good' sounds like is half the skill.",
        "tasks": [
          {
            "id": "3a",
            "xp": 10,
            "text": "Listen to 5 well-produced podcasts and 5 poorly-produced ones — note the specific differences"
          },
          {
            "id": "3b",
            "xp": 15,
            "text": "Study pacing, filler-word removal, and level consistency across the well-produced examples"
          }
        ]
      },
      {
        "day": 4,
        "focus": "Learn Show Notes and Timestamps",
        "icon": "📝",
        "tasks": [
          {
            "id": "4a",
            "xp": 10,
            "text": "Study 5 examples of well-written show notes and note what makes them effective"
          }
        ]
      },
      {
        "day": 5,
        "focus": "Learn Clip Creation Basics",
        "icon": "✂️",
        "note": "Most new listeners discover a show through a clip, not the platform itself — this skill matters as much as editing.",
        "tasks": [
          {
            "id": "5a",
            "xp": 10,
            "text": "Study 10 high-performing podcast clips on TikTok, Reels, or Shorts — note the hook, captions, and format"
          }
        ]
      },
      {
        "day": 6,
        "focus": "Edit Practice Episode 1",
        "icon": "🎬",
        "tasks": [
          {
            "id": "6a",
            "xp": 10,
            "text": "Find royalty-free or your own recorded raw podcast audio"
          },
          {
            "id": "6b",
            "xp": 15,
            "text": "Edit a full practice episode start to finish in Audacity"
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
            "text": "Listen back critically — does it sound professionally produced?"
          },
          {
            "id": "d7badge",
            "xp": 40,
            "badge": true,
            "emoji": "🎧",
            "text": "Editing Skills Proven — your first practice episode edited and reviewed critically."
          }
        ]
      }
    ]
  },
  {
    "week": 2,
    "title": "Build Your Full Demo Portfolio",
    "range": "Days 8-14",
    "icon": "📁",
    "color": "#0D7A5F",
    "goal": "Two fully-produced practice episodes, show notes, social clips, and a Loom demo ready.",
    "days": [
      {
        "day": 8,
        "focus": "Edit Practice Episode 2",
        "icon": "🎬",
        "tasks": [
          {
            "id": "8a",
            "xp": 13,
            "text": "Edit a second practice episode, ideally in a different style than episode 1"
          }
        ]
      },
      {
        "day": 9,
        "focus": "Write Show Notes for Both Episodes",
        "icon": "📝",
        "tasks": [
          {
            "id": "9a",
            "xp": 13,
            "text": "Write complete show notes and timestamps for both practice episodes"
          }
        ]
      },
      {
        "day": 10,
        "focus": "Create Social Clips",
        "icon": "✂️",
        "tasks": [
          {
            "id": "10a",
            "xp": 13,
            "text": "Cut 3-5 clips from your practice episodes using CapCut, with captions and vertical formatting"
          }
        ]
      },
      {
        "day": 11,
        "focus": "Set Up a Distribution Demo",
        "icon": "📡",
        "tasks": [
          {
            "id": "11a",
            "xp": 13,
            "text": "Create a free Buzzsprout or Spotify for Podcasters account"
          },
          {
            "id": "11b",
            "xp": 18,
            "text": "Upload one practice episode to demonstrate the publishing process"
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
            "text": "Create a simple document showing before/after audio samples, show notes, and clip examples"
          }
        ]
      },
      {
        "day": 13,
        "focus": "Record Loom Walkthroughs",
        "icon": "🎥",
        "tasks": [
          {
            "id": "13a",
            "xp": 13,
            "text": "Record a 60-90 second Loom explaining your editing process and showing the finished clips"
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
            "text": "Confirm you have 2 edited episodes, show notes, clips, and a Loom demo ready"
          },
          {
            "id": "d14badge",
            "xp": 45,
            "badge": true,
            "emoji": "📁",
            "text": "Portfolio Complete — 2 fully-produced episodes, show notes, clips and a Loom demo ready."
          }
        ]
      }
    ]
  },
  {
    "week": 3,
    "title": "Pick Your Genre and Prospect",
    "range": "Days 15-21",
    "icon": "🎙️",
    "color": "#C99A3B",
    "goal": "A genre specialization chosen and 15-20 real shows identified, audited, and scored.",
    "days": [
      {
        "day": 15,
        "focus": "Choose Your Genre Specialization",
        "icon": "🎯",
        "note": "This decision is what keeps you from competing with every other student running this system. See the Pick Your Genre tab.",
        "tasks": [
          {
            "id": "15a",
            "xp": 16,
            "text": "Review the 8 genre options in the Pick Your Genre tab"
          },
          {
            "id": "15b",
            "xp": 21,
            "text": "Choose ONE genre to specialize in"
          }
        ]
      },
      {
        "day": 16,
        "focus": "Build Your Show CRM",
        "icon": "🗂️",
        "tasks": [
          {
            "id": "16a",
            "xp": 16,
            "text": "Build the full Notion database using every column in the Show CRM tab"
          }
        ],
        "bpsCheckpoint": true
      },
      {
        "day": 17,
        "focus": "Search Podcast Directories",
        "icon": "🔎",
        "tasks": [
          {
            "id": "17a",
            "xp": 16,
            "text": "Search Apple Podcasts and Spotify by your chosen genre for shows with real engagement but visible gaps"
          }
        ]
      },
      {
        "day": 18,
        "focus": "Build Your Target List",
        "icon": "📋",
        "tasks": [
          {
            "id": "18a",
            "xp": 16,
            "text": "List 20-30 shows matching this profile"
          }
        ]
      },
      {
        "day": 19,
        "focus": "Audit Each Show",
        "icon": "🔬",
        "tasks": [
          {
            "id": "19a",
            "xp": 16,
            "text": "Listen to a recent episode from each — note specific gaps: rough audio, no clips, inconsistent schedule"
          }
        ]
      },
      {
        "day": 20,
        "focus": "Score and Prioritize",
        "icon": "🔥",
        "tasks": [
          {
            "id": "20a",
            "xp": 16,
            "text": "Tag each show: 🔥 Hot, ⚡ Warm, ❄️ Cold based on gap size and audience engagement"
          },
          {
            "id": "20b",
            "xp": 21,
            "text": "Focus only on Hot and Warm shows"
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
            "text": "Confirm you have 15-20 scored, audited target shows ready for outreach"
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
    "goal": "First wave of outreach sent, with replies being tracked and calls beginning to book.",
    "days": [
      {
        "day": 22,
        "focus": "Find Host Contact Info",
        "icon": "🔍",
        "tasks": [
          {
            "id": "22a",
            "xp": 19,
            "text": "Find each host's email or social handle — often listed in show notes or the podcast website"
          }
        ]
      },
      {
        "day": 23,
        "focus": "Draft Personalized Outreach",
        "icon": "✍️",
        "tasks": [
          {
            "id": "23a",
            "xp": 19,
            "text": "Personalize the outreach script with a specific observation about each show"
          }
        ]
      },
      {
        "day": 24,
        "focus": "Send Wave 1",
        "icon": "🚀",
        "tasks": [
          {
            "id": "24a",
            "xp": 19,
            "text": "Send outreach to your top 10 targets"
          },
          {
            "id": "24b",
            "xp": 24,
            "text": "Update Notion Stage to 'Contacted' for each"
          },
          {
            "id": "d24badge",
            "xp": 50,
            "badge": true,
            "emoji": "🎯",
            "text": "First Contact — your first wave of outreach sent to real podcast hosts."
          }
        ]
      },
      {
        "day": 25,
        "focus": "Send Wave 2",
        "icon": "🚀",
        "tasks": [
          {
            "id": "25a",
            "xp": 19,
            "text": "Send outreach to your next 10 targets"
          }
        ]
      },
      {
        "day": 26,
        "focus": "Monitor and Reply",
        "icon": "🔔",
        "tasks": [
          {
            "id": "26a",
            "xp": 19,
            "text": "Reply to every response within a few hours, positive or negative"
          },
          {
            "id": "d26badge",
            "xp": 40,
            "badge": true,
            "emoji": "💬",
            "text": "First Reply — a real host responded to your outreach."
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
            "text": "Send the follow-up script to anyone who hasn't responded after a few days"
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
    "title": "Close Your First Client",
    "range": "Days 29-35",
    "icon": "🏆",
    "color": "#7A5A00",
    "goal": "Your first paying podcast production client closed and fully onboarded.",
    "days": [
      {
        "day": 29,
        "focus": "Book Discovery Calls",
        "icon": "📅",
        "tasks": [
          {
            "id": "29a",
            "xp": 22,
            "text": "Schedule calls with anyone who responded positively"
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
            "text": "Use the discovery call questions to understand their current workflow and goals"
          },
          {
            "id": "d30badge",
            "xp": 55,
            "badge": true,
            "emoji": "📞",
            "text": "First Discovery Call — ran your first real call about their production workflow."
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
            "text": "Send your 3-tier package (Starter / Growth / Full Production) within 24 hours"
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
            "text": "Use the 'already edit it myself' and 'can't afford it' objection scripts as needed"
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
            "text": "Collect 50% deposit before beginning production"
          },
          {
            "id": "d33badge",
            "xp": 80,
            "badge": true,
            "emoji": "🤝",
            "text": "First Client Signed — your first podcast production retainer closed and deposited."
          }
        ]
      },
      {
        "day": 34,
        "focus": "Onboard — Get Raw Files",
        "icon": "📥",
        "tasks": [
          {
            "id": "34a",
            "xp": 22,
            "text": "Set up a file-sharing system for raw audio delivery"
          },
          {
            "id": "34b",
            "xp": 27,
            "text": "Confirm their brand requirements — intro, outro, tone preferences"
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
            "text": "Confirm the first client is closed, paid, and onboarded"
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
    "goal": "The first real episode fully produced, approved, and published.",
    "days": [
      {
        "day": 36,
        "focus": "Edit the First Real Episode — Part 1",
        "icon": "🎬",
        "tasks": [
          {
            "id": "36a",
            "xp": 25,
            "text": "Begin editing the client's real raw audio"
          }
        ]
      },
      {
        "day": 37,
        "focus": "Edit the First Real Episode — Part 2",
        "icon": "🎬",
        "tasks": [
          {
            "id": "37a",
            "xp": 25,
            "text": "Finish the full edit — cleanup, pacing, intro/outro placement"
          }
        ]
      },
      {
        "day": 38,
        "focus": "Write Show Notes",
        "icon": "📝",
        "tasks": [
          {
            "id": "38a",
            "xp": 25,
            "text": "Write show notes and timestamps for the episode"
          }
        ]
      },
      {
        "day": 39,
        "focus": "Create Clips",
        "icon": "✂️",
        "tasks": [
          {
            "id": "39a",
            "xp": 25,
            "text": "Cut 3-5 social clips from the finished episode"
          }
        ]
      },
      {
        "day": 40,
        "focus": "Client Review",
        "icon": "👀",
        "tasks": [
          {
            "id": "40a",
            "xp": 25,
            "text": "Send everything for approval before anything publishes"
          }
        ]
      },
      {
        "day": 41,
        "focus": "Publish",
        "icon": "📡",
        "tasks": [
          {
            "id": "41a",
            "xp": 25,
            "text": "Publish the finished episode and clips across the agreed platforms"
          },
          {
            "id": "d41badge",
            "xp": 60,
            "badge": true,
            "emoji": "🚀",
            "text": "First Episode Live — the client's first real episode published across platforms."
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
            "text": "Confirm the first real episode is live and the client is satisfied"
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
        "focus": "Present Results",
        "icon": "📊",
        "tasks": [
          {
            "id": "43a",
            "xp": 28,
            "text": "Show clip performance and any listen/download growth from the first episode"
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
            "text": "Propose increasing clip volume or moving to a Full Production package"
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
            "text": "Ask if they know other hosts in your genre who might want the same support"
          },
          {
            "id": "45b",
            "xp": 33,
            "text": "Set your next 30-day targets"
          },
          {
            "id": "d45badge",
            "xp": 100,
            "badge": true,
            "emoji": "🏆",
            "text": "Certified — you completed the full 45-Day Broadcast Engine."
          }
        ],
        "bpsCheckpoint": true
      }
    ]
  }
];

const NOTION_COLS = [
  {name:"Show Name",             type:"Title",    icon:"🎙️", desc:"The podcast's official name"},
  {name:"Host Name",             type:"Text",     icon:"👤", desc:"The host or hosts' name(s)"},
  {name:"Genre",                 type:"Select",   icon:"🏷️", desc:"Business / Health / True Crime / Comedy / Interview / Self-Improvement / Gaming / Sports"},
  {name:"Platform Links",        type:"URL",      icon:"🔗", desc:"Apple Podcasts or Spotify show link"},
  {name:"Episode Count",         type:"Number",   icon:"🔢", desc:"How many episodes published so far"},
  {name:"Posting Frequency",     type:"Select",   icon:"📅", desc:"Weekly / Bi-weekly / Monthly / Irregular"},
  {name:"Average Rating",        type:"Number",   icon:"⭐", desc:"Current star rating on the platform"},
  {name:"Review Count",          type:"Number",   icon:"💬", desc:"Total number of listener reviews"},
  {name:"Production Gap Signal", type:"Select",   icon:"🔍", desc:"Rough audio / No clips being made / Inconsistent schedule / Strong but overwhelmed host"},
  {name:"Contact Method",        type:"Select",   icon:"📱", desc:"Email / Instagram / Twitter-X / Website form"},
  {name:"Contact Info",          type:"Text",     icon:"📧", desc:"The actual email address or handle"},
  {name:"Lead Score",            type:"Number",   icon:"🎯", desc:"1-10 based on gap size and engagement signal"},
  {name:"Lead Priority",         type:"Select",   icon:"🔥", desc:"🔥 Hot · ⚡ Warm · ❄️ Cold"},
  {name:"Lead Stage",            type:"Select",   icon:"📊", desc:"Identified → Audited → Contacted → Replied Positively → Replied Negatively → Call Booked → Proposal Sent → Closed → Retainer"},
  {name:"Package Tier",          type:"Select",   icon:"💰", desc:"Starter / Growth / Full Production"},
  {name:"Monthly Retainer",      type:"Number",   icon:"💵", desc:"Agreed monthly amount, once closed"},
  {name:"Onboarded Date",        type:"Date",     icon:"📅", desc:"Date the client officially started"},
  {name:"Last Contacted",        type:"Date",     icon:"⏰", desc:"Most recent outreach or check-in date"},
  {name:"Notes",                 type:"Text",     icon:"📝", desc:"Reply content, brand preferences, anything relevant"},
];

const NOTION_VIEWS = [
  {name:"🎙️ All Shows",          desc:"Master table — every podcast you've identified across all genres."},
  {name:"🔥 Hot Prospects",      desc:"Filter: Priority = Hot. Real engagement, visible production gaps — your best targets."},
  {name:"📬 Active Outreach",    desc:"Filter: Stage = Contacted or Replied Positively. Your live pipeline."},
  {name:"📊 Pipeline Board",     desc:"Kanban grouped by Lead Stage — drag shows through as they progress."},
  {name:"💰 Active Clients",     desc:"Filter: Stage = Retainer. Your recurring revenue base and referral source list."},
];

const GENRES = [
  {icon:"💼", name:"Business & Entrepreneurship",
   why:"A large, well-monetized audience — hosts often already understand marketing ROI and have real budget for production.",
   find:"Apple Podcasts Business category charts, Spotify business podcast charts, LinkedIn posts where hosts promote their own show"},
  {icon:"💪", name:"Health & Wellness",
   why:"A growing category with a highly engaged, loyal listener base — hosts often already invest in their personal brand elsewhere.",
   find:"Apple Podcasts Health & Fitness category, wellness influencer crossover shows"},
  {icon:"🕵️", name:"True Crime",
   why:"Massive audience engagement and extremely high clip-shareability — true crime clips perform exceptionally well on social platforms.",
   find:"Apple Podcasts True Crime category, true crime podcast Facebook communities and subreddits"},
  {icon:"🎭", name:"Comedy & Entertainment",
   why:"High clip virality potential — hosts are often creators already comfortable with social media growth tactics.",
   find:"Apple Podcasts Comedy category, comedian social media crossover shows"},
  {icon:"🎤", name:"Interview & Conversational",
   why:"A broad, evergreen category with consistent, repeatable production needs across every single episode.",
   find:"Apple Podcasts Society & Culture category, LinkedIn or Twitter posts announcing new episode guests"},
  {icon:"🧠", name:"Self-Improvement & Personal Development",
   why:"An engaged, loyal audience that returns episode after episode — hosts often building a broader coaching business alongside the show.",
   find:"Apple Podcasts Self-Improvement subcategory, personal development influencer crossover shows"},
  {icon:"🎮", name:"Gaming & Pop Culture",
   why:"A young, highly social-media-active audience — clips from this genre spread especially fast on TikTok and YouTube Shorts.",
   find:"Apple Podcasts TV & Film or Video Games categories, Discord gaming communities where hosts promote episodes"},
  {icon:"⚽", name:"Sports Commentary",
   why:"A passionate, consistent audience with strong appetite for clip-based highlights and hot takes.",
   find:"Apple Podcasts Sports category, sports team fan community forums and subreddits"},
];

const SERVICE_COMPONENTS = [
  {icon:"🎧", color:"#7A5A00", name:"Full Episode Editing",
   desc:"Raw audio cleaned up — noise reduction, leveling, pacing, removing dead air and filler words, with intro and outro added.",
   why:"This is what separates a professional-sounding show from an amateur one. Most hosts don't have the time or trained ear for this work."},
  {icon:"📝", color:"#0D7A5F", name:"Show Notes & Timestamps",
   desc:"Written episode descriptions, chapter timestamps, and key takeaways for each episode.",
   why:"This is what helps a show get discovered in search and gives listeners a clear reason to click into a specific episode."},
  {icon:"✂️", color:"#C99A3B", name:"Social Clip Creation",
   desc:"3-5 short, captioned, vertically-formatted clips cut from each episode for TikTok, Instagram Reels, and YouTube Shorts.",
   why:"This is what actually grows a show today — most new listeners discover a podcast through a clip, not the platform itself."},
  {icon:"📡", color:"#8B2E1F", name:"Publishing & Distribution",
   desc:"Uploading the finished episode across every platform — Spotify, Apple Podcasts, YouTube — on a consistent schedule.",
   why:"Consistency is what actually builds an audience. A host who publishes sporadically loses momentum even with great content."},
];

const SCRIPTS = [
  {id:"outreach", tag:"Cold Outreach · Opening Message", color:"#8B2E1F",
   title:"Outreach Message to a Podcast Host",
   note:"Reference something specific from a real episode — this signals you actually listened, not just found their show in a search.",
   body:"Hey [Host name], I've been listening to [Show name] — really enjoyed the episode on [specific topic]. I noticed you're not currently clipping episodes for social, which is honestly one of the fastest ways shows in [genre] are growing right now. I edit and produce podcasts for a living, and I'd love to send you a free sample clip from one of your recent episodes, just to show you what it could look like. No pressure at all — want me to send it over?"},
  {id:"followup", tag:"Follow-Up · No Response", color:"#0D7A5F",
   title:"Follow-Up Message",
   note:"Send once, gently, after a few days.",
   body:"Hey [Host name], just following up in case this got buried — happy to send that free sample clip whenever works, no obligation either way."},
  {id:"discovery", tag:"Discovery Call · Key Questions", color:"#C99A3B",
   title:"Discovery Call Questions",
   note:"Let their own answers reveal the time and momentum they're losing — you barely need to pitch after this.",
   body:"\"How much time are you currently spending on editing and production each week?\"\n\n\"Are you currently creating any social clips from your episodes?\"\n\n\"What's stopping you from posting more consistently right now?\"\n\n\"What would having a few extra hours back each week actually let you focus on instead?\""},
  {id:"obj1", tag:"Objection · Already Handled", color:"#7A5A00",
   title:"Objection: \"I Already Edit It Myself\"",
   note:"Don't argue — offer the free sample as proof instead of trying to win the point verbally.",
   body:"That's great — a lot of hosts I work with started that way too. The main thing I usually hear is that editing takes way more time than expected, or clips specifically get skipped because there's just not enough hours in the week. Would it be useful if I sent a free sample clip from a recent episode, just so you can see what that specific piece could look like without needing to change anything else about your current setup?"},
  {id:"obj2", tag:"Objection · Budget", color:"#0D7A5F",
   title:"Objection: \"I Can't Afford Ongoing Help\"",
   note:"The free sample removes the financial risk from the very first ask.",
   body:"Totally understand — that's exactly why I like to start with a single free sample clip first, no cost at all. If it genuinely helps grow the show, we can talk about what a small monthly investment could look like from there. Most hosts find that even one clip that brings in new listeners more than covers the cost."},
  {id:"upsell", tag:"Upsell · Volume or Full Production", color:"#7A5A00",
   title:"Upsell Pitch",
   note:"Only pitch this after real, visible results — never expand scope before the first tier has proven itself.",
   body:"Your clips are performing well — [specific metric, e.g. the last one hit 40K views]. A lot of that momentum comes from consistency, and right now we're only cutting [X] clips per episode. Want to talk about increasing that, or adding full show notes and distribution so the whole process is handled end to end?"},
  {id:"referral", tag:"Growth · Referral Ask", color:"#8B2E1F",
   title:"Asking for a Referral",
   note:"Genre-specific referrals compound quickly — hosts in the same category often follow and know each other.",
   body:"I'm really glad this has been working for [show name]. Do you know any other podcast hosts in [genre] who might want the same kind of support? I'd love an introduction — happy to send them a free sample clip too."},
];

const PACKAGES = [
  {name:"Starter", icon:"🌱", color:"#0D7A5F", price:"$500-$700/month",
   includes:["Full episode editing, up to 4 episodes/month","2 social clips per episode"],
   bestFor:"New or smaller shows wanting professional polish without a huge investment"},
  {name:"Growth", icon:"⚡", color:"#7A5A00", price:"$800-$1,200/month",
   includes:["Everything in Starter","4-5 social clips per episode","Show notes and timestamps"],
   bestFor:"Established shows ready to invest in consistent, compounding growth"},
  {name:"Full Production", icon:"🏆", color:"#8B2E1F", price:"$1,300-$1,800/month",
   includes:["Everything in Growth","Full publishing and distribution across all platforms","Monthly performance report"],
   bestFor:"Shows wanting a complete production partner handling everything end to end"},
];

const FAQS = [
  {q:"What if I've never edited a podcast before?",
   a:"Podcast editing is a learnable technical skill, not innate talent. The core techniques — noise reduction, leveling, cutting dead air — follow a repeatable process you can learn from free tutorials in days, not months. Practice on 2-3 episodes before you ever pitch anyone."},
  {q:"What if a host asks for my portfolio and I don't have real client episodes yet?",
   a:"Show your practice episodes and be honest: 'I edited these specifically to show hosts in [genre] exactly what this sounds like before working with real client audio.' A genuinely well-edited practice episode is more convincing than a claim of experience — let the work speak."},
  {q:"Do I need expensive software to start?",
   a:"No. Audacity is completely free, unlimited, and genuinely capable of professional-quality editing. CapCut's free tier handles social clip creation. Descript is a helpful paid upgrade once revenue justifies it, but it is not required to start or even to run your first client."},
  {q:"How do I find shows to approach instead of just guessing?",
   a:"Search Apple Podcasts and Spotify by genre category and look specifically for shows with real listener engagement — reviews, ratings, active comments — but visible production gaps, like no social clips or inconsistent posting. That combination signals a real, provable opportunity."},
  {q:"What if the host is precious about their audio and doesn't want changes?",
   a:"Always send edits for approval before anything publishes, and treat their instructions as the final word on their own show's sound. Some hosts want heavy editing, others want a light touch — your job is to match their preference, not impose your own taste."},
  {q:"How much time does editing one episode actually take?",
   a:"A typical 45-60 minute episode takes roughly 1-3 hours to edit depending on raw audio quality and how much cleanup is needed. This speeds up significantly with practice and repetition on the same show's format."},
  {q:"What if my sample clip doesn't perform well?",
   a:"Clip performance depends on many factors outside your control — the platform's algorithm, posting time, existing audience size. Use it as a genuine demonstration of your editing and captioning skill rather than a guarantee of viral reach, and be upfront about that distinction with hosts."},
  {q:"Can I specialize in more than one genre eventually?",
   a:"Yes, once you have a proven system and existing clients providing stable income, expanding into a second genre is a natural way to grow. Start narrow while building your first few clients, then broaden deliberately."},
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

export default function TheBroadcastEngine() {
  const [tab,setTab]             = useState("plan");
  const [openWeek,setOpenWeek]   = useState(0);
  const [openDay,setOpenDay]     = useState(null);
  const [openGenre,setOpenGenre] = useState(null);
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
    {id:"notion",  label:"🗂️ Show CRM"},
    {id:"genre",   label:"🎙️ Pick Your Genre"},
    {id:"services",label:"🎬 Production Components"},
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
            The Broadcast Engine — 45-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Podcast Production & Growth System
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#6E6459",maxWidth:580,lineHeight:1.65}}>
            Edit episodes, write show notes, cut social clips, and publish consistently for podcast
            hosts who don't have time to do it themselves. Built on production skill, not automation.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F30",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this system exists:</strong> this is the first
              system built entirely on production and editing skill rather than automation, writing,
              or relationship work alone. Genre specialization means two students both doing "podcast
              production" never compete if one produces business shows and the other produces true
              crime. It's the natural home for anyone with a creative or technical production
              background who hasn't found their lane yet.
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Show CRM</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Notion (free plan) tracks every show you audit, approach, and pitch — from raw
              prospect to closed retainer.
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

        {/* GENRE */}
        {tab==="genre"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Pick Your Genre</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              This is the decision that keeps you from competing with every other student running
              this system. Choose one genre and specialize — do not target "any podcast."
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {GENRES.map((n,i)=>{
                const isOpen=openGenre===i;
                return (
                  <div key={i} onClick={()=>setOpenGenre(isOpen?null:i)}
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The 4 Production Components</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              One retainer service built from 4 layered components — each package on the Packages
              tab bundles these differently depending on episode volume and clip needs.
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
              Lead with proof, not a pitch. The free sample clip is your demo — let it do the talking
              wherever possible.
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
              Always lead with a free sample clip before proposing any tier — it earns the right to
              a pricing conversation at all.
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
                {t:"Full Production",v:"$15,600-$21,600/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#6E6459",margin:"10px 0 0",lineHeight:1.6}}>
                Five clients on the Growth tier alone = $48,000-$72,000 a year in recurring revenue,
                built on production skill anyone can learn from free tools and free tutorials.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>FAQ</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px"}}>
              The questions every student asks before pitching their first podcast host.
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
