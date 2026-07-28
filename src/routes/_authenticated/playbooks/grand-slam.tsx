// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
import { createFileRoute } from "@tanstack/react-router";
import { useSyncedTaskMap } from "@/lib/playbook-progress";
import { SaveBar } from "@/components/dfs/SaveBar";
import { useState } from "react";

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */

const PHASES = [
  {
    id: "setup", num: "01", icon: "⚡", color: "#3B82F6",
    title: "Set Up Your Free Arsenal", tag: "Day 1",
    tasks: [
      { id: "s1", text: "Sign up at Outscraper.com (free tier — your main lead scraper)" },
      { id: "s2", text: "Create Apollo.io account — 50 free verified emails per month" },
      { id: "s3", text: "Create Hunter.io account — 25 free email finds per month" },
      { id: "s4", text: "Sign up for Notion CRM (free for up to 3 users)" },
      { id: "s5", text: "Create Make.com account (free, 1,000 automation operations/month)" },
      { id: "s6", text: "Set up Calendly and add your real weekly availability" },
      { id: "s7", text: "Install Loom — record a 30-second test clip to get comfortable" },
    ],
    note: "Total cost today: $0. You only start spending money after your first client pays you.",
  },
  {
    id: "niche", num: "02", icon: "🎯", color: "#6366F1",
    title: "Lock In Your Niche", tag: "Day 1–2",
    tasks: [
      { id: "n1", text: "Choose ONE niche only to start — dental, real estate, and beauty close fastest" },
      { id: "n2", text: "Choose ONE city to target first (any city with 100k+ population works)" },
      { id: "n3", text: "Find 5 real businesses in your niche with weak or missing websites on Google Maps" },
      { id: "n4", text: "Read their Google reviews — write down every 'hard to reach' or 'no online booking' complaint" },
      { id: "n5", text: "Write one sentence: 'My clients get [outcome] in [timeframe]' — your positioning statement" },
    ],
    note: "Customer complaints = your pitch. 5 reviews saying 'hard to book' means you sell 'easy online booking in 14 days'.",
  },
  {
    id: "leads", num: "03", icon: "🗺️", color: "#8B5CF6",
    title: "Build Your Lead List", tag: "Day 2–3",
    tasks: [
      { id: "l1", text: "Open Google Maps → search '[niche] [city]' e.g. 'dentist Leeds' or 'hair salon Lagos'" },
      { id: "l2", text: "Scan the top 20 results — mentally flag any business with a weak or absent website" },
      { id: "l3", text: "In Outscraper, paste the same search → export 100 businesses as a CSV file" },
      { id: "l4", text: "Repeat with 2 more search term variations in the same niche" },
      { id: "l5", text: "Import the full CSV into Notion CRM — set all stage fields to 'Scraped'" },
    ],
    note: "Target: 200–300 raw leads imported. You'll filter these down to your 30 gold prospects in the next phase.",
  },
  {
    id: "qualify", num: "04", icon: "🔥", color: "#F59E0B",
    title: "Find the HOT Leads", tag: "Day 3–4",
    tasks: [
      { id: "q1", text: "Open each lead's Google listing — scan for hot signals and cold flags (use the Score tab)" },
      { id: "q2", text: "Score each lead and tag any score of 7+ as HOT in Notion CRM" },
      { id: "q3", text: "Archive or delete all leads with a -3 cold signal (franchise chains, government entities)" },
      { id: "q4", text: "Goal: 30 confirmed HOT leads ready before you send a single email" },
    ],
    note: "30 HOT leads beat 300 random ones every time. This step alone separates closers from chasers.",
  },
  {
    id: "emails", num: "05", icon: "📧", color: "#10B981",
    title: "Get the Owner's Direct Email", tag: "Day 4–5",
    tasks: [
      { id: "e1", text: "Check the Google Business Profile 'About' tab for email — takes 5 seconds per lead" },
      { id: "e2", text: "Visit their website /contact page or footer for the owner's direct address" },
      { id: "e3", text: "No email found? Paste their domain into Apollo.io to find one" },
      { id: "e4", text: "Apollo blank? Try Hunter.io with the same domain" },
      { id: "e5", text: "Last resort only: find the owner on LinkedIn → connect → message after they accept" },
      { id: "e6", text: "Log every email found in Notion CRM — move their stage to 'Ready to Contact'" },
    ],
    note: "info@ goes to an employee. The owner's direct email gets 3× the reply rate. Always dig deeper.",
  },
  {
    id: "offer", num: "06", icon: "💎", color: "#EC4899",
    title: "Build Your Grand Slam Offer", tag: "Day 5–6",
    tasks: [
      { id: "o1", text: "Write the Dream Outcome — what transformation does the client actually get? Not the deliverable" },
      { id: "o2", text: "Build a live demo using the prospect's actual business name and real branding" },
      { id: "o3", text: "Record a 90-second Loom walkthrough of that demo" },
      { id: "o4", text: "Commit to a 14-day delivery deadline — put it in your pitch and mean it" },
      { id: "o5", text: "Write your ease line: 'I need 1 hour of your time. I handle absolutely everything else.'" },
      { id: "o6", text: "Go to the Grand Slam tab → fill in all 4 parts → your cold email pitch auto-generates" },
      { id: "o7", text: "Test your pitch on a friend — can they understand it completely in 30 seconds?" },
    ],
    note: "Grand Slam = Dream Outcome + Proof + Speed + Ease. Four parts. One offer they can't logically refuse.",
  },
  {
    id: "send", num: "07", icon: "🚀", color: "#14B8A6",
    title: "Send, Follow Up, Get Paid", tag: "Week 2 onwards",
    tasks: [
      { id: "se1", text: "Send your first 10 cold emails manually — personalise each one individually" },
      { id: "se2", text: "Day 3 follow-up: use a completely different angle — a stat, a question, a fresh insight. Never 'just checking in'" },
      { id: "se3", text: "Day 7 follow-up: include your Loom demo link if not already shared" },
      { id: "se4", text: "Every reply → move to Notion 'Replied' stage → book a Calendly discovery call immediately" },
      { id: "se5", text: "Close your first Quick Win project ($300–600) and deliver in 10 days or fewer" },
      { id: "se6", text: "On delivery day: introduce the Full Presence upsell ($800–1,500)" },
      { id: "se7", text: "After the second project: pitch the Care Retainer ($200–400/month) — your recurring income foundation" },
    ],
    note: "Your first $500 client teaches more than six months of preparation. Send those 10 emails before perfecting anything else.",
  },
];

const GSO = [
  {
    id: "dream", icon: "🌟", color: "#F59E0B",
    title: "Dream Outcome",
    q: "What does your client REALLY want?",
    hint: "Not a website. Not a booking system. What life changes for them when you deliver?",
    ph: "e.g. Never miss a lead again. Fully booked 3 weeks in advance. Look like the most professional business in their area...",
    eg: "Your salon is fully booked every week. Clients book themselves online at midnight. You wake up to appointment notifications instead of missed calls.",
  },
  {
    id: "proof", icon: "🎯", color: "#6366F1",
    title: "Proof of Delivery",
    q: "Why should they believe YOU will deliver?",
    hint: "Build a demo with their actual brand before you pitch. Record a Loom showing it. Proof destroys objections before they even form.",
    ph: "e.g. I've already built a live preview at [theirbusiness.com/preview] using your actual logo and services — you can see it right now...",
    eg: "I've built a working preview of your new site using your actual logo, your services, and a live booking calendar. You can see it right now — no commitment needed.",
  },
  {
    id: "speed", icon: "⚡", color: "#10B981",
    title: "Time to Value",
    q: "How fast do they see results?",
    hint: "A 14-day delivery deadline turns a 'maybe later' into 'let's start'. Name the date. Own the deadline.",
    ph: "e.g. Your complete site goes live in 14 days. Your booking calendar starts accepting appointments from Day 1...",
    eg: "Your complete booking system launches in 14 days. Your Calendly link is active from Day 1 so you start taking appointments before the full site even goes live.",
  },
  {
    id: "ease", icon: "🛋️", color: "#EC4899",
    title: "Effort from Their Side",
    q: "How LITTLE do they have to do?",
    hint: "They're busy running a business. Reduce the barrier to 'yes' to near zero. One hour. One meeting. You do everything else.",
    ph: "e.g. I need just one hour of your time for onboarding. I write all the copy, design the site, configure CRM, and handle the full launch...",
    eg: "I need one hour of your time. You share your logo and a few photos. I write all the copy, design everything, configure the booking system, and handle the complete launch.",
  },
];

const HOT = [
  { pts: 3, label: "No website link in Google listing at all", why: "Invisible online — you ARE the solution" },
  { pts: 2, label: "Website exists but is outdated or not mobile-friendly", why: "They know the problem; haven't fixed it yet" },
  { pts: 2, label: "Under 25 Google reviews total", why: "Low digital engagement = your opening" },
  { pts: 2, label: "Independently owned, single location only", why: "You're emailing the actual decision-maker" },
  { pts: 2, label: "Reviews mention 'hard to book' or 'hard to contact'", why: "Customers are already calling for your solution" },
  { pts: 2, label: "Since Last Review — no new Google review in over a week", why: "Silent flywheel: reputation isn't compounding, they need your review-request automation" },
  { pts: 2, label: "Reviews not Responded — fewer than 40% of reviews have an owner reply", why: "Owner is disengaged from reputation management — easy win to pitch a done-for-you response system" },
  { pts: 1, label: "Business is 3–10 years old", why: "Budget exists; too busy to fix it themselves" },
  { pts: 1, label: "High-margin niche: dental, legal, med spa, real estate", why: "Fast, obvious ROI makes your fee easy to justify" },
];

const COLD = [
  { pts: -3, label: "Part of a franchise or chain", why: "Corporate controls their tech — instant skip" },
  { pts: -3, label: "Government or municipal entity", why: "Procurement cycles take months, not days" },
  { pts: -2, label: "Already has a fast, modern, mobile-first website", why: "Likely already has a digital partner" },
  { pts: -2, label: "200+ reviews with regular recent responses", why: "Active agency or marketing team already in place" },
  { pts: -1, label: "No physical address — online only", why: "Harder to verify; lower trust baseline" },
];

const LADDER = [
  { num: "01", icon: "🌱", color: "#10B981", name: "Quick Win", price: "$300–600", tag: "One-time", yours: true,
    what: "Landing page, Google-optimised, contact form, mobile-first. Delivered in under 10 days.",
    up: `"Now let's add CRM so you don't lose a single lead this page brings in."` },
  { num: "02", icon: "🌐", color: "#3B82F6", name: "Full Presence", price: "$800–1,500", tag: "One-time", yours: true,
    what: "Multi-page website + Notion CRM setup + Calendly booking integration. The full digital shop front.",
    up: `"Now let's add email marketing so those visitors keep coming back as repeat customers."` },
  { num: "03", icon: "⚡", color: "#8B5CF6", name: "Custom System", price: "$2,000–4,000", tag: "One-time", yours: true,
    what: "Custom Bubble.io or Adalo app + Make.com automation + CRM + Klaviyo email marketing. The full stack.",
    up: `"Let me stay on as your tech partner so this keeps performing and growing."` },
  { num: "04", icon: "🔄", color: "#F59E0B", name: "Care Retainer", price: "$200–400", tag: "/month", yours: true,
    what: "Monthly updates, uptime monitoring, content changes, priority support. Passive recurring income for you.",
    up: `"Want me to also manage your email campaigns every month?"` },
  { num: "05", icon: "📈", color: "#EC4899", name: "Growth Retainer", price: "$400–800", tag: "/month", yours: true,
    what: "Klaviyo campaigns designed and sent monthly + analytics report + CRM hygiene. Real growth work.",
    up: `"Want me to bring in a paid ads specialist to feed leads directly into this system?"` },
  { num: "06", icon: "📣", color: "#6E6459", name: "Paid Ads Management", price: "Refer + 10–20%", tag: "Partner", yours: false,
    what: "Partner with a trusted Google/Meta ads specialist. You earn a referral fee and stay as the client's primary relationship owner." },
  { num: "07", icon: "🔎", color: "#6E6459", name: "Advanced SEO", price: "Refer + 10–20%", tag: "Partner", yours: false,
    what: "Partner with an SEO specialist for content strategy and link-building. Don't attempt solo while still mastering CRM." },
];

const TOOL_CATS = [
  { cat: "Find Leads", color: "#6366F1", tools: [
    { name: "Outscraper", cost: "~$3/1K leads", url: "outscraper.com", desc: "Bulk Google Maps extraction. Set your search + city, export hundreds of leads as CSV in minutes. Your main workhorse." },
    { name: "PhantomBuster", cost: "Free trial", url: "phantombuster.com", desc: "LinkedIn + Google Maps automation for targeted niche and location scraping." },
  ]},
  { cat: "Find Emails", color: "#10B981", tools: [
    { name: "Apollo.io", cost: "Free · 50/mo", url: "apollo.io", desc: "Email + LinkedIn enrichment from any domain name. Your first stop when an email is missing." },
    { name: "Hunter.io", cost: "Free · 25/mo", url: "hunter.io", desc: "Domain-to-email finder with confidence scores. Only use addresses rated 80% or higher." },
    { name: "Snov.io", cost: "Free · 50/mo", url: "snov.io", desc: "Email finder and verifier. Your third backup if Apollo and Hunter both draw blanks." },
  ]},
  { cat: "Send Cold Outreach", color: "#F59E0B", tools: [
    { name: "Instantly.ai", cost: "$37/mo", url: "instantly.ai", desc: "Cold email at scale. Only activate once you have 50+ hot leads validated and loaded." },
    { name: "Lemlist", cost: "$39/mo", url: "lemlist.com", desc: "Cold email + LinkedIn outreach + personalised image thumbnails per email. Great for visual niches." },
  ]},
  { cat: "Automate Everything", color: "#3B82F6", tools: [
    { name: "Make.com", cost: "Free · 1K ops/mo", url: "make.com", desc: "Your silent automation engine. Connects Outscraper → Apollo → Notion → Instantly without you lifting a finger." },
  ]},
  { cat: "CRM & Nurture", color: "#EC4899", tools: [
    { name: "Notion CRM", cost: "Free · 3 users", url: "notion.com/crm", desc: "Your full pipeline. Stages: Scraped → Contacted → Replied → Discovery Call → Proposal → Closed." },
    { name: "Klaviyo", cost: "Free · <250 contacts", url: "klaviyo.com", desc: "Email nurture sequences for leads who don't respond immediately. Stay visible until they're ready." },
  ]},
  { cat: "Close & Get Paid", color: "#14B8A6", tools: [
    { name: "Calendly", cost: "Free", url: "calendly.com", desc: "Auto-schedule discovery calls from email replies. Put your link in every email signature you send." },
    { name: "Loom", cost: "Free · 5-min clips", url: "loom.com", desc: "Record 90-second personalised video pitches and demo walkthroughs. Consistently beats plain text." },
    { name: "Payoneer", cost: "Small % fee", url: "payoneer.com", desc: "Receive USD, GBP, and EUR from clients internationally. Best option from Nigeria." },
    { name: "Stripe", cost: "Small % fee", url: "stripe.com", desc: "Embed payment links in proposals for clients who prefer card payment over bank transfer." },
  ]},
];

const HOOKS = [
  { tier: "Starter", color: "#10B981", headline: '"Your Business Found Online — In 10 Days"', target: "Tradespeople · Solo coaches · Small salons", bonus: "Free Google Business Profile audit included" },
  { tier: "Standard", color: "#6366F1", headline: '"A Booking System That Fills Your Calendar Automatically"', target: "Clinics · Gyms · Therapists · Accountants", bonus: "First 3 months of Klaviyo email setup free" },
  { tier: "Premium", color: "#EC4899", headline: '"Stop Paying Third Parties a Cut. Own Your Entire Sales System."', target: "Restaurants · Real estate agencies · E-commerce brands", bonus: "90-day check-in call + analytics report included" },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */

function GrandSlamPlaybook() {
  const [tab, setTab] = useState("journey");
  const [done, setDone, saveMeta] = useSyncedTaskMap("p_grandslam");
  const [openPhase, setOpenPhase] = useState(0);
  const [openLadder, setOpenLadder] = useState(null);
  const [scoreChecks, setScoreChecks] = useState({});
  const [gso, setGso] = useState({ dream: "", proof: "", speed: "", ease: "" });
  const [copied, setCopied] = useState(false);

  const toggle = (id) => setDone(d => ({ ...d, [id]: !d[id] }));
  const toggleScore = (key) => setScoreChecks(s => ({ ...s, [key]: !s[key] }));
  const updateGso = (id, val) => setGso(g => ({ ...g, [id]: val }));

  const totalTasks = PHASES.reduce((acc, p) => acc + p.tasks.length, 0);
  const doneTasks = Object.values(done).filter(Boolean).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  const totalScore = Object.entries(scoreChecks).reduce((sum, [k, v]) => {
    if (!v) return sum;
    return sum + parseInt(k.split(":")[0]);
  }, 0);

  const rating =
    totalScore >= 7 ? { label: "🔥 HOT LEAD — Prioritise Now", border: "#22C55E", text: "#22C55E", bg: "#F4EFE4" } :
    totalScore >= 4 ? { label: "⚡ WARM — Worth Contacting", border: "#F59E0B", text: "#F59E0B", bg: "#F4EFE4" } :
    { label: "❄️ COLD — Skip or Archive", border: "#8A7C6D", text: "#6E6459", bg: "#FFFFFF" };

  const gsoFilled = GSO.filter(p => gso[p.id].trim().length > 20);
  const gsoReady = gsoFilled.length === 4;

  const pitch = gsoReady
    ? `Subject: Quick win for [Business Name] — live in 14 days

Hi [First Name],

I came across [Business Name] on Google Maps and wanted to reach out directly.

${gso.dream}

Here's why I'm confident I can deliver this:
${gso.proof}

On timing:
${gso.speed}

What I need from you:
${gso.ease}

I'd love to walk you through a 10-minute demo I've already built for your business. Open to a quick call this week?

→ [Your Calendly link here]

Best regards,
Boluwatife Famokunwa
[Your contact details]`
    : null;

  const copyPitch = () => {
    if (!pitch) return;
    navigator.clipboard.writeText(pitch).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const TABS = [
    { id: "journey", label: "🗺️ Journey" },
    { id: "gslam",   label: "💎 Grand Slam" },
    { id: "score",   label: "🎯 Score Leads" },
    { id: "ladder",  label: "📈 Value Ladder" },
    { id: "tools",   label: "🛠️ Automated Lead Gen. Tools" },
  ];

  const card = { background: "#FFFFFF", border: "1px solid #D9CFBB", borderRadius: 12 };
  const tag = (c, bg) => ({ fontSize: 10.5, fontWeight: 700, color: c, background: bg || c + "18", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap", display: "inline-block" });

  return (
    <div style={{ background: "#F8F5EE", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201A16" }}>
      <SaveBar meta={saveMeta} title="Grand Slam" total={totalTasks} />


      {/* ── HEADER ─────────────────────────────────── */}
      <div style={{ background: "linear-gradient(160deg,#FDF9F0 0%,#F5F0E4 100%)", borderBottom: "1px solid #D9CFBB", padding: "20px 16px 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E80", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Remote Success System · Boluwatife Famokunwa &amp; Friends
            </span>
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: "clamp(19px,4vw,28px)", fontWeight: 800, lineHeight: 1.2, background: "linear-gradient(130deg,#1A140F 20%,#C99A3B 70%,#8B0000 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Grand Slam Offer Implementation System
          </h1>
          <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#4A5568", lineHeight: 1.7, maxWidth: 560 }}>
            7 phases · Google Maps to first retainer client · Built for remote freelancers who refuse to stay average
          </p>

          {/* PROGRESS BAR */}
          <div style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: "#4A5568" }}>{doneTasks} of {totalTasks} tasks completed</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: progress >= 70 ? "#22C55E" : progress >= 30 ? "#3B82F6" : "#6E6459" }}>{progress}%</span>
            </div>
            <div style={{ background: "#111E31", borderRadius: 6, height: 5, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: progress >= 70 ? "linear-gradient(90deg,#3B82F6,#22C55E)" : "linear-gradient(90deg,#3B82F6,#8B5CF6)", borderRadius: 6, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", marginTop: 14, overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #C99A3B" : "2px solid transparent",
                color: tab === t.id ? "#A5B4FC" : "#8A7C6D",
                padding: "10px 13px", fontSize: 12.5, fontWeight: tab === t.id ? 700 : 500,
                whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "inherit",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────── */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 14px 80px" }}>

        {/* ══ JOURNEY ═══════════════════════════════ */}
        {tab === "journey" && (
          <div>
            <div style={{ ...card, padding: "13px 15px", marginBottom: 16, display: "flex", gap: 11, alignItems: "flex-start", borderColor: "#1E3560" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>👋</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#A5B4FC", marginBottom: 4 }}>Your Mission, Boluwatife</div>
                <p style={{ fontSize: 13, color: "#6E6459", margin: 0, lineHeight: 1.65 }}>
                  Follow these 7 phases in order. Tick off every task as you complete it — your progress bar updates in real time. The Grand Slam Offer (Phase 6) lands harder when the groundwork before it is solid.{" "}
                  <strong style={{ color: "#201A16" }}>Complete one task today. Just one. That is how it starts.</strong>
                </p>
              </div>
            </div>

            {PHASES.map((phase, idx) => {
              const pDone = phase.tasks.filter(t => done[t.id]).length;
              const pTotal = phase.tasks.length;
              const complete = pDone === pTotal;
              const isOpen = openPhase === idx;

              return (
                <div key={phase.id} style={{ marginBottom: 10 }}>
                  <div onClick={() => setOpenPhase(isOpen ? -1 : idx)}
                    style={{ ...card, borderLeft: `3px solid ${phase.color}`, cursor: "pointer", padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, userSelect: "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: phase.color + "18", border: `1px solid ${phase.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                      {complete ? "✅" : phase.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: phase.color }}>{phase.num}</span>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "#201A16" }}>{phase.title}</span>
                        <span style={tag("#64748B", "#111E31")}>{phase.tag}</span>
                        {complete && <span style={tag("#22C55E", "#F4EFE4")}>COMPLETE ✓</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 3, background: "#111E31", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${(pDone / pTotal) * 100}%`, height: "100%", background: phase.color, borderRadius: 3, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#8A7C6D", flexShrink: 0 }}>{pDone}/{pTotal}</span>
                      </div>
                    </div>
                    <span style={{ color: "#D9CFBB", fontSize: 20, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0, lineHeight: 1 }}>›</span>
                  </div>

                  {isOpen && (
                    <div style={{ background: "#090F1B", border: "1px solid #D9CFBB", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "14px 14px 16px" }}>
                      {phase.tasks.map(task => (
                        <div key={task.id} onClick={() => toggle(task.id)}
                          style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 9, cursor: "pointer", userSelect: "none" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${done[task.id] ? phase.color : "#D9CFBB"}`, background: done[task.id] ? phase.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                            {done[task.id] && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, color: done[task.id] ? "#8A7C6D" : "#CBD5E1", lineHeight: 1.55, textDecoration: done[task.id] ? "line-through" : "none", transition: "color 0.15s" }}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, background: phase.color + "0D", border: `1px solid ${phase.color}22`, borderRadius: 8, padding: "9px 12px" }}>
                        <span style={{ fontSize: 12.5, color: "#6E6459", lineHeight: 1.6 }}>💡 {phase.note}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {progress === 100 && (
              <div style={{ marginTop: 10, ...card, background: "#F4EFE4", border: "1px solid #22C55E40", padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#22C55E", marginBottom: 5 }}>Mission Complete, Boluwatife!</div>
                <div style={{ fontSize: 13, color: "#4A5568" }}>You've done what most people only plan to do. Celebrate — then set the next target.</div>
              </div>
            )}
          </div>
        )}

        {/* ══ GRAND SLAM ════════════════════════════ */}
        {tab === "gslam" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: "0 0 5px", fontSize: 18, fontWeight: 800, color: "#1A140F" }}>💎 Grand Slam Offer Builder</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#4A5568", lineHeight: 1.6 }}>
                Fill in all 4 parts below. Your complete cold email pitch assembles live — ready to copy and send.
              </p>
            </div>

            {GSO.map((part, idx) => {
              const filled = gso[part.id].trim().length > 20;
              return (
                <div key={part.id} style={{ ...card, marginBottom: 13, overflow: "hidden" }}>
                  <div style={{ background: part.color + "0F", borderBottom: `1px solid ${part.color}20`, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: filled ? part.color + "25" : "#111E31", border: `1px solid ${filled ? part.color + "55" : "#D9CFBB"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, transition: "all 0.3s" }}>
                      {filled ? "✅" : part.icon}
                    </div>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: part.color }}>PART {idx + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#1A140F" }}>{part.title}</span>
                        {filled && <span style={tag(part.color, part.color + "18")}>✓ Done</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#64748B", lineHeight: 1.5 }}>{part.q}</p>
                    </div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, color: "#4A5568", marginBottom: 8, lineHeight: 1.55, fontStyle: "italic" }}>
                      💡 {part.hint}
                    </div>
                    <textarea
                      value={gso[part.id]}
                      onChange={e => updateGso(part.id, e.target.value)}
                      placeholder={part.ph}
                      rows={3}
                      style={{ width: "100%", background: "#060D18", border: `1px solid ${filled ? part.color + "55" : "#D9CFBB"}`, borderRadius: 8, color: "#CBD5E1", fontSize: 13, padding: "10px 12px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.65, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    />
                    {!filled && (
                      <div style={{ fontSize: 11.5, color: "#2D3F55", marginTop: 6, fontStyle: "italic", lineHeight: 1.5 }}>
                        Example: "{part.eg}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* GENERATED PITCH */}
            <div style={{ ...card, border: `1px solid ${gsoReady ? "#EC489945" : "#D9CFBB"}`, overflow: "hidden" }}>
              <div style={{ background: gsoReady ? "#1A0610" : "#090F1B", borderBottom: `1px solid ${gsoReady ? "#EC489930" : "#D9CFBB"}`, padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: gsoReady ? "#EC4899" : "#8A7C6D", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {gsoReady ? "✨ Your Pitch — Ready to Copy & Send" : "Your Pitch Assembles Here"}
                  </div>
                  {!gsoReady && (
                    <div style={{ fontSize: 12, color: "#8A7C6D", marginTop: 3 }}>
                      {4 - gsoFilled.length} {4 - gsoFilled.length === 1 ? "part" : "parts"} left to complete above
                    </div>
                  )}
                </div>
                {gsoReady && (
                  <button onClick={copyPitch} style={{ background: copied ? "#F4EFE4" : "#EC489920", border: `1px solid ${copied ? "#22C55E50" : "#EC489945"}`, color: copied ? "#22C55E" : "#EC4899", borderRadius: 7, padding: "6px 13px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                    {copied ? "✓ Copied!" : "📋 Copy Pitch"}
                  </button>
                )}
              </div>
              {gsoReady ? (
                <pre style={{ margin: 0, padding: "16px", fontSize: 12.5, color: "#CBD5E1", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Inter', system-ui, sans-serif", wordBreak: "break-word" }}>
                  {pitch}
                </pre>
              ) : (
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>✍️</div>
                  <div style={{ fontSize: 13, color: "#2D3F55" }}>Complete all 4 parts to generate your pitch</div>
                </div>
              )}
            </div>

            {/* HOOKS */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6E6459", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                Ready-Made Offer Hooks by Tier
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {HOOKS.map(h => (
                  <div key={h.tier} style={{ ...card, padding: "12px 14px" }}>
                    <div style={tag(h.color, h.color + "18")}>{h.tier}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A140F", fontStyle: "italic", margin: "7px 0 4px" }}>{h.headline}</div>
                    <div style={{ fontSize: 11.5, color: "#4A5568", marginBottom: 4 }}>Best for: {h.target}</div>
                    <div style={{ fontSize: 12, color: "#10B981" }}>🎁 Bonus: {h.bonus}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI OBJECTION HANDLER */}
            <div style={{ ...card, marginTop: 14, background: "#080D18", border: "1px solid #8B5CF625", padding: "13px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>
                🗣️ When They Ask: "Can't I Just Use AI to Build This Myself?"
              </div>
              <div style={{ fontSize: 13, color: "#6E6459", fontStyle: "italic", lineHeight: 1.75, borderLeft: "2px solid #8B5CF640", paddingLeft: 12 }}>
                "Honestly? You could try — and you'd probably get to about 70% done. But the 30% that actually matters — connecting it to your CRM, configuring secure payments, making it work across every device, and keeping it maintained as things change — that's exactly what I specialise in. Think of it like accounting software: anyone can open QuickBooks, but you'd still hire an accountant. I'm not selling you a tool. I'm selling you a finished system and the support to keep it running."
              </div>
            </div>

            {/* GUARANTEE */}
            <div style={{ ...card, marginTop: 10, background: "#080D18", border: "1px solid #10B98125", padding: "13px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>
                🛡️ The Guarantee — Remove Their Last Fear
              </div>
              <div style={{ fontSize: 14, color: "#201A16", fontStyle: "italic", lineHeight: 1.7, marginBottom: 8 }}>
                "If your site isn't live and working within 14 days, you pay nothing until it is."
              </div>
              <div style={{ fontSize: 12.5, color: "#4A5568", lineHeight: 1.65 }}>
                Their biggest fear: pay and get nothing useful. A clear delivery guarantee removes that objection entirely. Since you control the build and timeline, you control whether you hit it. Start with the guarantee you can absolutely keep — then stretch it as you get faster.
              </div>
            </div>
          </div>
        )}

        {/* ══ SCORE LEADS ═══════════════════════════ */}
        {tab === "score" && (
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1A140F" }}>🎯 Lead Scorer</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#4A5568" }}>
              Open a Google Maps listing, check every signal that applies, and get your verdict instantly.
            </p>

            {/* VERDICT */}
            <div style={{ ...card, background: rating.bg, border: `1px solid ${rating.border}50`, padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: rating.text }}>{rating.label}</div>
                <div style={{ fontSize: 11.5, color: "#4A5568", marginTop: 2 }}>
                  {totalScore >= 7 ? "Contact immediately — high probability of closing" :
                   totalScore >= 4 ? "Worth sending a personalised email and demo" :
                   "Move on — don't waste your energy on cold prospects"}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: totalScore > 0 ? "#22C55E" : totalScore < 0 ? "#EF4444" : "#8A7C6D", lineHeight: 1 }}>
                  {totalScore > 0 ? "+" : ""}{totalScore}
                </div>
                <div style={{ fontSize: 10, color: "#8A7C6D" }}>SCORE</div>
              </div>
            </div>

            {/* HOT */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 9 }}>
              🔥 Hot Signals — tick what you see
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
              {HOT.map(sig => {
                const key = `${sig.pts}:hot:${sig.label}`;
                const on = !!scoreChecks[key];
                return (
                  <div key={key} onClick={() => toggleScore(key)}
                    style={{ ...card, background: on ? "#F4EFE4" : "#FFFFFF", borderColor: on ? "#22C55E40" : "#D9CFBB", padding: "10px 13px", cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start", transition: "all 0.15s", userSelect: "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${on ? "#22C55E" : "#D9CFBB"}`, background: on ? "#22C55E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                      {on && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                        <span style={tag("#22C55E", "#F4EFE4")}>+{sig.pts}</span>
                        <span style={{ fontSize: 13, color: on ? "#22C55E" : "#CBD5E1", fontWeight: on ? 600 : 400 }}>{sig.label}</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: "#8A7C6D" }}>{sig.why}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COLD */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 9 }}>
              ❄️ Cold Signals — tick what you see
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
              {COLD.map(sig => {
                const key = `${sig.pts}:cold:${sig.label}`;
                const on = !!scoreChecks[key];
                return (
                  <div key={key} onClick={() => toggleScore(key)}
                    style={{ ...card, background: on ? "#130308" : "#FFFFFF", borderColor: on ? "#EF444440" : "#D9CFBB", padding: "10px 13px", cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start", transition: "all 0.15s", userSelect: "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${on ? "#EF4444" : "#D9CFBB"}`, background: on ? "#EF4444" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                      {on && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                        <span style={tag("#EF4444", "#130308")}>{sig.pts}</span>
                        <span style={{ fontSize: 13, color: on ? "#EF4444" : "#CBD5E1", fontWeight: on ? 600 : 400 }}>{sig.label}</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: "#8A7C6D" }}>{sig.why}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TIER GUIDE */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
              {[
                { lbl: "🔥 HOT", range: "7+", desc: "Personalised pitch + demo. Move fast.", color: "#22C55E" },
                { lbl: "⚡ WARM", range: "4–6", desc: "Standard sequence, one follow-up.", color: "#F59E0B" },
                { lbl: "❄️ COLD", range: "0–3", desc: "Bulk email or archive entirely.", color: "#6E6459" },
              ].map(b => (
                <div key={b.lbl} style={{ ...card, padding: "11px", textAlign: "center" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: b.color, marginBottom: 3 }}>{b.lbl}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#1A140F", marginBottom: 3 }}>{b.range}</div>
                  <div style={{ fontSize: 11, color: "#4A5568", lineHeight: 1.4 }}>{b.desc}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setScoreChecks({})} style={{ background: "transparent", border: "1px solid #D9CFBB", color: "#4A5568", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
              ↺ Reset — Score Next Lead
            </button>
          </div>
        )}

        {/* ══ VALUE LADDER ══════════════════════════ */}
        {tab === "ladder" && (
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 18, fontWeight: 800, color: "#1A140F" }}>📈 Your Value Ladder</h2>
            <p style={{ margin: "0 0 5px", fontSize: 13, color: "#4A5568" }}>Start at the bottom. Climb with every client. Tap each rung for details and the exact upsell line.</p>

            <div style={{ ...card, padding: "11px 14px", marginBottom: 16, display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: 12.5, color: "#6E6459", lineHeight: 1.6 }}>
                One client can climb every rung over time. A dental client worth $500 today can become $800/month in recurring revenue within a year.{" "}
                <strong style={{ color: "#201A16" }}>Your goal is not more clients — it is more value per client.</strong>
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {LADDER.map((rung, idx) => {
                const open = openLadder === idx;
                return (
                  <div key={rung.num} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: rung.color + "18", border: `1px solid ${rung.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {rung.icon}
                      </div>
                      {idx < LADDER.length - 1 && <div style={{ width: 2, height: 14, background: "#D9CFBB", marginTop: 4, marginBottom: 4 }} />}
                    </div>
                    <div onClick={() => setOpenLadder(open ? null : idx)}
                      style={{ ...card, flex: 1, marginBottom: 8, cursor: "pointer", padding: "11px 13px", borderColor: open ? rung.color + "45" : "#D9CFBB", background: open ? "#08101A" : "#FFFFFF", transition: "all 0.15s", userSelect: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: rung.color }}>RUNG {rung.num}</span>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "#201A16" }}>{rung.name}</span>
                        <span style={tag(rung.color, rung.color + "15")}>{rung.price}</span>
                        <span style={tag(rung.yours ? "#22C55E" : "#6E6459", rung.yours ? "#F4EFE4" : "#111E31")}>{rung.tag}</span>
                        <span style={{ marginLeft: "auto", color: "#D9CFBB", fontSize: 20, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", lineHeight: 1 }}>›</span>
                      </div>
                      {open && (
                        <div style={{ marginTop: 10 }}>
                          <p style={{ fontSize: 13, color: "#6E6459", margin: "0 0 10px", lineHeight: 1.6 }}>{rung.what}</p>
                          {rung.up && (
                            <div style={{ background: "#060D18", borderRadius: 7, padding: "9px 11px", border: `1px solid ${rung.color}22` }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: rung.color, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Upsell Line</div>
                              <div style={{ fontSize: 13, color: "#201A16", fontStyle: "italic" }}>{rung.up}</div>
                            </div>
                          )}
                          {!rung.yours && (
                            <div style={{ background: "#060D18", borderRadius: 7, padding: "9px 11px", border: "1px solid #D9CFBB", marginTop: rung.up ? 8 : 0 }}>
                              <p style={{ margin: 0, fontSize: 12.5, color: "#4A5568", lineHeight: 1.65 }}>
                                Build a referral partner relationship. You stay as the client's main contact, your partner does the specialist work, and you earn 10–20% or a flat fee. This is how you look full-service without overextending your current skills.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ ...card, marginTop: 4, background: "#0A0800", border: "1px solid #F59E0B20", padding: "13px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>⚡ Note on Notion CRM</div>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.65 }}>
                Don't pitch Notion CRM as a main project until you've configured it at least once in a real project. Start by offering it as a small add-on to a web build — fixed scope, fixed price, low stakes. That's your real classroom. After doing it confidently twice, it becomes a standalone service you charge properly for.
              </p>
            </div>
          </div>
        )}

        {/* ══ TOOLS ═════════════════════════════════ */}
        {tab === "tools" && (
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 18, fontWeight: 800, color: "#1A140F" }}>🛠️ Your Full Tool Stack</h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#4A5568" }}>Every tool from first scrape to closed deal, with realistic costs.</p>

            {TOOL_CATS.map(cat => (
              <div key={cat.cat} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                  <div style={{ width: 16, height: 2, background: cat.color, borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cat.cat}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {cat.tools.map(tool => (
                    <div key={tool.name} style={{ ...card, padding: "11px 13px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#201A16" }}>{tool.name}</span>
                          <span style={tag(cat.color, cat.color + "18")}>{tool.cost}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "#4A5568", lineHeight: 1.5 }}>{tool.desc}</div>
                      </div>
                      <div style={{ fontSize: 10.5, color: cat.color + "80", flexShrink: 0, paddingTop: 2 }}>{tool.url}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* COST BREAKDOWN */}
            <div style={{ ...card, background: "#030A05", border: "1px solid #22C55E25", padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                💰 Month 1 Cost Breakdown
              </div>
              {[
                ["Outscraper — 1,000 leads", "~$3"],
                ["Apollo.io", "$0"],
                ["Hunter.io", "$0"],
                ["Make.com", "$0"],
                ["Notion CRM", "$0"],
                ["Klaviyo", "$0"],
                ["Calendly", "$0"],
                ["Loom", "$0"],
                ["Instantly.ai (only when your pipeline is full)", "$37/mo"],
              ].map(([tool, cost], i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #061005" : "none" }}>
                  <span style={{ fontSize: 13, color: "#4A5568" }}>{tool}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cost === "$0" ? "#22C55E" : "#F59E0B" }}>{cost}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 4, borderTop: "1px solid #061005" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#201A16" }}>Total Month 1</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#22C55E" }}>~$40</span>
              </div>
              <p style={{ fontSize: 12.5, color: "#8A7C6D", margin: "10px 0 0", lineHeight: 1.65 }}>
                Run the entire first month for nearly nothing. Add Instantly.ai only once your pipeline is loaded and you're ready to send at volume. Scale spending when revenue justifies it — never before.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/playbooks/grand-slam")({
  head: () => ({ meta: [{ title: "GrandSlamPlaybook — DFS Citadel" }] }),
  component: GrandSlamPlaybook,
});
