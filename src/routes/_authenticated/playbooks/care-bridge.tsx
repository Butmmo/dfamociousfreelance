import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/carebridge/CareBridge.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/care-bridge")({
  head: () => ({
    meta: [
      { title: "The Care Bridge — DBI Citadel" },
      { name: "description", content: "The Care Bridge: The 45-Day Build. Part of the DBI Citadel path system." },
      { property: "og:title", content: "The Care Bridge — DBI Citadel" },
      { property: "og:description", content: "The Care Bridge: The 45-Day Build." },
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
