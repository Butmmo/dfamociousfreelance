import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/ascent/AscentMachine.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/ascent-machine")({
  head: () => ({
    meta: [
      { title: "The Ascent — High-Ticket Closing Machine — DFS Citadel" },
      { name: "description", content: "The Ascent — High-Ticket Closing Machine: Curriculum. Part of the DFS Citadel path system." },
      { property: "og:title", content: "The Ascent — High-Ticket Closing Machine — DFS Citadel" },
      { property: "og:description", content: "The Ascent — High-Ticket Closing Machine: Curriculum." },
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
