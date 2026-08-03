import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/authority/AuthorityEngine.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/authority-engine")({
  head: () => ({
    meta: [
      { title: "The Authority Engine — DFS Citadel" },
      { name: "description", content: "The Authority Engine: The 45-Day Build. Part of the DFS Citadel path system." },
      { property: "og:title", content: "The Authority Engine — DFS Citadel" },
      { property: "og:description", content: "The Authority Engine: The 45-Day Build." },
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
