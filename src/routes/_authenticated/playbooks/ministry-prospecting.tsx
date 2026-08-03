import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/ministry/MinistryProspecting.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/ministry-prospecting")({
  head: () => ({
    meta: [
      { title: "Global Ministry Prospecting Guide — DFS Citadel" },
      { name: "description", content: "Global Ministry Prospecting Guide: Markets · Ministries · Leads. Part of the DFS Citadel path system." },
      { property: "og:title", content: "Global Ministry Prospecting Guide — DFS Citadel" },
      { property: "og:description", content: "Global Ministry Prospecting Guide: Markets · Ministries · Leads." },
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
