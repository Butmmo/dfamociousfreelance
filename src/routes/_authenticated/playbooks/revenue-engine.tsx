import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/revenue/RevenueRecoveryEngine.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/revenue-engine")({
  head: () => ({
    meta: [
      { title: "Revenue Recovery Engine — DBI Citadel" },
      { name: "description", content: "Revenue Recovery Engine: The 45-Day Build. Part of the DBI Citadel path system." },
      { property: "og:title", content: "Revenue Recovery Engine — DBI Citadel" },
      { property: "og:description", content: "Revenue Recovery Engine: The 45-Day Build." },
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
