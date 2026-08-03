import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/ministry/MinistrySystems.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/ministry-systems")({
  head: () => ({
    meta: [
      { title: "Digital Ministry Systems — DFS Citadel" },
      { name: "description", content: "Digital Ministry Systems: The 45-Day Build. Part of the DFS Citadel path system." },
      { property: "og:title", content: "Digital Ministry Systems — DFS Citadel" },
      { property: "og:description", content: "Digital Ministry Systems: The 45-Day Build." },
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
