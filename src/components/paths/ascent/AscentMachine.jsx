// The Ascent — 45-Day Zero-Capital Direct-Scouting Closer System
// Restyled to match smb-path-briefing.jsx's DBI Regal design system exactly:
// cream/gold/crimson palette, Inter type, inline styles, emoji iconography.
// All data, copy, gamification and persistence logic carried over unchanged
// from the original dark "signal/insignia/alert" theme — visuals only were replaced.

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CREAM, CREAM_DEEP, BORDER, INK, MUTED, GOLD, GOLD_DEEP, CRIMSON, EMERALD,
  TONE, tone, h2Style, pStyle, eyebrowStyle, labelStyle,
  ScoreDots, CalloutBox, AccordionShell, NextLink, TaskRow, DayCard,
} from "@/components/paths/shared/primitives";

const STORAGE_KEY = "ascent-progress-v2";

/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: "start", label: "🧭 Start Here" },
  { id: "niche", label: "🎯 Pick Lane" },
  { id: "scout", label: "🔍 Scout" },
  { id: "days", label: "📅 45 Days" },
  { id: "scripts", label: "📜 Scripts" },
  { id: "mastery", label: "👑 Mastery" },
  { id: "toolkit", label: "🧰 Toolkit" },
  { id: "after", label: "📈 Day 46+" },
];

const RANKS = [
  { name: "Recruit", threshold: 0, blurb: `Orders received. The clock starts now.` },
  { name: "Scout", threshold: 10, blurb: `Eyes open — learning to find what marketplaces can't show you.` },
  { name: "Prospector", threshold: 22, blurb: `Warm List built. The hidden market is now visible to you.` },
  { name: "Apprentice Closer", threshold: 38, blurb: `Proof assets live. First scouted contact made.` },
  { name: "Field Closer", threshold: 58, blurb: `Pipeline sustained. Auditions in motion.` },
  { name: "Contract Closer", threshold: 78, blurb: `Terms on the table. A seat is close.` },
  { name: "Certified High-Ticket Closer", threshold: 95, blurb: `System complete. First live reps taken.` },
];

const DAYS = [
  { day: 1, phase: 1, title: `Orientation & Self-Audit`,
    objective: `Learn how the game works and inventory what you're bringing to it.`,
    items: [
      { id: "d1i1", xp: 10, text: `Study the CLOSER call-flow model at a glance (full breakdown in Scripts)` },
      { id: "d1i2", xp: 15, text: `Write your 3–4 sentence "Why I Can Close" positioning statement` },
      { id: "d1i3", xp: 10, text: `List 5+ transferable skills from your work history that map directly to sales` },
      { id: "d1i4", xp: 15, text: `Set up your Warm List tracker (Notion or Sheets): two tables — Target Companies (Company | Niche | Tier | Source | Contact | Date | Status | Follow-up) and Warm Prospects (Name/handle | Where found | Signal shown | Engaged? | Notes)` },
    ]},
  { day: 2, phase: 1, title: `Master the CLOSER Framework`,
    objective: `Learn the exact, question-led conversation structure you'll run on every call.`,
    items: [
      { id: "d2i1", xp: 15, text: `Read the CLOSER Framework (Scripts tab) and rewrite all six stages in your own words` },
      { id: "d2i2", xp: 15, text: `Watch 2 hours of free sales-call breakdowns on YouTube relevant to your niche` },
      { id: "d2i3", xp: 20, text: `Draft your first-pass responses to 3 likely objections, using the Universal Objection Method (Scripts tab)` },
      { id: "d2i4", xp: 15, text: `Read the Mastery tab — the Five Core Philosophies and the Top 1% Habit Stack — and note which one challenges how you currently think about selling` },
    ]},
  { day: 3, phase: 1, title: `Niche Lock-In & Avatar Research`,
    objective: `Know exactly who buys your chosen niche's offer, and why.`,
    items: [
      { id: "d3i1", xp: 20, text: `Write your ideal client avatar: who they are, their pain, their "before" and "after"` },
      { id: "d3i2", xp: 15, text: `Read your niche's full card in Pick Lane — deal size, objections, watch-outs` },
      { id: "d3i3", xp: 15, text: `Decide your Tier 1 criteria: what makes a target company "ideal" for you (size, price point, visible gaps)` },
    ]},
  { day: 4, phase: 1, title: `The Scout Method: Search Scouting`,
    objective: `Learn and run direct-search company discovery — the engine that replaces marketplaces.`,
    items: [
      { id: "d4i1", xp: 15, text: `Read the Search Scouting method (Scout tab) in full` },
      { id: "d4i2", xp: 30, text: `Run the search patterns for your niche and log every promising company you find` },
      { id: "d4i3", xp: 10, text: `Tag each one Tier 1, 2, or 3 based on fit` },
    ]},
  { day: 5, phase: 1, title: `The Scout Method: YouTube Mining`,
    objective: `Find premium-offer sellers where they actually live — on camera.`,
    items: [
      { id: "d5i1", xp: 15, text: `Read the YouTube Mining method (Scout tab)` },
      { id: "d5i2", xp: 30, text: `Review 10+ channels in your niche; log every one with a real application or booking page` },
      { id: "d5i3", xp: 10, text: `Note team-size signals for each (solo founder vs. visible team)` },
    ]},
  { day: 6, phase: 1, title: `The Scout Method: Track Active Closers`,
    objective: `Use other closers' public footprint as free market intelligence.`,
    items: [
      { id: "d6i1", xp: 15, text: `Read the Track Active Closers method (Scout tab)` },
      { id: "d6i2", xp: 25, text: `Find and log 5+ people currently working as closers or setters in your niche` },
      { id: "d6i3", xp: 15, text: `Note every company they mention — each one is a validated target` },
    ]},
  { day: 7, phase: 1, title: `Consolidate the Warm List`,
    objective: `Turn three days of scouting into one clean, tiered target list.`,
    items: [
      { id: "d7i1", xp: 20, text: `Merge everything from Days 4–6 into your tracker; remove duplicates` },
      { id: "d7i2", xp: 15, text: `Confirm you have at least 25 logged companies, tiered 1–3` },
      { id: "d7i3", xp: 50, badge: true, emoji: "🔭", text: `Recon Complete — you built a full target list through direct scouting, not marketplace scrolling` },
    ]},
  { day: 8, phase: 1, title: `Build Proof Asset #1 — The Pitch Video`,
    objective: `Create the 90-second video that does your talking for you.`,
    items: [
      { id: "d8i1", xp: 15, text: `Script a 60–90 second "why hire me" video` },
      { id: "d8i2", xp: 25, text: `Record it on your phone and upload unlisted (YouTube or free Loom)` },
      { id: "d8i3", xp: 15, text: `Get one piece of feedback from anyone available and revise it once` },
    ]},
  { day: 9, phase: 1, title: `Build Proof Asset #2 — The Mock Call`,
    objective: `Prove — to yourself first — that you can run the framework live.`,
    items: [
      { id: "d9i1", xp: 30, text: `Run a full mock sales call (roleplay both sides, or with a partner) on your niche avatar — ask more than you tell` },
      { id: "d9i2", xp: 10, text: `Record it — a phone voice memo is enough` },
      { id: "d9i3", xp: 15, text: `Self-score it against the rubric (Scripts tab) and note one fix` },
      { id: "d9i5", xp: 15, text: `Run the Three Freedoms Questions during the call (Mastery tab) — push past the surface answer with "why" and "what can that create for you"` },
      { id: "d9i4", xp: 40, badge: true, emoji: "📼", text: `On Tape — recorded and self-reviewed your first mock call` },
    ]},
  { day: 10, phase: 1, title: `Build Your Resume & Proof Hub`,
    objective: `Package everything into one link you can send in ten seconds.`,
    items: [
      { id: "d10i1", xp: 20, text: `Write a one-page closer resume: your positioning statement, framework fluency, relevant experience` },
      { id: "d10i2", xp: 25, text: `Build a free proof hub (Carrd, Notion, or Linktree) linking your video + resume + contact` },
      { id: "d10i3", xp: 10, text: `Test the link on your own phone to confirm it loads cleanly` },
    ]},
  { day: 11, phase: 1, title: `Begin the Warm Prospect List`,
    objective: `Start identifying real people who are already showing they want what your niche sells.`,
    items: [
      { id: "d11i1", xp: 15, text: `Read the Warm Prospect Sourcing method (Scout tab), including the ground rules` },
      { id: "d11i2", xp: 25, text: `Find and engage 3–5 real people showing genuine buying-intent signals, with real, no-strings value only` },
      { id: "d11i3", xp: 40, badge: true, emoji: "🌱", text: `Warm Hands — engaged your first real warm prospects` },
    ]},
  { day: 12, phase: 1, title: `Bespoke Loom Prep: Tier 1 Targets`,
    objective: `Prepare a video for your best-fit targets that could only be for them.`,
    items: [
      { id: "d12i1", xp: 25, text: `For your top 5 Tier-1 companies, note one specific, real detail from their content to reference` },
      { id: "d12i2", xp: 15, text: `Script a bespoke 45–60 second Loom outline per target — different from your general pitch video` },
    ]},
  { day: 13, phase: 1, title: `Record & Send Bespoke Looms`,
    objective: `Go live with your highest-leverage outreach.`,
    items: [
      { id: "d13i1", xp: 35, text: `Record and send a bespoke Loom + resume to each of your 5 Tier-1 targets` },
      { id: "d13i2", xp: 10, text: `Log every send with today's date` },
      { id: "d13i3", xp: 50, badge: true, emoji: "🎯", text: `First Contact — your first outreach, personalized and scouted, not mass-applied` },
    ]},
  { day: 14, phase: 1, title: `First Broad Wave`,
    objective: `Extend outreach beyond Tier 1 without losing personalization.`,
    items: [
      { id: "d14i1", xp: 30, text: `Send 10–15 personalized messages to Tier 2/3 targets, referencing something specific from each` },
      { id: "d14i2", xp: 10, text: `Log every send in your tracker` },
    ]},
  { day: 15, phase: 1, title: `Phase 1 Review`,
    objective: `Audit the foundation before you scale it.`,
    items: [
      { id: "d15i1", xp: 15, text: `Update every stat in your tracker: companies logged, outreach sent, warm prospects engaged` },
      { id: "d15i2", xp: 15, text: `Name one thing that's working and one thing to adjust before Phase 2` },
    ]},

  { day: 16, phase: 2, title: `Fresh Scouting Sprint`,
    objective: `Keep the pipeline fed — scouting never fully stops.`,
    items: [
      { id: "d16i1", xp: 30, text: `Run the Scout Method again (search or YouTube, your choice) for 8–10 new targets` },
      { id: "d16i2", xp: 10, text: `Tier and log each one` },
    ]},
  { day: 17, phase: 2, title: `Outreach Wave`,
    objective: `Reach the newly scouted names plus your backlog.`,
    items: [
      { id: "d17i1", xp: 30, text: `Send 15 personalized messages to newly scouted + backlog targets` },
      { id: "d17i2", xp: 20, text: `Follow up on every Day 12–14 message with no reply (the +3-day rule)` },
      { id: "d17i3", xp: 40, badge: true, emoji: "💬", text: `First Reply — a target company responded to your outreach` },
    ]},
  { day: 18, phase: 2, title: `Warm Prospect Engagement`,
    objective: `Keep building real, honest relationships in your niche's audience.`,
    items: [
      { id: "d18i1", xp: 20, text: `Engage 3–5 more real prospects with genuine, no-strings value` },
      { id: "d18i2", xp: 10, text: `Log new signals in your Warm Prospects table` },
    ]},
  { day: 19, phase: 2, title: `Follow-Up + Mock Call`,
    objective: `Discipline plus sharpening — most people only do one.`,
    items: [
      { id: "d19i1", xp: 15, text: `Follow up every outstanding thread` },
      { id: "d19i2", xp: 25, text: `Run 1 more mock call focused on objections; use Surface → Confirm → Respond, then self-score it` },
    ]},
  { day: 20, phase: 2, title: `Audition Prep / Live Auditions`,
    objective: `Prepare like the interview is also your vetting session.`,
    items: [
      { id: "d20i1", xp: 20, text: `For any scheduled interview, deep-research the company: offer, price, founder, recent content` },
      { id: "d20i2", xp: 15, text: `Prepare 5 questions from the Vetting Checklist` },
      { id: "d20i3", xp: 10, text: `If nothing's scheduled yet: send 10 more scouted, personalized messages instead` },
    ]},
  { day: 21, phase: 2, title: `Maintenance + Safety Net`,
    objective: `Tend the system, and treat the marketplace check as backup, not strategy.`,
    items: [
      { id: "d21i1", xp: 15, text: `Clean and re-tier your tracker` },
      { id: "d21i2", xp: 10, text: `Spend 15 minutes on Indeed, Upwork, ZipRecruiter, or Glassdoor as a supplementary check — log anything relevant, then close the tab` },
    ]},
  { day: 22, phase: 2, title: `Weekly Review`,
    objective: `Know your numbers.`,
    items: [
      { id: "d22i1", xp: 15, text: `Update your response rate %, companies contacted, and warm prospects engaged` },
      { id: "d22i2", xp: 10, text: `Set one specific target to beat next week` },
    ]},
  { day: 23, phase: 2, title: `Fresh Scouting Sprint`,
    objective: `Scale the engine — this week's target is higher than last week's.`,
    items: [
      { id: "d23i1", xp: 30, text: `Run the Scout Method for 10–12 new targets` },
      { id: "d23i2", xp: 10, text: `Tier and log each one` },
    ]},
  { day: 24, phase: 2, title: `Outreach Wave`,
    objective: `Keep the volume climbing, without losing personalization.`,
    items: [
      { id: "d24i1", xp: 35, text: `Send 15–20 personalized messages` },
      { id: "d24i2", xp: 20, text: `Follow up every thread with no reply` },
    ]},
  { day: 25, phase: 2, title: `Warm Prospect Engagement`,
    objective: `Deepen the list you'll eventually hand off.`,
    items: [
      { id: "d25i1", xp: 20, text: `Engage 5 more real prospects with genuine value` },
      { id: "d25i2", xp: 10, text: `Log every new signal` },
    ]},
  { day: 26, phase: 2, title: `Follow-Up + Mock Call Intensive`,
    objective: `Sharpen the part of the call that loses deals: objections.`,
    items: [
      { id: "d26i1", xp: 15, text: `Follow up every outstanding thread` },
      { id: "d26i2", xp: 30, text: `Run 2 mock calls focused specifically on objection handling; score each` },
      { id: "d26i3", xp: 60, badge: true, emoji: "🎤", text: `Auditioned — completed your first live interview or trial close` },
    ]},
  { day: 27, phase: 2, title: `Audition Prep / Live Auditions`,
    objective: `Show up prepared, or fix what isn't converting.`,
    items: [
      { id: "d27i1", xp: 20, text: `Research any scheduled company deeply` },
      { id: "d27i2", xp: 15, text: `Rehearse your intro and CLOSER opening out loud 3 times` },
      { id: "d27i3", xp: 15, text: `If nothing's scheduled yet: audit your response rate and revise your bespoke Loom approach` },
    ]},
  { day: 28, phase: 2, title: `Maintenance + Safety Net`,
    objective: `Same discipline, second time around.`,
    items: [
      { id: "d28i1", xp: 15, text: `Clean and re-tier your tracker` },
      { id: "d28i2", xp: 10, text: `15-minute marketplace check, supplementary only` },
    ]},
  { day: 29, phase: 2, title: `Weekly Review`,
    objective: `Find your one real bottleneck.`,
    items: [
      { id: "d29i1", xp: 15, text: `Update every stat in your tracker` },
      { id: "d29i2", xp: 10, text: `Name your single biggest bottleneck and one fix for it` },
    ]},
  { day: 30, phase: 2, title: `Phase 2 Review`,
    objective: `Confirm you're ready to convert, not just prospect.`,
    items: [
      { id: "d30i1", xp: 15, text: `Full pipeline audit: how many companies at each stage` },
      { id: "d30i2", xp: 15, text: `Pick your top 2–3 live conversations to focus on closing in Phase 3` },
    ]},

  { day: 31, phase: 3, title: `Never Stop the Pipeline`,
    objective: `The pipeline is your leverage — even mid-negotiation.`,
    items: [
      { id: "d31i1", xp: 25, text: `Send 10 new scouted, personalized messages regardless of any pending offer` },
      { id: "d31i2", xp: 10, text: `Follow up all outstanding threads` },
    ]},
  { day: 32, phase: 3, title: `Know How to Negotiate`,
    objective: `Walk into any offer already knowing what fair looks like.`,
    items: [
      { id: "d32i1", xp: 15, text: `Study typical commission structures: pure commission vs. draw, standard %` },
      { id: "d32i2", xp: 20, text: `Draft the 3 questions you'll ask before accepting any offer` },
    ]},
  { day: 33, phase: 3, title: `Vet Any Offers Received`,
    objective: `Protect your time before you commit it.`,
    items: [
      { id: "d33i1", xp: 25, text: `Run every live offer through the full Vetting Checklist` },
    ]},
  { day: 34, phase: 3, title: `Second-Round Auditions`,
    objective: `Close the loop on live conversations.`,
    items: [
      { id: "d34i1", xp: 25, text: `Take any second-round interviews or trial closes; if none, send 10 more messages instead` },
    ]},
  { day: 35, phase: 3, title: `Weekly Review`,
    objective: `Know exactly where you stand.`,
    items: [
      { id: "d35i1", xp: 15, text: `Full pipeline and tracker audit` },
      { id: "d35i2", xp: 10, text: `Confirm your top choice if more than one offer is live` },
    ]},
  { day: 36, phase: 3, title: `Lock the Role`,
    objective: `Get it in writing.`,
    items: [
      { id: "d36i1", xp: 20, text: `Finalize terms in writing: commission %, payment schedule, lead flow commitment` },
      { id: "d36i2", xp: 100, badge: true, emoji: "🤝", text: `Signed — you secured a role` },
    ]},
  { day: 37, phase: 3, title: `Onboarding: Learn Their Offer`,
    objective: `Learn their offer like it's your own business.`,
    items: [
      { id: "d37i1", xp: 20, text: `Learn the company's offer inside out: pricing, guarantee, refund policy, ideal client` },
      { id: "d37i2", xp: 15, text: `Compare it honestly against your own Vetting Checklist notes` },
    ]},
  { day: 38, phase: 3, title: `Onboarding: Tools & Shadowing`,
    objective: `Get the infrastructure under you before your first real call.`,
    items: [
      { id: "d38i1", xp: 20, text: `Shadow or review 2 real call recordings if available` },
      { id: "d38i2", xp: 10, text: `Get set up in their tools: calendar, CRM, call platform` },
    ]},
  { day: 39, phase: 3, title: `The Warm Handoff`,
    objective: `Show up already producing value.`,
    items: [
      { id: "d39i1", xp: 30, text: `Introduce your best Warm Prospects to your new team as immediate pipeline — real people, real interest, ethically sourced (script in Scripts tab)` },
      { id: "d39i2", xp: 10, text: `Note their reaction — it's a strong early signal of how this seat will treat your work` },
    ]},
  { day: 40, phase: 3, title: `First Live Rep`,
    objective: `Take your first real swing.`,
    items: [
      { id: "d40i4", xp: 15, text: `Send your pre-call WhatsApp message the night before (Mastery tab) — this is where your first real client interaction actually starts` },
      { id: "d40i1", xp: 30, text: `Take your first real prospect interaction, shadowed or supported` },
      { id: "d40i2", xp: 15, text: `Debrief immediately: what worked, what to adjust` },
      { id: "d40i3", xp: 75, badge: true, emoji: "📞", text: `Live Fire — your first real client interaction` },
    ]},
  { day: 41, phase: 3, title: `Debrief & Refine`,
    objective: `Turn one real call into a sharper framework.`,
    items: [
      { id: "d41i1", xp: 20, text: `Review your Day 40 call against CLOSER and the rubric, line by line` },
      { id: "d41i2", xp: 10, text: `Rewrite your weakest objection response based on what actually happened` },
    ]},
  { day: 42, phase: 3, title: `First Solo Call`,
    objective: `Run it yourself.`,
    items: [
      { id: "d42i1", xp: 30, text: `Run a real call solo, or with a supervisor listening` },
      { id: "d42i2", xp: 15, text: `Full debrief against your framework and rubric` },
    ]},
  { day: 43, phase: 3, title: `Second Solo Call`,
    objective: `Prove Day 42 wasn't luck.`,
    items: [
      { id: "d43i1", xp: 30, text: `Run another real call solo` },
      { id: "d43i2", xp: 15, text: `Compare this debrief to Day 42's — what's already improving?` },
    ]},
  { day: 44, phase: 3, title: `Full System Debrief`,
    objective: `Find and fix your one recurring leak.`,
    items: [
      { id: "d44i1", xp: 20, text: `Review every call you've taken so far against the rubric; find the one pattern that repeats` },
      { id: "d44i2", xp: 15, text: `Fix it in writing — an updated objection response or framework note` },
    ]},
  { day: 45, phase: 3, title: `Certification Day`,
    objective: `Close the loop on this system and open the next one.`,
    items: [
      { id: "d45i1", xp: 15, text: `Full system review: what worked, what needs sharpening` },
      { id: "d45i2", xp: 20, text: `Set your 30/60/90-day targets (Day 46+ tab)` },
      { id: "d45i3", xp: 15, text: `Lock in your ongoing scouting and outreach cadence so the pipeline never goes cold` },
      { id: "d45i4", xp: 100, badge: true, emoji: "🏆", text: `Certified — you completed the full 45-day system` },
    ]},
];

const PHASE_META = {
  1: { name: `Phase 01 — Foundation & First Contact`, range: `Days 1–15`,
       scorecard: `By end of Day 15: Warm List built via direct scouting (25+ tiered companies) · proof video + resume + hub live · first warm prospects engaged · bespoke Looms sent to Tier 1 · broader wave sent to Tier 2/3.` },
  2: { name: `Phase 02 — Sustained Scouting & Pipeline`, range: `Days 16–30`,
       scorecard: `By end of Day 30: 40+ additional companies scouted and logged · two full outreach waves sent · 10+ warm prospects engaged · at least one audition or trial close completed · both weekly reviews logged.` },
  3: { name: `Phase 03 — Conversion & Launch`, range: `Days 31–45`,
       scorecard: `By end of Day 45: one role vetted and signed · Warm Prospects handed off on day one · onboarding complete · multiple live calls taken solo · 30/60/90 targets set.` },
};

const NICHES = [
  { id: "funding", name: `Credit & Business Funding`,
    scores: { entry: 3, dealSize: 4, competition: 3, durability: 4, safety: 3, fit: 3 },
    verdict: `Steady, B2B-leaning demand with solid deal sizes. Just confirm in writing whether the role touches licensed lending activity before you accept it.`,
    icp: `Small business owners needing working capital or credit access, sold either as done-for-you funding services or as a "build your business credit" coaching program.`,
    dealSizeText: `$3,000–$15,000 typical program price, or a % of capital raised · 10–15% commission is common`,
    whereToFind: [
      `Search: "business funding" or "business credit" consulting "apply now" testimonials`,
      `X-ray search: site:linkedin.com/in "business funding" "closer" OR "sales" — bypasses LinkedIn's free search limits`,
      `LinkedIn itself — this niche skews LinkedIn-heavy; search "closer" + "funding" to see who's already hired`,
      `Funding-broker Facebook and Discord communities`,
      `Marketplaces (light backup only): Indeed, Upwork, ZipRecruiter, Glassdoor`,
    ],
    objections: [
      { q: `"I don't think I'll qualify"`, a: `"What makes you say that?" — dig into what's actually blocking them before you respond to an assumption.` },
      { q: `"This sounds like a predatory loan"`, a: `"What have you heard, specifically?" — then clarify plainly what is and isn't being offered. Transparency defuses this fast.` },
      { q: `"I need capital now, not in weeks"`, a: `"What's driving the timeline?" — address the real urgency honestly rather than oversell speed.` },
    ],
    opener: `Hi [Name] — saw your post on [specific topic]. I help funding consultants convert more of their qualified conversations into signed clients. Are you currently looking for extra sales support? Happy to share a short intro clip.`,
    watchOut: `Some funding and lending activity requires licensing depending on jurisdiction. Confirm in writing whether you'd be selling education/consulting (usually no license needed) or something closer to loan origination (may require one).` },

  { id: "dating", name: `Dating & Relationship Coaching`,
    scores: { entry: 4, dealSize: 3, competition: 2, durability: 4, safety: 3, fit: 4 },
    verdict: `Large, relatable, emotionally-driven market — real upside, but it's the most crowded lane for aspiring closers and has the widest quality range among operators. Win by vetting hard and out-personalizing everyone else.`,
    icp: `Two common buyer types: people who are financially stable but frustrated with dating apps and low-quality results, and people navigating a breakup, confidence collapse, or wanting to rebuild their dating life.`,
    dealSizeText: `$2,000–$10,000 typical program price · 10% commission is the norm (range 5–20%)`,
    whereToFind: [
      `Search: "dating coach" "book a call" testimonials, or "dating coach" mentorship "our clients"`,
      `YouTube: search "dating coach" or "attraction coaching," check each channel's About/links for an application page`,
      `X-ray search: site:linkedin.com/in "closer" "dating coaching" — surfaces who's already hired, and where`,
      `Marketplaces (light backup only): Indeed, Upwork, ZipRecruiter, Glassdoor`,
    ],
    objections: [
      { q: `"It's too expensive"`, a: `"Compared to what? What has staying where you are already cost you — in time, in years, in relationships that didn't work out?"` },
      { q: `"I need to think about it"`, a: `"Totally fair. What specifically do you want to think through? Let's think it through together right now."` },
      { q: `"I tried coaching before and it didn't work"`, a: `"What was different about that experience? What would need to be true this time for it to actually work?"` },
      { q: `"I need to check with my partner or friends"`, a: `"Makes sense — what do you think their real concern would be?"` },
    ],
    opener: `Hey [Name] — been following your content on [specific post], especially [specific detail]. I help coaches convert more of their qualified leads into paying clients without you needing to be on every call. Are you currently looking for a closer or setter? Happy to send a 90-second video so you can see how I run one.`,
    watchOut: `Wide quality range among operators — from licensed coaches to pickup-artist-style shops. Read actual client testimonials and program content, not just the recruiter's pitch, before you commit your time.` },

  { id: "realestate", name: `Real Estate`,
    scores: { entry: 3, dealSize: 4, competition: 3, durability: 4, safety: 4, fit: 3 },
    verdict: `Evergreen and lucrative, with the cleanest reputational profile of the six — the main thing to check is whether the role needs a license.`,
    icp: `Aspiring or active real estate investors buying coaching/mentorship, or capital partners for real estate syndications and deals.`,
    dealSizeText: `$5,000–$25,000 typical coaching program, or commission on capital raised · 10–15% is common`,
    whereToFind: [
      `Search: "real estate investor coaching" "apply" OR "acquisitions" hiring`,
      `YouTube: real estate investing channels — check for an application or booking page`,
      `X-ray search: site:linkedin.com/in "closer" "real estate investing" — finds validated companies fast`,
      `BiggerPockets-adjacent communities and podcasts`,
      `Marketplaces (light backup only): Indeed, Upwork, ZipRecruiter, Glassdoor`,
    ],
    objections: [
      { q: `"I don't have capital to invest"`, a: `"What do you think it would actually take to get started?" — many programs teach the strategy before the capital stage, and most are surprised how early they could begin.` },
      { q: `"The market's too uncertain right now"`, a: `"What specifically about the market has you cautious?" — it's rarely the market itself once you dig in.` },
      { q: `"I've heard real estate gurus are scams"`, a: `"Fair — what have you heard, specifically?" — address exactly that, not the general reputation.` },
    ],
    opener: `Hey [Name], loved your breakdown on [specific deal or strategy]. I close for real estate coaches and investors and I'm looking for my next seat — open to a quick chat about whether you need extra sales bandwidth right now?`,
    watchOut: `Roles range from pure sales/acquisitions (no license needed) to directly representing buyers or sellers (usually requires a license in most places). Read the job description for which one you're being offered.` },

  { id: "content", name: `Content & Personal Branding`,
    scores: { entry: 4, dealSize: 2, competition: 2, durability: 3, safety: 3, fit: 4 },
    verdict: `The easiest lane to enter, but usually the smallest tickets and the most "guru noise." Strong as a stepping-stone niche while you build call reps.`,
    icp: `Coaches, consultants, and founders who want a stronger personal brand or more inbound leads — sold as ghostwriting, content, or full personal-branding agency packages.`,
    dealSizeText: `$2,000–$8,000 typical package, sometimes a recurring retainer · 5–15% commission is common`,
    whereToFind: [
      `Search: "personal brand agency" OR "ghostwriting agency" "apply" clients`,
      `X (Twitter) creator-economy and "build in public" circles`,
      `X-ray search: site:linkedin.com/in "closer" "personal brand" OR "content agency"`,
      `Agency-owner Skool and Facebook communities`,
      `Marketplaces (light backup only): Indeed, Upwork, ZipRecruiter, Glassdoor`,
    ],
    objections: [
      { q: `"I could just do this myself"`, a: `"What's stopped you from doing it yourself so far?" — almost always time, not skill. Let them say it.` },
      { q: `"How do I know this actually works"`, a: `"What kind of proof would actually change your mind?" — then go get exactly that, not a generic case study.` },
      { q: `"I don't have anything interesting to talk about"`, a: `"Walk me through a normal week for you." — there's always more material there than they think.` },
    ],
    opener: `Hey [Name] — your content on [specific post] is exactly the kind of thing I help creators and agencies turn into signed clients on the sales side. Are you handling all your own sales calls right now, or is there room for a closer?`,
    watchOut: `The most "guru-saturated" lane of the six. Ask for real client results — not just the recruiter's own income screenshots — before you commit your time.` },

  { id: "trading", name: `Trading & Trading Bots`,
    scores: { entry: 3, dealSize: 4, competition: 3, durability: 2, safety: 2, fit: 2 },
    verdict: `Can pay well, but carries the widest concentration of shaky operators and regulatory risk of the six. Vet twice as hard here, or treat it as last-priority.`,
    icp: `Retail traders/investors wanting passive or algorithmic income, usually sold via mentorship, signal groups, or "bot access" bundles.`,
    dealSizeText: `$1,500–$10,000+ typical bundle price · 10–20% commission is common`,
    whereToFind: [
      `Search: "trading mentorship" OR "trading bot" access "apply" (extra scrutiny required — see Watch Out)`,
      `Crypto and trading Telegram/Discord communities`,
      `X-ray search: site:linkedin.com/in "closer" "trading" — see who's currently placed, and where`,
      `Marketplaces (light backup only, vet twice as hard here): Indeed, Upwork, ZipRecruiter, Glassdoor`,
    ],
    objections: [
      { q: `"This sounds like every other trading scam"`, a: `"That's fair — what happened last time?" — address exactly that, transparently, or don't take this seat.` },
      { q: `"I've lost money on signals before"`, a: `"What was different about that experience?" — then differentiate specifically. Vague reassurance won't undo a real loss.` },
      { q: `"What if the bot just stops working"`, a: `"What would you want to see before trusting a bot again?" — answer only what you can prove. Overselling here is what burns closers' reputations.` },
    ],
    opener: `Hi [Name], following your content on [specific strategy or result]. I help trading educators convert more of their webinar or call attendees into members. Any chance you're looking for a closer right now?`,
    watchOut: `This niche has the highest concentration of aggressive or outright fraudulent operators of the six, and regulatory attention on trading-signal and "bot" businesses has increased. Run the full Vetting Checklist without skipping a single question — if they can't show verifiable, audited results, walk away.` },

  { id: "ai", name: `AI & B2B AI Implementation`,
    scores: { entry: 2, dealSize: 5, competition: 5, durability: 5, safety: 4, fit: 3 },
    verdict: `The least crowded, highest-ticket, fastest-growing lane of the six right now. The trade-off is a real learning curve — you need to sound credible on a technical call.`,
    icp: `SMB or mid-market business owners and operations leads who want AI agents, automation, or implementation work done for their business.`,
    dealSizeText: `$5,000–$50,000+ typical implementation project or retainer — the largest average ticket of the six · 10–20% commission is common`,
    whereToFind: [
      `LinkedIn (the dominant channel by far) — search "closer" or "account executive" + "AI implementation"`,
      `X-ray search: site:linkedin.com/in "AI implementation" "closer" OR "account executive"`,
      `No-code/automation communities (Make.com, GoHighLevel, Bubble) — genuinely worth your time if you already use these tools`,
      `AI implementation agency owner Skool and Discord communities`,
      `Marketplaces (light backup only): Indeed, Upwork, ZipRecruiter, Glassdoor`,
    ],
    objections: [
      { q: `"AI is just hype, it won't actually work for us"`, a: `"Walk me through the exact workflow this would touch." — answer their actual case, not the general argument for AI.` },
      { q: `"We tried something like this and it broke everything"`, a: `"What broke, exactly, and who was affected?" — don't reassure until you know.` },
      { q: `"Our team will resist this"`, a: `"Who on the team would feel this first?" — that's a change-management question, not a technology one. Treat it like one.` },
    ],
    opener: `Hi [Name] — noticed [specific post or case study] about your AI implementation work. I help agencies like yours convert more discovery calls into signed projects. Open to a quick conversation about your current sales bandwidth?`,
    watchOut: `The learning curve is real — you need enough fluency in automation/AI concepts to survive technical follow-up questions on a call. Hands-on experience with tools like Bubble, Make.com, GoHighLevel, or newer AI-assisted builders like Lovable, Base44, and Replit is a genuine unlock; most aspiring closers can't speak this language credibly yet.` },
];

const SCORE_LABELS = [
  { key: "entry", label: "Entry Ease" },
  { key: "dealSize", label: "Deal Size" },
  { key: "competition", label: "Low Competition" },
  { key: "durability", label: "Durability" },
  { key: "safety", label: "Safety" },
  { key: "fit", label: "Beginner Fit" },
];

const CLOSER_FRAMEWORK = [
  { letter: "C", stage: "Clarify", detail: `Ask why they're really here today — what prompted them to book this call now, specifically. Let them answer in full before you say anything else.` },
  { letter: "L", stage: "Label", detail: `Reflect their problem back as a clear, simple label, then ask if that's accurate. Let them confirm or correct it in their own words — don't assume you've got it right.` },
  { letter: "O", stage: "Overview", detail: `Ask what they've already tried and why it didn't work. Get the full history before you say a single word about your offer.` },
  { letter: "S", stage: "Sell the vacation, not the flight", detail: `Ask them to describe what life looks like once this is solved, in their own words. Then connect the offer to that outcome — not to features, steps, or how it works.` },
  { letter: "E", stage: "Explain away concerns", detail: `Meet every objection with a question that surfaces the real concern before you respond to it. Answer the actual worry, not the surface complaint.` },
  { letter: "R", stage: "Reinforce the decision", detail: `After they say yes, ask a question that gets them to restate why this was the right call, in their own words. This is what actually prevents remorse and refunds — and it continues through onboarding, not just the call.` },
];

const OBJECTION_METHOD = [
  { step: "Surface", detail: `Ask a question that gets the real concern out, not the polite version. "What's the actual hesitation?" beats accepting "let me think about it" at face value.` },
  { step: "Confirm", detail: `Reflect it back and confirm you've got it right before you respond to anything.` },
  { step: "Respond", detail: `Answer only the real concern you just confirmed — briefly — then ask if that resolves it.` },
];

const TEMPLATES = [
  { name: "Universal Cold Outreach Opener (swap in your niche)",
    body: `Hey [Name] — been following your content on [specific post/topic], especially [specific detail]. I help [niche] businesses convert more of their qualified leads into paying clients without you needing to be on every single call. Are you currently looking for a closer or setter? Happy to send a 90-second video so you can see how I run one.` },
  { name: "Day+3 Follow-Up",
    body: `Hey [Name], following up on my note from [day] — totally understand if it's not the right time. If you ever need an extra closer in your corner, I'm one message away. [link to your proof hub]` },
  { name: "Audition Ask",
    body: `Really appreciate you replying, [Name]. Would you be open to a quick 15-minute call this week so I can show you how I'd run a discovery call with one of your leads? Happy to do a live trial close if that's easier to evaluate.` },
  { name: "Bespoke Loom Opening Line (Day 13)",
    body: `Hey [Name] — before anything else, I want you to know I actually watched/read [specific piece of their content] before recording this, because a generic pitch wouldn't be fair to what you've built. [Then move into your pitch.]` },
  { name: "Informational Outreach to an Active Closer (Scout Method 3)",
    body: `Hey [Name] — I'm working on breaking into high-ticket closing in [niche] and came across your profile. Not looking for anything from you except maybe 10 minutes of insight if you're open to it — what's actually changed in this space lately? Happy to return the favor however I can.` },
  { name: "Warm Prospect Engagement (framing, not a script — Scout Method 4)",
    body: `Lead with something useful, not a pitch: a specific idea, resource, or reframe tied to their stated problem. Never mention any company, program, or offer. If they ask what you do, be honest: "I'm building experience in [niche] — glad I could help either way."` },
  { name: "The Warm Handoff (Day 39)",
    body: `I've been in touch with a few people who are actively looking for exactly what we offer — [Name] specifically mentioned [specific pain]. Want me to make the introduction, or would you rather I loop them into the normal booking flow?` },
];

const VETTING = [
  `Can they show verifiable client results — not just their closers' income screenshots?`,
  `What's their refund or chargeback rate? A legitimate operator knows this number and will tell you.`,
  `How are the leads you'd be calling actually generated — organic content, paid ads, or affiliates? This tells you how warm they really are.`,
  `Is your compensation and payment schedule confirmed in writing?`,
  `Do a 5-minute search for public complaints, lawsuits, or regulatory action against the company or founder.`,
  `Will you get any live call shadowing or training before going solo, or are you thrown in cold?`,
  `What's the realistic average deal size and close rate their current closers report? Ask directly.`,
];

const RESOURCES = [
  { need: "Company & lead research", paid: "Apollo, Clearbit, ZoomInfo — $50–300/mo (data enrichment)", free: "Not needed — the Scout Method (Scout tab) replaces this entirely", manual: "This is the system by design: Google search, YouTube, and LinkedIn X-ray search, done by hand. See the Scout tab." },
  { need: "Pipeline tracker / CRM", paid: "Notion paid tier, Close.com, HubSpot — $20–99/mo", free: "Notion free plan or Google Sheets", manual: "A plain Google Sheet works fully — update it by hand after every action, no exceptions." },
  { need: "Outreach sending", paid: "Apollo, Instantly — $30–100/mo (auto-sequencing)", free: "Not automatable at $0 — this is manual by design", manual: "Personally research and send each message 1-by-1. Budget 2–3 focused hours a day — it is the job." },
  { need: "Pitch & mock-call video", paid: "Loom Business, Riverside", free: "Loom free tier, or your phone camera", manual: "Record on your phone, trim with a free video editor app, upload unlisted to YouTube." },
  { need: "Call practice partner", paid: "A paid sales coach — $100–300/session", free: "Reddit/Discord accountability groups, friends or family", manual: "Record yourself running both sides of the call. It works — professionals still do this." },
  { need: "Proof-of-skill hub", paid: "Squarespace, Wix — $16–30/mo", free: "Carrd free tier, a public Notion page, or Linktree", manual: "A clean, well-formatted Google Doc with view access works if nothing else does." },
  { need: "Interview / call platform", paid: "Zoom Pro", free: "Google Meet, or Zoom free (40-min cap — enough for most interviews)", manual: "—" },
  { need: "Scheduling link", paid: "Calendly paid tiers", free: "Calendly free tier", manual: "Coordinate times manually by message — slower, still free." },
  { need: "Call review / transcription", paid: "Otter.ai paid, Gong", free: "Otter.ai free tier (limited minutes)", manual: "Re-listen to your own recording and take notes by hand. This is the \"7-hour\" option — and it works." },
];

const SCOUT_METHODS = [
  { id: "search", icon: "🔍", title: "Method 1 — Search Scouting",
    intro: `Use the open web to find companies before they ever think to post a job.`,
    patterns: [
      `"[niche]" coaching "book a call" testimonials`,
      `"[niche]" "high ticket" program apply`,
      `"[niche]" mentor "our clients" results -jobs`,
      `"[niche]" coach podcast interview 2026`,
      `site:linkedin.com/in "[niche] coach" OR "[niche] mentor" — X-ray search, bypasses LinkedIn's free search limits entirely`,
    ],
    green: `An application or "book a call" page (they run sales calls = candidate target) · specific testimonials naming real results (established, revenue-generating) · a solo founder with no visible team (likely the current bottleneck — prime target)`,
    red: `A dormant page, no clear offer, or no social proof at all` },
  { id: "youtube", icon: "🎥", title: "Method 2 — YouTube Mining",
    intro: `Premium coaches sell where they build trust — often on camera, long before they ever hire help.`,
    patterns: [
      `Search YouTube for [niche]-relevant terms; open every channel with real engagement, not just subscriber count — check recent views`,
      `Check the About tab and video descriptions for an application or booking link`,
      `Scan recent comments for buying-intent signals — this doubles as Warm Prospect sourcing (Method 4)`,
      `Note whether the channel shows a visible team or just one founder — both are valid targets, for different reasons`,
    ] },
  { id: "closers", icon: "👥", title: "Method 3 — Track Active Closers",
    intro: `Other closers' public footprint is free market intelligence — who's hiring, what deals look like right now, and what's actually changed.`,
    patterns: [
      `site:linkedin.com/in "high ticket closer" "[niche]" — X-ray search, no login or limit needed`,
      `site:linkedin.com/in "closer" "[niche] coaching"`,
      `On LinkedIn itself: "high ticket closer" "[niche]" in the main search bar — capitalize AND/OR/NOT, they're the only reliable operators on a free account`,
    ],
    extract: `Which companies they mention (validated targets — if one closer works there, there's often room for another) · deal sizes or commission hints in their posts · whether they seem open to a short, respectful DM` },
];

const INTEREST_LEVELS = ["Not Interested", "Curious", "Generally Interested", "Highly Interested", "Convicted"];

const PRECALL_TEMPLATES = [
  { name: "Night-Before WhatsApp Message", body: `Hey [Name], saw we have a meeting tomorrow at [time] about [their goal] — is there any specific question that needs answering that would stop you from showing up?` },
  { name: "Engagement Follow-Up (send regardless of their reply)", body: `Awesome [Name], I have 2–3 pieces of content that'll give you a ton of clarity:
1. A video of our founder walking through the process
2. Testimonials from people who solved that exact problem, or an FAQ sheet
3. A pre-sales video showing exactly what you'll get within [Product]
What would help most?` },
];

const PHILOSOPHIES = [
  { n: 1, title: "Pre-Call Preparation", tag: "1-on-1 contact, the night before — not a marketing email", extra: "precall",
    body: `The top 1% understand marketing, not just selling. Every hour between booking and the call, left without reinforcement, is an hour interest can decay — that's why leads go cold or simply don't show up. Left alone, a prospect treats your call as an educational call, not a buying call: you become an option to research, not a decision to make. Owning your own pre-call touch fixes this. Most leads never fully read a marketing email — that's "spray and pray," not built for their specific situation. A direct, personal message the night before is what actually stacks interest before they arrive.` },
  { n: 2, title: "Sell Transformations, Not Products",
    body: `Nobody buys a course, a call schedule, or a piece of software. They buy the version of themselves that exists on the other side of it. This is the entire engine behind CLOSER's "S" — Sell the vacation, not the flight (Scripts tab): describe the outcome in their own words, not the mechanism.` },
  { n: 3, title: "The Three Freedoms Questions", extra: "freedoms",
    body: `A technique used widely across high-ticket sales training: instead of accepting a surface-level goal, ask which of the three freedoms matters most, then layer deeper. This turns an abstract goal into an emotional one — and it's the actual mechanism for finding "the vacation" in CLOSER's "S" stage, not a guess.` },
  { n: 4, title: "People Buy Emotionally, Then Justify Logically",
    body: `Most salespeople lead with pain and logic — which isn't how people actually decide, and it creates pushback. People buy emotionally and justify logically afterward. Your job is to connect them to the emotion — the freedoms, the vacation — and the product supplies the logical reasoning they'll use to justify a decision they've already made. This isn't manipulation, it's guidance. Emotion first, logic second.` },
  { n: 5, title: "Conviction Beats Skill Every Time",
    body: `Sales is a transference of belief — you have to believe in what you're selling. But conviction doesn't mean believing your product will completely transform someone's life. It means being genuinely convinced it's the best next step for where they currently are. That's honest conviction, not hype — and it's what a prospect feels through the phone before they ever hear your logic.` },
];

const TOP1_HABITS = [
  { title: "Silence After the Ask", body: `After you ask for the decision, or state the price, stop talking. The next person to speak loses leverage. Jumping in to fill silence with a discount or a bonus is negotiating against yourself before anyone even objected.` },
  { title: "Control Your Tonality at the Close", body: `Consciously slow your pace exactly when the stakes rise. A rushed voice reads as nervous, or worse, pushy. A deliberate, unhurried one reads as conviction.` },
  { title: "Research Before You Dial", body: `Your pre-call message stacks interest, but the top 1% also review whatever the setter or intake form captured before they ever pick up — they walk in already knowing the situation, not discovering it live.` },
  { title: "Take Visible Notes", body: `Narrating "let me get that down" while writing what a prospect says does two things: it signals real listening, and it hands you their own words to reflect back later — the Label and Reinforce stages of CLOSER run on exactly this.` },
  { title: "Treat Your Numbers Like an Athlete Treats Stats", body: `Close rate, average deal size, and which objection actually beat you — reviewed weekly, not felt. Days 22, 29, and 35 already build this into the roadmap; the habit is doing it even after Day 45.` },
  { title: "Manage Your State Before High-Stakes Calls", body: `Conviction is hard to project from a scattered state. A short, deliberate ritual before a call — stand up, review your notes out loud, remind yourself why this is a genuine next step for this person — protects the belief you're supposed to be transferring.` },
];

const COMMAND_PRINCIPLES = [
  { title: "Genuine Selectivity, Not Performed Scarcity", body: `Confident positioning only works if it's true. Real criteria for who you work best with, and a genuine willingness to say "this isn't the right fit" — that reads as expertise. Faking it while accepting anyone with a pulse gets sensed immediately, and it torches the trust you're building faster than any pitch can rebuild it.` },
  { title: "Lead With Fit, Not With Pitch", body: `Opening with "I want to make sure this is a good fit for both of us" does two honest things at once: it signals real standards, and it gets the prospect talking about their own situation before you've said a word about the offer — exactly what CLOSER's Clarify and Overview stages (Scripts tab) are already built to do.` },
  { title: `Respect Hesitation, Don't Override It`, body: `If someone genuinely needs more time on a $2,000–$50,000 decision, that's not an objection to engineer around — it's information. Give them the room, and mean it. Pressuring a hesitant prospect into "recommitting" produces exactly what it sounds like: buyer's remorse, refund requests, and a reputation that costs you the next ten deals to repair the one you rushed.` },
  { title: "Confidence Is Built, Not Performed", body: `The version of this that actually holds up comes from real wins first — proof assets, a track record, genuine results. Confidence performed before it's earned reads as exactly what it is.` },
];

const AFTER_ROWS = [
  { d: "The Moment You Sign", t: "Around Day 36 in this system. You're walking in with a Warm Prospects handoff already in hand — a rare position for someone who started at zero 36 days earlier." },
  { d: "First 30 Days In The Seat", t: "You are still ramping. Expect inconsistency — some calls will go well, some won't. This is normal; even experienced reps typically need 3+ months to reach full productivity in a new role." },
  { d: "60–90 Days In The Seat", t: "This is realistically where the framework becomes second nature, objection handling sharpens, and your close rate stabilizes." },
  { d: "Beyond 90 Days In The Seat", t: "The $8,000–$40,000/month range this system was built around becomes genuinely achievable — it is real money real closers make in this industry — earned through call volume and close-rate discipline, not granted by landing the seat." },
];


/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */

function StartTab() {
  return (
    <div>
      <h2 style={h2Style}>How This System Works</h2>
      <p style={pStyle}>
        The Ascent is a 45-day, zero-capital operating system for landing a remote, commission-based high-ticket
        closing seat — built around direct scouting instead of marketplace applications. Three phases, one
        target: a signed role with a real pipeline already behind it.
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

      <CalloutBox toneKey="good" eyebrow="🧭 Why zero-capital, on purpose">
        Every tool this system needs has a free path — the Toolkit tab lists exactly what to use instead of paying
        for leads, licenses, or software. A closer role should never require payment before you're allowed to work;
        if one does, that's already answered by the Vetting Checklist in Scripts.
      </CalloutBox>

      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ ...eyebrowStyle, color: GOLD_DEEP }}>How to run this system</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: MUTED, lineHeight: 1.8 }}>
          <li>Read <strong style={{ color: INK }}>Pick Lane</strong> and lock a niche before Day 3.</li>
          <li>Learn <strong style={{ color: INK }}>Scout</strong> and <strong style={{ color: INK }}>Scripts</strong> in the first week — they're the engine every later day runs on.</li>
          <li>Work <strong style={{ color: INK }}>45 Days</strong> in order, checking off tasks as you go — your rank climbs automatically.</li>
          <li>Read <strong style={{ color: INK }}>Mastery</strong> whenever a call goes sideways — it's the "why" behind the framework, not just the "how."</li>
        </ol>
      </div>
    </div>
  );
}

function NicheTab() {
  const [openNiche, setOpenNiche] = useState(null);
  return (
    <div>
      <h2 style={h2Style}>Pick Your Lane</h2>
      <p style={pStyle}>Six niches, graded honestly on the same six factors. Pick one before Day 3 — you can't scout, script, or sell to a target you haven't chosen yet.</p>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Lane</th>
              {SCORE_LABELS.map((s) => (
                <th key={s.key} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED, whiteSpace: "nowrap" }}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NICHES.map((n) => (
              <tr key={n.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{n.name}</td>
                {SCORE_LABELS.map((s) => (
                  <td key={s.key} style={{ padding: "10px" }}><ScoreDots value={n.scores[s.key]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {NICHES.map((n) => {
          const open = openNiche === n.id;
          return (
            <AccordionShell key={n.id} isOpen={open} onToggle={() => setOpenNiche(open ? null : n.id)}
              header={
                <span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: INK, display: "block" }}>{n.name}</span>
                  <span style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, display: "block", marginTop: 3, maxWidth: 560 }}>{n.verdict}</span>
                </span>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 12 }}>
                <div>
                  <p style={labelStyle}>Who buys</p>
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{n.icp}</p>
                </div>
                <div>
                  <p style={labelStyle}>Deal size</p>
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{n.dealSizeText}</p>
                </div>
                <div>
                  <p style={labelStyle}>Where to find offers</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                    {n.whereToFind.map((w, i) => (
                      <div key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
                        <span style={{ color: GOLD_DEEP, flexShrink: 0 }}>→</span><span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={labelStyle}>Common objections</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
                    {n.objections.map((o, i) => (
                      <div key={i} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px" }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: INK, margin: "0 0 3px" }}>{o.q}</p>
                        <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.55 }}>{o.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={labelStyle}>Sample opener</p>
                  <p style={{ fontSize: 12.5, color: INK, fontStyle: "italic", lineHeight: 1.6, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px", margin: 0 }}>{n.opener}</p>
                </div>
                <div style={{ background: TONE.caution.bg, border: `1px solid ${TONE.caution.bd}`, borderRadius: 8, padding: "9px 11px" }}>
                  <p style={{ ...labelStyle, color: CRIMSON }}>Watch out</p>
                  <p style={{ fontSize: 12.5, color: INK, lineHeight: 1.6, margin: 0 }}>{n.watchOut}</p>
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
      <h2 style={h2Style}>The Scout Method</h2>
      <p style={pStyle}>Four ways to find real target companies without a marketplace — the engine behind every outreach day in the 45-Day Roadmap.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        {SCOUT_METHODS.map((m) => (
          <div key={m.id} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: 0 }}>{m.title}</p>
            </div>
            <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: "0 0 10px" }}>{m.intro}</p>
            {m.patterns && (
              <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", marginBottom: (m.green || m.extract) ? 10 : 0 }}>
                <p style={labelStyle}>Search patterns</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                  {m.patterns.map((p, i) => (
                    <code key={i} style={{ fontSize: 11.5, color: INK, lineHeight: 1.5, fontFamily: "inherit" }}>{p}</code>
                  ))}
                </div>
              </div>
            )}
            {m.green && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 8 }}>
                <div style={{ background: TONE.good.bg, border: `1px solid ${TONE.good.bd}`, borderRadius: 8, padding: "9px 11px" }}>
                  <p style={{ ...labelStyle, color: EMERALD }}>✓ Green flags</p>
                  <p style={{ fontSize: 12, color: INK, lineHeight: 1.55, margin: 0 }}>{m.green}</p>
                </div>
                <div style={{ background: TONE.caution.bg, border: `1px solid ${TONE.caution.bd}`, borderRadius: 8, padding: "9px 11px" }}>
                  <p style={{ ...labelStyle, color: CRIMSON }}>✕ Red flags</p>
                  <p style={{ fontSize: 12, color: INK, lineHeight: 1.55, margin: 0 }}>{m.red}</p>
                </div>
              </div>
            )}
            {m.extract && (
              <div style={{ background: TONE.neutral.bg, border: `1px solid ${TONE.neutral.bd}`, borderRadius: 8, padding: "9px 11px" }}>
                <p style={labelStyle}>What to extract</p>
                <p style={{ fontSize: 12, color: INK, lineHeight: 1.55, margin: 0 }}>{m.extract}</p>
              </div>
            )}
          </div>
        ))}

        <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🌱</span>
            <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: 0 }}>Method 4 — Warm Prospect Sourcing</p>
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: "0 0 10px" }}>
            Different goal from Methods 1–3: instead of finding companies to pitch, you find real people already
            showing genuine buying-intent signals — comments, posts, questions — and build authentic relationships
            by offering real, no-strings value. These become your Warm Prospects list, and eventually a handoff
            (Day 39) that makes you valuable on day one of a new seat.
          </p>
          <div style={{ background: TONE.caution.bg, border: `1px solid ${TONE.caution.bd}`, borderRadius: 8, padding: "9px 11px" }}>
            <p style={{ ...labelStyle, color: CRIMSON }}>Ground rules</p>
            <p style={{ fontSize: 12, color: INK, lineHeight: 1.6, margin: 0 }}>Never pitch a company, a program, or yourself as a closer in these interactions. Never misrepresent who you are. The value has to be real and free, with nothing attached — that's what makes the eventual handoff trustworthy instead of transactional.</p>
          </div>
        </div>
      </div>

      <CalloutBox toneKey="neutral" eyebrow="🧭 Marketplaces are a backup, not a strategy">
        Indeed, Upwork, ZipRecruiter, and Glassdoor aren't off-limits — they're just not the engine. Give them 15 minutes as a supplementary check (Days 21 and 28), log anything relevant, then close the tab and get back to scouting.
      </CalloutBox>
    </div>
  );
}

function DaysTab({ checked, onToggle }) {
  const [expandedDay, setExpandedDay] = useState(1);
  const phases = [1, 2, 3];
  return (
    <div>
      <h2 style={h2Style}>The 45-Day Roadmap</h2>
      <p style={pStyle}>Every day builds on the last. Check off each task as you complete it — your rank and XP update automatically.</p>

      {phases.map((p) => {
        const meta = PHASE_META[p];
        const daysInPhase = DAYS.filter((d) => d.phase === p);
        return (
          <div key={p} style={{ marginBottom: 22 }}>
            <div style={{ background: "rgba(201,154,59,0.08)", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "12px 15px", marginBottom: 10 }}>
              <p style={{ fontWeight: 800, fontSize: 13.5, color: GOLD_DEEP, margin: "0 0 2px" }}>{meta.name}</p>
              <p style={{ fontSize: 11, color: MUTED, textTransform: "", letterSpacing: "0.06em", margin: "0 0 8px" }}>{meta.range}</p>
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

function ScriptsTab() {
  return (
    <div>
      <h2 style={h2Style}>Scripts & Frameworks</h2>
      <p style={pStyle}>The exact conversational structure this whole system is built around — plus the objection method, ready-to-use templates, and the vetting checklist to run before you accept any offer.</p>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>The CLOSER Framework</p>
      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
        {CLOSER_FRAMEWORK.map((c, i) => (
          <div key={c.letter} style={{ display: "flex", gap: 12, padding: "12px 16px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
            <span style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: "rgba(201,154,59,0.14)", color: GOLD_DEEP,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800,
            }}>{c.letter}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: INK, margin: "0 0 3px" }}>{c.stage}</p>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>The Universal Objection Method</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10, marginBottom: 20 }}>
        {OBJECTION_METHOD.map((o, i) => (
          <div key={o.step} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, margin: "0 0 4px" }}>Step {i + 1}</p>
            <p style={{ fontWeight: 700, fontSize: 13.5, color: GOLD_DEEP, margin: "0 0 5px" }}>{o.step}</p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, margin: 0 }}>{o.detail}</p>
          </div>
        ))}
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>Ready-to-use templates</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {TEMPLATES.map((t) => (
          <div key={t.name} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 14px" }}>
            <p style={{ fontWeight: 700, fontSize: 12.5, color: INK, margin: "0 0 5px" }}>{t.name}</p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>{t.body}</p>
          </div>
        ))}
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>Vetting checklist — run before accepting any offer</p>
      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "6px 16px", marginBottom: 20 }}>
        {VETTING.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: GOLD_DEEP, width: 16 }}>{i + 1}.</span>
            <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>{v}</span>
          </div>
        ))}
      </div>

      <CalloutBox toneKey="neutral" eyebrow="📋 Self-scoring your mock and real calls">
        Score every recorded call against the six CLOSER stages above, 0–2 points each (0 = skipped, 1 = attempted, 2 = landed cleanly) — 12 points total. Days 9, 19, 26, 41, 42, 43 and 44 all build this rubric directly into the roadmap.
      </CalloutBox>
    </div>
  );
}

function MasteryTab() {
  return (
    <div>
      <h2 style={h2Style}>Mastery</h2>
      <p style={pStyle}>The philosophies and habits underneath the framework — what separates someone running the script from someone who actually believes what they're saying.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {PHILOSOPHIES.map((p) => (
          <div key={p.n} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "rgba(201,154,59,0.14)", color: GOLD_DEEP,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
              }}>{p.n}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: "0 0 3px" }}>{p.title}</p>
                {p.tag && <p style={{ fontSize: 11, color: GOLD_DEEP, fontStyle: "italic", margin: "0 0 6px" }}>{p.tag}</p>}
                <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.65, margin: 0 }}>{p.body}</p>

                {p.extra === "precall" && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <p style={labelStyle}>Interest scale to track</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {INTEREST_LEVELS.map((lvl, i) => (
                          <span key={lvl} style={{
                            fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 20,
                            background: i === INTEREST_LEVELS.length - 1 ? TONE.good.bg : CREAM,
                            color: i === INTEREST_LEVELS.length - 1 ? EMERALD : MUTED,
                            border: `1px solid ${i === INTEREST_LEVELS.length - 1 ? TONE.good.bd : BORDER}`,
                          }}>{lvl}</span>
                        ))}
                      </div>
                    </div>
                    {PRECALL_TEMPLATES.map((t) => (
                      <div key={t.name} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ fontWeight: 700, fontSize: 12, color: INK, margin: "0 0 4px" }}>{t.name}</p>
                        <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>{t.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {p.extra === "freedoms" && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 8, marginBottom: 10 }}>
                      {["⏳ Time Freedom", "💰 Financial Freedom", "🤝 Relationship Freedom"].map((f) => (
                        <div key={f} style={{ background: "rgba(201,154,59,0.08)", border: `1px solid ${TONE.neutral.bd}`, borderRadius: 8, padding: "9px 11px", textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: GOLD_DEEP }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
                      <p style={labelStyle}>The deepening sequence</p>
                      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                        Ask which freedom matters most right now → ask "why does that one matter most?" → ask "what
                        would solving that actually create for you?" Each layer moves them from a surface goal to
                        the real emotional driver underneath it — the "vacation" CLOSER's S stage is built to sell.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>The Top 1% Habit Stack</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10, marginBottom: 24 }}>
        {TOP1_HABITS.map((h) => (
          <div key={h.title} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: INK, margin: "0 0 5px" }}>{h.title}</p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>{h.body}</p>
          </div>
        ))}
      </div>

      <p style={{ ...labelStyle, fontSize: 11, marginBottom: 10 }}>Command Principles</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
        {COMMAND_PRINCIPLES.map((c) => (
          <div key={c.title} style={{ background: "#FFFFFF", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: GOLD_DEEP, margin: "0 0 5px" }}>{c.title}</p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolkitTab() {
  return (
    <div>
      <h2 style={h2Style}>Toolkit & Resources</h2>
      <p style={pStyle}>Every tool this system needs has a $0 path. Paid tiers speed things up — they're never required.</p>

      <CalloutBox toneKey="caution" eyebrow="⚠️ The trap this table exists to prevent">
        A closer role should never require you to pay for leads, licenses, "certification," or software before
        you're allowed to work. If a company asks you to pay for anything before your first commission, that's
        already a red flag on the Vetting Checklist (Scripts tab) — walk away.
      </CalloutBox>

      <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ background: CREAM_DEEP }}>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Need</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>Paid Option</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: EMERALD }}>Free Option</th>
              <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "", color: MUTED }}>$0 Manual Path</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: INK, verticalAlign: "top" }}>{r.need}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: MUTED, verticalAlign: "top" }}>{r.paid}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: EMERALD, verticalAlign: "top" }}>{r.free}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: MUTED, verticalAlign: "top" }}>{r.manual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CalloutBox toneKey="neutral" eyebrow="🧭 Marketplaces, one more time">
        Indeed, Upwork, ZipRecruiter, and Glassdoor are listed above as a manual fallback, not a strategy — the
        Scout tab's direct methods are the actual engine of this system.
      </CalloutBox>
    </div>
  );
}

function AfterTab() {
  return (
    <div>
      <h2 style={h2Style}>Life After Day 45</h2>
      <p style={pStyle}>Certification isn't the finish line — it's where the honest version of this role actually begins.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {AFTER_ROWS.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 14, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px 16px" }}>
            <span style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
              background: i === AFTER_ROWS.length - 1 ? GOLD : "rgba(201,154,59,0.14)",
              color: i === AFTER_ROWS.length - 1 ? "#FFFFFF" : GOLD_DEEP, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, marginTop: 1,
            }}>{i + 1}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: INK, margin: "0 0 4px" }}>{r.d}</p>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.65, margin: 0 }}>{r.t}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${GOLD}`, borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
        <div style={{ ...eyebrowStyle, color: GOLD_DEEP }}>💵 The formula that sets your real income</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: "0 0 8px" }}>Qualified Calls × Close Rate × Average Deal Value × Commission % = Monthly Income</p>
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>Example at Beyond-90 volume: 30 calls × 20% close × $8,000 deal × 10% commission = $4,800/month — the low end of a real range, not its ceiling. Run your own numbers in the Performance Calculator.</p>
      </div>

      <CalloutBox toneKey="good" eyebrow="📈 Set your 30/60/90">
        Day 45's final task asks you to set 30/60/90-day targets and lock in an ongoing scouting cadence. Do both —
        the pipeline that got you here is the same one that keeps paying you after Day 45. It doesn't run itself.
      </CalloutBox>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

export default function TheAscent() {
  const [activeTab, setActiveTab] = useState("start");
  const [checked, setChecked] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setChecked(parsed.checked || {});
        }
      } catch (e) {
        // no saved progress yet — fine, start fresh
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ checked: next, savedAt: Date.now() }), false);
    } catch (e) {
      // best effort — progress still stands for this session either way
    }
  }, []);

  const toggle = useCallback((id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      persist(next);
      return next;
    });
  }, [persist]);

  const handleReset = () => {
    if (!confirmingReset) { setConfirmingReset(true); return; }
    setChecked({});
    persist({});
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

  if (!loaded) {
    return <div style={{ background: CREAM, minHeight: "100vh" }} />;
  }

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #FDF9F0 0%, ${CREAM_DEEP} 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "24px 18px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: CRIMSON, textTransform: "", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, boxShadow: `0 0 6px ${GOLD}`, display: "inline-block" }} />
            45-Day Zero-Capital System
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: `linear-gradient(130deg, #1A140F 20%, ${GOLD} 70%, ${CRIMSON} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Ascent
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, maxWidth: 660, lineHeight: 1.7 }}>
            A 45-day, zero-capital operating system to land a remote, commission-based high-ticket closing seat —
            no paid ads, no paid lead lists, no paid course required. Direct scouting replaces the marketplace scroll.
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
        {activeTab === "niche" && <NicheTab />}
        {activeTab === "scout" && <ScoutTab />}
        {activeTab === "days" && <DaysTab checked={checked} onToggle={toggle} />}
        {activeTab === "scripts" && <ScriptsTab />}
        {activeTab === "mastery" && <MasteryTab />}
        {activeTab === "toolkit" && <ToolkitTab />}
        {activeTab === "after" && <AfterTab />}
      </div>

      {/* CTA FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: "#FFFFFF" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 16px 40px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: MUTED, marginBottom: 12 }}>Go Deeper</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <NextLink to="/global-targeting-manual" icon="🌍" title="Global Targeting Manual" body="Where the target companies actually are worldwide, a 7th lane, and a formal scoring system for any target." />
            <NextLink to="/performance-calculator" icon="🧮" title="Performance Calculator" body="Model your real monthly income at Ramping, Established, and Beyond-90 stages." />
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            🛡️ Progress saves to this device automatically. This system replaces marketplace scrolling with direct scouting — it doesn't replace doing the work.
          </p>
        </div>
      </div>
    </div>
  );
}
