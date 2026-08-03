import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/authority/AuthorityCalculator.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/authority-calculator")({
  head: () => ({
    meta: [
      { title: "Authority Performance Calculator — DFS Citadel" },
      { name: "description", content: "Authority Performance Calculator: Powered by Claude AI. Part of the DFS Citadel path system." },
      { property: "og:title", content: "Authority Performance Calculator — DFS Citadel" },
      { property: "og:description", content: "Authority Performance Calculator: Powered by Claude AI." },
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
