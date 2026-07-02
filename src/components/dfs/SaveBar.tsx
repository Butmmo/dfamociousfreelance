import { CheckCircle2, Loader2, Save, AlertTriangle } from "lucide-react";
import type { SyncMeta } from "@/lib/playbook-progress";
import { toast } from "sonner";

export function SaveBar({ meta, title, total }: { meta: SyncMeta; title: string; total?: number }) {
  const { status, lastSavedAt, saveNow, completedCount } = meta;
  const label =
    status === "saving" ? "Saving…" :
    status === "error" ? "Save failed — retry" :
    lastSavedAt ? `Saved • ${lastSavedAt.toLocaleTimeString()}` :
    "Auto-save enabled";
  const Icon =
    status === "saving" ? Loader2 :
    status === "error" ? AlertTriangle :
    CheckCircle2;
  return (
    <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-[880px] mx-auto flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className={`h-4 w-4 ${status === "saving" ? "animate-spin" : status === "error" ? "text-destructive" : "text-gold-deep"}`} />
          <span className="truncate">{label}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-muted-foreground hidden sm:inline">
            <span className="font-semibold text-foreground">{completedCount}</span>
            {typeof total === "number" ? ` / ${total}` : ""} complete
          </span>
          <button
            onClick={async () => {
              await saveNow();
              toast.success(`${title} progress saved`);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-3.5 w-3.5" /> Save progress
          </button>
        </div>
      </div>
    </div>
  );
}
