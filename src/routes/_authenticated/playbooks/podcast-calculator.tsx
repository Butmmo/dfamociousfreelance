import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/broadcast/PodcastCalculator.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/podcast-calculator")({
  head: () => ({
    meta: [
      { title: "Podcast Performance Calculator — DBI Citadel" },
      { name: "description", content: "Podcast Performance Calculator: Powered by Claude AI. Part of the DBI Citadel path system." },
      { property: "og:title", content: "Podcast Performance Calculator — DBI Citadel" },
      { property: "og:description", content: "Podcast Performance Calculator: Powered by Claude AI." },
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
