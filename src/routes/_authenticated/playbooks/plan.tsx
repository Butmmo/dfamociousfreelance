// @ts-nocheck
// 45-Day Implementation Playbook — installed verbatim from source; only colours
// remapped to the DFS Regal palette. Progress persists via Supabase.
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { SaveBar } from "@/components/dfs/SaveBar";

export const Route = createFileRoute("/_authenticated/playbooks/plan")({
  head: () => ({ meta: [{ title: "45-Day Implementation Playbook — DFS" }] }),
  component: PlanPage,
});


export const WEEKS = [
  {
    week:1, title:"Build Your Foundation", range:"Days 1-7",
    icon:"🏗️", color:"#7A5A00",
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
    icon:"🔍", color:"#0D7A5F",
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
    icon:"📧", color:"#B8860B",
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
    icon:"🏆", color:"#8B2E1F",
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
    icon:"🚀", color:"#8B2E1F",
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
    icon:"⚙️", color:"#0D7A5F",
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
    icon:"🌅", color:"#B8860B",
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

const NOTION_COLS = [
  {name:"SMB Name",          type:"Title",    icon:"🏢", desc:"Official business name from Google Maps"},
  {name:"Phone Number",      type:"Phone",    icon:"📞", desc:"Direct business phone from the listing"},
  {name:"Website URL",       type:"URL",      icon:"🌐", desc:"Their current site URL, or enter 'No Website'"},
  {name:"Google Reviews",    type:"Number",   icon:"⭐", desc:"Total review count at time of research"},
  {name:"City",              type:"Text",     icon:"📍", desc:"City where the business operates"},
  {name:"Country",           type:"Select",   icon:"🌍", desc:"USA / UK / Canada / Australia / Germany / Netherlands / UAE / Israel"},
  {name:"Niche",             type:"Select",   icon:"🎯", desc:"Dental / Real Estate / Fitness / Coach / Beauty / Restaurant / Legal / etc."},
  {name:"Founder Name",      type:"Text",     icon:"👤", desc:"Owner or decision-maker — found via LinkedIn, website, or Facebook"},
  {name:"Founder Email",     type:"Email",    icon:"📧", desc:"Direct personal email — not info@ or contact@ — 3x higher reply rate"},
  {name:"Founder LinkedIn",  type:"URL",      icon:"💼", desc:"Their personal LinkedIn profile URL for DM outreach"},
  {name:"Lead Score",        type:"Number",   icon:"🎯", desc:"1-10 score from the Grand Slam Playbook scoring rubric"},
  {name:"Lead Priority",     type:"Select",   icon:"🔥", desc:"🔥 Hot (7+)  ·  ⚡ Warm (4-6)  ·  ❄️ Cold (0-3)"},
  {name:"Lead Stage",        type:"Select",   icon:"📊", desc:"Not Contacted → Contacted → Replied Positively → Replied Negatively → Call Booked → Proposal Sent → Closed → Retainer"},
  {name:"The Gap",           type:"Text",     icon:"⚠️", desc:"Problem 1 — the visible missing piece in their digital presence"},
  {name:"The Leak",          type:"Text",     icon:"💧", desc:"Problem 2 — what The Gap silently costs them every week"},
  {name:"The Lift",          type:"Text",     icon:"🚀", desc:"Problem 3 — the revenue they could be capturing if the system existed"},
  {name:"Email 1 Sent",      type:"Checkbox", icon:"✉️", desc:"The Gap email (PAS formula) — sent?"},
  {name:"Email 2 Sent",      type:"Checkbox", icon:"✉️", desc:"The Leak email (consequence reveal) — sent 3 days after Email 1"},
  {name:"Email 3 Sent",      type:"Checkbox", icon:"✉️", desc:"The Lift email (live demo reveal) — sent 7 days after Email 1"},
  {name:"LinkedIn Connected",type:"Checkbox", icon:"💼", desc:"Connection request sent on LinkedIn"},
  {name:"LinkedIn DM Sent",  type:"Checkbox", icon:"💬", desc:"DM sent after they accepted the connection"},
  {name:"Last Contacted",    type:"Date",     icon:"📅", desc:"Date of most recent outreach — used to time Email 2 and Email 3"},
  {name:"Notes",             type:"Text",     icon:"📝", desc:"Their exact reply words, call notes, objections raised, anything relevant"},
];

const NOTION_VIEWS = [
  {name:"📋 All Leads",        desc:"Master table — every lead in order of entry. Never delete from here."},
  {name:"🔥 Hot Leads",        desc:"Filter: Lead Priority = Hot. These get a personalised Lovable demo before any email goes out."},
  {name:"⚡ Active Outreach",  desc:"Filter: Lead Stage = Contacted OR Replied Positively. Your live pipeline."},
  {name:"📅 This Week",        desc:"Filter: Last Contacted within last 7 days. Nothing slips through this view."},
  {name:"📊 Pipeline Board",   desc:"Kanban grouped by Lead Stage. Drag cards left to right as leads progress."},
  {name:"🏆 Closed Won",       desc:"Filter: Stage = Closed OR Retainer. Your proof library and case study source."},
];

const RESEARCH_STEPS = [
  {n:"01",icon:"🗺️",color:"#7A5A00",title:"Scout on Google Maps — Notebook Only",
   body:"Open Google Maps on your phone. Search '[niche] [city]'. Browse 25-30 listings. In your physical notebook, record: business name, phone, review count, whether a website appears, and a quick note on what looks weak. Move fast — this is scouting, not research. Aim for 15-20 entries per session."},
  {n:"02",icon:"📒",color:"#0D7A5F",title:"Transfer Notebook to Google Sheets",
   body:"Same evening or next morning: open your raw data sheet and create a row for each listing. Columns: SMB Name | Phone | Website (or None) | Reviews | City | Country | Niche | Date Found. Visit each website briefly (30 seconds max) and note: mobile-friendly? Has booking? Modern design? Use a comment cell."},
  {n:"03",icon:"💼",color:"#B8860B",title:"Find the Founder on LinkedIn",
   body:"Search '[Business Name] [City]' on LinkedIn. Find the Owner, Founder, Director, or MD. Note: full name, job title, profile URL. Check whether they post content — active LinkedIn users respond to DMs 2-3x faster than inactive ones. If not on LinkedIn, check the website About page or Facebook."},
  {n:"04",icon:"📘",color:"#8B2E1F",title:"Check Facebook and Instagram",
   body:"Search the business name on both platforms. Note: when did they last post? Are customers commenting with pain points like 'hard to book' or 'never got a reply'? A business with an active Instagram but no booking system is a perfect target — they have the audience but no system to convert it."},
  {n:"05",icon:"🔍",color:"#8B2E1F",title:"Find the Direct Email via Google Search",
   body:"Try: '[Founder Name] [Business Name] email' or '[Founder Name] [City] contact'. Then check the website /contact and /about pages. Look for a personal email, not info@ or contact@ — personal addresses get 3x the reply rate. If you cannot find one, mark the lead as 'LinkedIn DM only' in your sheet."},
  {n:"06",icon:"🎯",color:"#0D7A5F",title:"Score the Lead Using the Grand Slam Rubric",
   body:"Apply the 7 green signals and 5 red flags from the Grand Slam Playbook (Score Leads tab). Record the score in your Scoring Scratch Pad sheet. Tag: Hot (7+), Warm (4-6), Cold (0-3). Only continue enriching Hot and Warm leads. Do not spend another minute on Cold leads."},
  {n:"07",icon:"⚡",color:"#B8860B",title:"Identify The Gap, The Leak, and The Lift",
   body:"For every HOT lead only: open the 3-Problem Method tab and identify all three connected problems specific to this business. The three must form a causal chain. Write all three in your Google Sheet before opening Notion — Notion is where they go once the research is complete."},
  {n:"08",icon:"🗂️",color:"#7A5A00",title:"Enter Into Notion CRM",
   body:"Once a lead has: founder name, contact method, and all three problems identified — create their Notion entry, fill every column, and set Lead Stage to 'Not Contacted'. This is the signal they are ready for outreach. Notion is your source of truth. Google Sheets is just the scouting scratch pad."},
];

const NICHES_3P = [
  {niche:"Dental Clinic",icon:"🦷",
   gap:"No online booking — patients can only call during office hours to schedule an appointment",
   leak:"People searching for a dentist at 9 PM cannot book immediately and move on to whoever lets them — the clinic never knows they were there",
   lift:"No email recall system means existing patients only return when they remember to call — no automated schedule, no loyalty, lower lifetime patient value",
   chain:"No booking system → missed night-time enquiries → no recall campaign → patients drift to competitors at renewal time",
   tip:"One Lovable booking site + Mailchimp recall sequence solves all three with a single integrated build."},
  {niche:"Real Estate Agent",icon:"🏠",
   gap:"Leads are managed in WhatsApp and mental notes — no CRM, no structured pipeline visibility",
   leak:"60-70% of warm leads go cold because there is no follow-up system — they enquire once, get one response, then hear nothing for weeks",
   lift:"Past clients are never systematically re-engaged — no referral campaign, no market update emails, the most valuable relationships left completely idle",
   chain:"No CRM → unstructured follow-up → warm leads go cold → no referral system → income stays unpredictable",
   tip:"Lovable landing page + Notion CRM setup + 3-email Mailchimp sequence addresses the full chain in one build."},
  {niche:"Hair Salon or Beauty Studio",icon:"💆",
   gap:"Booking is by phone or walk-in only — no online scheduling, no 24/7 availability for clients",
   leak:"Clients who want to rebook after 6 PM cannot do so — they either call next day and forget, or book elsewhere out of convenience",
   lift:"No birthday or rebooking reminder system means loyal clients drift away without the salon realising until revenue noticeably drops",
   chain:"Phone-only booking → after-hours clients lost → no rebooking reminders → silent churn → revenue decline",
   tip:"Lovable booking page + Mailchimp birthday and rebooking sequences covers all three with one connected system."},
  {niche:"Business or Life Coach",icon:"🎯",
   gap:"Discovery calls are booked via email back-and-forth — no automated scheduling link in bio, emails, or website",
   leak:"Interested prospects lose momentum during the multi-email scheduling process and stop responding before ever getting on a call",
   lift:"No email nurture sequence means followers who are not ready to buy today never receive the content that would convert them next month",
   chain:"No booking link → friction in scheduling → warm leads cool off → no nurture → follower stays a follower forever",
   tip:"Lovable coaching site with embedded Calendly + Mailchimp nurture sequence addresses all three with one build."},
  {niche:"Restaurant or Cafe",icon:"🍽️",
   gap:"All orders and reservations go through third-party platforms — the restaurant owns none of its own customer data",
   leak:"Every transaction enriches the platform, not the restaurant — 15-30% commission per order, no direct customer contact, no way to reach regulars independently",
   lift:"No loyalty or repeat-visit campaign means regulars return at random — no system to bring them back on a slow Tuesday or announce a special event",
   chain:"Platform dependency → no customer data → no direct marketing → no loyalty system → revenue always at the platform's mercy",
   tip:"Lovable ordering page + Mailchimp loyalty campaign + a simple menu site gives the restaurant full ownership of its own customers."},
];

const SCRIPTS = [
  {id:"e1",tag:"Email 1 · The Gap · PAS",color:"#7A5A00",
   title:"Email 1 — The Gap",
   note:"Under 130 words. Reference one specific thing you found during enrichment — review count, missing booking button, outdated site. The specificity is what separates this from spam.",
   body:`Subject: [First Name] — something I noticed about [Business Name]

Hi [First Name],

I was looking at [Business Name] on Google and noticed [specific gap — one precise sentence, e.g. there is no way for clients to book an appointment outside of business hours].

For a business with your presence in [City], that one gap is likely costing you [specific consequence — new clients, bookings, or enquiries] every week.

I build digital systems for [niche] businesses — websites, booking tools, and client management — that fix exactly this.

I recently built something for a similar business: [Lovable demo link or Loom walkthrough].

Worth a 15-minute conversation?

[Calendly link]

[Your name]`},
  {id:"e2",tag:"Email 2 · The Leak · Day 3",color:"#0D7A5F",
   title:"Email 2 — The Leak",
   note:"This is NOT a follow-up. It reveals new information — the hidden cost of their Gap. The subject line must not contain the words 'following up' or 'checking in'.",
   body:`Subject: The quiet cost of [reference the gap] at [Business Name]

Hi [First Name],

Something I have been thinking about since I reached out a few days ago.

Most [niche] owners already know they need [fix for the gap]. What rarely gets talked about is what that gap costs silently, week after week.

When a potential client finds your listing and cannot [take the natural next step — book, enquire, get a quote], they do not wait. They click the next result. You never know they were there.

Across a month, that is likely [estimate: 3-6 missed clients] walking out the digital door.

I have helped [niche] businesses stop this specific leak. Happy to walk you through how in 15 minutes.

[Calendly link]

[Your name]`},
  {id:"e3",tag:"Email 3 · The Lift · Day 7",color:"#B8860B",
   title:"Email 3 — The Lift and Demo",
   note:"Your strongest email. It leads with a live Lovable demo. The link makes it real in a way words never can. Keep it short — the demo does the talking.",
   body:`Subject: I built something for [Business Name]

Hi [First Name],

I went ahead and built a quick live demo of what a [solution type] could look like for [Business Name].

Not a concept — you can click through it here: [Lovable demo link]
Or watch the 90-second walkthrough: [Loom link]

What it addresses:
→ [The Gap — one line]
→ [The Leak — one line]
→ [The Lift — one line]

If [3-5 new clients / more bookings / direct orders] a month would be worth it, this pays for itself within the first week.

15 minutes to walk through it together?

[Calendly link]

[Your name]`},
  {id:"li1",tag:"LinkedIn · Connection Request",color:"#0A66C2",
   title:"LinkedIn Connection Request",
   note:"Under 300 characters. No pitch. No link. Just a relevant reason to connect. Anything longer gets ignored or declined.",
   body:`Hi [First Name], I help [niche] businesses in [City] with digital systems — websites, booking tools, and client management. Would love to connect.`},
  {id:"li2",tag:"LinkedIn · First DM After Connecting",color:"#8B2E1F",
   title:"LinkedIn First DM",
   note:"Only send after they accept. Lead with a specific observation, not a pitch. The Loom link does the selling — your job is to get them to click it.",
   body:`Thanks for connecting, [First Name].

I noticed [Business Name] has [specific observation — e.g. great reviews but no way to book online]. I went ahead and built a quick demo that might be worth 90 seconds of your time.

[Loom walkthrough link]

No pitch — just wanted to show you what is possible for a business like yours.

[Your name]`},
  {id:"disc",tag:"Discovery Call · SPIN Framework",color:"#8B2E1F",
   title:"Discovery Call Script",
   note:"Your job on a discovery call is to listen, not pitch. Each question surfaces information that closes the deal — but only if you stay completely silent after asking it.",
   body:`BEFORE THE CALL (5 minutes):
Review their Notion entry — Gap, Leak, Lift, their exact words from the reply.

SITUATION:
"How are you currently handling new client enquiries that come in online?"

PROBLEM:
"What is the biggest challenge with how that works right now?"
[Stay silent. Let them finish. Do not fill the pause.]

IMPLICATION:
"How much would it change things if you never missed an after-hours enquiry again?"

NEED-PAYOFF:
"If I could build a system that does that in 14 days, would that be worth exploring?"
[Wait for the yes. Then stop talking.]

CLOSE:
"I will have a proposal to you within 24 hours. Does [time] tomorrow work to review it together?"`},
  {id:"obj",tag:"Objection · AI Self-Build",color:"#B8860B",
   title:"Objection: Can I Not Build This Myself With AI?",
   note:"Say this calmly. It is educational, not defensive. Most clients drop the objection immediately once they understand what the last 30% actually involves.",
   body:`"Honestly? You could try — I use these same kinds of tools to move fast. But here is what typically happens: most owners get to about 70% done, then stall on the part that actually matters — connecting it to a booking system, setting up payment collection, making sure it works on every device, and keeping it updated as things change.

That last 30% is exactly what I specialise in.

Think of it like accounting software — anyone can open QuickBooks, but you would still hire an accountant to make sure the numbers are right. I am not selling you a tool. I am selling you a finished system that works, and someone who is accountable for keeping it that way."`},
];

const PITCH_ITEMS = [
  {icon:"💜",color:"#8B2E1F",name:"Lovable.dev Website or Landing Page",
   price:"$300-$700",timeline:"5-10 days",required:true,
   desc:"Your primary build tool. With Pro access you build a modern, fast, professional site in hours. The client sees a polished result in under a week. This is your anchor offer — the entry point for most clients.",
   tools:["Lovable.dev Pro (your $25/month investment)"],
   upsell:"Now let us add a CRM so no lead from this site ever goes cold."},
  {icon:"⚡",color:"#7A5A00",name:"Booking System and Scheduling Page",
   price:"$400-$900",timeline:"7-12 days",required:false,
   desc:"A Lovable app with an embedded Calendly or booking form. Ideal for clinics, coaches, salons, and gyms. Solves The Gap for nearly every service-based business you will target.",
   tools:["Lovable.dev Pro","Calendly (free tier)"],
   upsell:"The next step is an email reminder sequence so clients do not forget their appointments."},
  {icon:"📊",color:"#0D7A5F",name:"Notion CRM Setup for the Client",
   price:"$150-$300",timeline:"2-3 days",required:false,
   desc:"Set up a Notion database for their business: lead tracking, client pipeline, task management. Completely free for the client on Notion's free tier. You charge for the setup, training, and documentation.",
   tools:["Notion (free for the client)"],
   upsell:"I can now connect this to an email tool so your leads get followed up automatically."},
  {icon:"📧",color:"#8B2E1F",name:"Email Marketing Setup with Mailchimp",
   price:"$200-$450",timeline:"3-5 days",required:false,
   desc:"Set up a Mailchimp account, build 3 automated sequences (welcome, nurture, rebooking), and configure the first campaign. Free for the client up to 500 contacts. You charge for strategy, setup, and copy.",
   tools:["Mailchimp (free up to 500 contacts)"],
   upsell:"Want me to manage a monthly campaign for you on retainer?"},
  {icon:"🌟",color:"#B8860B",name:"Google Business Profile Optimisation",
   price:"$100-$200",timeline:"1-2 days",required:false,
   desc:"Completely free to execute — you charge for your expertise and time. Optimise their listing: update photos, write a keyword-rich description, set up Q&A, configure messaging, and show them how to request reviews consistently.",
   tools:["Google Business Profile (free)"],
   upsell:"Now let us build you a proper website that matches this polished listing."},
  {icon:"🚀",color:"#B8860B",name:"GoHighLevel Funnel — Trial Strategy",
   price:"$400-$800",timeline:"7-14 days",required:false,
   desc:"Use GoHighLevel's 14-day free trial to build a complete sales funnel: landing page, email sequences, SMS follow-up, and CRM pipeline. Deliver the working system within the trial window. Charge for setup and strategy. The client subscribes to GHL directly at $97/month. You keep the setup fee.",
   tools:["GoHighLevel 14-day free trial"],
   upsell:"I can stay on as a monthly retainer to manage and optimise the funnel for you."},
];

const FAQS = [
  {q:"I genuinely have no money right now. Can I start with zero spend?",
   a:"Yes — for the first 7 days, everything is free. The one non-negotiable investment is Lovable.dev Pro at approximately $25 per month. Here is the math: your first deal, even at the lowest Starter price of $300, funds 12 months of Lovable Pro. The question is not whether $25 is affordable right now. It is whether one closed deal in 45 days is achievable following this playbook consistently. Based on this plan done properly, it is."},
  {q:"Why Lovable.dev specifically? Can I use Bubble.io or Webflow instead?",
   a:"Lovable builds faster and looks more modern by default for standard builds. Bubble.io is better for complex web apps with databases and user authentication — use it when the project genuinely needs that level of logic. For a landing page, booking site, or client portal, Lovable wins on speed and visual quality. Both can be in your stack — there is no rule that says pick only one."},
  {q:"What if a client asks for something I cannot yet build?",
   a:"Scope what you can deliver confidently. If the project requires a full database, user accounts, or complex backend logic — that is a Bubble.io project. Know the boundary between what Lovable handles and what needs Bubble. Be honest with clients about what each tool produces. Never promise what you cannot deliver. Never turn down a project — scope it to your current capability, charge accordingly, and learn the rest during the build."},
  {q:"How many emails should I send per day without automation?",
   a:"Start with 5 deeply personalised emails per day. Each email should take 10-15 minutes to personalise properly — that is about 75 minutes of quality outreach daily. Volume is not your advantage at this stage. Quality is. A deeply researched email to 5 HOT leads consistently outperforms 100 generic emails every single time. Scale volume only when your quality standard is locked in."},
  {q:"What if I get no replies after sending all 3 emails to a lead?",
   a:"Check three things in order. First: was the lead truly HOT (score 7+)? If you contacted Warm or Cold leads in your first batch, low reply rates are expected. Second: did your subject lines sound like marketing emails? Rewrite them to sound like messages from a real person. Third: was each email specifically personalised with something from your research? If all three were done correctly and still no reply — test a different niche before changing anything about your offer."},
  {q:"Should I mention I am based in Nigeria when reaching out to international clients?",
   a:"You are not required to volunteer your location in a cold email. Position yourself as a Digital Systems Engineer serving businesses globally — which is true. Your Lovable demos, your professional Gmail, your LinkedIn presence, and your portfolio site are what establish credibility. If a client asks directly, answer honestly and immediately follow with your portfolio link and demo. Results speak louder than geography every time."},
  {q:"What if a client wants a refund after the project has started?",
   a:"This is exactly why the 50% upfront rule exists. The deposit covers your time on the Blueprint and early Build phases. Your 1-page agreement should state that the deposit is non-refundable if work has commenced. Always get written approval of the Blueprint document before building anything. This single step eliminates the most common reason clients try to cancel — the discovery that the final product does not match their unspoken expectation."},
  {q:"When should I start investing in automation tools like Make.com or Apollo.io?",
   a:"When your manual process is maxed out — meaning you are sending 25-30 personalised emails per week, you have closed at least 3 deals, and your pipeline is consistent enough that automation would save meaningful time without sacrificing quality. Before that point, automation adds cost and complexity without adding proportional results. Manual first. Automate what is proven. This playbook is designed to get you to that threshold."},
];

/* ── 3 CORE SERVICES ────────────────────────────────────── */
const SERVICES_3 = [
  {
    id:"reviews", icon:"⭐", color:"#7A5A00",
    name:"Google Review Automation",
    price:"$297–$497/month",
    signal:"Under 50 reviews, last review over 3 months ago, or rating under 4.5",
    when:"Lead with this when: low review count vs competitors, stale listing, or they say 'our phone isn't ringing like it used to'",
    pitch:`"Right now, AI tools like ChatGPT, Google AI Mode, and Perplexity only recommend businesses with fresh, consistent reviews. Yours stopped getting reviews [X months] ago — which means AI is actively skipping you every time someone searches for a [niche] in [city]. I can set up a fully automated system that requests a review from every customer after every job. No manual effort. Just a steady drip of fresh reviews every week. That is what gets AI to recommend you. Investment is $297 a month."`,
    ghl:"GHL Sub-account → Reputation → Settings → Request → Configure Google review link → Automations → New Workflow → Trigger: Appointment completed / tag added → Wait 2 hours → SMS Message 1 (check-in) → Wait 2 hours → SMS Message 2 (review link). Publish workflow.",
    tool:"GoHighLevel (30-day free trial at gohighlevel.com). This is a GHL Reputation workflow. Zero extra software needed.",
    lovable:"Build client a branded 'Review Dashboard' page in Lovable showing their review growth over time — screenshot it monthly for their Loom report. Charge $97/month extra for this reporting add-on.",
    upsell:"After 60-90 days when they see reviews growing: 'Your listing is looking great — but I noticed your contact form has no automation behind it. People are filling it in and waiting days for a reply. Want to fix that too?'",
  },
  {
    id:"speed", icon:"⚡", color:"#0D7A5F",
    name:"Speed to Lead Automation",
    price:"$197–$397/month",
    signal:"Contact form on website, no CRM, response time over 1 hour, or they mention 'we get enquiries but they don't convert'",
    when:"Lead with this when: they have a website with a contact form but no automation, or they mention losing leads before they can call back",
    pitch:`"Here is a fact that shocks most business owners: if someone fills in your contact form and you don't call them within 60 seconds, there is a 70% chance they've already booked your competitor. Your competitors who have speed-to-lead automation are literally stealing your leads before you even see the notification. I can set up a system that triggers an instant call to your phone the moment a form is submitted — so you reach that lead first, every time. Takes about a day to set up. Runs automatically from there."`,
    ghl:"GHL → Automations → New Workflow → Trigger: Form submitted → Action 1: Internal notification (push/email to owner) → Action 2: Outbound call to owner's number → Action 3: If not answered within 5 min → SMS to lead: 'Hi [name], we just received your enquiry — calling you now. If we missed you, here is our direct line: [number]'",
    tool:"GoHighLevel handles the entire flow. The client needs a GHL sub-account with their phone number connected. No extra software required.",
    lovable:"Build client a 'Lead Tracker' page in Lovable that pulls GHL webhook data and shows each enquiry, response time, and outcome. Upsell this as a $97/month reporting dashboard.",
    upsell:"After showing improved lead response rates: 'Your enquiries are converting better now. The last gap is your phone — you still miss [X] calls a month after hours. Want me to put an AI receptionist on it?'",
  },
  {
    id:"calls", icon:"📞", color:"#B8860B",
    name:"AI Voice Receptionist",
    price:"$297–$497/month (+ $0.14/min Bland AI usage)",
    signal:"They mention missed calls, work-from-vehicle (plumbers, HVAC), after-hours call volume, or solo practice",
    when:"Lead with this when: they are visibly missing calls, work in the field away from a phone, or they mention 'I always miss calls when I'm with a customer'",
    pitch:`"Did you know 62% of calls to small businesses go unanswered — and 85% of people who reach voicemail hang up and call a competitor? Those are your highest-intent leads. They had their phone in their hand, they searched for you, they chose to call — and you missed it. I can set up an AI receptionist that answers every call in under one second, sounds completely human, handles common questions, quotes your prices, and books appointments directly into your calendar. It runs 24 hours a day for less than the cost of a part-time employee."`,
    ghl:"Step 1: GHL → Settings → Phone → Missed Call Text-Back (instant, free, basic). Step 2 (full AI): Create Bland AI account at blandai.com → Create agent → Upload business PDF knowledge base → Connect Calendly API → Purchase phone number ($15/month) → Configure pathways (greeting → FAQ → booking) → Test with Norm → Publish. Step 3: Embed Bland AI widget in Lovable-built website.",
    tool:"Start with GHL missed-call text-back (free, basic). Upgrade to Bland AI ($0.14/min) for full AI receptionist. Phone number costs $15/month from Bland or GHL.",
    lovable:"Build client a 'Call Analytics Dashboard' in Lovable showing call volume, answered vs missed, booking conversion from calls. This becomes a $97-$197/month reporting retainer.",
    upsell:"After receptionist is live: 'Your calls are being answered and bookings are up. Now let's make sure your website matches the professional image you are projecting — it still looks like 2018 and it's losing you credibility.' → Website project + monthly retainer.",
  },
];

/* ── UPSELL LADDER ──────────────────────────────────────── */
const UPSELL_STEPS = [
  {
    phase:"Month 1–2", icon:"⭐", color:"#7A5A00",
    service:"Reviews Service ($297/month)",
    action:"Run the 5-minute SMB audit. Show them the review gap vs competitors. Show the ChatGPT AI search test. Set up 2-message GHL review sequence.",
    trigger:"The moment their reviews start coming in (usually within first week), their trust in you is established. This is your window.",
    intro:`"Your reviews are picking up — I can see [X] new ones came in this month. While I was in your GHL account I noticed something else you're probably losing leads on. Worth a quick look?"`,
    revenue:"$297/month",
  },
  {
    phase:"Month 3–4", icon:"⚡", color:"#0D7A5F",
    service:"+ Speed to Lead Automation (+$197–$297/month)",
    action:"Show them their contact form submissions from the past 30 days. Ask how many they called back within the hour. The silence is your pitch.",
    trigger:"Any mention of 'leads not converting' or 'I need to follow up better' is your green light.",
    intro:`"I pulled your form submissions from last month — you had [X] enquiries. Based on your response pattern, you're likely keeping about [X]% of those. Want me to make it automatic so you reach every lead in under 60 seconds?"`,
    revenue:"$494–$594/month combined",
  },
  {
    phase:"Month 5–6", icon:"📞", color:"#B8860B",
    service:"+ AI Voice Receptionist (+$297–$397/month)",
    action:"Pull their GHL call log. Show missed calls. Run the Bland AI demo live on the call. Let them hear 'Karen' book a fake appointment.",
    trigger:"Ask: 'How many calls do you think you miss per week when you're with a client?' — their answer is the pitch.",
    intro:`"Your reviews are growing and your leads are converting faster. The last gap is your phone. You're still missing [X] calls a week. Want to hear what it sounds like when an AI answers for you? Give me 90 seconds."`,
    revenue:"$791–$991/month combined",
  },
  {
    phase:"Month 7+", icon:"🌐", color:"#8B2E1F",
    service:"+ Website or App Rebuild (+$300–$800 one-off + $97–$197/month retainer)",
    action:"Screenshot their current website next to their growing review count. The mismatch is obvious and they feel it too.",
    trigger:"'Our website is pretty old' — said unprompted at any point. This is a Lovable project. Blueprint → Build → Bulletproof in 2 weeks.",
    intro:`"Your reputation online has improved massively — fresh reviews, fast response, calls answered. But your website still looks like it's from 2015. It's undermining everything else you've built. I can rebuild it in Lovable in 2 weeks. Starter is $300–$500 one-off, and I'll maintain it for $97/month."`,
    revenue:"$888–$1,188/month ongoing + one-off project fee",
  },
];

/* ── GHL MASTERY ────────────────────────────────────────── */
const GHL_STEPS = [
  {
    n:"01", icon:"🎯", color:"#7A5A00",
    title:"What GoHighLevel Is and Why You Need It",
    body:"GoHighLevel (GHL) is the all-in-one platform used by over 60,000 agencies worldwide to manage clients' CRM, automation, phone, SMS, email, reputation, and reporting — all from one dashboard. You run an agency-level account and create sub-accounts for each client. The client never needs to see the back-end unless you want them to. Start your 30-day free trial at gohighlevel.com. No credit card required for the trial. After the trial, the Starter plan is $97/month — this is covered by your first review service client.",
  },
  {
    n:"02", icon:"🏗️", color:"#0D7A5F",
    title:"Set Up Your Agency Account and First Sub-Account",
    body:"When you log in to GHL: (1) Complete your agency profile. (2) Click 'Sub-Accounts' → 'Create Sub-Account'. (3) Enter the client's business name, address, and phone number. (4) This sub-account is their entire digital infrastructure — CRM, automations, phone, reputation. (5) Connect their Google Business Profile in the sub-account under Reputation → Settings. This is what enables review request tracking. Do this setup on a screen-share or record a Loom to show the client what you have built.",
  },
  {
    n:"03", icon:"⭐", color:"#B8860B",
    title:"Build the Review Automation (Service #1)",
    body:"Inside the client's sub-account: (1) Reputation → Settings → Request → paste their Google Business Profile review link. (2) Automations → New Workflow → Name it 'Review Request Sequence'. (3) Trigger: contact tag added ('job-complete') or appointment status changed to 'completed'. (4) Action: Wait 2 hours → Send SMS: 'Hi [contact.first_name], thanks for choosing [business name] today! If you have 30 seconds, a quick Google review would mean the world to us: [review link]'. (5) Wait 2 days → If no review → Send SMS 2: 'Hi [name], [owner name] here from [business]. Just checking in — did everything go well? If so, a quick Google review really helps: [link]'. (6) Publish. Test with your own number.",
  },
  {
    n:"04", icon:"⚡", color:"#8B2E1F",
    title:"Build the Speed to Lead Workflow (Service #2)",
    body:"Inside the client's sub-account: (1) Automations → New Workflow → Name it 'Speed to Lead'. (2) Trigger: Form submitted (select their Lovable/website form — you will need to embed the GHL form or use a webhook from the Lovable form). (3) Action 1: Internal notification → push notification to owner + email alert. (4) Action 2: GHL outbound call → calls owner's mobile number immediately. (5) If no answer (5 min): Action 3 → SMS to lead: 'Hi [name], we just received your enquiry — someone from our team will call you in the next few minutes. In the meantime: [Calendly link]'. (6) CRM: Create/update contact automatically. This workflow takes 20 minutes to build. Charge $197–$397/month for it running.",
  },
  {
    n:"05", icon:"📞", color:"#8B2E1F",
    title:"Set Up Missed Call Text-Back (Free Gateway to AI Receptionist)",
    body:"The quickest win in GHL: Settings → Phone → Missed Call Text-Back → Toggle ON → Customise message: 'Hi, we just missed your call at [business name]. We will call you right back — or book directly here: [Calendly link]'. This goes out automatically every time a call is missed. Takes 3 minutes to set up. Pitch this as a free included feature on every service package. Then upsell: 'This sends a text when you miss a call. For $297 more per month I can have an AI that answers every call so you never miss one.'",
  },
  {
    n:"06", icon:"🤖", color:"#0D7A5F",
    title:"Add Bland AI for Full AI Receptionist (Service #3)",
    body:"(1) Create Bland AI account at blandai.com. (2) Create a PDF knowledge base with: business name, address, hours, services, prices, FAQs, booking instructions. (3) Upload to Bland AI Knowledge Base. (4) Create Agent: Name (e.g. 'Karen'), voice (Karen sounds most human), enable interruption. (5) Connect Calendly or GHL calendar via API key. (6) Build pathways: Greeting → FAQ questions → Booking flow → Wrap-up. (7) Use Norm (Bland's AI setup assistant) — tell it exactly what you need in plain language. It builds the entire agent. (8) Test thoroughly. (9) Purchase a phone number ($15/month). (10) Port the number or redirect client's overflow calls to this number.",
  },
  {
    n:"07", icon:"📊", color:"#B8860B",
    title:"Monthly Client Reporting (Retainer Justification)",
    body:"Every month, send each client a Loom (2-3 minutes, screen recorded) showing: (1) Review count this month vs last month. (2) Star rating trend. (3) GHL reputation dashboard screenshot. (4) Speed to Lead: enquiries received, response time achieved, leads converted. (5) Call stats: answered vs missed, bookings created. (6) One insight: 'Based on this data, here is what I recommend next month.' This Loom is what keeps them paying month after month. It shows visible proof the system is working. Record it in 5 minutes. It is the most valuable 5 minutes you spend on that client.",
  },
  {
    n:"08", icon:"📚", color:"#7A5A00",
    title:"Learning Resources — How to Master GHL for Free",
    body:"(1) YouTube: search 'GoHighLevel tutorial 2026' — hundreds of free step-by-step videos. Channels: Robb Bailey, Nate Freedman, and the official GHL YouTube channel. (2) GHL Community: app.gohighlevel.com/communities — active forum with answers to every question. (3) GHL Support: 24/7 live chat inside the platform. Use it freely. (4) Bland AI: docs.bland.ai — full documentation plus Norm (their AI setup assistant). (5) n8n and Make.com: use these when you need a webhook bridge between Lovable forms and GHL. Both have free tiers and excellent YouTube tutorials. (6) Build everything on your own GHL sub-account first using a fake business — never experiment on a client's live account.",
  },
];

/* ─────────────────────────────────────────────────────── */
function Chevron({open}) {
  return <span style={{color:"#6B5D3F",fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function Check({checked,color}) {
  return (
    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?color:"#6B5D3F"}`,
      background:checked?color:"transparent",display:"flex",alignItems:"center",
      justifyContent:"center",flexShrink:0,marginTop:2,fontSize:11,
      color:"#F5EFDF",fontWeight:800,transition:"all .15s"}}>
      {checked?"✓":""}
    </div>
  );
}

function ProgressBar({value,color,height=6}) {
  return (
    <div style={{background:"#E8DCC0",borderRadius:999,height,overflow:"hidden"}}>
      <div style={{width:`${value}%`,height:"100%",background:color,
        borderRadius:999,transition:"width .3s"}}/>
    </div>
  );
}

function SLabel({text,color}) {
  return (
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

function PlanPage() {
  const [tab,setTab]              = useState("plan");
  const [openWeek,setOpenWeek]    = useState(0);
  const [openDay,setOpenDay]      = useState(null);
  const [openScript,setOpenScript]= useState(null);
  const [openFaq,setOpenFaq]      = useState(null);
  const [openNiche,setOpenNiche]  = useState(null);
  const [openStep,setOpenStep]    = useState(null);
  const [openPitch,setOpenPitch]  = useState(null);
  const [openSvc,setOpenSvc]      = useState(null);
  const [openUps,setOpenUps]      = useState(null);
  const [openGHL,setOpenGHL]      = useState(null);
  const [done,setDone,syncMeta]   = useSyncedTaskMap("plan");

  const allTasks = useMemo(()=>WEEKS.flatMap(w=>w.days.flatMap(d=>d.tasks)),[]);
  const totalTasks     = allTasks.length;
  const completedTasks = allTasks.filter(t=>done[t.id]).length;
  const progress = totalTasks>0?Math.round((completedTasks/totalTasks)*100):0;
  const progressColor = progress>=70?"#0D7A5F":progress>=35?"#B8860B":"#7A5A00";
  const toggle = id=>setDone(p=>({...p,[id]:!p[id]}));
  const weekPct = w=>{
    const t=w.days.flatMap(d=>d.tasks);
    return t.length>0?Math.round((t.filter(x=>done[x.id]).length/t.length)*100):0;
  };

  const TABS=[
    {id:"plan",     label:"📅 45-Day Plan"},
    {id:"notion",   label:"🗂️ Notion CRM"},
    {id:"research", label:"🔍 Lead Research"},
    {id:"problems", label:"⚡ 3-Problem Method"},
    {id:"scripts",  label:"📝 Scripts"},
    {id:"pitch",    label:"📈 Secondary Upsell Ladder"},
    {id:"match",    label:"💰 What to Pitch"},
    {id:"upsell",   label:"📈 Upsell Ladder"},
    {id:"ghl",      label:"🔧 GHL Mastery"},
    {id:"faq",      label:"❓ FAQ"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:"#F5EFDF",minHeight:"100vh",color:"#1A1410"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#FBF6E9 0%,#FFFFFF 60%,#F5EFDF 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #E8DCC0"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:"#0D7A5F",
            textTransform:"uppercase",marginBottom:7,
            display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#0D7A5F",
              boxShadow:"0 0 6px #0D7A5F",display:"inline-block"}}/>
            45-Day Implementation Playbook — Zero Budget Edition
          </div>
          <h1 style={{margin:"0 0 7px",
            fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,lineHeight:1.15,
            color:"#1A1410"}}>
            From Zero to First Client — <span style={{color:"#7A5A00"}}>Manually</span>
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#6B5D3F",
            maxWidth:580,lineHeight:1.65}}>
            No automations. No paid lead tools. No batch sends. Every lead researched by hand,
            scored on a rubric, enriched with 3 connected problems, and contacted personally from Gmail.
            This is how you build a freelance business when every cent counts.
          </p>
          <div style={{background:"#FFFFFF",borderRadius:10,padding:"11px 14px",
            border:"1px solid #E8DCC0"}}>
            <div style={{display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:7}}>
              <span style={{fontSize:12,fontWeight:600,color:"#6B5D3F"}}>Overall Progress</span>
              <span style={{fontSize:13,fontWeight:800,color:progressColor}}>
                {completedTasks} / {totalTasks} tasks · {progress}%
              </span>
            </div>
            <ProgressBar value={progress} color={progressColor} height={8}/>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#FFFFFF",borderBottom:"1px solid #E8DCC0",
        position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:880,margin:"0 auto",
          display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid #7A5A00":"2px solid transparent",
              color:tab===t.id?"#7A5A00":"#6B5D3F",
              padding:"12px 13px",fontSize:12.5,
              fontWeight:tab===t.id?600:500,
              cursor:"pointer",whiteSpace:"nowrap",
              transition:"all .15s",fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:880,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* 45-DAY PLAN */}
        {tab==="plan"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              45-Day Action Plan
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 14px"}}>
              Tap a week → tap a day → tick tasks as you complete them.
              Every task is manual. Zero automations required.
            </p>
            {WEEKS.map((w,wi)=>{
              const wp=weekPct(w); const wOpen=openWeek===wi;
              return (
                <div key={w.week} style={{marginBottom:9}}>
                  <div onClick={()=>setOpenWeek(wOpen?null:wi)}
                    style={{background:wOpen?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${wOpen?w.color+"55":"#E8DCC0"}`,
                      borderRadius:wOpen?"11px 11px 0 0":11,cursor:"pointer",
                      padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:37,height:37,borderRadius:9,
                      background:w.color+"18",border:`1px solid ${w.color}35`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:18,flexShrink:0}}>{w.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:7,alignItems:"center",
                        flexWrap:"wrap",marginBottom:4}}>
                        <span style={{fontWeight:700,fontSize:14,color:"#1A1410"}}>
                          Week {w.week}: {w.title}
                        </span>
                        <span style={{fontSize:10,color:"#6B5D3F",background:"#E8DCC0",
                          borderRadius:4,padding:"1px 6px"}}>{w.range}</span>
                        {wp>0&&<span style={{fontSize:10.5,fontWeight:700,color:w.color}}>
                          {wp}%
                        </span>}
                      </div>
                      <p style={{fontSize:11.5,color:"#6B5D3F",margin:"0 0 6px",lineHeight:1.4}}>
                        {w.goal}
                      </p>
                      <ProgressBar value={wp} color={w.color} height={3}/>
                    </div>
                    <Chevron open={wOpen}/>
                  </div>
                  {wOpen&&(
                    <div style={{background:"#F5EFDF",
                      border:`1px solid ${w.color}25`,borderTop:"none",
                      borderRadius:"0 0 11px 11px",padding:"8px 11px 13px"}}>
                      {w.days.map(d=>{
                        const dk=`${wi}-${d.day}`; const dOpen=openDay===dk;
                        const dDone=d.tasks.filter(t=>done[t.id]).length;
                        const dComplete=dDone===d.tasks.length&&d.tasks.length>0;
                        return (
                          <div key={d.day} style={{marginTop:7}}>
                            <div onClick={()=>setOpenDay(dOpen?null:dk)}
                              style={{background:dOpen?"#FFFFFF":"#FFFFFF",
                                border:`1px solid ${dComplete?w.color+"60":"#E8DCC0"}`,
                                borderRadius:dOpen?"9px 9px 0 0":9,
                                cursor:"pointer",padding:"10px 12px",
                                display:"flex",alignItems:"center",gap:9}}>
                              <span style={{fontSize:16,flexShrink:0}}>
                                {dComplete?"✅":d.icon}
                              </span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",gap:6,
                                  alignItems:"center",flexWrap:"wrap"}}>
                                  <span style={{fontSize:10,fontWeight:700,
                                    color:w.color,background:w.color+"18",
                                    borderRadius:4,padding:"1px 6px"}}>
                                    Day {d.day}
                                  </span>
                                  <span style={{fontSize:13,fontWeight:600,color:"#1A1410"}}>
                                    {d.focus}
                                  </span>
                                </div>
                                <div style={{fontSize:11,color:"#6B5D3F",marginTop:2}}>
                                  {dDone}/{d.tasks.length} tasks
                                </div>
                              </div>
                              <Chevron open={dOpen}/>
                            </div>
                            {dOpen&&(
                              <div style={{background:"#F5EFDF",
                                border:"1px solid #E8DCC0",borderTop:"none",
                                borderRadius:"0 0 9px 9px",padding:"10px 12px 12px"}}>
                                {d.note&&(
                                  <div style={{background:w.color+"10",
                                    border:`1px solid ${w.color}22`,
                                    borderRadius:7,padding:"7px 10px",
                                    marginBottom:10,fontSize:12,
                                    color:w.color+"CC",lineHeight:1.5}}>
                                    💡 {d.note}
                                  </div>
                                )}
                                {d.tasks.map(t=>(
                                  <div key={t.id} onClick={()=>toggle(t.id)}
                                    style={{display:"flex",gap:9,alignItems:"flex-start",
                                      padding:"8px 0",
                                      borderBottom:"1px solid #FBF6E9",cursor:"pointer"}}>
                                    <Check checked={!!done[t.id]} color={w.color}/>
                                    <span style={{fontSize:13,lineHeight:1.55,
                                      color:done[t.id]?"#6B5D3F":"#6B5D3F",
                                      textDecoration:done[t.id]?"line-through":"none",
                                      transition:"all .15s"}}>{t.text}</span>
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              Notion CRM — Full Setup Guide
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              Notion on the free plan is your command centre.
              Google Sheets is just the raw scouting pad. Every enriched lead lives in Notion.
            </p>
            <div style={{background:"#FFFFFF",border:"1px solid #6366F125",
              borderRadius:11,padding:"14px 16px",marginBottom:18}}>
              <SLabel text="The Lead Journey" color="#7A5A00"/>
              <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6}}>
                {["📒 Notebook","→","📊 Google Sheets","→","🗂️ Notion CRM","→","📧 Gmail Outreach"].map((s,i)=>(
                  s==="→"
                    ?<span key={i} style={{color:"#6B5D3F",fontSize:14}}>→</span>
                    :<span key={i} style={{background:"#E8DCC0",border:"1px solid #E8DCC0",
                      borderRadius:6,padding:"4px 10px",fontSize:12,
                      color:"#7A5A00",fontWeight:500}}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <SLabel text="All 23 Database Properties" color="#0D7A5F"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:22}}>
              {NOTION_COLS.map((c,i)=>(
                <div key={i} style={{background:"#FFFFFF",border:"1px solid #E8DCC0",
                  borderRadius:9,padding:"10px 13px",
                  display:"flex",gap:11,alignItems:"flex-start"}}>
                  <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",
                      flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13.5,fontWeight:700,color:"#1A1410"}}>
                        {c.name}
                      </span>
                      <span style={{fontSize:10.5,background:"#E8DCC0",
                        border:"1px solid #E8DCC0",borderRadius:5,
                        padding:"1px 7px",color:"#7A5A00",fontWeight:600}}>
                        {c.type}
                      </span>
                    </div>
                    <p style={{fontSize:12,color:"#6B5D3F",margin:0,lineHeight:1.5}}>
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <SLabel text="The 6 Views to Create" color="#B8860B"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {NOTION_VIEWS.map((v,i)=>(
                <div key={i} style={{background:"#FFFFFF",border:"1px solid #E8DCC0",
                  borderRadius:9,padding:"11px 14px"}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:"#1A1410",marginBottom:4}}>
                    {v.name}
                  </div>
                  <p style={{fontSize:12.5,color:"#6B5D3F",margin:0,lineHeight:1.5}}>
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
            <div style={{background:"#FFFFFF",border:"1px solid #EC489925",
              borderRadius:10,padding:"13px 15px"}}>
              <SLabel text="The Three Problem Columns — Non-Negotiable" color="#8B2E1F"/>
              <p style={{fontSize:13,color:"#6B5D3F",margin:"0 0 12px",lineHeight:1.65}}>
                The Gap, The Leak, and The Lift columns must be filled in before a single email is
                written for that lead. They are the raw material for all 3 emails. See the
                3-Problem Method tab for how to identify them.
              </p>
              {[["⚠️ The Gap","The visible, fixable problem in their digital presence — something you can see from their Google listing, website, or social media."],
                ["💧 The Leak","What The Gap is silently costing them every week — lost leads, missed bookings, or revenue going to a competitor."],
                ["🚀 The Lift","The upside they are missing — the clients they could be serving and the revenue they could be collecting if the system existed."]
              ].map(([t,d],i)=>(
                <div key={i} style={{background:"#FFFFFF",borderRadius:8,
                  padding:"10px 12px",marginBottom:8,border:"1px solid #E8DCC0"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#1A1410",marginBottom:4}}>{t}</div>
                  <p style={{fontSize:12,color:"#6B5D3F",margin:0,lineHeight:1.55}}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEAD RESEARCH */}
        {tab==="research"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              Manual Lead Research — Step by Step
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              Every lead completes all 8 steps before you write a single word of outreach.
              Tap each step to expand the full instructions.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {RESEARCH_STEPS.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{display:"flex",flexDirection:"column",
                    alignItems:"center",flexShrink:0,paddingTop:2}}>
                    <div style={{width:36,height:36,borderRadius:9,
                      background:s.color+"18",border:`1px solid ${s.color}40`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:17}}>{s.icon}</div>
                    {i<RESEARCH_STEPS.length-1&&(
                      <div style={{width:2,height:20,background:"#E8DCC0",
                        marginTop:4,marginBottom:4}}/>
                    )}
                  </div>
                  <div onClick={()=>setOpenStep(openStep===i?null:i)}
                    style={{background:openStep===i?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${openStep===i?s.color:"#E8DCC0"}`,
                      borderRadius:10,padding:"11px 13px",flex:1,
                      marginBottom:10,cursor:"pointer",transition:"border-color .2s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",
                      alignItems:"center",gap:8}}>
                      <div>
                        <span style={{fontSize:9,fontWeight:700,color:s.color}}>{s.n}</span>
                        {" "}<span style={{fontWeight:700,fontSize:13.5,color:"#1A1410"}}>
                          {s.title}
                        </span>
                      </div>
                      <Chevron open={openStep===i}/>
                    </div>
                    {openStep===i&&(
                      <p style={{fontSize:13,color:"#6B5D3F",margin:"10px 0 0",
                        lineHeight:1.65,borderTop:"1px solid #E8DCC0",paddingTop:10}}>
                        {s.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#FFFFFF",border:"1px solid #F59E0B25",
              borderRadius:10,padding:"13px 15px",marginTop:4}}>
              <SLabel text="Time Per Lead Benchmark" color="#B8860B"/>
              {[["Week 2 (first time)","25-35 min per HOT lead"],
                ["Week 4 (with practice)","15-20 min per HOT lead"],
                ["Week 6 (after 30+ leads)","10-14 min per HOT lead"]
              ].map(([w,t],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #E8DCC0"}}>
                  <span style={{fontSize:13,color:"#6B5D3F"}}>{w}</span>
                  <span style={{fontSize:13,fontWeight:600,color:"#B8860B"}}>{t}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#6B5D3F",margin:"10px 0 0",lineHeight:1.6}}>
                The first 5 leads feel slow. By lead 20 the process becomes near-automatic.
                Research quality stays high — only the speed improves.
              </p>
            </div>
          </div>
        )}

        {/* 3-PROBLEM METHOD */}
        {tab==="problems"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              The 3-Problem Method
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              Three connected problems. One email narrative. One solution.
              This is what makes your outreach feel personal instead of generic.
            </p>
            <div style={{background:"#FFFFFF",border:"1px solid #6366F130",
              borderRadius:12,padding:"16px",marginBottom:18}}>
              <SLabel text="The Framework" color="#7A5A00"/>
              {[["⚠️","The Gap","#7A5A00","The visible, fixable problem you found during research. Missing or broken in their digital presence.","→ Email 1 — PAS around The Gap"],
                ["💧","The Leak","#0D7A5F","The hidden cost of The Gap. What it silently costs them every week in lost clients, missed bookings, or wasted spend.","→ Email 2 — Reveals the hidden cost"],
                ["🚀","The Lift","#B8860B","The revenue they are not capturing. What they could be earning if The Gap were fixed and The Leak plugged.","→ Email 3 — Your demo solves all three"]
              ].map(([ic,nm,col,desc,ref],i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:36,height:36,borderRadius:9,background:col+"18",
                      border:`1px solid ${col}40`,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:17}}>{ic}</div>
                    {i<2&&<div style={{width:2,height:16,background:"#E8DCC0",
                      marginTop:3,marginBottom:3}}/>}
                  </div>
                  <div style={{background:"#FFFFFF",border:"1px solid #E8DCC0",
                    borderRadius:9,padding:"10px 13px",flex:1,marginBottom:8}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:14,color:"#1A1410"}}>{nm}</span>
                      <span style={{fontSize:10.5,color:col,background:col+"18",
                        borderRadius:5,padding:"1px 7px",fontWeight:600}}>{ref}</span>
                    </div>
                    <p style={{fontSize:12.5,color:"#6B5D3F",margin:0,lineHeight:1.55}}>{desc}</p>
                  </div>
                </div>
              ))}
              <div style={{background:"#E8DCC0",borderRadius:8,padding:"11px 13px",
                border:"1px solid #E8DCC0",marginTop:4}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8B2E1F",marginBottom:5}}>
                  The Critical Rule
                </div>
                <p style={{fontSize:12.5,color:"#6B5D3F",margin:0,lineHeight:1.6}}>
                  The three problems must form a causal chain — The Gap causes The Leak, The Leak
                  prevents The Lift. If fixing The Gap would not logically address The Leak and unlock
                  The Lift, they are not connected enough. Confusion leads to indecision.
                  Indecision guarantees no sale.
                </p>
              </div>
            </div>
            <SLabel text="5 Niche Examples — Tap to Expand" color="#0D7A5F"/>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:8}}>
              {NICHES_3P.map((n,i)=>{
                const isOpen=openNiche===i;
                return (
                  <div key={i} onClick={()=>setOpenNiche(isOpen?null:i)}
                    style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${isOpen?"#0D7A5F":"#E8DCC0"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>
                      <span style={{flex:1,fontWeight:600,fontSize:14,color:"#1A1410"}}>
                        {n.niche}
                      </span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 16px",borderTop:"1px solid #E8DCC0"}}>
                        {[["⚠️ The Gap","#7A5A00",n.gap],
                          ["💧 The Leak","#0D7A5F",n.leak],
                          ["🚀 The Lift","#B8860B",n.lift],
                          ["🔗 The Chain","#8B2E1F",n.chain],
                          ["💡 Your Solution","#8B2E1F",n.tip]
                        ].map(([lbl,col,val],j)=>(
                          <div key={j} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,
                              textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>
                              {lbl}
                            </div>
                            <p style={{fontSize:13,color:"#6B5D3F",margin:0,
                              lineHeight:1.6,borderLeft:`2px solid ${col}40`,paddingLeft:10}}>
                              {val}
                            </p>
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              Scripts and Templates
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 14px",lineHeight:1.6}}>
              Every script is a starting point. Personalise the bracketed sections with what you
              found during enrichment — that is what makes it land.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SCRIPTS.map((s,i)=>{
                const isOpen=openScript===i;
                return (
                  <div key={i} onClick={()=>setOpenScript(isOpen?null:i)}
                    style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${isOpen?s.color:"#E8DCC0"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",
                          flexWrap:"wrap",marginBottom:2}}>
                          <span style={{fontWeight:700,fontSize:13.5,color:"#1A1410"}}>
                            {s.title}
                          </span>
                          <span style={{fontSize:10,color:s.color,background:s.color+"18",
                            borderRadius:4,padding:"1px 6px",fontWeight:600}}>{s.tag}</span>
                        </div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 14px",borderTop:"1px solid #E8DCC0"}}>
                        <pre style={{background:"#F5EFDF",borderRadius:8,padding:"12px 13px",
                          marginTop:12,fontFamily:"'Courier New',monospace",fontSize:12,
                          color:"#6B5D3F",lineHeight:1.85,
                          borderLeft:`2px solid ${s.color}40`,
                          whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                          {s.body}
                        </pre>
                        <div style={{marginTop:9,background:s.color+"10",
                          border:`1px solid ${s.color}25`,borderRadius:7,
                          padding:"7px 10px",fontSize:12,color:s.color,lineHeight:1.5}}>
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

        {/* WHAT TO PITCH */}
        {tab==="pitch"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              What to Pitch — Zero Budget Offer Stack
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              Six services you can deliver right now. One required investment.
              Everything else runs on free tiers.
            </p>
            <div style={{background:"linear-gradient(135deg,#FBF6E9,#E8DCC0)",
              border:"1px solid #8B5CF635",borderRadius:12,
              padding:"16px",marginBottom:18}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:24,flexShrink:0}}>💜</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#1A1410",marginBottom:4}}>
                    The One Non-Negotiable: Lovable.dev Pro (~$25/month)
                  </div>
                  <p style={{fontSize:13,color:"#6B5D3F",margin:"0 0 10px",lineHeight:1.65}}>
                    This is the single spend that makes the entire playbook possible. Your first
                    deal — even at the lowest Starter price of $300 — funds 12 months of Pro
                    access. Before the first deal closes, find a way to make this happen.
                  </p>
                  <div style={{fontSize:12,color:"#8B2E1F",fontWeight:600}}>
                    Why it is worth it: you build a professional, click-through demo in hours.
                    The demo is your pitch. No demo means no close.
                  </div>
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {PITCH_ITEMS.map((p,i)=>{
                const isOpen=openPitch===i;
                return (
                  <div key={i} onClick={()=>setOpenPitch(isOpen?null:i)}
                    style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${isOpen?p.color:"#E8DCC0"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",
                      alignItems:"center",gap:11}}>
                      <div style={{width:38,height:38,borderRadius:9,
                        background:p.color+"18",border:`1px solid ${p.color}35`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:18,flexShrink:0}}>{p.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",
                          flexWrap:"wrap",marginBottom:2}}>
                          <span style={{fontWeight:700,fontSize:14,color:"#1A1410"}}>
                            {p.name}
                          </span>
                          {p.required&&(
                            <span style={{fontSize:10,fontWeight:700,color:"#8B2E1F",
                              background:"#8B5CF618",borderRadius:4,padding:"1px 6px"}}>
                              REQUIRED TOOL
                            </span>
                          )}
                        </div>
                        <div style={{display:"flex",gap:10}}>
                          <span style={{fontSize:12,fontWeight:700,color:p.color}}>
                            {p.price}
                          </span>
                          <span style={{fontSize:12,color:"#6B5D3F"}}>{p.timeline}</span>
                        </div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #E8DCC0"}}>
                        <p style={{fontSize:13,color:"#6B5D3F",
                          margin:"12px 0 12px",lineHeight:1.65}}>{p.desc}</p>
                        <div style={{marginBottom:10}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#6B5D3F",
                            textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>
                            Tools Used
                          </div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {p.tools.map((t,j)=>(
                              <span key={j} style={{fontSize:12,background:"#E8DCC0",
                                border:"1px solid #E8DCC0",borderRadius:5,
                                padding:"3px 9px",color:"#6B5D3F"}}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{background:p.color+"10",
                          border:`1px solid ${p.color}25`,
                          borderRadius:7,padding:"8px 11px"}}>
                          <div style={{fontSize:10,fontWeight:700,color:p.color,
                            textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>
                            Upsell Trigger
                          </div>
                          <p style={{fontSize:12.5,color:"#1A1410",margin:0,
                            fontStyle:"italic",lineHeight:1.5}}>{p.upsell}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{background:"#FFFFFF",border:"1px solid #10B98125",
              borderRadius:10,padding:"14px 15px",marginTop:16}}>
              <SLabel text="The Demo-First Close Strategy" color="#0D7A5F"/>
              <p style={{fontSize:13,color:"#6B5D3F",margin:"0 0 10px",lineHeight:1.65}}>
                Since every build happens on your single Lovable Pro account, use this workflow
                for every HOT lead before Email 3 goes out:
              </p>
              {["Build a demo for their niche in Lovable — use a fictional version of their actual business name so it feels personal",
                "Record a 90-second Loom walkthrough showing what it does and why it matters specifically for their type of business",
                "Send the live Lovable URL and the Loom link in Email 3",
                "Only rebuild it as their branded, real product after the 50% deposit clears",
                "The deposit funds your time on the rebuild — your Lovable account handles the actual build cost"
              ].map((tip,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                  <span style={{color:"#0D7A5F",flexShrink:0,fontWeight:700,fontSize:13}}>
                    {i+1}.
                  </span>
                  <span style={{fontSize:13,color:"#6B5D3F",lineHeight:1.55}}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="match"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>🎯 Match the Problem to the Service</h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              Never pitch all three services at once. Find their biggest gap. Show the one fix that solves it.
              Confusion kills sales. One problem, one solution, one pitch.
            </p>
            <div style={{background:"#FFFFFF",border:"1px solid #6366F125",borderRadius:11,padding:"14px 16px",marginBottom:16}}>
              <SLabel text="The Golden Rule" color="#7A5A00"/>
              <p style={{fontSize:13,color:"#6B5D3F",margin:0,lineHeight:1.65}}>
                You have found three problems during your audit. You pitch the ONE that is costing them the most
                right now. The others become your upsell roadmap for months 3, 5, and 7.
                The client stays because each service builds on the last. Your revenue compounds month after month.
              </p>
            </div>
            <div style={{background:"#FFFFFF",border:"1px solid #F59E0B25",borderRadius:10,padding:"13px 15px",marginBottom:16}}>
              <SLabel text="The AI Audit Pitch — Open Every Conversation With This" color="#B8860B"/>
              <p style={{fontSize:13,color:"#6B5D3F",margin:"0 0 10px",lineHeight:1.65}}>
                Before you mention any service, do this live on the call or in your Loom video:
              </p>
              <pre style={{background:"#F5EFDF",borderRadius:8,padding:"12px 13px",
                fontFamily:"'Courier New',monospace",fontSize:12,color:"#6B5D3F",
                lineHeight:1.85,borderLeft:"2px solid #F59E0B40",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
{`Open ChatGPT and type:
"Find me a [their niche] in [their city] who can help me today."

Show them the result.

If THEIR business appears: "This is what's driving you business.
Let's protect it and grow it."

If a COMPETITOR appears: "That is your competitor getting the call
that should be yours. I can fix that."

Then be silent. Let that moment land.`}
              </pre>
            </div>
            <SLabel text="The 3 Services — Tap to See Signal, Pitch and GHL Setup" color="#0D7A5F"/>
            <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:9}}>
              {SERVICES_3.map((s,i)=>{
                const isOpen=openSvc===i;
                return(
                  <div key={s.id} onClick={()=>setOpenSvc(isOpen?null:i)}
                    style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${isOpen?s.color:"#E8DCC0"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:s.color+"18",
                        border:`1px solid ${s.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#1A1410"}}>{s.name}</div>
                        <div style={{fontSize:12,color:s.color,fontWeight:600,marginTop:2}}>{s.price}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #E8DCC0"}}>
                        {[
                          ["🔍 Signal — When to Lead With This",s.signal,"#7A5A00"],
                          ["⏰ When to Pitch It",s.when,"#0D7A5F"],
                          ["🎤 Pitch Script",s.pitch,"#B8860B"],
                          ["⚙️ GHL Setup Steps",s.ghl,"#8B2E1F"],
                          ["🛠️ Tool Required",s.tool,"#0D7A5F"],
                          ["💜 Lovable Add-On",s.lovable,"#8B2E1F"],
                          ["📈 Upsell Trigger",s.upsell,"#B8860B"],
                        ].map(([lbl,val,col])=>(
                          <div key={lbl} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",
                              letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                            <p style={{fontSize:13,color:"#6B5D3F",margin:0,lineHeight:1.65,
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

        {tab==="upsell"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>📈 The Upsell Ladder</h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              One client, fully upsold over 7 months = $888–$1,188/month recurring.
              Five such clients = $5,000–$6,000/month before you close a single new deal.
            </p>
            <div style={{background:"#FFFFFF",border:"1px solid #10B98125",borderRadius:11,padding:"14px 16px",marginBottom:16}}>
              <SLabel text="The Compounding Math" color="#0D7A5F"/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:10}}>
                {[
                  ["1 client × Reviews only","$297/month","#7A5A00"],
                  ["1 client × Reviews + Speed","$494–$594/month","#0D7A5F"],
                  ["1 client × All 3 services","$791–$991/month","#B8860B"],
                  ["1 client × All 3 + Website","$888–$1,188/month","#8B2E1F"],
                ].map(([lbl,val,col])=>(
                  <div key={lbl} style={{background:"#FFFFFF",border:"1px solid #E8DCC0",
                    borderRadius:8,padding:"10px 12px"}}>
                    <div style={{fontSize:11.5,color:"#6B5D3F",marginBottom:4,lineHeight:1.4}}>{lbl}</div>
                    <div style={{fontSize:15,fontWeight:800,color:col}}>{val}</div>
                  </div>
                ))}
              </div>
              <p style={{fontSize:12,color:"#6B5D3F",margin:0,lineHeight:1.6}}>
                The upsell only works because each service builds genuine trust and delivers visible results
                before the next one is offered. Never stack services before the previous one has proved itself.
                60–90 days per tier. Patience is the strategy.
              </p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {UPSELL_STEPS.map((u,i)=>{
                const isOpen=openUps===i;
                return(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <div style={{width:36,height:36,borderRadius:9,background:u.color+"18",
                        border:`1px solid ${u.color}40`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:17}}>{u.icon}</div>
                      {i<UPSELL_STEPS.length-1&&<div style={{width:2,height:18,background:"#E8DCC0",
                        marginTop:4,marginBottom:4}}/>}
                    </div>
                    <div onClick={()=>setOpenUps(isOpen?null:i)}
                      style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                        border:`1px solid ${isOpen?u.color:"#E8DCC0"}`,
                        borderRadius:10,padding:"11px 13px",flex:1,
                        marginBottom:10,cursor:"pointer",transition:"border-color .2s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:u.color,
                            textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{u.phase}</div>
                          <div style={{fontWeight:700,fontSize:13.5,color:"#1A1410"}}>{u.service}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:800,color:u.color}}>{u.revenue}</div>
                          <Chevron open={isOpen}/>
                        </div>
                      </div>
                      {isOpen&&(
                        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #E8DCC0"}}>
                          {[
                            ["✅ What You Do",u.action,"#0D7A5F"],
                            ["🎤 How You Introduce It",u.intro,"#B8860B"],
                            ["🚦 The Trigger Signal",u.trigger,"#7A5A00"],
                          ].map(([lbl,val,col])=>(
                            <div key={lbl} style={{marginBottom:12}}>
                              <div style={{fontSize:10,fontWeight:700,color:col,
                                textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                              <p style={{fontSize:13,color:"#6B5D3F",margin:0,lineHeight:1.65,
                                borderLeft:`2px solid ${col}40`,paddingLeft:10,
                                fontStyle:lbl.includes("Introduce")?"italic":"normal"}}>{val}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="ghl"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>🔧 GHL Mastery Guide</h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 16px",lineHeight:1.6}}>
              GoHighLevel is the engine behind all 3 services. Learn it on your own sub-account first.
              Never experiment on a live client account.
            </p>
            <div style={{background:"#FFFFFF",border:"1px solid #F59E0B25",borderRadius:10,padding:"13px 15px",marginBottom:16}}>
              <SLabel text="Your GHL Cost vs Revenue" color="#B8860B"/>
              {[
                ["GHL Starter Plan","$97/month","#8B2E1F"],
                ["First review client covers it","$297/month income","#0D7A5F"],
                ["Net after GHL is covered","$200/month from client 1","#0D7A5F"],
                ["Every client after that","$297+/month pure profit","#0D7A5F"],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #E8DCC0"}}>
                  <span style={{fontSize:13,color:"#6B5D3F"}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:700,color:col}}>{val}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#6B5D3F",margin:"10px 0 0",lineHeight:1.6}}>
                GHL pays for itself with your very first client. After that it is a pure force multiplier.
                Start your 30-day free trial at <strong style={{color:"#B8860B"}}>gohighlevel.com</strong>
              </p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {GHL_STEPS.map((s,i)=>{
                const isOpen=openGHL===i;
                return(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <div style={{width:36,height:36,borderRadius:9,background:s.color+"18",
                        border:`1px solid ${s.color}40`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:17}}>{s.icon}</div>
                      {i<GHL_STEPS.length-1&&<div style={{width:2,height:20,background:"#E8DCC0",
                        marginTop:4,marginBottom:4}}/>}
                    </div>
                    <div onClick={()=>setOpenGHL(isOpen?null:i)}
                      style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                        border:`1px solid ${isOpen?s.color:"#E8DCC0"}`,
                        borderRadius:10,padding:"11px 13px",flex:1,
                        marginBottom:10,cursor:"pointer",transition:"border-color .2s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                        <div>
                          <span style={{fontSize:9,fontWeight:700,color:s.color}}>{s.n} </span>
                          <span style={{fontWeight:700,fontSize:13.5,color:"#1A1410"}}>{s.title}</span>
                        </div>
                        <Chevron open={isOpen}/>
                      </div>
                      {isOpen&&(
                        <p style={{fontSize:13,color:"#6B5D3F",margin:"10px 0 0",lineHeight:1.65,
                          borderTop:"1px solid #E8DCC0",paddingTop:10}}>{s.body}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#1A1410"}}>
              Zero-Budget FAQ
            </h2>
            <p style={{fontSize:12.5,color:"#6B5D3F",margin:"0 0 14px"}}>
              Every question answered for someone starting with no expendable funds
              and no existing clients.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FAQS.map((f,i)=>{
                const isOpen=openFaq===i;
                return (
                  <div key={i} onClick={()=>setOpenFaq(isOpen?null:i)}
                    style={{background:isOpen?"#FBF6E9":"#FFFFFF",
                      border:`1px solid ${isOpen?"#7A5A00":"#E8DCC0"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",
                      alignItems:"flex-start",gap:9}}>
                      <span style={{color:"#7A5A00",fontSize:13,fontWeight:800,
                        flexShrink:0,marginTop:1}}>Q</span>
                      <span style={{flex:1,fontSize:13.5,fontWeight:600,
                        color:"#1A1410",lineHeight:1.45}}>{f.q}</span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 13px",borderTop:"1px solid #E8DCC0"}}>
                        <div style={{display:"flex",gap:9,marginTop:11,alignItems:"flex-start"}}>
                          <span style={{color:"#0D7A5F",fontSize:13,fontWeight:800,flexShrink:0}}>
                            A
                          </span>
                          <p style={{fontSize:13,color:"#6B5D3F",margin:0,lineHeight:1.65}}>
                            {f.a}
                          </p>
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
      <SaveBar status={syncMeta.status} lastSavedAt={syncMeta.lastSavedAt} pendingCount={syncMeta.pendingCount} onSave={syncMeta.saveNow} />
    </div>
  );
}

