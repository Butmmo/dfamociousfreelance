// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
import { createFileRoute } from "@tanstack/react-router";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { SaveBar } from "@/components/dfs/SaveBar";
import { useState, useMemo } from "react";

/* ─── 45-DAY PLAN DATA ──────────────────────────────────── */
export const WEEKS = [
  {
    week: 1, title: "Build Your Foundation", range: "Days 1–7", icon: "🏗️", color: "#6366F1",
    goal: "Tools set up, niche locked, 2 demos built, portfolio site live. You are ready to go to market.",
    days: [
      { day: 1, focus: "Arsenal Setup — $0 Day", icon: "⚡",
        note: "Total cost today: $0. You only spend money after your first client pays you.",
        tasks: [
          { id: "1a", text: "Sign up at Outscraper.com — free tier — your primary lead scraper" },
          { id: "1b", text: "Create Apollo.io account — 50 free verified emails per month" },
          { id: "1c", text: "Create Hunter.io account — 25 free email finds per month" },
          { id: "1d", text: "Sign up for Notion — free tier is all you need to build your CRM pipeline" },
          { id: "1e", text: "Create Make.com account — free, 1,000 operations per month" },
          { id: "1f", text: "Set up Calendly with your real weekly availability" },
          { id: "1g", text: "Install Loom and record a 30-second test clip to get comfortable" },
          { id: "1h", text: "Update LinkedIn headline: 'Digital Systems Engineer | Web Apps & Automation'" },
        ]},
      { day: 2, focus: "Lock Niche & Market", icon: "🎯",
        note: "ONE niche. ONE city. Breadth kills beginners. Depth closes deals.",
        tasks: [
          { id: "2a", text: "Pick ONE niche to start — dental, real estate, and beauty close fastest for beginners" },
          { id: "2b", text: "Pick ONE city (any city with 100,000+ population works — anywhere in the world)" },
          { id: "2c", text: "Open Google Maps → search '[niche] [city]' → scan 10 listings for weak or missing websites" },
          { id: "2d", text: "Read 20 reviews across those listings — write down every 'hard to book' or 'no website' complaint you find" },
          { id: "2e", text: "Write one sentence: 'I help [niche] businesses in [city] get [outcome] in [timeframe]'" },
        ]},
      { day: 3, focus: "Build Demo #1", icon: "🛠️",
        note: "Done beats perfect. A working demo closes more clients than the best pitch ever will.",
        tasks: [
          { id: "3a", text: "Open Lovable, Bubble.io, or Base44 — whichever you're most comfortable with" },
          { id: "3b", text: "Build a landing page for a fictional business in your chosen niche (give it a real-sounding name)" },
          { id: "3c", text: "Include: hero headline, services list, contact form, and a booking button" },
          { id: "3d", text: "Open it on your phone and fix anything that looks broken — it must be mobile-first" },
          { id: "3e", text: "Publish it to a live URL — even a Bubble or Lovable subdomain works perfectly" },
        ]},
      { day: 4, focus: "Build Demo #2 + Record Looms", icon: "🎬",
        note: "Two demos show range. The Loom walkthrough makes it real — people trust a voice explaining it.",
        tasks: [
          { id: "4a", text: "Build Demo #2 showing something different — booking system, CRM intake form, or multi-page site" },
          { id: "4b", text: "Record a 90-second Loom for Demo #1 — explain what problem it solves, not just what it is" },
          { id: "4c", text: "Record a 90-second Loom for Demo #2" },
          { id: "4d", text: "Write a 100-word description for each demo: Problem → What You Built → Outcome" },
          { id: "4e", text: "Save both Loom links — you will use these in your cold emails starting Day 17" },
        ]},
      { day: 5, focus: "Portfolio Site Live", icon: "🌐",
        note: "Your portfolio site is your silent salesperson. It works while you sleep.",
        tasks: [
          { id: "5a", text: "Build your personal portfolio site using Lovable, Bubble.io, or Webflow" },
          { id: "5b", text: "Pages needed: Home, Services (outcomes-first, no tool names), Case Studies (your 2 demos), Contact" },
          { id: "5c", text: "Homepage headline: '[Your Name] — Digital Systems Engineer for [Niche] Businesses'" },
          { id: "5d", text: "Embed Calendly on the Contact page — visitors must be able to book you immediately" },
          { id: "5e", text: "Publish and test every link, button, and form on both desktop and mobile" },
        ]},
      { day: 6, focus: "Notion CRM Pipeline Setup", icon: "⚙️",
        note: "Your CRM is your business operating system. Set it up right once — it runs your growth forever.",
        tasks: [
          { id: "6a", text: "Create a Notion database with pipeline stages: Scraped → Contacted → Replied → Call Booked → Proposal Sent → Closed → On Retainer" },
          { id: "6b", text: "Add custom fields: Business Name, Owner Name, Niche, City, Website, Lead Score, Notes, Email" },
          { id: "6c", text: "After each outreach email, log it in Notion manually or connect via Make.com to auto-update your contact records" },
          { id: "6d", text: "Create a filtered Notion view called 'HOT Leads' — you will use this daily from Week 2 onwards" },
          { id: "6e", text: "Set a reminder rule: any lead in 'Contacted' for more than 4 days with no reply → flag for follow-up" },
        ]},
      { day: 7, focus: "Test, Review & Calibrate", icon: "✅",
        note: "Before moving to Week 2, confirm you have something to show AND something to track.",
        tasks: [
          { id: "7a", text: "Book a fake Calendly appointment with yourself — confirm the email notification arrives" },
          { id: "7b", text: "Open both demo sites on your phone and take a screenshot — does it look professional?" },
          { id: "7c", text: "Play both Loom videos — would a stranger instantly understand the problem being solved?" },
          { id: "7d", text: "Write down 3 specific businesses by name that you want as clients before Day 30" },
        ]},
    ],
  },
  {
    week: 2, title: "Data Harvest", range: "Days 8–14", icon: "🔍", color: "#10B981",
    goal: "60+ HOT leads (score 7+) loaded into Notion with verified emails, ready to contact.",
    days: [
      { day: 8, focus: "First Google Maps Scrape", icon: "🗺️",
        note: "100 leads in 15 minutes. This is your superpower — most freelancers chase leads one by one forever.",
        tasks: [
          { id: "8a", text: "Google Maps → search '[niche] [city]' → manually scan top 10 listings, note weak or missing websites" },
          { id: "8b", text: "Open Outscraper.com → paste same search → export 100 results as CSV" },
          { id: "8c", text: "Repeat with 2 more search variations (e.g. 'dental clinic [city]', 'family dentist [city]')" },
          { id: "8d", text: "Open the CSV → delete any obvious chains (McDonald's, Toni & Guy, Specsavers, etc.)" },
          { id: "8e", text: "Target: 200+ raw leads in the CSV before moving to Day 9" },
        ]},
      { day: 9, focus: "Enrich Emails with Apollo.io", icon: "🔬",
        note: "info@ goes to an employee. The owner's direct email gets 3× the reply rate. Apollo finds it.",
        tasks: [
          { id: "9a", text: "Import your cleaned CSV into Apollo.io — use the bulk domain enrichment feature" },
          { id: "9b", text: "Export the enriched list with email addresses filled in" },
          { id: "9c", text: "For any still missing: check the Google listing's 'About' tab — some businesses list email there directly" },
          { id: "9d", text: "Visit /contact or footer of any remaining websites — the owner's email is usually there" },
        ]},
      { day: 10, focus: "Hunter.io Backup + Email Verify", icon: "🎯",
        note: "Sending to invalid emails damages your sender reputation. Verify everything before you send.",
        tasks: [
          { id: "10a", text: "For any lead still missing an email: paste their domain into Hunter.io" },
          { id: "10b", text: "Only use Hunter results rated 80% confidence or higher" },
          { id: "10c", text: "Run your full email list through NeverBounce or ZeroBounce free trial to remove invalid addresses" },
          { id: "10d", text: "Mark any 'risky' or 'unknown' emails as 'Low Confidence' in Notion" },
        ]},
      { day: 11, focus: "Score & Tag Every Lead", icon: "🔥",
        note: "30 HOT leads beat 300 random ones every single time. This step separates closers from chasers.",
        tasks: [
          { id: "11a", text: "Open each lead's Google listing → apply the 7-signal scoring system → score in 60 seconds" },
          { id: "11b", text: "Tag all leads scoring 7+ as HOT in Notion" },
          { id: "11c", text: "Tag leads scoring 4–6 as WARM — these go into your automated Instantly.ai sequence" },
          { id: "11d", text: "Archive or delete every franchise chain and government entity immediately — no exceptions" },
        ]},
      { day: 12, focus: "Load & Segment Notion CRM", icon: "📊",
        note: "A well-organised CRM means you never lose track of a potential client again.",
        tasks: [
          { id: "12a", text: "Import your scored, verified list into your Notion CRM database" },
          { id: "12b", text: "Tag each contact by: Niche, City, Score (HOT/WARM), and Priority (1, 2, 3)" },
          { id: "12c", text: "Set all newly imported leads to the 'Scraped' pipeline stage" },
          { id: "12d", text: "Goal check: do you have at least 30 HOT leads? If not, run another Outscraper batch today" },
        ]},
      { day: 13, focus: "Second Target Scrape", icon: "🌍",
        note: "Two targets means two income streams. Don't put all your leads in one basket.",
        tasks: [
          { id: "13a", text: "Choose: second city in same country OR second niche in same city" },
          { id: "13b", text: "Run a full Outscraper scrape for your second target" },
          { id: "13c", text: "Enrich, score, and import this second batch using the same Day 8–12 process" },
          { id: "13d", text: "Goal: 60 total HOT leads across both targets loaded in Notion by end of today" },
        ]},
      { day: 14, focus: "Build the Make.com Automation", icon: "🤖",
        note: "Set this up once. Every future scrape auto-populates your CRM and triggers outreach.",
        tasks: [
          { id: "14a", text: "Open Make.com → create new scenario → add Outscraper as the trigger module" },
          { id: "14b", text: "Add Apollo.io as next step to auto-enrich any new lead with an email address" },
          { id: "14c", text: "Add Notion as final step to auto-create a contact record in your CRM database for each enriched lead" },
          { id: "14d", text: "Test the full flow with 5 fake leads — confirm each step executes correctly" },
          { id: "14e", text: "Schedule it to auto-run every Monday morning at 8 AM — the pipeline never stops filling" },
        ]},
    ],
  },
  {
    week: 3, title: "Outreach Launch", range: "Days 15–21", icon: "📧", color: "#F59E0B",
    goal: "50+ emails sent, first replies received, 3–5 discovery calls booked.",
    days: [
      { day: 15, focus: "Write Your 3-Email Sequence", icon: "✍️",
        note: "Three emails. Three completely different angles. Never 'just following up' — always add new value.",
        tasks: [
          { id: "15a", text: "Write Email 1 (PAS formula): Problem (their digital gap) → Agitate (cost of staying invisible) → Solve (your offer). Max 120 words." },
          { id: "15b", text: "Write Email 2 (Day 3 follow-up): Ask one specific question about their current process. No pitch at all." },
          { id: "15c", text: "Write Email 3 (Day 7 follow-up): Share your Loom demo. 'I built a preview for businesses like yours — worth 90 seconds?'" },
          { id: "15d", text: "Load all 3 emails into Instantly.ai as a sequence with 3-day gaps between each send" },
          { id: "15e", text: "Send the sequence to your own email address and check how it renders on mobile" },
        ]},
      { day: 16, focus: "Build the Grand Slam Offer", icon: "💎",
        note: "Your offer is what gets a yes. Not your website. Not your tools. The offer. Spend real time here.",
        tasks: [
          { id: "16a", text: "Write your Dream Outcome statement — what the client's life looks like after delivery (not the deliverable itself)" },
          { id: "16b", text: "Pick your TOP 5 HOT leads and build a personalised demo using each one's actual business name" },
          { id: "16c", text: "Record a 60–90 second Loom per lead showing them their personalised preview" },
          { id: "16d", text: "Write your ease line: 'I need one hour of your time. I handle absolutely everything else.'" },
          { id: "16e", text: "Set your guarantee: 'Live in 14 days or you don't pay until it is.'" },
        ]},
      { day: 17, focus: "Send Wave 1 — First 10 Emails", icon: "🚀",
        note: "Your first 10 emails will teach you more than any course. Send them before you feel ready.",
        tasks: [
          { id: "17a", text: "Send your 5 personalised emails (with Loom demos) manually to your TOP 5 HOT leads" },
          { id: "17b", text: "Send 5 more to HOT leads using your Email 1 template — personalise the opening line for each" },
          { id: "17c", text: "NEVER mention Bubble.io, Lovable, Claude Code, or any tool name — sell the outcome only" },
          { id: "17d", text: "Move all 10 leads in Notion from 'Scraped' → 'Contacted'" },
          { id: "17e", text: "Set phone notifications for new email replies — you must respond within 2 hours" },
        ]},
      { day: 18, focus: "LinkedIn Parallel Outreach", icon: "💼",
        note: "Email + LinkedIn doubles your touchpoints without doubling your effort.",
        tasks: [
          { id: "18a", text: "Search each of your Wave 1 leads on LinkedIn — find the owner, founder, or director" },
          { id: "18b", text: "Send a connection request: 'Hi [Name], I help [niche] businesses with digital systems. Would love to connect.'" },
          { id: "18c", text: "DO NOT pitch in the connection request — wait until they accept, then send one short relevant message" },
          { id: "18d", text: "Post one piece of content on your LinkedIn today: an observation about digital gaps in your target niche" },
        ]},
      { day: 19, focus: "Wave 2 — Next 20 via Instantly", icon: "⚡",
        note: "Now you use the automation. Wave 1 taught you what works. Wave 2 scales it.",
        tasks: [
          { id: "19a", text: "Import your next 20 HOT leads into Instantly.ai" },
          { id: "19b", text: "Activate your 3-email sequence — confirm sending is set to business days only" },
          { id: "19c", text: "Check Wave 1 subject lines — if open rate is under 30%, rewrite the subject before Wave 2 sends" },
          { id: "19d", text: "Set daily send limit to 20 emails maximum — this protects your sender domain reputation" },
        ]},
      { day: 20, focus: "Monitor & Reply to Everything", icon: "🔔",
        note: "Speed of reply is a competitive advantage. Most freelancers take days. You respond in hours.",
        tasks: [
          { id: "20a", text: "Check Instantly.ai dashboard — note open rate and reply rate for each sequence" },
          { id: "20b", text: "Reply to EVERY response within 2 hours — positive, negative, or 'not interested'" },
          { id: "20c", text: "For every positive reply: send your Calendly link and suggest 2 specific days and times" },
          { id: "20d", text: "Move all replied leads in Notion from 'Contacted' → 'Replied'" },
        ]},
      { day: 21, focus: "Week 3 Metrics Review", icon: "📈",
        note: "Numbers don't lie. Make ONE change for Week 4 based on what the data shows — not ten.",
        tasks: [
          { id: "21a", text: "Count: total emails sent, open rate %, reply rate %, calls booked" },
          { id: "21b", text: "Open rate under 25%? Your subject line is the problem — rewrite it completely" },
          { id: "21c", text: "Good open rate but low replies? Your offer isn't clear — tighten the Dream Outcome statement" },
          { id: "21d", text: "Set Week 4 targets: minimum 3 discovery calls booked, 1 proposal sent" },
        ]},
    ],
  },
  {
    week: 4, title: "First Close", range: "Days 22–28", icon: "🏆", color: "#EC4899",
    goal: "Run discovery calls, send proposals, close your first paid project.",
    days: [
      { day: 22, focus: "Discovery Calls — SPIN Framework", icon: "📞",
        note: "Don't pitch on a discovery call. Listen first. The client tells you exactly how to close them.",
        tasks: [
          { id: "22a", text: "Before each call: spend 5 minutes on their Google listing and website — note one specific gap to reference" },
          { id: "22b", text: "Situation: 'How are you currently handling new client enquiries that come in online?'" },
          { id: "22c", text: "Problem: 'What's the biggest challenge with how that works right now?' — then be silent and listen fully" },
          { id: "22d", text: "Implication: 'How much would it be worth if you never missed an after-hours lead again?'" },
          { id: "22e", text: "Need-Payoff: 'If I could build a system that does that in 14 days, would that be worth exploring?' — wait for the yes" },
        ]},
      { day: 23, focus: "Send Proposals Within 24 Hours", icon: "📄",
        note: "Proposals sent within 24 hours close at 3× the rate of those sent 3 days later.",
        tasks: [
          { id: "23a", text: "Use the 3-tier structure — Starter, Standard, Premium — always show all three options" },
          { id: "23b", text: "Name the outcome first in each tier, then the deliverables — never the other way around" },
          { id: "23c", text: "Include your delivery guarantee: 'Live in [X] days or I work for free until it is'" },
          { id: "23d", text: "Send via Google Docs or Notion — not plain email body text — it looks more credible and is easier to share" },
        ]},
      { day: 24, focus: "Follow Up on Every Proposal", icon: "🔁",
        note: "Most deals are lost not to a no but to silence. Follow up once, politely, with a new angle.",
        tasks: [
          { id: "24a", text: "48 hours after sending: 'Hi [Name], just checking you received the proposal — any questions I can answer?'" },
          { id: "24b", text: "If no reply after 5 days: send one final message with a fresh angle or a time-limited availability slot" },
          { id: "24c", text: "Proposals older than 10 days with no response → mark as 'Cold' in Notion and move forward" },
        ]},
      { day: 25, focus: "Handle Objections on Live Calls", icon: "🗣️",
        note: "Objections are not rejections. They are questions that haven't been answered yet.",
        tasks: [
          { id: "25a", text: "'Can I build this myself with AI?' → 'You could — but most owners stall at 70%. That last 30% is what I specialise in.'" },
          { id: "25b", text: "'Too expensive' → Move to the Starter package. Don't discount — reframe the value instead." },
          { id: "25c", text: "'I need to think about it' → 'Of course — is there a specific part you're uncertain about? Happy to clarify right now.'" },
          { id: "25d", text: "'Send me more examples' → Send your Loom demos and case study immediately — same day, not next day" },
        ]},
      { day: 26, focus: "Close & Collect 50% Deposit", icon: "💰",
        note: "50% upfront is non-negotiable. It protects you AND signals that they are serious.",
        tasks: [
          { id: "26a", text: "Once they say yes: send a simple 1-page agreement via Google Docs within the hour" },
          { id: "26b", text: "Send a Payoneer or Stripe payment link for 50% of the fee — do not start work until it clears" },
          { id: "26c", text: "Send a kickoff questionnaire: brand colours, logo, domain access, social links, key services listed" },
          { id: "26d", text: "Move the lead to 'Closed' in Notion. Then get to work." },
        ]},
      { day: 27, focus: "Begin Project — Blueprint Phase", icon: "📐",
        note: "Blueprint first. Build second. Always. This one habit separates professionals from freelancers.",
        tasks: [
          { id: "27a", text: "Map out exactly what you're building: pages, features, integrations, data flows" },
          { id: "27b", text: "Share the blueprint with the client and get written confirmation before opening any build tool" },
          { id: "27c", text: "Set your internal deadline 2 days before your promised delivery date — buffer for the unexpected" },
          { id: "27d", text: "Send the client a quick update message: 'Blueprint approved — build starts today. You'll hear from me in 2 days.'" },
        ]},
      { day: 28, focus: "Week 4 Review + Full Pipeline Audit", icon: "🔍",
        note: "Honest audit. Don't skip this. What you measure, you can improve.",
        tasks: [
          { id: "28a", text: "Tally: discovery calls run, proposals sent, deals closed, revenue collected (actual, not invoiced)" },
          { id: "28b", text: "Open Notion — what stage is every lead in? Which have been stuck in one stage too long?" },
          { id: "28c", text: "No close yet? Diagnose ONE variable — lead quality, pitch clarity, or offer. Fix only that one thing." },
          { id: "28d", text: "Set Week 5 target: deliver first project + upsell attempt + ask for 2 referrals" },
        ]},
    ],
  },
  {
    week: 5, title: "Deliver & Expand", range: "Days 29–35", icon: "🚀", color: "#8B5CF6",
    goal: "Deliver first project, collect full payment, upsell, get a real testimonial, expand to second target.",
    days: [
      { day: 29, focus: "Build Phase + New Scrape", icon: "⚙️",
        note: "While you build the first project, the machine keeps running. Never stop filling the pipeline.",
        tasks: [
          { id: "29a", text: "Continue building Project 1 — send the client one update message or screenshot today" },
          { id: "29b", text: "Run a new Outscraper batch for a fresh city or niche in the background" },
          { id: "29c", text: "Enrich, score, and add the new HOT leads to Notion tagged as 'Scraped'" },
          { id: "29d", text: "The pipeline never pauses — always building and prospecting at the same time" },
        ]},
      { day: 30, focus: "Deliver First Project", icon: "🎉",
        note: "Delivery is a ceremony, not just a file transfer. Make the client feel the transformation.",
        tasks: [
          { id: "30a", text: "Book a 30-minute Calendly screen-share specifically for the delivery walkthrough" },
          { id: "30b", text: "Walk through every page and feature — explain what each piece does for their business specifically" },
          { id: "30c", text: "Send the Payoneer/Stripe final 50% payment link immediately after the walkthrough call" },
          { id: "30d", text: "Set a 3-day check-in reminder in Notion: 'How is the site performing? Any questions?'" },
        ]},
      { day: 31, focus: "Upsell Day", icon: "📈",
        note: "The best time to sell the next thing is right after delivering something great. Trust is at its peak.",
        tasks: [
          { id: "31a", text: "Send upsell email within 48 hours: 'Now that your site is live, the next step is automatic lead follow-up...'" },
          { id: "31b", text: "Offer Standard package (CRM + email automation) if they started on Starter" },
          { id: "31c", text: "Pitch the Care Retainer ($200–400/month) as a way to keep the system running and growing without effort" },
        ]},
      { day: 32, focus: "Testimonial + Case Study + Referrals", icon: "⭐",
        note: "One happy client can bring three more. This step is worth as much as any cold email campaign.",
        tasks: [
          { id: "32a", text: "Send: 'Would you mind leaving a quick Google review? Here's the direct link: [URL]'" },
          { id: "32b", text: "Ask for a LinkedIn recommendation — takes them 5 minutes, helps you for years" },
          { id: "32c", text: "Send referral request: 'If you know other [niche] owners who could use this, I'd love an introduction'" },
          { id: "32d", text: "Write your first real case study: Problem → What You Built → Specific Result (with a number if possible)" },
        ]},
      { day: 33, focus: "Portfolio Update + First LinkedIn Post", icon: "📣",
        note: "Every case study is a future client magnet. Document before you move on.",
        tasks: [
          { id: "33a", text: "Add before-and-after screenshots to your portfolio site showing the transformation" },
          { id: "33b", text: "Post the case study on LinkedIn (under 300 words): what the problem was, what you built, the result" },
          { id: "33c", text: "Update your cold email template to reference this real case study by result" },
        ]},
      { day: 34, focus: "Launch Second Target", icon: "🌍",
        note: "Everything you learned in Target 1 gives you a head start in Target 2. The curve is much faster now.",
        tasks: [
          { id: "34a", text: "Choose: new niche (e.g. beauty if you started dental) OR new country (e.g. UK if you started USA)" },
          { id: "34b", text: "Run a fresh Outscraper scrape for the second target" },
          { id: "34c", text: "Update your email template with niche-specific language — reference your new real case study" },
          { id: "34d", text: "Send Wave 1 to top 10 HOT leads in the new target using your proven sequence" },
        ]},
      { day: 35, focus: "Week 5 Revenue Review", icon: "💵",
        note: "Track actual money collected — not projected, not invoiced. What has cleared your Payoneer?",
        tasks: [
          { id: "35a", text: "Total revenue collected to date (money actually received)" },
          { id: "35b", text: "Count active leads by pipeline stage in Notion" },
          { id: "35c", text: "Any proposals outstanding over 5 days? Follow up today." },
          { id: "35d", text: "Any retainer conversations started? Target: at least 1 retainer closed by Day 45." },
        ]},
    ],
  },
  {
    week: 6, title: "Scale the Machine", range: "Days 36–42", icon: "⚙️", color: "#14B8A6",
    goal: "Full automation running, second niche active, first retainer closed, LinkedIn content started.",
    days: [
      { day: 36, focus: "Full Automation Audit", icon: "🔧",
        note: "A machine that runs on its own is worth more than any single project. Audit it before you scale it.",
        tasks: [
          { id: "36a", text: "Open Make.com — did the scenario run correctly this week without errors?" },
          { id: "36b", text: "Verify Notion is updating pipeline stages from Instantly.ai reply triggers" },
          { id: "36c", text: "Check Klaviyo is sending the nurture sequence to leads who didn't respond after 3 emails" },
          { id: "36d", text: "Fix any broken automation steps — run a fresh 5-lead end-to-end test" },
        ]},
      { day: 37, focus: "Wave 3 with Real Case Study", icon: "📨",
        note: "Now you pitch with proof. A cold email with a real case study converts at 2–3× the rate of one without.",
        tasks: [
          { id: "37a", text: "Update Email 1 to reference your real case study: '[Similar business] just got [specific result]...'" },
          { id: "37b", text: "Send Wave 3 to 30 new HOT leads across both niches" },
          { id: "37c", text: "For your TOP 5 new leads: build a personalised preview and send a Loom — same weapon, refined by experience" },
          { id: "37d", text: "Test subject line: '[Name] — [Similar biz] just [result]. Could work for you too.'" },
        ]},
      { day: 38, focus: "Retainer Conversations", icon: "🔄",
        note: "One retainer covers your tool costs. Two covers your salary. Three is profit. Start these conversations now.",
        tasks: [
          { id: "38a", text: "For every completed project: book a 15-minute 'what's next' call with the client" },
          { id: "38b", text: "Pitch Care Retainer ($200–400/month): maintenance, updates, priority support" },
          { id: "38c", text: "Pitch Growth Retainer ($400–800/month): Klaviyo campaigns, monthly analytics, CRM management" },
          { id: "38d", text: "Close at least 1 retainer before Day 45 — this is your recurring income foundation" },
        ]},
      { day: 39, focus: "Klaviyo Nurture Sequence Setup", icon: "✉️",
        note: "Most leads aren't ready to buy when you first email them. Klaviyo keeps you visible until they are.",
        tasks: [
          { id: "39a", text: "Create a Klaviyo audience: 'Cold Leads — 3+ emails sent, no reply after 14 days'" },
          { id: "39b", text: "Set up a 4-email nurture sequence: value tip → case study → question → final offer" },
          { id: "39c", text: "Space these emails 2 weeks apart — this is a long-game sequence, not a push" },
          { id: "39d", text: "Connect Make.com: lead stuck in 'Contacted' for 14 days → auto-add to Klaviyo nurture audience" },
        ]},
      { day: 40, focus: "Weekly LinkedIn Content Post", icon: "📱",
        note: "One post per week for 6 months builds more inbound leads than most ad campaigns. Start the habit today.",
        tasks: [
          { id: "40a", text: "Write a post under 250 words: share one honest insight from working with your first client" },
          { id: "40b", text: "End with a CTA: 'If you run a [niche] business and relate to this, feel free to reach out'" },
          { id: "40c", text: "Post it now. Authenticity outperforms polish on LinkedIn for new accounts. Done beats perfect." },
        ]},
      { day: 41, focus: "Raise Your Prices", icon: "💹",
        note: "You are more valuable now than on Day 1. Your prices must reflect the track record you've built.",
        tasks: [
          { id: "41a", text: "After 2 closed deals: raise your Starter price by $100" },
          { id: "41b", text: "After 3 closed deals: raise Standard by $200" },
          { id: "41c", text: "Update your portfolio site pricing — always raise list prices, never offer discounts on old pricing to new clients" },
        ]},
      { day: 42, focus: "Full 6-Week Review", icon: "📊",
        note: "The most important review of the entire 45 days. What you measure now, you can multiply in Month 2.",
        tasks: [
          { id: "42a", text: "Tally all-time: leads scraped, emails sent, open rate, reply rate, calls run, proposals sent, deals closed" },
          { id: "42b", text: "Revenue collected to date — actual, not projected" },
          { id: "42c", text: "Active retainers count — even one is a major win at this stage" },
          { id: "42d", text: "Identify the single biggest bottleneck — where did most leads stop progressing?" },
          { id: "42e", text: "Write: 'What I would do differently from Day 1' — that becomes your Month 2 strategy" },
        ]},
    ],
  },
  {
    week: 7, title: "Month 2 Launch", range: "Days 43–45", icon: "🌅", color: "#F97316",
    goal: "Honest debrief complete, Month 2 targets set, first public proof shared.",
    days: [
      { day: 43, focus: "Month 1 Full Debrief", icon: "🪞",
        note: "Entrepreneurs who review their numbers grow faster than those who only look forward.",
        tasks: [
          { id: "43a", text: "Pull all metrics from Notion, Instantly.ai, and Klaviyo into one Google Sheet" },
          { id: "43b", text: "Calculate: revenue collected ÷ hours worked = your effective hourly rate. Is it improving?" },
          { id: "43c", text: "Identify your #1 performing lead source and your #1 performing niche" },
          { id: "43d", text: "Write 3 things that went better than expected and 3 things to improve in Month 2" },
        ]},
      { day: 44, focus: "Month 2 Planning Session", icon: "📋",
        note: "Month 2 is where the machine becomes real. You have data, proof, and a system. Now scale it.",
        tasks: [
          { id: "44a", text: "Set specific Month 2 targets: X leads scraped, X emails sent, X calls, X proposals, X closes, X revenue" },
          { id: "44b", text: "Decide: expand niche, expand country, or go deeper in your existing market?" },
          { id: "44c", text: "Block calendar time for outreach, delivery, and weekly review — treat each like a client meeting" },
          { id: "44d", text: "Plan your first paid tool upgrade based on what constrained you most in Month 1" },
        ]},
      { day: 45, focus: "Public Commitment + Keep Shipping", icon: "🏁",
        note: "The public commitment makes it real. Share what you're building. It attracts clients and keeps you accountable.",
        tasks: [
          { id: "45a", text: "Post on LinkedIn: share your first real result, what you built, and where you're headed" },
          { id: "45b", text: "Write a private commitment: 'By Day 90, I will have [X] clients, [Y] monthly recurring revenue'" },
          { id: "45c", text: "Keep the outreach machine running — it never stops, even during active delivery weeks" },
        ]},
    ],
  },
];

/* ─── SCRIPTS DATA ──────────────────────────────────────── */
const SCRIPTS = [
  { id: "e1", tag: "Day 17 · Wave 1", color: "#6366F1",
    title: "Cold Email #1 — PAS Formula",
    note: "Under 120 words. Never mention tools by name. Sell the outcome.",
    body: `Subject: [Name] — [City] competitors are getting leads you're missing

Hi [Name],

I was looking at [Business Name]'s listing and noticed there's no way for potential clients to book online.

Most [niche] businesses in [city] quietly lose 20–40% of new enquiries this way — people search at 10 PM, can't book, and move on to whoever responds first.

I build automated booking and lead systems for [niche] businesses that capture and convert enquiries 24/7.

I recently helped a similar business go from missed calls to 3× more booked appointments: [Loom link]

Worth a 15-minute call? [Calendly link]

[Your name]` },
  { id: "e2", tag: "Day 3 after Email 1", color: "#10B981",
    title: "Follow-Up Email #2 — One Question",
    note: "No pitch. Just genuine curiosity. This tone gets 3× the reply rate of a salesy follow-up.",
    body: `Subject: One question for you, [Name]

Hi [Name],

Quick question — how are you currently handling enquiries that come in outside of business hours?

Most [niche] owners I speak with are either missing them entirely or spending the first hour of every morning catching up.

Happy to share how I've solved this for others in a 3-minute demo if useful.

[Your name]
[Calendly link]` },
  { id: "e3", tag: "Day 7 after Email 1", color: "#F59E0B",
    title: "Follow-Up Email #3 — Demo Reveal",
    note: "Highest-converting of the three. The personalised preview is the real weapon here.",
    body: `Subject: I built something for [Business Name]

Hi [Name],

I took 30 minutes to put together a quick preview of what a modern booking system could look like for [Business Name].

It's not live — just a demo — but it shows exactly how clients would book, how enquiries would be captured, and how automatic follow-ups would work.

[Loom link / Demo URL]

If 3 extra bookings a month would be worth it, this pays for itself in week one.

Want to walk through it together?

[Your name]
[Calendly link]` },
  { id: "lnk", tag: "Day 18 · LinkedIn", color: "#3B82F6",
    title: "LinkedIn Connection Request",
    note: "Under 50 words. No pitch. No link. Just a relevant reason to connect.",
    body: `Hi [Name], I help [niche] businesses with digital systems — booking, lead capture, and client management. Would love to connect.` },
  { id: "disc", tag: "Day 22 · Discovery Call", color: "#EC4899",
    title: "Discovery Call — SPIN Framework",
    note: "The most important skill on a discovery call is silence. Ask, then wait. Resist filling the silence.",
    body: `SITUATION:
"How are you currently handling new client enquiries online — is there a booking system in place?"

PROBLEM:
"What's the biggest challenge with how that works right now?"
[Stop talking. Listen fully. Don't interrupt.]

IMPLICATION:
"How much would it be worth if you were fully booked 3 weeks in advance without chasing anyone?"

NEED-PAYOFF:
"If I could build a system that does exactly that in 14 days, would that be worth exploring?"
[Wait for the yes.]

CLOSE:
"Great — I'll have a proposal to you within 24 hours. Does tomorrow at 10 AM work to review it together?"` },
  { id: "ups", tag: "Day 31 · After Delivery", color: "#8B5CF6",
    title: "Upsell Email — After Delivery",
    note: "Send within 48 hours of delivery while satisfaction is at its absolute highest.",
    body: `Subject: The natural next step for [Business Name]

Hi [Name],

Now that the site is live, I wanted to flag what most of my clients do next.

The site captures attention — but without a CRM and email follow-up system behind it, leads can still slip through.

I can add:
→ Notion CRM setup (tracks every enquiry automatically)
→ A 3-email follow-up sequence (sends itself when someone fills in your form)

Configured and running in under 2 weeks. Investment: [Standard package price].

I have a slot opening next week — interested?

[Your name]` },
  { id: "ref", tag: "Day 32", color: "#14B8A6",
    title: "Referral Request Email",
    note: "Warm introductions close at 5× the rate of cold emails. One referral is worth 50 cold contacts.",
    body: `Subject: One small favour

Hi [Name],

Really glad the project came out well — thank you for being such a great client to work with.

One small favour: if you know any other [niche] business owners who could use the same kind of system, I'd love an introduction. Just forward this email or drop me their name.

And if you have 2 minutes — a quick Google review would mean a lot: [Direct review link]

Thanks again,
[Your name]` },
  { id: "obj", tag: "Any Discovery Call", color: "#F97316",
    title: "Objection: 'Can't I Use AI to Build This Myself?'",
    note: "Say this calmly and with full confidence. It's educational, not defensive.",
    body: `"Honestly? You could try — I use these same kinds of tools to move fast. But here's what typically happens: most owners get about 70% done, then stall on the part that actually matters for a real business — connecting it to a CRM, securing payments, making sure it works on every device, and keeping it maintained as things change.

That 30% is what I specialise in.

It's like accounting software — anyone can open QuickBooks, but you'd still hire an accountant to make sure your books are actually right. I'm not selling you a tool. I'm selling you a finished system that works, and the accountability to keep it running."` },
];

/* ─── FAQ DATA ──────────────────────────────────────────── */
const FAQS = [
  { q: "I have no clients yet. Where exactly do I start?",
    a: "Open this guide. Complete every task on Day 1 in exact order — tool accounts first, then niche selection. Do not skip ahead. Your first outreach email goes out on Day 17, not Day 1. The 16 days before it are what make the email land." },
  { q: "What if they ask for my portfolio and I only have demo projects?",
    a: "Show them. A demo built with their niche in mind is more convincing than 10 generic client sites. Say: 'These are projects I built to show exactly what I deliver for [niche] businesses specifically.' Demos that look real close just as well as live client work — sometimes better." },
  { q: "How do I talk about using AI tools without clients thinking they don't need me?",
    a: "You don't mention the tools at all in your pitch. Sell the outcome, the process, and the accountability. If they ask directly: 'I use AI-accelerated tools to move faster than traditional developers — the architecture, integrations, and ongoing support are all mine.' An architect uses AutoCAD. You'd still hire the architect." },
  { q: "What if a client asks for something I don't know how to build?",
    a: "Scope it clearly first — get paid for what you know, then figure out the rest during the build. Tell them: 'I'll have a solution for that in the proposal.' Then research it. This is completely normal. Professionals learn on the job constantly — the key is never promising what you genuinely cannot deliver." },
  { q: "How do I receive payments from clients in the USA, UK, and Australia?",
    a: "Payoneer is your best option from Nigeria — it accepts USD, GBP, EUR, and AUD directly and transfers to your local bank account. Stripe works well for clients who prefer to pay by card. Set up both. Never send invoices and wait for manual bank transfers — always use a payment link." },
  { q: "Should I use my own name or create a company name?",
    a: "Start with your own name. It builds personal trust faster and requires zero legal setup. Once you've closed 5+ deals, consider a studio name like 'NextBlazer Systems' or 'Bolu Digital'. Personal brands attract first clients. Studio names attract referrals and bigger projects." },
  { q: "How many cold emails should I send per day?",
    a: "Start with 10–20 per day, manual or via Instantly.ai. Never exceed 50 per day on a new email domain — it damages your sender reputation. Warm up the domain for 2 weeks before bulk sending. Quality always beats volume: 30 personalised emails consistently outperform 300 generic ones." },
  { q: "When should I start paying for tools?",
    a: "After your first client pays you. Month 1 runs for approximately $40 total (one Outscraper batch + all free tiers). Add Instantly.ai at $37/month only once your pipeline has 50+ verified leads ready to send. Upgrade everything else only as revenue justifies it — never before." },
  { q: "How long until I can realistically expect my first client?",
    a: "Following this plan consistently: first HOT lead reply typically arrives between Day 17–21. First discovery call: Day 21–25. First close: Day 25–35 for most people following through. The variables in your control are lead quality (use the scoring system), offer clarity (use the Grand Slam framework), and speed of follow-up." },
  { q: "What if I get replies but nobody converts?",
    a: "This almost always means one of three things: (1) your offer isn't specific enough to their pain, (2) your price feels misaligned with the value you're describing, or (3) you're not following up fast enough after replies. Fix ONE variable at a time. Never change everything at once — you won't know what worked." },
];

/* ─── MILESTONES DATA ───────────────────────────────────── */
const MILESTONES = [
  { day: "Day 7",  label: "Foundation Ready",    icon: "🏗️", color: "#6366F1", revenue: "$0",           desc: "All tools live, 2 demos built, portfolio site published, Notion CRM pipeline configured." },
  { day: "Day 14", label: "Pipeline Loaded",     icon: "📊", color: "#10B981", revenue: "$0",           desc: "60+ HOT leads scored, email-verified, and segmented in Notion. Make.com automation running." },
  { day: "Day 21", label: "Outreach Active",     icon: "📧", color: "#F59E0B", revenue: "$0",           desc: "50+ emails sent, open rate tracked, first replies incoming, 3+ discovery calls booked." },
  { day: "Day 28", label: "First Close",         icon: "🏆", color: "#EC4899", revenue: "$150–2,000",   desc: "First proposal accepted, 50% deposit collected, project blueprint approved, build started." },
  { day: "Day 35", label: "First Delivery",      icon: "🎉", color: "#8B5CF6", revenue: "$300–4,000",   desc: "First project delivered, full payment collected, upsell email sent, testimonial and case study secured." },
  { day: "Day 42", label: "Machine Running",     icon: "⚙️", color: "#14B8A6", revenue: "$500–6,500",   desc: "Full automation active, second niche live, LinkedIn content started, first retainer conversation open." },
  { day: "Day 45", label: "Month 2 Ready",       icon: "🌅", color: "#F97316", revenue: "$500–8,000+",  desc: "Full debrief complete, Month 2 targets set, pipeline active, public proof published. Ready to scale." },
];

/* ─── PRINCIPLES DATA ───────────────────────────────────── */
const PRINCIPLES = [
  { num: "01", icon: "🎯", color: "#6366F1", title: "One Niche. One City. One Month.",        body: "The biggest beginner mistake is going broad. 'Dental clinics in Austin' closes 10× faster than 'any business that needs a website'. Specificity makes your email feel personal. Generality makes it feel like spam." },
  { num: "02", icon: "⚡", color: "#10B981", title: "Demos Close. Pitches Don't.",             body: "A 90-second Loom walkthrough of a working product with their business name on it is worth more than three pages of beautifully written pitch copy. Build demos before you send a single email." },
  { num: "03", icon: "💎", color: "#F59E0B", title: "Sell the Outcome. Never the Tool.",       body: "Never mention Bubble.io, Lovable, Claude Code, Cursor, or Base44 in a cold email or proposal. Sell what the client gets: 'More bookings. Less admin. A system that runs while you sleep.'" },
  { num: "04", icon: "🔁", color: "#EC4899", title: "Follow Up Until You Get an Answer.",     body: "Most deals are not lost to rejection — they are lost to silence. A polite, value-adding follow-up on Day 3, then Day 7, then Day 14 is not being annoying. It is being professional. Silence is not a no." },
  { num: "05", icon: "💰", color: "#8B5CF6", title: "50% Upfront. Always. No Exceptions.",    body: "A client who won't pay 50% upfront is a client who won't pay the final 50% either. This rule protects you and signals to them that you are serious. Start work only after the deposit clears — every time." },
  { num: "06", icon: "📈", color: "#14B8A6", title: "Retainers Are the Real Business.",        body: "A project is income. A retainer is a salary. One retainer at $300/month covers all your tool costs. Five retainers at $300/month is $1,800/month of stable income before you close a single new deal." },
  { num: "07", icon: "🤖", color: "#F97316", title: "AI Is Your Engine. Not Your Identity.",   body: "Claude Code, Cursor, and Lovable let you build in days what used to take weeks. Use them without apology. But to clients you are a Digital Systems Engineer who delivers fast, precise results. The tools are your competitive secret." },
  { num: "08", icon: "🏃", color: "#6366F1", title: "Send the 10 Emails Before You're Ready.", body: "You will never feel fully ready. The demos will never be perfect enough. Send the first 10 emails on Day 17 as instructed, before you feel comfortable. Your first reply will teach you more than any amount of preparation ever could." },
];

/* ─── HELPER COMPONENTS ─────────────────────────────────── */
function Chevron({ open }) {
  return <span style={{ color: "#8A7C6D", fontSize: 19, display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>;
}

function Check({ checked, color }) {
  return (
    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? color : "#8A7C6D"}`, background: checked ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 11, color: "#F8F5EE", fontWeight: 800, transition: "all 0.15s" }}>
      {checked ? "✓" : ""}
    </div>
  );
}

function ProgressBar({ value, color, height = 6 }) {
  return (
    <div style={{ background: "#D9CFBB", borderRadius: 999, height, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.3s ease" }} />
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────── */
function ImplementationPlaybook() {
  const [tab, setTab]           = useState("plan");
  const [openWeek, setOpenWeek] = useState(0);
  const [openDay, setOpenDay]   = useState(null);
  const [openScript, setOpenScript] = useState(null);
  const [openFaq, setOpenFaq]   = useState(null);
  const [done, setDone, saveMeta] = useSyncedTaskMap("p_45day");

  const allTasks = useMemo(() => WEEKS.flatMap(w => w.days.flatMap(d => d.tasks)), []);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => done[t.id]).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weekPct = (w) => {
    const tasks = w.days.flatMap(d => d.tasks);
    return tasks.length > 0 ? Math.round((tasks.filter(t => done[t.id]).length / tasks.length) * 100) : 0;
  };

  const toggle = (id) => setDone(prev => ({ ...prev, [id]: !prev[id] }));

  const progressColor = progress >= 70 ? "#10B981" : progress >= 35 ? "#F59E0B" : "#6366F1";

  const TABS = [
    { id: "plan",       label: "📅 45-Day Plan" },
    { id: "scripts",    label: "📝 Scripts" },
    { id: "milestones", label: "🎯 Milestones" },
    { id: "faq",        label: "❓ FAQ" },
    { id: "principles", label: "💡 Principles" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#F8F5EE", minHeight: "100vh", color: "#201A16" }}>
      <SaveBar meta={saveMeta} title="45-Day Plan" total={totalTasks} />


      {/* ── HEADER ────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(160deg,#FDF9F0 0%,#F8F5EE 60%,#F8F5EE 100%)", padding: "22px 16px 18px", borderBottom: "1px solid #D9CFBB" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#10B981", textTransform: "uppercase", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981", display: "inline-block" }} />
            45-Day Implementation Playbook
          </div>
          <h1 style={{ margin: "0 0 7px", fontSize: "clamp(21px,4.5vw,33px)", fontWeight: 800, lineHeight: 1.15, background: "linear-gradient(135deg,#FFFFFF 30%,#C99A3B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            From Zero to First Client
          </h1>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#6E6459", maxWidth: 560, lineHeight: 1.65 }}>
            A beginner-friendly, day-by-day action guide to building a profitable international web development freelance business. 45 days. Real targets. Actionable every single day.
          </p>
          <div style={{ background: "#FFFFFF", borderRadius: 10, padding: "11px 14px", border: "1px solid #D9CFBB" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6E6459" }}>Overall Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: progressColor }}>{completedTasks} / {totalTasks} tasks · {progress}%</span>
            </div>
            <ProgressBar value={progress} color={progressColor} height={8} />
          </div>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────── */}
      <div style={{ background: "#F8F5EE", borderBottom: "1px solid #D9CFBB", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", padding: "0 8px", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none",
              borderBottom: tab === t.id ? "2px solid #6366F1" : "2px solid transparent",
              color: tab === t.id ? "#A5B4FC" : "#8A7C6D",
              padding: "12px 13px", fontSize: 12.5, fontWeight: tab === t.id ? 600 : 500,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "18px 13px 60px" }}>

        {/* ════ 45-DAY PLAN ════════════════════════════════ */}
        {tab === "plan" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#1A140F" }}>45-Day Action Plan</h2>
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 14px" }}>Tap a week → expand a day → tick off tasks as you complete them.</p>
            {WEEKS.map((w, wi) => {
              const wp = weekPct(w);
              const wOpen = openWeek === wi;
              return (
                <div key={w.week} style={{ marginBottom: 9 }}>
                  <div onClick={() => setOpenWeek(wOpen ? null : wi)}
                    style={{ background: wOpen ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${wOpen ? w.color + "55" : "#D9CFBB"}`, borderRadius: wOpen ? "11px 11px 0 0" : 11, cursor: "pointer", padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 37, height: 37, borderRadius: 9, background: w.color + "18", border: `1px solid ${w.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{w.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1A140F" }}>Week {w.week}: {w.title}</span>
                        <span style={{ fontSize: 10, color: "#8A7C6D", background: "#EDE7DA", borderRadius: 4, padding: "1px 6px" }}>{w.range}</span>
                        {wp > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: w.color }}>{wp}%</span>}
                      </div>
                      <p style={{ fontSize: 11.5, color: "#6E6459", margin: "0 0 6px", lineHeight: 1.4 }}>{w.goal}</p>
                      <ProgressBar value={wp} color={w.color} height={3} />
                    </div>
                    <Chevron open={wOpen} />
                  </div>

                  {wOpen && (
                    <div style={{ background: "#F5F0E4", border: `1px solid ${w.color}25`, borderTop: "none", borderRadius: "0 0 11px 11px", padding: "8px 11px 13px" }}>
                      {w.days.map((d) => {
                        const dk = `${wi}-${d.day}`;
                        const dOpen = openDay === dk;
                        const dDone = d.tasks.filter(t => done[t.id]).length;
                        const dComplete = dDone === d.tasks.length;
                        return (
                          <div key={d.day} style={{ marginTop: 7 }}>
                            <div onClick={() => setOpenDay(dOpen ? null : dk)}
                              style={{ background: dOpen ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${dComplete ? w.color + "60" : "#D9CFBB"}`, borderRadius: dOpen ? "9px 9px 0 0" : 9, cursor: "pointer", padding: "10px 12px", display: "flex", alignItems: "center", gap: 9 }}>
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{dComplete ? "✅" : d.icon}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: w.color, background: w.color + "18", borderRadius: 4, padding: "1px 6px" }}>Day {d.day}</span>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "#201A16" }}>{d.focus}</span>
                                </div>
                                <div style={{ fontSize: 11, color: "#8A7C6D", marginTop: 2 }}>{dDone}/{d.tasks.length} tasks</div>
                              </div>
                              <Chevron open={dOpen} />
                            </div>
                            {dOpen && (
                              <div style={{ background: "#FFFFFF", border: "1px solid #D9CFBB", borderTop: "none", borderRadius: "0 0 9px 9px", padding: "10px 12px 12px" }}>
                                {d.note && (
                                  <div style={{ background: w.color + "10", border: `1px solid ${w.color}22`, borderRadius: 7, padding: "7px 10px", marginBottom: 10, fontSize: 12, color: w.color + "CC", lineHeight: 1.5 }}>
                                    💡 {d.note}
                                  </div>
                                )}
                                {d.tasks.map(t => (
                                  <div key={t.id} onClick={() => toggle(t.id)}
                                    style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #EDE7DA", cursor: "pointer" }}>
                                    <Check checked={!!done[t.id]} color={w.color} />
                                    <span style={{ fontSize: 13, color: done[t.id] ? "#8A7C6D" : "#3A2E24", lineHeight: 1.55, textDecoration: done[t.id] ? "line-through" : "none", transition: "all 0.15s" }}>{t.text}</span>
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

        {/* ════ SCRIPTS ════════════════════════════════════ */}
        {tab === "scripts" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#1A140F" }}>Scripts & Templates</h2>
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 14px" }}>Ready to copy. Replace the brackets, personalise one line, and send.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {SCRIPTS.map((s, i) => {
                const isOpen = openScript === i;
                return (
                  <div key={s.id} onClick={() => setOpenScript(isOpen ? null : i)}
                    style={{ background: isOpen ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${isOpen ? s.color : "#D9CFBB"}`, borderRadius: 11, cursor: "pointer", overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1A140F" }}>{s.title}</span>
                          <span style={{ fontSize: 10, color: s.color, background: s.color + "18", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>{s.tag}</span>
                        </div>
                      </div>
                      <Chevron open={isOpen} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 14px 14px", borderTop: "1px solid #D9CFBB" }}>
                        <div style={{ background: "#FFFFFF", borderRadius: 8, padding: "12px 13px", marginTop: 12, fontFamily: "'Courier New', monospace", fontSize: 12, color: "#6E6459", lineHeight: 1.85, borderLeft: `2px solid ${s.color}40`, whiteSpace: "pre-wrap" }}>
                          {s.body}
                        </div>
                        <div style={{ marginTop: 9, background: s.color + "10", border: `1px solid ${s.color}25`, borderRadius: 7, padding: "7px 10px", fontSize: 12, color: s.color, lineHeight: 1.5 }}>
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

        {/* ════ MILESTONES ══════════════════════════════════ */}
        {tab === "milestones" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#1A140F" }}>45-Day Milestones</h2>
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 18px" }}>Seven checkpoints. Use these as your north star — not a rigid schedule.</p>
            {MILESTONES.map((m, i) => (
              <div key={m.day} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: m.color + "18", border: `1px solid ${m.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
                  {i < MILESTONES.length - 1 && <div style={{ width: 2, height: 26, background: "#D9CFBB", marginTop: 4, marginBottom: 4 }} />}
                </div>
                <div style={{ background: "#FFFFFF", border: "1px solid #D9CFBB", borderRadius: 10, padding: "11px 13px", flex: 1, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: m.color, background: m.color + "18", borderRadius: 4, padding: "1px 7px" }}>{m.day}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1A140F" }}>{m.label}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#10B981", marginLeft: "auto" }}>{m.revenue}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "#6E6459", margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ background: "#0A1020", border: "1px solid #10B98125", borderRadius: 10, padding: "13px 15px", marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>📈 Conservative 45-Day Revenue Projection</div>
              {[
                { label: "1–2 Starter Packages",  range: "$300–1,200" },
                { label: "0–1 Standard Package",  range: "$0–1,500" },
                { label: "0–1 Retainer Started",  range: "$0–400" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #D9CFBB" }}>
                  <span style={{ fontSize: 13, color: "#6E6459" }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{r.range}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1A140F" }}>45-Day Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>$300–3,100+</span>
              </div>
              <p style={{ fontSize: 12, color: "#8A7C6D", margin: "8px 0 0", lineHeight: 1.6 }}>Conservative, assuming 1–2 closed deals. Following the daily outreach routine consistently pushes the higher end. Month 2 and 3 will be significantly higher as the pipeline compounds.</p>
            </div>
          </div>
        )}

        {/* ════ FAQ ════════════════════════════════════════ */}
        {tab === "faq" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#1A140F" }}>Beginner FAQ</h2>
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 14px" }}>The questions every new freelancer asks, answered directly.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{ background: isOpen ? "#FDF9F0" : "#FFFFFF", border: `1px solid ${isOpen ? "#6366F1" : "#D9CFBB"}`, borderRadius: 11, cursor: "pointer", overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span style={{ color: "#6366F1", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>Q</span>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#201A16", lineHeight: 1.45 }}>{f.q}</span>
                      <Chevron open={isOpen} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 14px 13px", borderTop: "1px solid #D9CFBB" }}>
                        <div style={{ display: "flex", gap: 9, marginTop: 11, alignItems: "flex-start" }}>
                          <span style={{ color: "#10B981", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>A</span>
                          <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65 }}>{f.a}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ PRINCIPLES ══════════════════════════════════ */}
        {tab === "principles" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#1A140F" }}>8 Core Principles</h2>
            <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "0 0 14px" }}>Rules that separate freelancers who close from those who stay stuck. Return to these whenever you feel lost.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {PRINCIPLES.map((p) => (
                <div key={p.num} style={{ background: "#FFFFFF", border: `1px solid ${p.color}22`, borderRadius: 11, padding: "13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 19 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: p.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Principle {p.num}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1A140F", marginTop: 1 }}>{p.title}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65, borderLeft: `2px solid ${p.color}40`, paddingLeft: 11 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export const Route = createFileRoute("/_authenticated/playbooks/plan")({
  head: () => ({ meta: [{ title: "ImplementationPlaybook — DFS Citadel" }] }),
  component: ImplementationPlaybook,
});
