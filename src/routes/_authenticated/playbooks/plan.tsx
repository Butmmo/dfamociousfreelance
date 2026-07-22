// @ts-nocheck
// 45-Day Implementation Playbook v2. Content owned by DFS; UI adopts app's Regal palette.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { SaveBar } from "@/components/dfs/SaveBar";

export const Route = createFileRoute("/_authenticated/playbooks/plan")({
  head: () => ({ meta: [{ title: "45-Day Implementation Playbook — DFS" }] }),
  component: PlanPage,
});

/* ─── 45-DAY PLAN DATA (v2) ─────────────────────────────── */
export const WEEKS = [
  {
    week:1, title:"Build Your Foundation", range:"Days 1-7",
    icon:"🏗️", color:"#6366F1",
    goal:"All free accounts live. Notion CRM built. Two Lovable demos recorded on Loom. You are ready to go to market with zero budget spent.",
    days:[
      {day:1, focus:"Free Account Arsenal", icon:"⚡",
       note:"Total spend today: $0. The only money you will spend this week is Lovable Pro — and only when you start Day 4.",
       tasks:[
         {id:"1a",text:"Create a dedicated professional Gmail for outreach only: firstname.lastname@gmail.com — never use a personal or shared inbox"},
         {id:"1b",text:"Sign up for Notion (free) at notion.so — this is your CRM, deal tracker, and knowledge base"},
         {id:"1c",text:"Create a Google Sheets spreadsheet titled 'Lead Scouting Raw Data' — your notebook-to-digital bridge"},
         {id:"1d",text:"Sign up for Calendly (free tier) and link it to your new Gmail — your discovery call booking link"},
         {id:"1e",text:"Create a Loom account (free, 5-min videos) — your demo walkthroughs live here"},
         {id:"1f",text:"Update LinkedIn headline: Digital Systems Engineer | Web Apps, Automation and CRM for Growing Businesses"},
         {id:"1g",text:"Create Lovable.dev account — upgrade to Pro (~$25/month) only when you begin Day 4"},
       ]},
      {day:2, focus:"Build Your Notion CRM Database", icon:"🗂️",
       note:"This database is your entire business operating system. Build it right once — you will use it every single day.",
       tasks:[
         {id:"2a",text:"Open Notion → New Page → Full-page Database (Table view). Name it: Lead Pipeline"},
         {id:"2b",text:"Add all 23 columns listed in the Notion CRM tab — do not skip any, each one has a purpose"},
         {id:"2c",text:"Create 5 views: All Leads (table), Hot Leads (filtered by Priority), Active Outreach (Stage = Contacted or Replied Positively), Pipeline Board (Kanban by Stage), Closed Won (Stage = Closed or Retainer)"},
         {id:"2d",text:"Configure Lead Stage as a Select with these exact options in order: Not Contacted, Contacted, Replied Positively, Replied Negatively, Call Booked, Proposal Sent, Closed, Retainer"},
         {id:"2e",text:"Add yourself as a test entry and fill every column — confirm every field works as expected"},
       ]},
      {day:3, focus:"Google Sheets Lead Tracker Setup", icon:"📊",
       note:"Google Sheets is your raw scouting pad. Notion is your enriched command centre. Never confuse the two.",
       tasks:[
         {id:"3a",text:"Open your Lead Scouting Raw Data sheet → create columns: SMB Name | Phone | Website | Google Reviews | City | Country | Niche | Date Found | In Notion (Y/N)"},
         {id:"3b",text:"Create a second tab called Scoring Scratch Pad — you apply the scoring rubric here before entering leads into Notion"},
         {id:"3c",text:"Bold and color the header row — it must be easy to read quickly when transferring from a notebook"},
         {id:"3d",text:"Practice: enter 3 fictional businesses and score them — confirm the flow feels comfortable"},
       ]},
      {day:4, focus:"Build Demo #1 on Lovable", icon:"🛠️",
       note:"This is the day Lovable Pro earns its cost. A working demo closes more deals than three weeks of cold emails without one.",
       tasks:[
         {id:"4a",text:"Choose your first niche — dental, real estate, and beauty close fastest for beginners"},
         {id:"4b",text:"Open Lovable.dev → New Project → describe it: landing page and online booking system for a [niche] business. Use a fictional but realistic business name."},
         {id:"4c",text:"Iterate until it looks modern and professional: hero section, services list, booking form or calendar, contact section"},
         {id:"4d",text:"Publish to a live Lovable URL — open it on your phone. If it looks wrong on mobile, fix it before moving on"},
         {id:"4e",text:"Write a 100-word description: problem it solves, who it is for, what outcome it creates"},
       ]},
      {day:5, focus:"Build Demo #2 on Lovable", icon:"🛠️",
       note:"Two demos show range. If Demo 1 was a website, make Demo 2 a booking system, client portal, or lead capture page.",
       tasks:[
         {id:"5a",text:"Choose a second niche — different from Day 4 — and build a second Lovable demo"},
         {id:"5b",text:"Make it visually distinct from Demo 1 — different layout, different niche, different problem solved"},
         {id:"5c",text:"Publish and test on mobile — every demo must be flawless on a phone screen"},
         {id:"5d",text:"Write the 100-word outcome description for Demo 2"},
       ]},
      {day:6, focus:"Record Loom Walkthroughs for Both Demos", icon:"🎬",
       note:"Keep each Loom under 90 seconds. Structure: problem it solves (10 sec) → what you built (60 sec) → how to get one (10 sec).",
       tasks:[
         {id:"6a",text:"Record 60-90 second Loom for Demo 1 — speak confidently, explain the problem before showing the solution"},
         {id:"6b",text:"Record 60-90 second Loom for Demo 2"},
         {id:"6c",text:"Watch both recordings immediately — retake if your voice lacks confidence or any part of the demo freezes"},
         {id:"6d",text:"Save both Loom links in a Notion page titled 'Demo Assets' — these go into Email 3 for every lead"},
       ]},
      {day:7, focus:"LinkedIn Profile Audit and Week 1 Review", icon:"✅",
       note:"Decision-makers check your LinkedIn before replying to your email. Make sure it does not undermine you.",
       tasks:[
         {id:"7a",text:"Update LinkedIn: professional photo, headline from Day 1, About section (3-5 lines on who you help and how)"},
         {id:"7b",text:"Add your Lovable demo links to the LinkedIn Featured section"},
         {id:"7c",text:"Open both demos on your phone — do they look sharp and professional? Refine if not before Week 2"},
         {id:"7d",text:"Confirm Notion CRM has all columns and all 5 views working correctly"},
         {id:"7e",text:"Write your Week 2 target in your notebook: which niche, which city or country, minimum leads to find"},
       ]},
    ]},
  {
    week:2, title:"Manual Lead Harvest", range:"Days 8-14",
    icon:"🔍", color:"#10B981",
    goal:"Minimum 10 fully enriched HOT leads in Notion CRM with founder email, 3 connected problems identified, and ready for outreach.",
    days:[
      {day:8, focus:"Google Maps Scouting Session 1", icon:"🗺️",
       note:"Your physical notebook is your best tool today. Move fast through listings — this is a scouting pass, not research. Enrichment starts tomorrow.",
       tasks:[
         {id:"8a",text:"Open Google Maps on your phone → search '[niche] [city]' → browse the first 25-30 listings"},
         {id:"8b",text:"In your notebook, record for each: business name, phone, review count, whether a website link appears, and a quick gut-feel note (no site / outdated site / looks promising)"},
         {id:"8c",text:"Flag businesses with under 30 reviews, no website, or a clearly outdated site — these are your highest-priority targets"},
         {id:"8d",text:"Run 3 different search terms in the same niche: e.g. 'dentist', 'dental clinic', 'private dentist' — different terms surface different businesses"},
         {id:"8e",text:"Target: 15-20 raw leads recorded in your notebook by end of today"},
       ]},
      {day:9, focus:"Transfer Notebook to Google Sheets", icon:"📋",
       note:"Do this same evening or first thing next morning while the listings are still fresh in your memory.",
       tasks:[
         {id:"9a",text:"Open Google Sheets → create a new row for every business from your notebook"},
         {id:"9b",text:"Fill: SMB Name | Phone | Website URL (or 'None') | Google Reviews | City | Country | Niche | Date Found"},
         {id:"9c",text:"Visit each website briefly (30 seconds max): note in a comment cell — mobile-friendly Y/N, has online booking Y/N, looks modern Y/N"},
         {id:"9d",text:"Highlight any row with no website or an obviously outdated one in yellow — these are Priority A"},
       ]},
      {day:10, focus:"Manual Enrichment — Top 5 Leads", icon:"🔬",
       note:"Enrichment is where you earn your reply. A deeply researched email feels personal. A generic one gets deleted in 2 seconds.",
       tasks:[
         {id:"10a",text:"Pick your top 5 Priority A leads from Google Sheets"},
         {id:"10b",text:"For each: search '[Business Name] [City] owner' or '[Business Name] LinkedIn' to find the founder, owner, or director by name"},
         {id:"10c",text:"Open their LinkedIn profile — note full name, job title, profile URL, and whether they post content (active users reply faster)"},
         {id:"10d",text:"Check their Facebook and Instagram: when did they last post? Any customer comments mentioning 'hard to book' or 'could not find contact'? This is your Gap evidence."},
         {id:"10e",text:"Google '[Founder Name] [Business] email' or check the website /contact and /about pages — look for a personal email, not info@ or contact@"},
       ]},
      {day:11, focus:"Manual Enrichment — Next 5 Leads", icon:"🔬",
       note:"Same process as Day 10. By your fifth lead today you should be completing enrichment in under 20 minutes per lead.",
       tasks:[
         {id:"11a",text:"Enrich leads 6-10 using the same Day 10 process"},
         {id:"11b",text:"For any lead where you cannot find a direct email: note 'LinkedIn DM only' — they go into your LinkedIn outreach queue"},
         {id:"11c",text:"End of today: 10 leads with founder name, contact method, and notes on their digital presence"},
       ]},
      {day:12, focus:"Score All Leads and Enter into Notion CRM", icon:"🎯",
       note:"Score every lead using the 7 green signals and 5 red flags from the Grand Slam Playbook. Only Hot and Warm leads enter Notion.",
       tasks:[
         {id:"12a",text:"Open your Google Sheets Scoring Scratch Pad → apply the scoring rubric to each of your 10 leads"},
         {id:"12b",text:"Tag each: 🔥 Hot (score 7+) · ⚡ Warm (score 4-6) · ❄️ Cold (score 0-3)"},
         {id:"12c",text:"Enter every Hot and Warm lead into your Notion CRM database — fill every available column, set Stage to 'Not Contacted'"},
         {id:"12d",text:"Archive Cold leads in Google Sheets only — do not enter them into Notion, do not contact them"},
       ]},
      {day:13, focus:"Identify 3 Connected Problems Per HOT Lead", icon:"⚡",
       note:"This is the most important research step in the entire playbook. One hour here produces a week of highly targeted outreach that actually converts.",
       tasks:[
         {id:"13a",text:"Open the 3-Problem Method tab in this playbook — read the full framework before you begin"},
         {id:"13b",text:"For each HOT lead: identify The Gap (what is visibly missing), The Leak (what it silently costs them), The Lift (the revenue they could capture)"},
         {id:"13c",text:"Confirm all three form a causal chain — The Gap causes The Leak, and The Leak prevents The Lift"},
         {id:"13d",text:"Enter The Gap, The Leak, and The Lift into the matching Notion columns for each HOT lead"},
         {id:"13e",text:"Review: do all 3 problems point naturally to ONE solution — your Lovable demo? If not, rethink the connection before drafting any email"},
       ]},
      {day:14, focus:"Google Maps Scouting Session 2", icon:"🗺️",
       note:"While you prepare outreach for Batch 1, the pipeline keeps moving. This habit separates consistent earners from one-time closers.",
       tasks:[
         {id:"14a",text:"Choose: second city in same country OR second niche in same city"},
         {id:"14b",text:"Repeat the Day 8 scouting process — notebook, 15-20 raw leads, flagged Priority A entries"},
         {id:"14c",text:"Do not enrich this batch yet — enrichment begins Day 18 after your first outreach wave is running"},
       ]},
    ]},
  {
    week:3, title:"Outreach Launch", range:"Days 15-21",
    icon:"📧", color:"#F59E0B",
    goal:"5+ personalised emails sent manually from Gmail. LinkedIn requests to same leads. First replies tracked in Notion.",
    days:[
      {day:15, focus:"Draft Email 1 for Top 5 HOT Leads", icon:"✍️",
       note:"Write each email individually. The goal is for the recipient to think you wrote it for them — because you did.",
       tasks:[
         {id:"15a",text:"Open the Scripts tab — read the Email 1 template and understand the PAS structure before writing a single word"},
         {id:"15b",text:"For each of your top 5 HOT leads: personalise the opening line with something specific you noticed (review count, missing booking, outdated site date)"},
         {id:"15c",text:"Reference your relevant Lovable demo or Loom link — this is the proof that makes the email real"},
         {id:"15d",text:"Keep every email under 130 words. If it sounds like a template, rewrite the first two lines."},
         {id:"15e",text:"Save each draft in Notion or Google Docs — review them tomorrow morning with fresh eyes before sending"},
       ]},
      {day:16, focus:"Send Email 1 Manually from Gmail", icon:"🚀",
       note:"You are sending 5 emails. Not 500. That is the point. Every email goes from your Gmail to the founder's personal email — no tools, no batch sends.",
       tasks:[
         {id:"16a",text:"Reread each of your 5 drafts — make one final personalisation tweak per email if anything feels generic"},
         {id:"16b",text:"Send them one by one from your dedicated Gmail — never BCC or CC multiple leads at once"},
         {id:"16c",text:"After each send: open Notion → update Stage to 'Contacted' → set Last Contacted to today"},
         {id:"16d",text:"Set phone notifications for Gmail replies — you must respond to any positive reply within 2 hours"},
       ]},
      {day:17, focus:"LinkedIn Connection Requests to Same 5 Leads", icon:"💼",
       note:"Email and LinkedIn together doubles your touchpoints without doubling your effort. Use both channels — but not simultaneously on the same day.",
       tasks:[
         {id:"17a",text:"Search each of your 5 leads on LinkedIn by founder name → open their profile"},
         {id:"17b",text:"Before requesting: comment thoughtfully on their most recent post — this warms them up before your connection request arrives"},
         {id:"17c",text:"Send connection request with a personalised note (under 300 characters): 'Hi [Name], I help [niche] businesses in [City] with digital systems. Would love to connect.'"},
         {id:"17d",text:"Do NOT mention your email or pitch in the connection request — that comes only after they accept"},
         {id:"17e",text:"Tick the LinkedIn Connected checkbox in Notion for each lead where the request is sent"},
       ]},
      {day:18, focus:"Enrich the Day 14 Batch", icon:"🔬",
       note:"While Batch 1 is in market, Batch 2 gets enriched. The pipeline never stops moving — this is how you avoid feast-and-famine.",
       tasks:[
         {id:"18a",text:"Transfer your Day 14 notebook entries to Google Sheets"},
         {id:"18b",text:"Enrich the top 8-10 leads from this batch: founder name, email, LinkedIn, 3 connected problems"},
         {id:"18c",text:"Score every enriched lead — enter Hot and Warm into Notion CRM with all columns filled"},
       ]},
      {day:19, focus:"Send Email 1 to Next 5 HOT Leads", icon:"📧",
       note:"Second wave. Same process as Days 15-16. Each email individually written and manually sent.",
       tasks:[
         {id:"19a",text:"Draft personalised Email 1s for the next 5 HOT leads from your Day 18 enrichment"},
         {id:"19b",text:"Send them manually from Gmail — one by one — update Notion Stage and Last Contacted date for each"},
         {id:"19c",text:"Send LinkedIn connection requests to this second batch as well"},
       ]},
      {day:20, focus:"Monitor, Reply, and Update Notion", icon:"🔔",
       note:"Speed of reply is your single biggest competitive advantage. Every hour of delay costs you the reply. Every unanswered reply costs you the deal.",
       tasks:[
         {id:"20a",text:"Check your Gmail — reply to every response within 2 hours. Positive, negative, or neutral — all get a reply."},
         {id:"20b",text:"For positive replies: send your Calendly link and suggest 2 specific time slots — make booking effortless"},
         {id:"20c",text:"Update Notion Stage for every reply: 'Replied Positively' or 'Replied Negatively'. Add their exact words to the Notes column."},
         {id:"20d",text:"Check LinkedIn: accept new connections → send the DM to each one who accepts (see Scripts tab)"},
       ]},
      {day:21, focus:"Send Email 2 to Day 16 Non-Responders", icon:"📬",
       note:"Email 2 is NOT a follow-up. It reveals The Leak — new information the lead has not thought about. The subject line must not say 'following up'.",
       tasks:[
         {id:"21a",text:"Identify which Day 16 leads have not replied — open their Notion entries"},
         {id:"21b",text:"Draft Email 2 for each (see Scripts tab) — reference The Leak specifically identified in their Notion profile"},
         {id:"21c",text:"Subject line must feel like a new conversation, not a reminder — see Scripts tab for proven subject line formulas"},
         {id:"21d",text:"Send manually, update Notion Last Contacted date for each"},
       ]},
    ]},
  {
    week:4, title:"First Close", range:"Days 22-28",
    icon:"🏆", color:"#EC4899",
    goal:"Discovery calls run, proposals sent, first paid project closed, 50% deposit collected.",
    days:[
      {day:22, focus:"LinkedIn DMs to Accepted Connections", icon:"💬",
       note:"Only DM after they accept. Your first DM is not a pitch — it is a personal observation and a Loom link. The demo does the selling.",
       tasks:[
         {id:"22a",text:"Check which connection requests from Days 17 and 19 have been accepted"},
         {id:"22b",text:"Send each new connection the DM from the Scripts tab — mention one specific thing about their business and share the Loom walkthrough"},
         {id:"22c",text:"Do not pitch in the DM. End with: 'Worth 15 minutes to explore?' — not a hard close"},
         {id:"22d",text:"Log every DM sent in Notion: LinkedIn DM Sent checkbox ticked, Last Contacted updated"},
       ]},
      {day:23, focus:"Send Email 3 to Non-Responders — The Lift", icon:"🎯",
       note:"This is your strongest email. It leads with a live Lovable demo built for their type of business. The link makes it real in a way words never can.",
       tasks:[
         {id:"23a",text:"Identify all Day 16 leads who have not replied to Email 1 or Email 2"},
         {id:"23b",text:"Draft Email 3 for each — lead with the Loom walkthrough and the live Lovable demo URL"},
         {id:"23c",text:"Make clear in one sentence: this demo addresses their specific Gap, Leak, and Lift — not a generic showcase"},
         {id:"23d",text:"Send manually, update Notion Last Contacted"},
       ]},
      {day:24, focus:"Discovery Calls — SPIN Framework", icon:"📞",
       note:"Your job on a discovery call is to listen, not pitch. The client tells you exactly how to close them if you ask the right questions.",
       tasks:[
         {id:"24a",text:"5 minutes before each call: review their Notion entry — Gap, Leak, Lift, their exact words from the reply"},
         {id:"24b",text:"SITUATION: 'How are you currently handling new client enquiries that come in online?'"},
         {id:"24c",text:"PROBLEM: 'What is the biggest challenge with how that works right now?' — then be completely silent. Do not fill the pause."},
         {id:"24d",text:"IMPLICATION: 'How much would it change things if you never missed an after-hours enquiry again?'"},
         {id:"24e",text:"NEED-PAYOFF: 'If I could build a system that does that in 14 days, would that be worth exploring?' — wait for the yes"},
       ]},
      {day:25, focus:"Send Proposals Within 24 Hours", icon:"📄",
       note:"Proposals sent within 24 hours of a discovery call close at 3x the rate of proposals sent 3 days later. Do not wait.",
       tasks:[
         {id:"25a",text:"Use the 3-tier structure from the Grand Slam Playbook — Starter, Standard, and Premium — always show all three"},
         {id:"25b",text:"Name the outcome first in each tier, then the deliverables — never the other way around"},
         {id:"25c",text:"Include your delivery guarantee: 'Live in [X] days or I work at no charge until it is'"},
         {id:"25d",text:"Send as a shared Google Doc link — professional and easy for them to share with a business partner"},
       ]},
      {day:26, focus:"Follow Up on Proposals", icon:"🔁",
       note:"Most deals die in silence, not rejection. One polite follow-up after 48 hours recovers 20-30% of proposals that would otherwise go cold.",
       tasks:[
         {id:"26a",text:"48 hours after sending: 'Hi [Name], just checking you received the proposal — any questions I can answer?'"},
         {id:"26b",text:"5 days with no response: send a value-add message — a fresh insight about their business or a case study result"},
         {id:"26c",text:"Any proposal older than 10 days with no response: mark Notion Stage as 'Replied Negatively' and move on"},
       ]},
      {day:27, focus:"Handle Objections on Live Calls", icon:"🗣️",
       note:"Objections are questions the client has not yet asked out loud. Your job is to answer them before they walk away.",
       tasks:[
         {id:"27a",text:"'Too expensive' → Do not discount. Move to the Starter tier. Reframe value: 'At $X, this pays for itself with the first new client it brings in'"},
         {id:"27b",text:"'Can I not build this myself with AI?' → Use the exact script from the Scripts tab — calm, educational, never defensive"},
         {id:"27c",text:"'I need to think about it' → 'Of course — is there a specific part you are uncertain about? I am happy to clarify right now.'"},
         {id:"27d",text:"'Send me more examples' → Send your Loom demos same day, not next day — same-day response converts significantly better"},
       ]},
      {day:28, focus:"Close and Collect 50% Deposit", icon:"💰",
       note:"50% upfront is non-negotiable. It protects you and qualifies them. A client unwilling to pay 50% upfront will also be difficult about the final 50%.",
       tasks:[
         {id:"28a",text:"Once they say yes: send a simple 1-page agreement via Google Docs within the hour"},
         {id:"28b",text:"Send a Payoneer or bank transfer request for 50% of the project fee — do not start work until payment clears"},
         {id:"28c",text:"Send a kickoff questionnaire: brand colours, logo file, domain access, key services, any existing content"},
         {id:"28d",text:"Update Notion Stage to 'Closed'. Begin the Blueprint phase immediately."},
       ]},
    ]},
  {
    week:5, title:"Deliver and Expand", range:"Days 29-35",
    icon:"🚀", color:"#8B5CF6",
    goal:"First project delivered and fully paid. Upsell conversation started. Real testimonial and case study secured. New batch in outreach.",
    days:[
      {day:29, focus:"Blueprint Phase — Map Before You Build", icon:"📐",
       note:"Blueprint first. Build second. Every time. This one habit separates professionals from order-takers — and prevents expensive scope creep.",
       tasks:[
         {id:"29a",text:"Map exactly what you are building: pages, features, forms, integrations, data flows — in writing or a simple diagram"},
         {id:"29b",text:"Share the blueprint with the client via Google Doc and get written confirmation before opening Lovable"},
         {id:"29c",text:"Set your internal delivery deadline 2 days before the promised date — buffer is not laziness, it is professionalism"},
         {id:"29d",text:"Send client update: 'Blueprint approved — build starts today. You will hear from me in 48 hours.'"},
       ]},
      {day:30, focus:"Build Phase and New Scouting Session", icon:"⚙️",
       note:"While you build the first project, the pipeline keeps running. One scouting hour today prevents a gap in income 3 weeks from now.",
       tasks:[
         {id:"30a",text:"Continue building Project 1 in Lovable — send the client a progress screenshot or short Loom update"},
         {id:"30b",text:"Use 60 minutes to run a new Google Maps scouting session for a fresh city or niche"},
         {id:"30c",text:"Record raw leads in notebook — enrichment begins on Day 31"},
       ]},
      {day:31, focus:"Enrich New Batch and Enter Notion", icon:"🔬",
       note:"Enriching the new batch while delivering a project is how you avoid the feast-and-famine cycle permanently.",
       tasks:[
         {id:"31a",text:"Transfer Day 30 notebook entries to Google Sheets"},
         {id:"31b",text:"Enrich your top 8-10 leads: founder name, direct email, LinkedIn, 3 connected problems"},
         {id:"31c",text:"Score and enter Hot and Warm leads into Notion CRM with all columns filled"},
       ]},
      {day:32, focus:"Send Email 1 to New Batch HOT Leads", icon:"📧",
       note:"Outreach never stops — even during delivery weeks. Commit to a minimum of 5 outreach actions every week for the next 12 months.",
       tasks:[
         {id:"32a",text:"Draft and send personalised Email 1 to your top 5 HOT leads from the new batch"},
         {id:"32b",text:"Send LinkedIn connection requests to the same 5 leads"},
         {id:"32c",text:"Update Notion Stage and Last Contacted date for each"},
       ]},
      {day:33, focus:"Deliver Project 1 — Make It a Ceremony", icon:"🎉",
       note:"Delivery is not a file transfer — it is the moment a client's business changes. Treat it that way and you earn the testimonial, the referral, and the retainer conversation.",
       tasks:[
         {id:"33a",text:"Book a 30-minute Calendly screen-share call specifically for the delivery walkthrough"},
         {id:"33b",text:"Walk through every page and feature — explain what each piece does for their business specifically"},
         {id:"33c",text:"Send the final 50% payment request immediately after the walkthrough call"},
         {id:"33d",text:"Schedule a 3-day check-in: 'Quick 10 minutes — just checking everything is running smoothly'"},
       ]},
      {day:34, focus:"Upsell Conversation", icon:"📈",
       note:"The best moment to sell the next thing is within 48 hours of a great delivery. Trust is at its peak and the door is wide open.",
       tasks:[
         {id:"34a",text:"Send upsell message: 'Now that [site/system] is live, the next natural step is [CRM / email automation / booking integration]. Want me to show you what that looks like?'"},
         {id:"34b",text:"Offer the Care Retainer ($200-400/month): maintenance, updates, and priority support"},
         {id:"34c",text:"If they want more now: propose the next Standard or Premium package based on their next most urgent problem"},
       ]},
      {day:35, focus:"Testimonial, Case Study and 2 Referrals", icon:"⭐",
       note:"One happy client can bring three more. This step is worth more than any cold email campaign — and it costs you nothing but the ask.",
       tasks:[
         {id:"35a",text:"Ask: 'Would you mind leaving a quick Google review? Here is the direct link: [URL]'"},
         {id:"35b",text:"Ask for a LinkedIn recommendation — 5 minutes of their time, years of credibility for you"},
         {id:"35c",text:"Ask for referrals: 'If you know any other [niche] owners who could use this, I would love an introduction'"},
         {id:"35d",text:"Write your first real case study: Problem → What You Built → Specific Result. Add it to your portfolio site and update your email templates to reference it."},
       ]},
    ]},
  {
    week:6, title:"Scale the Manual Machine", range:"Days 36-42",
    icon:"⚙️", color:"#14B8A6",
    goal:"Third scouting round complete. Full Notion pipeline active. LinkedIn content started. First retainer conversation open.",
    days:[
      {day:36, focus:"Scouting Session 3 — New Niche or Country", icon:"🗺️",
       note:"Everything you learned in the first two niches makes the third faster. Patterns repeat. The research sharpens. The emails get better.",
       tasks:[
         {id:"36a",text:"Choose: new niche you have not yet targeted, OR a new country (UK or Australia are strong for English-language outreach)"},
         {id:"36b",text:"Run a full Google Maps scouting session — 15-20 raw leads in notebook"},
         {id:"36c",text:"If the new niche requires a different type of solution (e.g. restaurants need a different demo than coaches), update your Lovable demo accordingly"},
       ]},
      {day:37, focus:"Enrich, Score and Enter New Batch", icon:"🔬",
       note:"By Week 6 you should be completing a full lead enrichment in under 15 minutes per lead. Quality stays high — speed just improves with repetition.",
       tasks:[
         {id:"37a",text:"Transfer, enrich, score, and enter 8-10 leads from Day 36 into Notion CRM"},
         {id:"37b",text:"Identify 3 connected problems for each HOT lead in the new batch"},
         {id:"37c",text:"Update your email templates to reference your real Project 1 result — replace any demo reference with the actual outcome"},
       ]},
      {day:38, focus:"Draft Emails Using Your Real Case Study", icon:"✍️",
       note:"Every email you send from this point forward references a real result — not a demo, not a promise. This is your first major credibility upgrade.",
       tasks:[
         {id:"38a",text:"Draft Email 1 for your top 5 HOT leads from the new batch — open with a reference to your Project 1 result"},
         {id:"38b",text:"Example opener: 'I recently helped a [niche] business in [City] go from missed enquiries to a fully automated booking system — live in 12 days.'"},
         {id:"38c",text:"Save all 5 drafts and review them the next morning before sending"},
       ]},
      {day:39, focus:"Send Wave 3 Outreach", icon:"📧",
       note:"Third wave. You have a real case study now. The email converts at a meaningfully higher rate than your first wave did.",
       tasks:[
         {id:"39a",text:"Send Email 1 to your top 5 HOT leads from the new batch — manually, one by one from Gmail"},
         {id:"39b",text:"Send LinkedIn connection requests to the same 5 leads"},
         {id:"39c",text:"Update Notion Stage and Last Contacted for each"},
       ]},
      {day:40, focus:"First LinkedIn Content Post", icon:"📱",
       note:"One LinkedIn post per week for 6 months builds more inbound than most ad campaigns. Today you start that habit.",
       tasks:[
         {id:"40a",text:"Write a post under 250 words: share one honest observation from working with your first client — what was the before, what changed after"},
         {id:"40b",text:"End with a CTA: 'If you run a [niche] business and this sounds familiar, feel free to reach out'"},
         {id:"40c",text:"Post it now. Do not over-edit. Authenticity outperforms polish on LinkedIn every single time."},
       ]},
      {day:41, focus:"Weekly Follow-Up Sweep Across All Batches", icon:"🔄",
       note:"This 30-minute weekly sweep ensures nothing falls through the cracks. It is worth more than 2 hours of new prospecting.",
       tasks:[
         {id:"41a",text:"Open Notion → Active Outreach view → review every lead in 'Contacted' status"},
         {id:"41b",text:"Any lead contacted 3-4 days ago with no reply: send Email 2 (The Leak)"},
         {id:"41c",text:"Any lead contacted 7 days ago with no reply: send Email 3 (The Lift + Demo)"},
         {id:"41d",text:"Any lead with 3 emails sent and no reply: mark as 'Replied Negatively' in Notion — archive for a 30-day nurture re-contact"},
       ]},
      {day:42, focus:"Full 6-Week Review", icon:"📊",
       note:"The most important 45 minutes of the entire playbook. What you measure now, you can multiply in Month 2.",
       tasks:[
         {id:"42a",text:"Count: total leads scouted, enriched, entered into Notion, emailed, replied, calls booked, proposals sent, deals closed"},
         {id:"42b",text:"Revenue collected to date — actual money received, not invoiced"},
         {id:"42c",text:"Open Notion Pipeline Board — where is every lead? Which have been stuck in one stage for too long?"},
         {id:"42d",text:"Write one honest sentence: what single thing, if done differently, would have closed more deals in Month 1?"},
       ]},
    ]},
  {
    week:7, title:"Month 2 Launch", range:"Days 43-45",
    icon:"🌅", color:"#F97316",
    goal:"Full debrief complete. Month 2 targets set in writing. Public proof shared. Pipeline actively running.",
    days:[
      {day:43, focus:"Full Month 1 Debrief", icon:"🪞",
       note:"Honest self-assessment is not self-criticism — it is the raw material of a better Month 2.",
       tasks:[
         {id:"43a",text:"Pull all numbers from Gmail, Notion, and Google Sheets into one summary document"},
         {id:"43b",text:"Calculate: revenue collected divided by total hours worked = your effective hourly rate. Is it improving?"},
         {id:"43c",text:"Identify your best-performing niche, best-performing email subject line, and best-performing outreach channel"},
         {id:"43d",text:"Write 3 things that exceeded expectations and 3 things to improve in Month 2"},
       ]},
      {day:44, focus:"Month 2 Planning Session", icon:"📋",
       note:"Month 2 is where compounding begins. You have data, proof, and a case study. The machine is faster now.",
       tasks:[
         {id:"44a",text:"Set specific Month 2 targets in writing: leads scouted, emails sent, calls, proposals, closes, revenue"},
         {id:"44b",text:"Decide: expand niche, expand country, or go deeper in your existing market?"},
         {id:"44c",text:"Plan when automation tools make financial sense — rule: only when manual volume maxes out and you have consistent revenue to fund them"},
         {id:"44d",text:"Block weekly time in your calendar for: scouting, enrichment, email, calls, delivery, review — treat each like a client appointment"},
       ]},
      {day:45, focus:"Public Commitment and Keep Shipping", icon:"🏁",
       note:"The public post makes it real. It attracts clients, keeps you accountable, and builds an audience of future students who want to learn from your journey.",
       tasks:[
         {id:"45a",text:"Post on LinkedIn: what you set out to do, what you built, what you learned, where you are headed in Month 2"},
         {id:"45b",text:"Write a private commitment: 'By Day 90, I will have [X] clients and [Y] monthly recurring revenue'"},
         {id:"45c",text:"The outreach machine never pauses — send at least 2 new personalised emails today. Day 45 is not a rest day. It is a relaunch."},
       ]},
    ]},
];

/* ─── UI ─────────────────────────────────────────────────── */
function PlanPage() {
  const [tasks, setTasks, meta] = useSyncedTaskMap("p_45day");

  const totalTasks = useMemo(
    () => WEEKS.reduce((n, w) => n + w.days.reduce((m, d) => m + d.tasks.length, 0), 0),
    []
  );

  const toggle = (id: string) => setTasks((p: any) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="pb-12">
      <SaveBar meta={meta} title="45-Day Playbook" total={totalTasks} />

      <div className="max-w-[880px] mx-auto px-4 pt-8 space-y-6">
        <header>
          <div className="text-[10px] uppercase tracking-widest text-gold-deep">Playbook · 45 Days</div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">From Zero to First Client</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manual outreach, high-value demos, Notion CRM, and a first close by Day 28. Every tick auto-saves and updates your rank and calendar.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-gold/40 bg-accent/20 px-3 py-1 font-semibold text-gold-deep">
              {meta.completedCount} / {totalTasks} tasks complete
            </span>
            <span>{Math.round((meta.completedCount / Math.max(1, totalTasks)) * 100)}% through the campaign</span>
          </div>
        </header>

        {WEEKS.map((w) => (
          <section key={w.week} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border" style={{ background: `linear-gradient(135deg, ${w.color}18, transparent)` }}>
              <div className="text-[10px] uppercase tracking-widest text-gold-deep">Week {w.week} · {w.range}</div>
              <h2 className="mt-1 font-display text-xl md:text-2xl font-bold">{w.icon} {w.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{w.goal}</p>
            </div>
            <div className="p-5 space-y-4">
              {w.days.map((d) => {
                const done = d.tasks.filter((t) => tasks[t.id]).length;
                const pct = Math.round((done / d.tasks.length) * 100);
                return (
                  <div key={d.day} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Day {d.day}</div>
                        <div className="mt-0.5 font-display text-base font-bold flex items-center gap-2"><span>{d.icon}</span> {d.focus}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-semibold">{done} / {d.tasks.length}</div>
                        <div className="text-muted-foreground">{pct}%</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 rounded bg-muted overflow-hidden">
                      <div className={`h-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                    {d.note && (
                      <p className="mt-3 text-xs italic text-muted-foreground border-l-2 border-gold/40 pl-3">{d.note}</p>
                    )}
                    <ul className="mt-3 space-y-2">
                      {d.tasks.map((t) => (
                        <li key={t.id}>
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={!!tasks[t.id]}
                              onChange={() => toggle(t.id)}
                              className="mt-0.5 h-4 w-4 rounded border-gold/40 accent-primary"
                            />
                            <span className={`text-sm leading-relaxed ${tasks[t.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {t.text}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="rounded-xl border border-gold/40 bg-accent/20 p-5 text-sm">
          <div className="text-[10px] uppercase tracking-widest text-gold-deep">Notion CRM</div>
          <p className="mt-2 text-muted-foreground">
            The entire pipeline lives inside Notion. If you use another tool it will slow you down and confuse your admin — stick with Notion for the full 45 days, then decide.
          </p>
        </div>
      </div>
    </div>
  );
}
