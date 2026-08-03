import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const View = lazy(() => import("@/components/paths/revenue/EcommerceProspecting.jsx"));

export const Route = createFileRoute("/_authenticated/playbooks/ecommerce-prospecting")({
  head: () => ({
    meta: [
      { title: "E-commerce Prospecting Guide — DFS Citadel" },
      { name: "description", content: "E-commerce Prospecting Guide: Markets · Niches · Leads. Part of the DFS Citadel path system." },
      { property: "og:title", content: "E-commerce Prospecting Guide — DFS Citadel" },
      { property: "og:description", content: "E-commerce Prospecting Guide: Markets · Niches · Leads." },
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
