import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/broadcast/PodcastProspecting.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/podcast-prospecting")({
  head: () => ({
    meta: [
      { title: "Global Podcast Prospecting Guide — DFS Citadel" },
      { name: "description", content: "Global Podcast Prospecting Guide: Spaces · Shows · Leads. Part of the DFS Citadel path system." },
      { property: "og:title", content: "Global Podcast Prospecting Guide — DFS Citadel" },
      { property: "og:description", content: "Global Podcast Prospecting Guide: Spaces · Shows · Leads." },
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
