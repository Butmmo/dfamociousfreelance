// Shared DBI Regal primitives — palette, typography tokens, and the small set
// of UI building blocks every path's Engine/Machine component is built from
// (ScoreDots, CalloutBox, AccordionShell, NextLink, TaskRow, DayCard, BpsCheckpoints).
// Extracted from AscentMachine.jsx so every path stays visually and behaviorally
// in sync instead of each one carrying its own drifting copy.

/* ─── PALETTE (DBI Regal) ─── */
export const CREAM = "#F8F5EE";
export const CREAM_DEEP = "#F5F0E4";
export const BORDER = "#D9CFBB";
export const INK = "#201A16";
export const MUTED = "#6E6459";
export const GOLD = "#C99A3B";
export const GOLD_DEEP = "#7A5A00";
export const CRIMSON = "#8B0000";
export const EMERALD = "#0D7A5F";

export const TONE = {
  good: { c: EMERALD, bg: "rgba(13,122,95,0.08)", bd: "rgba(13,122,95,0.35)" },
  caution: { c: CRIMSON, bg: "rgba(139,0,0,0.06)", bd: "rgba(139,0,0,0.30)" },
  neutral: { c: GOLD_DEEP, bg: "rgba(122,90,0,0.07)", bd: "rgba(122,90,0,0.30)" },
};
export const PLAIN = { c: MUTED, bg: "#FFFFFF", bd: BORDER };
export const tone = (key) => (key === "plain" ? PLAIN : TONE[key] || TONE.neutral);

/* ─── TYPOGRAPHY TOKENS ─── */
export const h2Style = { fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: INK };
export const pStyle = { fontSize: 13, color: MUTED, lineHeight: 1.7, margin: "0 0 14px" };
export const eyebrowStyle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", marginBottom: 8 };
export const labelStyle = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "", color: GOLD_DEEP, marginBottom: 4 };

/* ─── PRIMITIVES ─── */

export function ScoreDots({ value, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: i < value ? GOLD : "transparent",
          border: i < value ? "none" : `1px solid ${BORDER}`,
        }} />
      ))}
    </span>
  );
}

export function CalloutBox({ toneKey, eyebrow, children }) {
  const t = tone(toneKey);
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ ...eyebrowStyle, color: t.c, display: "flex", alignItems: "center", gap: 6 }}>{eyebrow}</div>
      <div style={{ fontSize: 13, color: INK, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export function AccordionShell({ isOpen, onToggle, header, children }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "13px 16px", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {header}
        <span style={{ flexShrink: 0, color: MUTED, fontSize: 14, marginTop: 2 }}>{isOpen ? "⌄" : "›"}</span>
      </button>
      {isOpen && (
        <div style={{ padding: "2px 16px 18px", borderTop: `1px solid ${BORDER}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function NextLink({ to, icon, title, body }) {
  return (
    <div title={to} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

export function TaskRow({ item, checked, onToggle }) {
  const isChecked = !!checked[item.id];
  if (item.badge) {
    return (
      <button
        onClick={() => onToggle(item.id)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, borderRadius: 9, padding: "9px 11px",
          border: `1px solid ${isChecked ? GOLD : BORDER}`, background: isChecked ? "rgba(201,154,59,0.10)" : CREAM,
          textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, background: isChecked ? GOLD : "#FFFFFF", border: isChecked ? "none" : `1px solid ${BORDER}`,
        }}>{item.emoji}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isChecked ? GOLD_DEEP : INK }}>{item.text}</span>
        <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: GOLD_DEEP }}>+{item.xp} XP</span>
      </button>
    );
  }
  return (
    <button
      onClick={() => onToggle(item.id)}
      style={{
        width: "100%", display: "flex", alignItems: "flex-start", gap: 9, borderRadius: 8, padding: "8px 9px",
        background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <span style={{
        flexShrink: 0, marginTop: 2, width: 15, height: 15, borderRadius: "50%",
        border: `1.5px solid ${isChecked ? EMERALD : BORDER}`, background: isChecked ? EMERALD : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isChecked && <span style={{ color: "#FFFFFF", fontSize: 9, lineHeight: 1 }}>✓</span>}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: isChecked ? MUTED : INK, textDecoration: isChecked ? "line-through" : "none" }}>{item.text}</span>
      <span style={{ flexShrink: 0, fontSize: 10.5, color: MUTED, paddingTop: 1 }}>+{item.xp}</span>
    </button>
  );
}

export function DayCard({ dayData, checked, onToggle, expanded, onExpand }) {
  const total = dayData.items.reduce((s, i) => s + (checked[i.id] ? 1 : 0), 0);
  const done = total === dayData.items.length;
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={onExpand}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "12px 15px", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11.5, fontWeight: 800, background: done ? GOLD : "#FFFFFF", color: done ? "#FFFFFF" : MUTED,
            border: done ? "none" : `1px solid ${BORDER}`,
          }}>{String(dayData.day).padStart(2, "0")}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {dayData.title}{dayData.bpsCheckpoint ? " ★" : ""}
            </p>
            {dayData.objective && (
              <p style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dayData.objective}</p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap" }}>{total}/{dayData.items.length}</span>
          <span style={{ color: MUTED, fontSize: 14 }}>{expanded ? "⌄" : "›"}</span>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: "2px 10px 10px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 2 }}>
          {dayData.items.map((item) => (
            <TaskRow key={item.id} item={item} checked={checked} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── BPS CHECKPOINTS ───
   The Belief → Affirmation → Evaluation cadence (dfg/references/bps-cadence.md)
   applied inside a path's own 45-day system. Renders the three checkpoints with
   their fixed, non-improvised remark language — the same shape across every
   path so a beneficiary who switches paths recognizes the rhythm immediately. */
export function BpsCheckpoints({ checkpoints }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      {checkpoints.map((c, i) => (
        <div key={c.day} style={{ padding: "13px 16px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: GOLD_DEEP, background: "rgba(201,154,59,0.14)",
              borderRadius: 5, padding: "2px 7px", flexShrink: 0,
            }}>Day {c.day}</span>
            <strong style={{ fontSize: 13, color: INK }}>{c.type}</strong>
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.65, margin: 0 }}>{c.detail}</p>
        </div>
      ))}
    </div>
  );
}
