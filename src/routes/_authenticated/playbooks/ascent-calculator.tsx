import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/ascent/AscentCalculator.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/ascent-calculator")({
  head: () => ({
    meta: [
      { title: "Ascent Performance Calculator — DBI Citadel" },
      { name: "description", content: "Ascent Performance Calculator: Powered by Claude AI. Part of the DBI Citadel path system." },
      { property: "og:title", content: "Ascent Performance Calculator — DBI Citadel" },
      { property: "og:description", content: "Ascent Performance Calculator: Powered by Claude AI." },
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
