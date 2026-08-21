import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { CHOICE_WINDOW_HOURS, REVISION_WINDOW_HOURS, getPath, type PathDef, type PathKey } from "@/lib/paths";

export interface PathState {
  loading: boolean;
  path: PathDef | null;
  pathKey: PathKey | null;
  /** Beneficiary has not chosen yet and is still inside the 24-hour window. */
  needsChoice: boolean;
  /** ms remaining before a path is assigned automatically. */
  msRemaining: number;
  deadline: Date | null;
  autoAssigned: boolean;
  /** True while the beneficiary's one-time 48h revision window (from their very first choice) is still open. */
  revisionWindowOpen: boolean;
  /** ms remaining in the revision window. */
  revisionMsRemaining: number;
  revisionDeadline: Date | null;
  /** Super admins may inspect any path. */
  canSeeAllPaths: boolean;
  choose: (key: PathKey) => Promise<void>;
  refresh: () => void;
}

const LS_VIEW_AS = "dfs_view_path";

export function usePath(): PathState {
  const { user, isSuperAdmin, loading: sessionLoading } = useSession();
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let alive = true;
    supabase
      .from("profiles")
      .select("path_key, path_chosen_at, path_deadline, path_auto_assigned, path_first_chosen_at, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setRow(data ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user, sessionLoading, nonce]);

  const revisionDeadline = row?.path_first_chosen_at
    ? new Date(new Date(row.path_first_chosen_at).getTime() + REVISION_WINDOW_HOURS * 3_600_000)
    : null;
  const revisionWindowOpen = !!row?.path_key && !!revisionDeadline && revisionDeadline.getTime() > Date.now();

  // Re-render every 30s so either countdown (choice window, or the
  // one-time revision window after a first choice) stays honest.
  useEffect(() => {
    if (!row) return;
    if (row.path_key && !revisionWindowOpen) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [row, revisionWindowOpen]);
  void tick;

  const deadline = row?.path_deadline
    ? new Date(row.path_deadline)
    : row?.created_at
      ? new Date(new Date(row.created_at).getTime() + CHOICE_WINDOW_HOURS * 3_600_000)
      : null;

  const superAdminView =
    isSuperAdmin && typeof window !== "undefined" ? (localStorage.getItem(LS_VIEW_AS) as PathKey | null) : null;

  const effectiveKey = (superAdminView ?? row?.path_key ?? null) as PathKey | null;

  const choose = useCallback(
    async (key: PathKey) => {
      if (!user) return;
      if (isSuperAdmin) {
        // The founder inspects paths rather than being locked into one.
        localStorage.setItem(LS_VIEW_AS, key);
        refresh();
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          path_key: key, path_chosen_at: new Date().toISOString(), path_auto_assigned: false,
          // Only the very first-ever choice opens the 48h revision window —
          // a switch made inside that window never resets or extends it.
          ...(row?.path_first_chosen_at ? {} : { path_first_chosen_at: new Date().toISOString() }),
        } as any)
        .eq("id", user.id);
      if (error) throw error;
      refresh();
    },
    [user, isSuperAdmin, refresh, row?.path_first_chosen_at],
  );

  return {
    loading: sessionLoading || loading,
    path: getPath(effectiveKey),
    pathKey: effectiveKey,
    needsChoice: !sessionLoading && !loading && !!user && !isSuperAdmin && !row?.path_key,
    msRemaining: deadline ? Math.max(0, deadline.getTime() - Date.now()) : 0,
    deadline,
    autoAssigned: !!row?.path_auto_assigned,
    revisionWindowOpen: !isSuperAdmin && revisionWindowOpen,
    revisionMsRemaining: revisionDeadline ? Math.max(0, revisionDeadline.getTime() - Date.now()) : 0,
    revisionDeadline,
    canSeeAllPaths: isSuperAdmin,
    choose,
    refresh,
  };
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}
