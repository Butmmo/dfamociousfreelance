// SMB Prospecting Guide — "Prioritize & Scale" tab.
// Turns a scored review-gap list into a weekly outreach queue, then into a real income target.
const GOLD = "#C99A3B";
const CRIMSON = "#8B0000";
const GREEN = "#0D7A5F";
const INK = "#201A16";
const MUTED = "#6E6459";

function SLabel({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.09em", color, margin: "0 0 10px" }}>
      {text}
    </div>
  );
}

const WEEKLY_RHYTHM = [
  { day: "Mon", title: "Refresh The List", color: GREEN, text: "Run one fresh Outscraper pull for your niche and city. Add every new business to the Notion board as Not Contacted, with its current review count and last-review date." },
  { day: "Tue", title: "Score Everything New", color: GOLD, text: "Run each new business through the review-gap score. Anything at 7+ goes straight to the top of the queue; 4–6 goes to the nurture list; below 4 gets parked." },
  { day: "Wed", title: "Outreach Block One", color: CRIMSON, text: "Send 20–25 first-touch emails to Hot leads only, each one naming their real review count against the map leader's. Never batch-send a generic version." },
  { day: "Thu", title: "Follow-Up & Loom", color: GOLD, text: "Follow up on everything sent 3+ days ago, and record 3–5 personalised Loom review-gap walkthroughs for the warmest replies." },
  { day: "Fri", title: "Outreach Block Two + Calls", color: GREEN, text: "Second send of 20–25, then take every booked call. Friday afternoons are the highest answer rate in the trades — owners are off the tools." },
  { day: "Sat", title: "Score The Week", color: MUTED, text: "Log sent, opened, replied, booked and closed in the board. Compare against last week. One number changes your plan: reply rate." },
];

const QUEUE_RULES = [
  { label: "Hot", emoji: "🔥", color: GREEN, action: "Under 100 reviews, a visible map leader far ahead, and no owner replies. Contact within 48 hours, personalise every line, and offer the Loom audit immediately." },
  { label: "Warm", emoji: "🌤️", color: GOLD, action: "Real gap but partly active — some recent reviews or occasional owner replies. Add to the sequence, but only after the Hot queue is fully worked." },
  { label: "Cool", emoji: "🌥️", color: "#8A7C6D", action: "Decent reputation already, or a small review gap. Nurture monthly with genuinely useful notes, not pitches." },
  { label: "Cold", emoji: "❄️", color: MUTED, action: "Already dominant on the map, or clearly running an agency. Park it. Only revisit if reviews stall or the leader's position slips." },
];

const FUNNEL = [
  { label: "Businesses scraped", val: "200 / month", note: "One niche, one metro. Outscraper pulls this in an afternoon." },
  { label: "Pass the review-gap score", val: "60–80", note: "Roughly a third clear the 7+ Hot threshold in an unworked niche." },
  { label: "Emails sent", val: "180–200", note: "Two blocks a week across four weeks, tracked for opens in Snov.io." },
  { label: "Replies", val: "9–20", note: "5–10% is a normal band for a genuinely personalised review-gap opener." },
  { label: "Calls booked", val: "4–8", note: "About half of replies will take ten minutes if the Loom landed first." },
  { label: "Clients closed", val: "1–2", note: "A steady month. Two is a good month, not a lucky one." },
];

const MIX = [
  { tier: "Starter — $297/mo", clients: 6, color: GREEN },
  { tier: "Standard — $397/mo", clients: 8, color: GOLD },
  { tier: "Premium — $497/mo", clients: 6, color: CRIMSON },
];

const box = {
  background: "#F8F5EE",
  border: "1px solid #E3DAC8",
  borderRadius: 11,
  padding: "13px 15px",
  marginBottom: 20,
} as const;

export function PrioritizeParts() {
  const annual = MIX.reduce((sum, m) => sum + m.clients * (m.tier.includes("297") ? 297 : m.tier.includes("397") ? 397 : 497) * 12, 0);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "22px 18px 90px" }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: INK }}>Prioritize Your Queue, Then Scale</h2>
      <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 18px", lineHeight: 1.6 }}>
        A scored list is not a pipeline. This is the weekly rhythm that turns your review-gap scores into
        real outreach, and the honest math behind a six-figure year on Google Review Automation alone.
      </p>

      <SLabel text="Your Weekly Rhythm" color={GOLD} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {WEEKLY_RHYTHM.map((r) => (
          <div key={r.day} style={{ ...box, marginBottom: 0, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 38, fontSize: 10.5, fontWeight: 800, color: r.color, flexShrink: 0, paddingTop: 1 }}>{r.day}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 2 }}>{r.title}</div>
              <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.55 }}>{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      <SLabel text="Queue Rules By Tier" color={CRIMSON} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {QUEUE_RULES.map((t) => (
          <div key={t.label} style={{ background: "#F8F5EE", border: `1px solid ${t.color}30`, borderRadius: 10, padding: "10px 13px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ background: t.color + "18", border: `1px solid ${t.color}45`, borderRadius: 999, padding: "3px 10px", fontSize: 11.5, fontWeight: 700, color: t.color, flexShrink: 0, whiteSpace: "nowrap" }}>
              {t.emoji} {t.label}
            </span>
            <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>{t.action}</p>
          </div>
        ))}
      </div>

      <SLabel text="Recycling Cool & Cold Leads" color={GOLD} />
      <div style={box}>
        <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Re-score every Cool and Cold business every 30–60 days. Review counts move, map leaders change,
          and an owner who was replying diligently in March goes silent by June. A parked lead is not a dead
          lead — it is one whose signals have not changed yet.
        </p>
      </div>

      <SLabel text="A Worked Example — Replace With Your Real Numbers" color={GOLD} />
      <div style={box}>
        <p style={{ fontSize: 11.5, color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
          These are planning placeholders, not researched averages. After three weeks, replace every line with
          the numbers from your own board and Snov.io open tracking.
        </p>
        {FUNNEL.map((f, i) => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < FUNNEL.length - 1 ? "1px solid #E3DAC8" : "none" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: GOLD + "18", border: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: GOLD, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>{f.label}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>{f.note}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, flexShrink: 0 }}>{f.val}</div>
          </div>
        ))}
        <p style={{ fontSize: 11.5, color: MUTED, margin: "12px 0 0", lineHeight: 1.6 }}>
          One to two closes a month, worked consistently, is twelve to twenty clients in a year — and this
          system is retained monthly, so month twelve carries every client month one brought in.
        </p>
      </div>

      <SLabel text="The Math Behind Your Six-Figure Target" color={GREEN} />
      <div style={{ ...box, marginBottom: 14 }}>
        {MIX.map((m) => (
          <div key={m.tier} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #E3DAC8" }}>
            <span style={{ fontSize: 12.5, color: INK, fontWeight: 600 }}>{m.tier}</span>
            <span style={{ fontSize: 12.5, color: m.color, fontWeight: 700 }}>{m.clients} clients</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 11 }}>
          <span style={{ fontSize: 12.5, color: MUTED }}>20 retained clients, twelve months</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: GREEN }}>${annual.toLocaleString()}/year</span>
        </div>
      </div>

      <div style={{ background: "#F5F0E4", border: `1px solid ${GOLD}30`, borderRadius: 11, padding: "13px 15px" }}>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Twenty retained clients is the target, not twenty closes in a hectic month. Start every client on
          Starter, prove the review count moving inside 90 days, then upsell to Standard or Premium — that
          upsell path is what carries the number above, and it is the reason one mastered niche beats three
          half-worked ones. Widen only when your first lane is closing predictably.
        </p>
      </div>
    </div>
  );
}
