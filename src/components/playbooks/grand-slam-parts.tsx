// @ts-nocheck
// Playbook route — content provided by the user, wired to Supabase progress tracking.
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
      { id: "n1", text: "Choose ONE Tier-1 boring niche only to start — garage doors, tree service, junk removal, septic or pressure washing" },
      { id: "n2", text: "Choose ONE city to target first (any city with 100k+ population works)" },
      { id: "n3", text: "Find 5 real businesses in your niche on Google Maps with under 50 reviews and no owner replies" },
      { id: "n4", text: "Compare each one to the top business in that map pack — write down both review counts and the date of their last review. That gap is your entire pitch" },
      { id: "n5", text: "Write one sentence: 'My clients get [outcome] in [timeframe]' — your positioning statement" },
    ],
    note: "The review gap is your pitch. 'You have 38 reviews, they have 412' beats any feature list ever written.",
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
  { pts: 2, label: "Under 50 reviews while the map-pack leader has 5x more", why: "The review gap IS the pitch — quantifiable, verifiable, and painful" },
  { pts: 1, label: "Tier-1 boring niche: garage doors, tree service, septic, junk removal, restoration", why: "High ticket, emergency intent, and virtually no agency competition" },
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
    what: "Custom Lovable or Lovable app + Make.com automation + CRM + Go High Level email marketing. The full stack.",
    up: `"Let me stay on as your tech partner so this keeps performing and growing."` },
  { num: "04", icon: "🔄", color: "#F59E0B", name: "Care Retainer", price: "$200–400", tag: "/month", yours: true,
    what: "Monthly updates, uptime monitoring, content changes, priority support. Passive recurring income for you.",
    up: `"Want me to also manage your email campaigns every month?"` },
  { num: "05", icon: "📈", color: "#EC4899", name: "Growth Retainer", price: "$400–800", tag: "/month", yours: true,
    what: "Go High Level campaigns designed and sent monthly + analytics report + CRM hygiene. Real growth work.",
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
    { name: "Go High Level", cost: "Free · <250 contacts", url: "klaviyo.com", desc: "Email nurture sequences for leads who don't respond immediately. Stay visible until they're ready." },
  ]},
  { cat: "Close & Get Paid", color: "#14B8A6", tools: [
    { name: "Calendly", cost: "Free", url: "calendly.com", desc: "Auto-schedule discovery calls from email replies. Put your link in every email signature you send." },
    { name: "Loom", cost: "Free · 5-min clips", url: "loom.com", desc: "Record 90-second personalised video pitches and demo walkthroughs. Consistently beats plain text." },
    { name: "Payoneer", cost: "Small % fee", url: "payoneer.com", desc: "Receive USD, GBP, and EUR from clients internationally. Best option from Nigeria." },
    { name: "Stripe", cost: "Small % fee", url: "stripe.com", desc: "Embed payment links in proposals for clients who prefer card payment over bank transfer." },
  ]},
];

const HOOKS = [
  { tier: "Starter", color: "#10B981", headline: '"40 New Google Reviews In 90 Days — On Autopilot"', target: "Window cleaning · Junk removal · Pressure washing", bonus: "Free review-gap audit against your top 3 map competitors" },
  { tier: "Standard", color: "#6366F1", headline: '"Beat The Shop Outranking You — Without Spending A Cent On Ads"', target: "Garage doors · Tree services · Pest control · Septic", bonus: "Done-for-you review response templates included" },
  { tier: "Premium", color: "#EC4899", headline: '"Be The Name AI Recommends When Someone Searches At 2am"', target: "Water damage · HVAC · Movers · Locksmiths", bonus: "Monthly review dashboard + Loom performance report" },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */

export function GrandSlamParts({ tab }) {
  const [openPhase, setOpenPhase] = useState(0);
  const [openLadder, setOpenLadder] = useState(null);
  const [scoreChecks, setScoreChecks] = useState({});
  const [gso, setGso] = useState({ dream: "", proof: "", speed: "", ease: "" });
  const [copied, setCopied] = useState(false);

  const toggleScore = (key) => setScoreChecks(s => ({ ...s, [key]: !s[key] }));
  const updateGso = (id, val) => setGso(g => ({ ...g, [id]: val }));


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


  const card = { background: "#FFFFFF", border: "1px solid #D9CFBB", borderRadius: 12 };
  const tag = (c, bg) => ({ fontSize: 10.5, fontWeight: 700, color: c, background: bg || c + "18", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap", display: "inline-block" });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201A16" }}>


      {/* ── CONTENT ────────────────────────────────── */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 14px 80px" }}>

        {/* ══ JOURNEY ═══════════════════════════════ */}

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
                  <div style={{ fontSize: 10, fontWeight: 700, color: gsoReady ? "#EC4899" : "#8A7C6D", textTransform: "", letterSpacing: "0.1em" }}>
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
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6E6459", textTransform: "", letterSpacing: "0.1em", marginBottom: 10 }}>
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
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", textTransform: "", letterSpacing: "0.1em", marginBottom: 7 }}>
                🗣️ When They Ask: "Can't I Just Use AI to Build This Myself?"
              </div>
              <div style={{ fontSize: 13, color: "#6E6459", fontStyle: "italic", lineHeight: 1.75, borderLeft: "2px solid #8B5CF640", paddingLeft: 12 }}>
                "Honestly? You could try — and you'd probably get to about 70% done. But the 30% that actually matters — connecting it to your CRM, configuring secure payments, making it work across every device, and keeping it maintained as things change — that's exactly what I specialise in. Think of it like accounting software: anyone can open QuickBooks, but you'd still hire an accountant. I'm not selling you a tool. I'm selling you a finished system and the support to keep it running."
              </div>
            </div>

            {/* GUARANTEE */}
            <div style={{ ...card, marginTop: 10, background: "#080D18", border: "1px solid #10B98125", padding: "13px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "", letterSpacing: "0.1em", marginBottom: 7 }}>
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
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "", letterSpacing: "0.1em", marginBottom: 9 }}>
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
            <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", textTransform: "", letterSpacing: "0.1em", marginBottom: 9 }}>
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

        {/* ══ TOOLS ═════════════════════════════════ */}

      </div>
    </div>
  );
}

