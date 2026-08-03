import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/carebridge/CareCalculator.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/care-calculator")({
  head: () => ({
    meta: [
      { title: "Home-Care Performance Calculator — DFS Citadel" },
      { name: "description", content: "Home-Care Performance Calculator: Powered by Claude AI. Part of the DFS Citadel path system." },
      { property: "og:title", content: "Home-Care Performance Calculator — DFS Citadel" },
      { property: "og:description", content: "Home-Care Performance Calculator: Powered by Claude AI." },
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
