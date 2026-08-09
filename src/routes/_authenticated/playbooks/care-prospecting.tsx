import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/carebridge/CareProspecting.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/care-prospecting")({
  head: () => ({
    meta: [
      { title: "Senior Care Prospecting Guide — DBI Citadel" },
      { name: "description", content: "Senior Care Prospecting Guide: Markets · Agencies · Leads. Part of the DBI Citadel path system." },
      { property: "og:title", content: "Senior Care Prospecting Guide — DBI Citadel" },
      { property: "og:description", content: "Senior Care Prospecting Guide: Markets · Agencies · Leads." },
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
