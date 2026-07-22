import { CheckCircle2, Loader2, Save, AlertTriangle } from "lucide-react";
import type { SyncMeta, SaveStatus } from "@/lib/playbook-progress";
import { toast } from "sonner";

type Props =
  | { meta: SyncMeta; title?: string; total?: number }
  | {
      status: SaveStatus;
      lastSavedAt: Date | null;
      pendingCount?: number;
      onSave: () => Promise<void> | void;
      title?: string;
      total?: number;
      completedCount?: number;
    };

export function SaveBar(props: Props) {
  const status: SaveStatus = "meta" in props ? props.meta.status : props.status;
  const lastSavedAt: Date | null =
    "meta" in props ? props.meta.lastSavedAt : props.lastSavedAt;
  const saveNow: () => Promise<void> | void =
    "meta" in props ? props.meta.saveNow : props.onSave;
  const completedCount: number | undefined =
    "meta" in props ? props.meta.completedCount : props.completedCount;
  const title = props.title ?? "Progress";
  const total = props.total;

  const label =
    status === "saving"
      ? "Saving…"
      : status === "error"
      ? "Save failed — retry"
      : lastSavedAt
      ? `Saved • ${lastSavedAt.toLocaleTimeString()}`
      : "Auto-save enabled";
  const Icon =
    status === "saving" ? Loader2 : status === "error" ? AlertTriangle : CheckCircle2;

  return (
    <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-[880px] mx-auto flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon
            className={`h-4 w-4 ${
              status === "saving"
                ? "animate-spin"
                : status === "error"
                ? "text-destructive"
                : "text-gold-deep"
            }`}
          />
          <span className="truncate">{label}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs">
          {typeof completedCount === "number" && (
            <span className="text-muted-foreground hidden sm:inline">
              <span className="font-semibold text-foreground">{completedCount}</span>
              {typeof total === "number" ? ` / ${total}` : ""} complete
            </span>
          )}
          <button
            onClick={async () => {
              await saveNow();
              toast.success(`${title} saved`);
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
