// @ts-nocheck
// Global SMB Engine — merged playbook (Global Freelance + SMB Prospecting + Grand Slam Offer).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlobalParts } from "@/components/playbooks/global-parts";
import { ProspectingParts } from "@/components/playbooks/prospecting-parts";
import { GrandSlamParts } from "@/components/playbooks/grand-slam-parts";

export const Route = createFileRoute("/_authenticated/playbooks/global-smb-engine")({
  head: () => ({
    meta: [
      { title: "Global SMB Engine — DFS Citadel" },
      { name: "description", content: "Countries, niches, Google Maps searches, lead scoring and the Grand Slam offer builder — one engine for the SMB Optimisation System." },
      { property: "og:title", content: "Global SMB Engine — DFS Citadel" },
      { property: "og:description", content: "The merged SMB engine: target countries, niches, map searches, lead scoring and the Grand Slam offer builder." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GlobalSmbEngine,
});

const TABS = [
  { id: "countries", label: "🌍 Countries" },
  { id: "businesses", label: "💼 Niches" },
  { id: "maps", label: "🗺️ Map Searches" },
  { id: "score", label: "🎯 Score Leads" },
  { id: "gslam", label: "💎 Grand Slam" },
];

function GlobalSmbEngine() {
  const [tab, setTab] = useState("countries");

  return (
    <div style={{ background: "#F8F5EE", minHeight: "100vh", color: "#201A16", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg,#FDF9F0 0%,#F5F0E4 100%)", borderBottom: "1px solid #D9CFBB", padding: "24px 18px 0" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#8B0000", textTransform: "uppercase", marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C99A3B", boxShadow: "0 0 6px #C99A3B", display: "inline-block" }} />
            SMB Optimisation System · Playbook 01
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4.6vw,36px)", fontWeight: 800, lineHeight: 1.15, background: "linear-gradient(130deg,#1A140F 20%,#C99A3B 70%,#8B0000 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The Global SMB Engine
          </h1>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6E6459", maxWidth: 620, lineHeight: 1.7 }}>
            Countries · niches · exact Google Maps searches · lead scoring · the Grand Slam offer builder. One engine, from market choice to a pitch you can send today —
            built on the DFS tool stack: <strong style={{ color: "#7A5A00" }}>Go High Level, Notion, Lovable, Make / Zapier / n8n</strong>.
          </p>

          {/* TABS */}
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: tab === t.id ? "2px solid #C99A3B" : "2px solid transparent",
                  color: tab === t.id ? "#7A5A00" : "#8A7C6D",
                  padding: "11px 14px", fontSize: 12.5, fontWeight: tab === t.id ? 700 : 500,
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
      {(tab === "countries" || tab === "businesses") && <GlobalParts tab={tab} />}
      {tab === "maps" && <ProspectingParts tab="maps" />}
      {(tab === "score" || tab === "gslam") && <GrandSlamParts tab={tab} />}
    </div>
  );
}
