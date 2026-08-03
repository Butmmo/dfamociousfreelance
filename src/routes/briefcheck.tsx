import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { BRIEFINGS, PATHS } from "@/lib/paths";

export const Route = createFileRoute("/briefcheck")({
  ssr: false,
  component: () => (
    <div>
      {PATHS.map((p) => {
        const C = BRIEFINGS[p.key];
        return (
          <div key={p.key} data-brief={p.key}>
            <h2>{p.key}</h2>
            <Suspense fallback={<div>loading</div>}>
              <C />
            </Suspense>
          </div>
        );
      })}
    </div>
  ),
});
