import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/ascent/AscentTargeting.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/ascent-targeting")({
  head: () => ({
    meta: [
      { title: "Global Targeting Manual — DFS Citadel" },
      { name: "description", content: "Global Targeting Manual: Markets · Offers · Scouting. Part of the DFS Citadel path system." },
      { property: "og:title", content: "Global Targeting Manual — DFS Citadel" },
      { property: "og:description", content: "Global Targeting Manual: Markets · Offers · Scouting." },
    ],
  }),
  component: () => (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Opening playbook…</div>}>
        <View />
      </Suspense>
    </div>
  ),
});
