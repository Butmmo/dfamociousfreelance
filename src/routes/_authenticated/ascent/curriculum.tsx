// @ts-nocheck
// THE ASCENT — installed verbatim from the-ascent-2.jsx; only the colour palette
// was remapped to the DFS Regal system so every panel, icon and label stays
// legible. Progress persists to Supabase and access is gated by ascent_access.
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkMyAscentAccess } from "@/lib/ascent.functions";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { SaveBar } from "@/components/dfs/SaveBar";
import { Lock } from "lucide-react";
import {
  Target, CheckCircle2, Circle, ChevronDown, ChevronRight,
  Send, MessageSquare, ShieldCheck, AlertTriangle, TrendingUp, RotateCcw,
  FileText, Phone, Compass, Users, Search, Video
} from 'lucide-react';

export const Route = createFileRoute("/_authenticated/ascent/curriculum")({
  head: () => ({ meta: [
    { title: "The Ascent — DFS Citadel" },
    { name: "description", content: "45-Day Zero-Capital Direct-Scouting Closer System." },
  ] }),
  component: AscentGate,
});

function AscentGate() {
  const check = useServerFn(checkMyAscentAccess);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    check({ data: undefined })
      .then((r) => setStatus(r?.hasAccess ? "granted" : "denied"))
      .catch(() => setStatus("denied"));
  }, [check]);
  if (status === "loading") return <div className="p-10 text-center text-muted-foreground">Verifying Ascent access…</div>;
  if (status === "denied") return (
    <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-gold/40 bg-card p-10 text-center space-y-3 shadow-regal">
      <Lock className="h-10 w-10 text-gold-deep mx-auto" />
      <h1 className="font-display text-2xl">The Ascent is invitation-only</h1>
      <p className="text-sm text-muted-foreground">This programme is granted individually by the Founder. Contact your council admin if you believe you should have access.</p>
    </div>
  );
  return <App />;
}


/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */


const PHASE_META = {
  1: { name: `Phase 01 — Foundation & First Contact`, range: `Days 1–15`,
       scorecard: `By end of Day 15: Warm List built via direct scouting (25+ tiered companies) · proof video + resume + hub live · first warm prospects engaged · bespoke Looms sent to Tier 1 · broader wave sent to Tier 2/3.` },
  2: { name: `Phase 02 — Sustained Scouting & Pipeline`, range: `Days 16–30`,
       scorecard: `By end of Day 30: 40+ additional companies scouted and logged · two full outreach waves sent · 10+ warm prospects engaged · at least one audition or trial close completed · both weekly reviews logged.` },
  3: { name: `Phase 03 — Conversion & Launch`, range: `Days 31–45`,
       scorecard: `By end of Day 45: one role vetted and signed · Warm Prospects handed off on day one · onboarding complete · multiple live calls taken solo · 30/60/90 targets set.` },
};

const NICHES = [
  { id: 'funding', name: `Credit & Business Funding`,
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

  { id: 'dating', name: `Dating & Relationship Coaching`,
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

  { id: 'realestate', name: `Real Estate`,
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

  { id: 'content', name: `Content & Personal Branding`,
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

  { id: 'trading', name: `Trading & Trading Bots`,
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

  { id: 'ai', name: `AI & B2B AI Implementation`,
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
  { key: 'entry', label: 'Entry Ease' },
  { key: 'dealSize', label: 'Deal Size' },
  { key: 'competition', label: 'Low Competition' },
  { key: 'durability', label: 'Durability' },
  { key: 'safety', label: 'Safety' },
  { key: 'fit', label: 'Beginner Fit' },
];

const CLOSER_FRAMEWORK = [
  { letter: 'C', stage: 'Clarify', detail: `Ask why they're really here today — what prompted them to book this call now, specifically. Let them answer in full before you say anything else.` },
  { letter: 'L', stage: 'Label', detail: `Reflect their problem back as a clear, simple label, then ask if that's accurate. Let them confirm or correct it in their own words — don't assume you've got it right.` },
  { letter: 'O', stage: 'Overview', detail: `Ask what they've already tried and why it didn't work. Get the full history before you say a single word about your offer.` },
  { letter: 'S', stage: 'Sell the vacation, not the flight', detail: `Ask them to describe what life looks like once this is solved, in their own words. Then connect the offer to that outcome — not to features, steps, or how it works.` },
  { letter: 'E', stage: 'Explain away concerns', detail: `Meet every objection with a question that surfaces the real concern before you respond to it. Answer the actual worry, not the surface complaint.` },
  { letter: 'R', stage: 'Reinforce the decision', detail: `After they say yes, ask a question that gets them to restate why this was the right call, in their own words. This is what actually prevents remorse and refunds — and it continues through onboarding, not just the call.` },
];

const OBJECTION_METHOD = [
  { step: 'Surface', detail: `Ask a question that gets the real concern out, not the polite version. "What's the actual hesitation?" beats accepting "let me think about it" at face value.` },
  { step: 'Confirm', detail: `Reflect it back and confirm you've got it right before you respond to anything.` },
  { step: 'Respond', detail: `Answer only the real concern you just confirmed — briefly — then ask if that resolves it.` },
];

const TEMPLATES = [
  { name: 'Universal Cold Outreach Opener (swap in your niche)',
    body: `Hey [Name] — been following your content on [specific post/topic], especially [specific detail]. I help [niche] businesses convert more of their qualified leads into paying clients without you needing to be on every single call. Are you currently looking for a closer or setter? Happy to send a 90-second video so you can see how I run one.` },
  { name: 'Day+3 Follow-Up',
    body: `Hey [Name], following up on my note from [day] — totally understand if it's not the right time. If you ever need an extra closer in your corner, I'm one message away. [link to your proof hub]` },
  { name: 'Audition Ask',
    body: `Really appreciate you replying, [Name]. Would you be open to a quick 15-minute call this week so I can show you how I'd run a discovery call with one of your leads? Happy to do a live trial close if that's easier to evaluate.` },
  { name: 'Bespoke Loom Opening Line (Day 13)',
    body: `Hey [Name] — before anything else, I want you to know I actually watched/read [specific piece of their content] before recording this, because a generic pitch wouldn't be fair to what you've built. [Then move into your pitch.]` },
  { name: 'Informational Outreach to an Active Closer (Scout Method 3)',
    body: `Hey [Name] — I'm working on breaking into high-ticket closing in [niche] and came across your profile. Not looking for anything from you except maybe 10 minutes of insight if you're open to it — what's actually changed in this space lately? Happy to return the favor however I can.` },
  { name: 'Warm Prospect Engagement (framing, not a script — Scout Method 4)',
    body: `Lead with something useful, not a pitch: a specific idea, resource, or reframe tied to their stated problem. Never mention any company, program, or offer. If they ask what you do, be honest: "I'm building experience in [niche] — glad I could help either way."` },
  { name: 'The Warm Handoff (Day 39)',
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
  { need: 'Company & lead research', paid: 'Apollo, Clearbit, ZoomInfo — $50–300/mo (data enrichment)', free: 'Not needed — the Scout Method (Scout tab) replaces this entirely', manual: 'This is the system by design: Google search, YouTube, and LinkedIn X-ray search, done by hand. See the Scout tab.' },
  { need: 'Pipeline tracker / CRM', paid: 'Notion paid tier, Close.com, HubSpot — $20–99/mo', free: 'Notion free plan or Google Sheets', manual: 'A plain Google Sheet works fully — update it by hand after every action, no exceptions.' },
  { need: 'Outreach sending', paid: 'Apollo, Instantly — $30–100/mo (auto-sequencing)', free: 'Not automatable at $0 — this is manual by design', manual: 'Personally research and send each message 1-by-1. Budget 2–3 focused hours a day — it is the job.' },
  { need: 'Pitch & mock-call video', paid: 'Loom Business, Riverside', free: 'Loom free tier, or your phone camera', manual: 'Record on your phone, trim with a free video editor app, upload unlisted to YouTube.' },
  { need: 'Call practice partner', paid: 'A paid sales coach — $100–300/session', free: 'Reddit/Discord accountability groups, friends or family', manual: 'Record yourself running both sides of the call. It works — professionals still do this.' },
  { need: 'Proof-of-skill hub', paid: 'Squarespace, Wix — $16–30/mo', free: 'Carrd free tier, a public Notion page, or Linktree', manual: 'A clean, well-formatted Google Doc with view access works if nothing else does.' },
  { need: 'Interview / call platform', paid: 'Zoom Pro', free: 'Google Meet, or Zoom free (40-min cap — enough for most interviews)', manual: '—' },
  { need: 'Scheduling link', paid: 'Calendly paid tiers', free: 'Calendly free tier', manual: 'Coordinate times manually by message — slower, still free.' },
  { need: 'Call review / transcription', paid: 'Otter.ai paid, Gong', free: 'Otter.ai free tier (limited minutes)', manual: 'Re-listen to your own recording and take notes by hand. This is the "7-hour" option — and it works.' },
];

const SCOUT_METHODS = [
  { id: 'search', icon: 'search', title: 'Method 1 — Search Scouting',
    intro: `Use the open web to find companies before they ever think to post a job.`,
    patterns: [
      `"[niche]" coaching "book a call" testimonials`,
      `"[niche]" "high ticket" program apply`,
      `"[niche]" mentor "our clients" results -jobs`,
      `"[niche]" coach podcast interview 2026`,
      `site:linkedin.com/in "[niche] coach" OR "[niche] mentor"  — X-ray search, bypasses LinkedIn's free search limits entirely`,
    ],
    green: `An application or "book a call" page (they run sales calls = candidate target) · specific testimonials naming real results (established, revenue-generating) · a solo founder with no visible team (likely the current bottleneck — prime target)`,
    red: `A dormant page, no clear offer, or no social proof at all` },
  { id: 'youtube', icon: 'video', title: 'Method 2 — YouTube Mining',
    intro: `Premium coaches sell where they build trust — often on camera, long before they ever hire help.`,
    patterns: [
      `Search YouTube for [niche]-relevant terms; open every channel with real engagement, not just subscriber count — check recent views`,
      `Check the About tab and video descriptions for an application or booking link`,
      `Scan recent comments for buying-intent signals — this doubles as Warm Prospect sourcing (Method 4)`,
      `Note whether the channel shows a visible team or just one founder — both are valid targets, for different reasons`,
    ] },
  { id: 'closers', icon: 'users', title: 'Method 3 — Track Active Closers',
    intro: `Other closers' public footprint is free market intelligence — who's hiring, what deals look like right now, and what's actually changed.`,
    patterns: [
      `site:linkedin.com/in "high ticket closer" "[niche]" — X-ray search, no login or limit needed`,
      `site:linkedin.com/in "closer" "[niche] coaching"`,
      `On LinkedIn itself: "high ticket closer" "[niche]" in the main search bar — capitalize AND/OR/NOT, they're the only reliable operators on a free account`,
    ],
    extract: `Which companies they mention (validated targets — if one closer works there, there's often room for another) · deal sizes or commission hints in their posts · whether they seem open to a short, respectful DM` },
];

const INTEREST_LEVELS = ['Not Interested', 'Curious', 'Generally Interested', 'Highly Interested', 'Convicted'];

const PRECALL_TEMPLATES = [
  { name: 'Night-Before WhatsApp Message', body: `Hey [Name], saw we have a meeting tomorrow at [time] about [their goal] — is there any specific question that needs answering that would stop you from showing up?` },
  { name: 'Engagement Follow-Up (send regardless of their reply)', body: `Awesome [Name], I have 2–3 pieces of content that'll give you a ton of clarity:
1. A video of our founder walking through the process
2. Testimonials from people who solved that exact problem, or an FAQ sheet
3. A pre-sales video showing exactly what you'll get within [Product]
What would help most?` },
];

const PHILOSOPHIES = [
  { n: 1, title: 'Pre-Call Preparation', tag: '1-on-1 contact, the night before — not a marketing email', extra: 'precall',
    body: `The top 1% understand marketing, not just selling. Every hour between booking and the call, left without reinforcement, is an hour interest can decay — that's why leads go cold or simply don't show up. Left alone, a prospect treats your call as an educational call, not a buying call: you become an option to research, not a decision to make. Owning your own pre-call touch fixes this. Most leads never fully read a marketing email — that's "spray and pray," not built for their specific situation. A direct, personal message the night before is what actually stacks interest before they arrive.` },
  { n: 2, title: 'Sell Transformations, Not Products',
    body: `Nobody buys a course, a call schedule, or a piece of software. They buy the version of themselves that exists on the other side of it. This is the entire engine behind CLOSER's "S" — Sell the vacation, not the flight (Scripts tab): describe the outcome in their own words, not the mechanism.` },
  { n: 3, title: 'The Three Freedoms Questions', extra: 'freedoms',
    body: `A technique used widely across high-ticket sales training: instead of accepting a surface-level goal, ask which of the three freedoms matters most, then layer deeper. This turns an abstract goal into an emotional one — and it's the actual mechanism for finding "the vacation" in CLOSER's "S" stage, not a guess.` },
  { n: 4, title: 'People Buy Emotionally, Then Justify Logically',
    body: `Most salespeople lead with pain and logic — which isn't how people actually decide, and it creates pushback. People buy emotionally and justify logically afterward. Your job is to connect them to the emotion — the freedoms, the vacation — and the product supplies the logical reasoning they'll use to justify a decision they've already made. This isn't manipulation, it's guidance. Emotion first, logic second.` },
  { n: 5, title: 'Conviction Beats Skill Every Time',
    body: `Sales is a transference of belief — you have to believe in what you're selling. But conviction doesn't mean believing your product will completely transform someone's life. It means being genuinely convinced it's the best next step for where they currently are. That's honest conviction, not hype — and it's what a prospect feels through the phone before they ever hear your logic.` },
];

const TOP1_HABITS = [
  { title: 'Silence After the Ask', body: `After you ask for the decision, or state the price, stop talking. The next person to speak loses leverage. Jumping in to fill silence with a discount or a bonus is negotiating against yourself before anyone even objected.` },
  { title: 'Control Your Tonality at the Close', body: `Consciously slow your pace exactly when the stakes rise. A rushed voice reads as nervous, or worse, pushy. A deliberate, unhurried one reads as conviction.` },
  { title: 'Research Before You Dial', body: `Your pre-call message stacks interest, but the top 1% also review whatever the setter or intake form captured before they ever pick up — they walk in already knowing the situation, not discovering it live.` },
  { title: 'Take Visible Notes', body: `Narrating "let me get that down" while writing what a prospect says does two things: it signals real listening, and it hands you their own words to reflect back later — the Label and Reinforce stages of CLOSER run on exactly this.` },
  { title: 'Treat Your Numbers Like an Athlete Treats Stats', body: `Close rate, average deal size, and which objection actually beat you — reviewed weekly, not felt. Days 22, 29, and 35 already build this into the roadmap; the habit is doing it even after Day 45.` },
  { title: 'Manage Your State Before High-Stakes Calls', body: `Conviction is hard to project from a scattered state. A short, deliberate ritual before a call — stand up, review your notes out loud, remind yourself why this is a genuine next step for this person — protects the belief you're supposed to be transferring.` },
];

const COMMAND_PRINCIPLES = [
  { title: 'Genuine Selectivity, Not Performed Scarcity', body: `Confident positioning only works if it's true. Real criteria for who you work best with, and a genuine willingness to say "this isn't the right fit" — that reads as expertise. Faking it while accepting anyone with a pulse gets sensed immediately, and it torches the trust you're building faster than any pitch can rebuild it.` },
  { title: 'Lead With Fit, Not With Pitch', body: `Opening with "I want to make sure this is a good fit for both of us" does two honest things at once: it signals real standards, and it gets the prospect talking about their own situation before you've said a word about the offer — exactly what CLOSER's Clarify and Overview stages (Scripts tab) are already built to do.` },
  { title: `Respect Hesitation, Don't Override It`, body: `If someone genuinely needs more time on a $2,000–$50,000 decision, that's not an objection to engineer around — it's information. Give them the room, and mean it. Pressuring a hesitant prospect into "recommitting" produces exactly what it sounds like: buyer's remorse, refund requests, and a reputation that costs you the next ten deals to repair the one you rushed.` },
  { title: 'Confidence Is Built, Not Performed', body: `The version of this that actually holds up comes from real wins first — proof assets, a track record, genuine results. Confidence performed before it's earned reads as exactly what it is.` },
];

/* ---------------------------------------------------------------------- */
/* SMALL COMPONENTS                                                        */
/* ---------------------------------------------------------------------- */

function CornerMarks() {
  return (
    <>
      <span className="pointer-events-none absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-signal/60" />
      <span className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-signal/60" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-signal/60" />
      <span className="pointer-events-none absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-signal/60" />
    </>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="relative mb-5 pl-4 border-l-2 border-insignia">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-insignia">{eyebrow}</p>
      <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide leading-tight mt-0.5">{title}</h2>
      {sub && <p className="text-sm text-ink-muted mt-1.5 max-w-2xl">{sub}</p>}
    </div>
  );
}

function ScoreDots({ value }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-insignia' : 'bg-panel-raised border border-line'}`} />
      ))}
    </span>
  );
}

function ScoutIcon({ name, size = 14 }) {
  if (name === 'search') return <Search size={size} />;
  if (name === 'video') return <Video size={size} />;
  if (name === 'users') return <Users size={size} />;
  return <Compass size={size} />;
}

function TaskRow({ item, checked, onToggle }) {
  const isChecked = !!checked[item.id];
  if (item.badge) {
    return (
      <button
        onClick={() => onToggle(item.id)}
        className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 border text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
          isChecked ? 'bg-insignia/10 border-insignia' : 'bg-panel-raised/50 border-line'
        }`}
      >
        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base ${isChecked ? 'bg-insignia' : 'border border-line text-ink-muted'}`}>
          {item.emoji}
        </span>
        <span className={`flex-1 text-sm font-medium ${isChecked ? 'text-insignia' : 'text-slate-200'}`}>{item.text}</span>
        <span className="shrink-0 font-mono text-[11px] text-insignia">+{item.xp} XP</span>
      </button>
    );
  }
  return (
    <button
      onClick={() => onToggle(item.id)}
      className="w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-panel-raised/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      {isChecked ? (
        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-signal" />
      ) : (
        <Circle size={17} className="mt-0.5 shrink-0 text-ink-muted" />
      )}
      <span className={`flex-1 text-sm ${isChecked ? 'text-ink-muted line-through decoration-line' : 'text-slate-200'}`}>{item.text}</span>
      <span className="shrink-0 font-mono text-[11px] text-ink-muted pt-0.5">+{item.xp}</span>
    </button>
  );
}

function DayCard({ dayData, checked, onToggle, expanded, onExpand }) {
  const total = dayData.items.reduce((s, i) => s + (checked[i.id] ? 1 : 0), 0);
  const done = total === dayData.items.length;
  return (
    <div className="relative rounded-lg border border-line bg-panel overflow-hidden">
      <button
        onClick={onExpand}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`font-mono text-xs shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${done ? 'bg-signal border-signal text-ink font-bold' : 'border-line text-ink-muted'}`}>
            {String(dayData.day).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg text-white leading-tight truncate">{dayData.title}</p>
            <p className="text-xs text-ink-muted truncate">{dayData.objective}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] text-ink-muted">{total}/{dayData.items.length}</span>
          {expanded ? <ChevronDown size={16} className="text-ink-muted" /> : <ChevronRight size={16} className="text-ink-muted" />}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-1 border-t border-line">
          {dayData.items.map(item => (
            <TaskRow key={item.id} item={item} checked={checked} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */

function StartTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Mission Briefing" title="What this system does" />
      <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
        This is a 45-day, zero-capital operating system to land a remote, commission-based high-ticket closing seat — built entirely around direct scouting, not marketplaces. No paid ads, no paid lead lists, no paid course required.
      </p>

      <div className="relative rounded-lg border border-alert bg-alert/10 p-4">
        <CornerMarks />
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-alert" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-alert">Read this before Day 1</p>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          $8,000–$40,000/month is a real, achievable range in this industry — not hype. But it's the ceiling of the <em>role</em> once you're closing consistently, not a guarantee for Day 45. This system's job is to get you a <strong className="text-white">signed seat and your first live client conversations by Day 45</strong>. From there, most disciplined closers ramp to strong income over roughly 60–90 days in the seat. Anyone promising you $40k in month one with zero experience is selling a course, not a career. Full ramp math is in <strong className="text-white">Day 46+</strong>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2">How rank &amp; XP work</p>
          <ul className="text-sm text-slate-300 space-y-1.5 leading-relaxed">
            <li>· Every task carries an XP value.</li>
            <li>· Check it off the moment you actually complete it in real life.</li>
            <li>· Your rank climbs automatically, and progress saves on this device.</li>
            <li>· Milestone badges mark real-world events — check them off whenever they happen, even if that's not the exact calendar day shown.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2">How to run this</p>
          <ol className="text-sm text-slate-300 space-y-1.5 leading-relaxed list-decimal list-inside">
            <li>Explore all six lanes in <strong className="text-white">Pick Lane</strong> and choose one — the grading is honest, not the answer.</li>
            <li>Learn the <strong className="text-white">Scout</strong> methods before Day 4 — they power most of the roadmap.</li>
            <li>Work <strong className="text-white">45 Days</strong> in order, pulling scripts, vetting, tools, and the <strong className="text-white">Mastery</strong> philosophies as each day calls for them.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function NicheTab() {
  const [openId, setOpenId] = useState(null);
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Decision Support" title="Grade the six lanes" sub="Honest scoring, 1–5, where 5 is most favorable for a zero-dollar beginner. No lane is disqualified, and none is the 'right answer' — this exists so you choose with open eyes." />

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="bg-panel-raised text-ink-muted font-mono uppercase tracking-wide text-[10px]">
              <th className="text-left px-3 py-2 font-medium">Lane</th>
              {SCORE_LABELS.map(s => <th key={s.key} className="text-left px-2 py-2 font-medium whitespace-nowrap">{s.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {NICHES.map((n, idx) => (
              <tr key={n.id} className={`${idx % 2 ? 'bg-panel/60' : 'bg-panel'} border-t border-line`}>
                <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{n.name}</td>
                {SCORE_LABELS.map(s => <td key={s.key} className="px-2 py-2.5"><ScoreDots value={n.scores[s.key]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        {NICHES.map(n => {
          const open = openId === n.id;
          return (
            <div key={n.id} className="relative rounded-lg border border-line bg-panel overflow-hidden">
              <button onClick={() => setOpenId(open ? null : n.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
                <div>
                  <p className="font-display text-lg text-white">{n.name}</p>
                  <p className="text-xs text-ink-muted mt-1 max-w-xl">{n.verdict}</p>
                </div>
                {open ? <ChevronDown size={18} className="text-ink-muted shrink-0 mt-1" /> : <ChevronRight size={18} className="text-ink-muted shrink-0 mt-1" />}
              </button>
              {open && (
                <div className="px-4 pb-5 pt-1 border-t border-line space-y-4 text-sm">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Who buys</p>
                    <p className="text-slate-300 leading-relaxed">{n.icp}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Deal size</p>
                    <p className="text-slate-300 leading-relaxed">{n.dealSizeText}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Where to find offers</p>
                    <ul className="text-slate-300 space-y-1 mt-1">
                      {n.whereToFind.map((w, i) => <li key={i} className="flex gap-2"><span className="text-insignia">→</span><span>{w}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Common objections</p>
                    <div className="space-y-2 mt-1">
                      {n.objections.map((o, i) => (
                        <div key={i} className="rounded-md bg-panel-raised/60 border border-line p-2.5">
                          <p className="text-slate-200 font-medium">{o.q}</p>
                          <p className="text-ink-muted mt-1">{o.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Sample opener</p>
                    <p className="text-slate-300 leading-relaxed italic bg-panel-raised/60 border border-line rounded-md p-2.5">{n.opener}</p>
                  </div>
                  <div className="rounded-md border border-alert/50 bg-alert/10 p-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-alert mb-1">Watch out</p>
                    <p className="text-slate-200 leading-relaxed">{n.watchOut}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoutTab() {
  return (
    <div className="space-y-7">
      <SectionHeading eyebrow="The Engine" title="Scout: find what marketplaces can't show you" />

      <div className="relative rounded-lg border border-signal bg-signal/10 p-4">
        <CornerMarks />
        <p className="text-sm text-slate-200 leading-relaxed">
          Most solo coaches and small teams running a $2,000–$50,000 offer have never posted a job anywhere public. They don't have an HR department — they hire through their network, or by saying yes to a great cold pitch that lands at the right time. Marketplaces only show you the sliver of this market that's already decided to recruit formally. Everything below is built to find the much larger, invisible rest of it.
        </p>
      </div>

      {SCOUT_METHODS.map(m => (
        <div key={m.id} className="rounded-lg border border-line bg-panel p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2 flex items-center gap-2"><ScoutIcon name={m.icon} /> {m.title}</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{m.intro}</p>
          <div className="space-y-1.5">
            {m.patterns.map((p, i) => (
              <div key={i} className="rounded bg-panel-raised/60 border border-line px-3 py-2 font-mono text-xs text-slate-200 leading-relaxed">{p}</div>
            ))}
          </div>
          {m.green && (
            <div className="mt-3">
              <p className="text-xs text-signal font-medium mb-1">Green flags</p>
              <p className="text-xs text-slate-300 leading-relaxed">{m.green}</p>
            </div>
          )}
          {m.red && (
            <div className="mt-2">
              <p className="text-xs text-alert font-medium mb-1">Red flags</p>
              <p className="text-xs text-slate-300 leading-relaxed">{m.red}</p>
            </div>
          )}
          {m.extract && (
            <div className="mt-3">
              <p className="text-xs text-signal font-medium mb-1">What to extract</p>
              <p className="text-xs text-slate-300 leading-relaxed">{m.extract}</p>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2 flex items-center gap-2"><MessageSquare size={14} /> Method 4 — Warm Prospect Sourcing</p>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">The single most powerful proof you can bring to a company you haven't been hired by yet: real, warmed interest.</p>
        <p className="text-xs text-signal font-medium mb-1">Where to look</p>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">Niche-relevant subreddits, Facebook groups, comment sections, and forums where people openly describe the exact pain your niche's offer solves.</p>
        <p className="text-xs text-alert font-medium mb-1.5">Three ground rules — non-negotiable</p>
        <div className="space-y-1.5 mb-3">
          {[
            `Never claim to represent a company you don't work for yet`,
            `Never collect payment or make a promise on a company's behalf`,
            `Give real, useful value — no strings attached, every time`,
          ].map((rule, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-200"><span className="text-alert font-mono shrink-0">{i + 1}.</span><span>{rule}</span></div>
          ))}
        </div>
        <p className="text-xs text-signal font-medium mb-1">How to use it</p>
        <p className="text-xs text-slate-300 leading-relaxed">Mention specific examples (first names only) to target companies as proof of your instinct. Once you're onboarded, make the formal introduction — see Day 39, the Warm Handoff.</p>
      </div>

      <div className="rounded-lg border border-line bg-panel-raised/40 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Where marketplaces still fit</p>
        <p className="text-sm text-slate-300 leading-relaxed">Indeed, Upwork, ZipRecruiter, and Glassdoor aren't off-limits — Days 21 and 28 schedule a light 15-minute check-in on purpose. But they only surface the fraction of this market that's already decided to recruit publicly. Everything above is built to find the much larger, invisible fraction first.</p>
      </div>
    </div>
  );
}

function DaysTab({ checked, onToggle }) {
  const [expanded, setExpanded] = useState({ 1: true });
  const toggleDay = (d) => setExpanded(prev => ({ ...prev, [d]: !prev[d] }));

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Field Manual" title="The 45 days" sub="One universal roadmap — the WHAT changes with your niche (who you target, what you say), the HOW stays the same. Pull specifics from Pick Lane, Scout, and Scripts as you go." />
      {[1, 2, 3].map(phase => (
        <div key={phase} className="space-y-3">
          <div className="relative rounded-lg border border-line bg-paper p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#6B5D3F' }}>{PHASE_META[phase].name} · {PHASE_META[phase].range}</p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#6B5D3F' }}>{PHASE_META[phase].scorecard}</p>
          </div>
          <div className="space-y-2.5">
            {DAYS.filter(d => d.phase === phase).map(d => (
              <DayCard
                key={d.day}
                dayData={d}
                checked={checked}
                onToggle={onToggle}
                expanded={!!expanded[d.day]}
                onExpand={() => toggleDay(d.day)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScriptsTab() {
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Reference" title="Framework, scripts & vetting" />

      <div className="relative rounded-lg border border-insignia bg-insignia/10 p-4">
        <CornerMarks />
        <p className="font-mono text-[11px] uppercase tracking-widest text-insignia mb-1.5">The one rule above every framework</p>
        <p className="text-sm text-slate-200 leading-relaxed">Marketing educates. Selling asks. If you catch yourself explaining more than you're asking on a call, you've slipped into pitching too early — the single most common way beginners lose deals they were actually going to win. Every stage below is built to keep you asking.</p>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-1 flex items-center gap-2"><Compass size={14} /> The CLOSER Framework</p>
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">Built and popularized by Alex Hormozi, and taught widely across high-ticket sales training since — including by closers-turned-trainers like Alex Beck. It works because every step is a question that gets <em>them</em> talking, not a script that gets you telling.</p>
        <div className="space-y-2">
          {CLOSER_FRAMEWORK.map((f, i) => (
            <div key={i} className="rounded-lg border border-line bg-panel p-3.5">
              <p className="font-display text-base text-white">{f.letter} — {f.stage}</p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-3 flex items-center gap-2"><ShieldCheck size={14} /> The Universal Objection Method</p>
        <div className="grid sm:grid-cols-3 gap-2.5">
          {OBJECTION_METHOD.map((o, i) => (
            <div key={i} className="rounded-lg border border-line bg-panel p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-insignia mb-1">{i + 1}. {o.step}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{o.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-muted mt-2.5">Niche-specific objections, already written in this style, live on every card under Pick Lane — this method is what makes any of them work.</p>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-3 flex items-center gap-2"><Send size={14} /> Templates</p>
        <div className="space-y-3">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="rounded-lg border border-line bg-panel p-3.5">
              <p className="font-mono text-[11px] text-insignia uppercase tracking-wide mb-1.5">{t.name}</p>
              <p className="text-sm text-slate-300 leading-relaxed italic">{t.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-3 flex items-center gap-2"><ShieldCheck size={14} /> Universal Vetting Checklist</p>
        <div className="rounded-lg border border-line bg-panel p-4 space-y-2.5">
          {VETTING.map((v, i) => (
            <div key={i} className="flex gap-2.5 text-sm">
              <span className="font-mono text-insignia shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-slate-300 leading-relaxed">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal mb-3 flex items-center gap-2"><FileText size={14} /> Mock-Call Self-Score Rubric</p>
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-sm text-slate-300 leading-relaxed">Score yourself 1–5 on each after every recorded call: <span className="text-slate-200">opened with a clear frame</span> · <span className="text-slate-200">asked more than you talked</span> · <span className="text-slate-200">surfaced a real problem in their words</span> · <span className="text-slate-200">connected pain to the offer before pitching</span> · <span className="text-slate-200">asked plainly for the decision</span>. Anything under a 3 is your next mock call's focus.</p>
        </div>
      </div>
    </div>
  );
}

function MasteryTab() {
  return (
    <div className="space-y-7">
      <SectionHeading eyebrow="Beyond The Framework" title="The Top 1% Standard" sub="CLOSER gives you the skeleton of a call. This is the muscle — the philosophies and habits that separate a closer who's competent from one who's dangerous." />

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-insignia mb-3">The Five Core Philosophies</p>
        <div className="space-y-3">
          {PHILOSOPHIES.map(p => (
            <div key={p.n} className="rounded-lg border border-line bg-panel p-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-insignia text-sm">{String(p.n).padStart(2, '0')}</span>
                <p className="font-display text-lg text-white leading-tight">{p.title}</p>
              </div>
              {p.tag && <p className="text-xs text-ink-muted italic mt-0.5">{p.tag}</p>}
              <p className="text-sm text-slate-300 leading-relaxed mt-2">{p.body}</p>

              {p.extra === 'precall' && (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs text-signal font-medium mb-1.5">The Five Interest Levels — track where a lead sits before and during a call</p>
                    <div className="flex flex-wrap gap-1.5">
                      {INTEREST_LEVELS.map((lvl, i) => (
                        <span key={i} className="font-mono text-[10px] uppercase tracking-wide text-slate-200 bg-panel-raised/60 border border-line rounded-full px-2.5 py-1">
                          {i + 1}. {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                  {PRECALL_TEMPLATES.map((t, i) => (
                    <div key={i} className="rounded-md bg-panel-raised/60 border border-line p-2.5">
                      <p className="font-mono text-[10px] text-insignia uppercase tracking-wide mb-1">{t.name}</p>
                      <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-line">{t.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {p.extra === 'freedoms' && (
                <div className="mt-3 space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {['Time Freedom', 'Financial Freedom', 'Location Freedom'].map((f, i) => (
                      <span key={i} className="font-mono text-[10px] uppercase tracking-wide text-ink bg-insignia rounded-full px-2.5 py-1">{f}</span>
                    ))}
                  </div>
                  <div className="rounded-md bg-panel-raised/60 border border-line p-2.5 space-y-1">
                    {['Which is most important to you?', 'Why? What does that mean for you?', 'What can that create for you?'].map((q, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-relaxed">→ "{q}"</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-insignia mb-1">The Top 1% Habit Stack</p>
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">Six more patterns worth stealing — not replacements for the five philosophies above, reinforcements of them.</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {TOP1_HABITS.map((h, i) => (
            <div key={i} className="rounded-lg border border-line bg-panel p-3.5">
              <p className="text-sm text-slate-200 font-medium mb-1">{h.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{h.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-insignia mb-1">Command, Don't Chase</p>
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">A closer who needs the deal reads as needy — and neediness kills conversion faster than any objection ever will.</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {COMMAND_PRINCIPLES.map((c, i) => (
            <div key={i} className="rounded-lg border border-line bg-panel p-3.5">
              <p className="text-sm text-slate-200 font-medium mb-1">{c.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-muted leading-relaxed mt-3 italic">The science behind this is real: a meta-analysis of 42 studies found that simply reminding someone they're free to decide measurably increases how comfortable people feel saying yes — not because it tricks them, but because removing pressure removes the resistance pressure creates. Use it because you mean it, not as a timed maneuver.</p>
      </div>
    </div>
  );
}

function ToolkitTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Zero-Capital Stack" title="Free toolkit" sub="Every need on this system has a $0 path. Paid tools are listed only as accelerants, never requirements." />

      <div className="relative rounded-lg border border-alert bg-alert/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-alert" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-alert">The one trap to avoid</p>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          You do not need to pay for a "High Ticket Closer Certification" to get hired. These programs commonly run $2,500–$20,000. Most legitimate hiring companies care about one thing: can you demonstrate skill on a real or mock call? Your proof video and mock-call recording from Days 8–9 do the same job a $10,000 certificate claims to do. Save your money.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-panel-raised text-ink-muted font-mono uppercase tracking-wide text-[10px]">
              <th className="text-left px-3 py-2.5 font-medium">Need</th>
              <th className="text-left px-3 py-2.5 font-medium">Paid accelerant</th>
              <th className="text-left px-3 py-2.5 font-medium">Free option</th>
              <th className="text-left px-3 py-2.5 font-medium">$0 manual path</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((r, i) => (
              <tr key={i} className={`${i % 2 ? 'bg-panel/60' : 'bg-panel'} border-t border-line align-top`}>
                <td className="px-3 py-3 text-slate-200 font-medium whitespace-nowrap">{r.need}</td>
                <td className="px-3 py-3 text-ink-muted">{r.paid}</td>
                <td className="px-3 py-3 text-signal">{r.free}</td>
                <td className="px-3 py-3 text-slate-300">{r.manual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-line bg-panel-raised/40 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Where marketplaces fit</p>
        <p className="text-sm text-slate-300 leading-relaxed">Indeed, Upwork, ZipRecruiter, and Glassdoor are real and worth the scheduled 15-minute checks on Days 21 and 28 — but they're a safety net for this system, not the engine. The engine is the Scout tab.</p>
      </div>
    </div>
  );
}

function AfterTab() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Beyond the System" title="Day 46 and onward" sub="The honest version of what happens next, anchored to time in the seat — not the calendar." />

      <div className="space-y-3">
        {[
          { d: 'The Moment You Sign', t: 'Around Day 36 in this system. You\u2019re walking in with a Warm Prospects handoff already in hand — a rare position for someone who started at zero 36 days earlier.' },
          { d: 'First 30 Days In The Seat', t: 'You are still ramping. Expect inconsistency — some calls will go well, some won\u2019t. This is normal; even experienced reps typically need 3+ months to reach full productivity in a new role.' },
          { d: '60–90 Days In The Seat', t: 'This is realistically where the framework becomes second nature, objection handling sharpens, and your close rate stabilizes.' },
          { d: 'Beyond 90 Days In The Seat', t: 'The $8,000–$40,000/month range this system was built around becomes genuinely achievable — it is real money real closers make in this industry — earned through call volume and close-rate discipline, not granted by landing the seat.' },
        ].map((row, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-line bg-panel p-4">
            <p className="font-mono text-xs text-insignia shrink-0 w-32 pt-0.5">{row.d}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{row.t}</p>
          </div>
        ))}
      </div>

      <div className="relative rounded-lg border border-signal bg-signal/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-signal" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-signal">The formula that actually sets your income</p>
        </div>
        <p className="font-mono text-sm text-white">Qualified Calls × Close Rate × Average Deal Value × Commission % = Monthly Income</p>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Example: 30 calls × 20% close rate × $8,000 deal × 10% commission = $4,800/month. Push close rate to 30% or deal value to $15k on the same 30 calls, and you're well past $10k. This is the lever panel you're actually pulling after Day 45 — not luck.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-panel p-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          One last thing: don't let the Scout Method go quiet once you land a seat. Keep running it lightly — even 2–3 new companies scouted a week keeps optionality alive, and it's exactly how top closers eventually negotiate better splits or move to bigger tickets.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP                                                                      */
/* ---------------------------------------------------------------------- */

function App() {
  const [activeTab, setActiveTab] = useState('start');
  const [checked, setChecked, syncMeta] = useSyncedTaskMap('ascent');
  const [confirmingReset, setConfirmingReset] = useState(false);


  const persist = useCallback(async () => { /* auto-persisted via useSyncedTaskMap */ }, []);

  const toggleItem = useCallback((id) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetProgress = useCallback(() => {
    setChecked({});
    persist({});
    setConfirmingReset(false);
  }, [persist]);

  const allItems = useMemo(() => DAYS.flatMap(d => d.items), []);
  const badgeItems = useMemo(() => allItems.filter(i => i.badge), [allItems]);
  const totalXP = useMemo(() => allItems.reduce((s, i) => s + i.xp, 0), [allItems]);
  const earnedXP = useMemo(() => allItems.reduce((s, i) => s + (checked[i.id] ? i.xp : 0), 0), [allItems, checked]);
  const percent = totalXP ? Math.min(100, Math.round((earnedXP / totalXP) * 100)) : 0;

  const rankIndex = useMemo(() => {
    let idx = 0;
    RANKS.forEach((r, i) => { if (percent >= r.threshold) idx = i; });
    return idx;
  }, [percent]);
  const currentRank = RANKS[rankIndex];

  return (
    <div className="min-h-screen bg-ink font-body text-slate-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Big Shoulders Display', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .bg-ink {
          background-color: #F5EFDF;
          background-image:
            linear-gradient(rgba(184,134,11,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,134,11,0.06) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .bg-panel { background-color: #FFFFFF; }
        .bg-panel-raised { background-color: #FBF6E9; }
        .bg-paper { background-color: #1A1410; }
        .border-line { border-color: #E8DCC0; }
        .text-ink-muted { color: #6B5D3F; }
        .text-signal { color: #0D7A5F; }
        .bg-signal { background-color: #0D7A5F; }
        .border-signal { border-color: #0D7A5F; }
        .text-insignia { color: #B8860B; }
        .bg-insignia { background-color: #B8860B; }
        .border-insignia { border-color: #B8860B; }
        .text-alert { color: #8B2E1F; }
        .border-alert { border-color: #8B2E1F; }
        .bg-alert\\/10 { background-color: rgba(224,87,74,0.1); }
        .bg-signal\\/10 { background-color: rgba(69,199,176,0.1); }
        .bg-insignia\\/10 { background-color: rgba(217,164,65,0.1); }
        .border-insignia\\/50 { border-color: rgba(217,164,65,0.5); }
        .border-alert\\/50 { border-color: rgba(224,87,74,0.5); }
        .bg-panel-raised\\/50 { background-color: rgba(35,40,51,0.5); }
        .bg-panel-raised\\/60 { background-color: rgba(35,40,51,0.6); }
        .hover\\:bg-panel-raised\\/60:hover { background-color: rgba(35,40,51,0.6); }
        .bg-ink\\/95 { background-color: rgba(18,21,26,0.95); }
        .focus-visible\\:outline-signal:focus-visible { outline-color: #0D7A5F; }
        .decoration-line { text-decoration-color: #E8DCC0; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-line" style={{ backgroundColor: 'rgba(18,21,26,0.96)' }}>
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="font-display text-3xl text-white tracking-wide leading-none">THE ASCENT</h1>
              <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.2em] mt-1">45-Day Zero-Capital Direct-Scouting Closer System</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-insignia uppercase tracking-wider">{currentRank.name}</p>
              <p className="font-mono text-[11px] text-ink-muted">{earnedXP} / {totalXP} XP</p>
            </div>
          </div>

          <div className="mt-3 flex gap-1" aria-label={`Progress: ${percent}%`}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < Math.round(percent / 5) ? 'bg-insignia' : 'bg-panel-raised border border-line'}`} />
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap pb-3">
            <div className="flex gap-1.5 flex-wrap">
              {badgeItems.map(b => (
                <span
                  key={b.id}
                  title={b.text}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${checked[b.id] ? 'bg-insignia border-insignia' : 'border-line text-ink-muted opacity-50'}`}
                >
                  {b.emoji}
                </span>
              ))}
            </div>
            {confirmingReset ? (
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-ink-muted">Erase all progress?</span>
                <button onClick={resetProgress} className="text-alert underline">Yes, reset</button>
                <button onClick={() => setConfirmingReset(false)} className="text-ink-muted underline">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmingReset(true)} className="flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
                <RotateCcw size={11} /> Reset progress
              </button>
            )}
          </div>
        </div>

        <nav className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2.5 -mt-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`shrink-0 font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
                activeTab === t.id ? 'bg-signal border-signal text-ink font-semibold' : 'border-line text-ink-muted hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-16">
        {activeTab === 'start' && <StartTab />}
        {activeTab === 'niche' && <NicheTab />}
        {activeTab === 'scout' && <ScoutTab />}
        {activeTab === 'days' && <DaysTab checked={checked} onToggle={toggleItem} />}
        {activeTab === 'scripts' && <ScriptsTab />}
        {activeTab === 'mastery' && <MasteryTab />}
        {activeTab === 'toolkit' && <ToolkitTab />}
        {activeTab === 'after' && <AfterTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-8">
        <p className="text-[11px] text-ink-muted font-mono">Progress saves locally to this artifact on this device. {currentRank.blurb}</p>
      </footer>
    <SaveBar status={syncMeta.status} lastSavedAt={syncMeta.lastSavedAt} pendingCount={syncMeta.pendingCount} onSave={syncMeta.saveNow} />
      </div>
  );
}
