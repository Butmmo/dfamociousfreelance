import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/authority/AuthorityProspecting.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/authority-prospecting")({
  head: () => ({
    meta: [
      { title: "The Prospecting Engine — DFS Citadel" },
      { name: "description", content: "The Prospecting Engine: Experts · Niches · Leads. Part of the DFS Citadel path system." },
      { property: "og:title", content: "The Prospecting Engine — DFS Citadel" },
      { property: "og:description", content: "The Prospecting Engine: Experts · Niches · Leads." },
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
