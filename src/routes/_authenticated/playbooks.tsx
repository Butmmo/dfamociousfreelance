import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { Motto } from "@/components/dfs/Brand";

export const Route = createFileRoute("/_authenticated/playbooks")({
  head: () => ({ meta: [{ title: "Playbooks — DFS" }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <Motto />
        <h1 className="mt-2 font-display text-4xl font-bold">The Playbooks</h1>
        <p className="text-muted-foreground">Four interactive systems — the 45-day plan, Grand Slam closer, SMB prospecting, and global markets — arrive in the next build turn, fully wired to your progress tracker and calendar.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <BookOpen className="h-10 w-10 mx-auto text-gold-deep" />
        <p className="mt-4 text-sm text-muted-foreground">Ready to be forged. Coming next turn.</p>
      </div>
    </div>
  ),
});
