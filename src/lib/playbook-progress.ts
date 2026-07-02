import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SyncMeta {
  status: SaveStatus;
  lastSavedAt: Date | null;
  pendingCount: number;
  saveNow: () => Promise<void>;
  completedCount: number;
}

/**
 * Drop-in replacement for useState<Record<string, boolean>>({}) that hydrates
 * from and persists to public.task_progress. Returns tuple [state, setState, meta].
 */
export function useSyncedTaskMap(
  playbook: string,
): [Record<string, boolean>, Dispatch<SetStateAction<Record<string, boolean>>>, SyncMeta] {
  const [state, setStateRaw] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const userIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const prevRef = useRef<Record<string, boolean>>({});
  const pendingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      userIdRef.current = uid;
      if (!uid) { hydratedRef.current = true; return; }
      const { data } = await supabase
        .from("task_progress")
        .select("task_id, completed")
        .eq("user_id", uid)
        .eq("playbook", playbook);
      if (cancelled) return;
      const next: Record<string, boolean> = {};
      (data ?? []).forEach((r: { task_id: string; completed: boolean }) => {
        if (r.completed) next[r.task_id] = true;
      });
      prevRef.current = next;
      setStateRaw(next);
      hydratedRef.current = true;
    })();
    return () => { cancelled = true; };
  }, [playbook]);

  const persist = useCallback(async (changes: Record<string, boolean>) => {
    const uid = userIdRef.current;
    if (!uid) return;
    const rows = Object.entries(changes).map(([task_id, completed]) => ({
      user_id: uid, playbook, task_id, completed,
      completed_at: completed ? new Date().toISOString() : null,
    }));
    if (rows.length === 0) return;
    setStatus("saving");
    const { error } = await supabase
      .from("task_progress")
      .upsert(rows, { onConflict: "user_id,playbook,task_id" });
    if (error) { console.error("[task_progress upsert]", error); setStatus("error"); return; }
    setStatus("saved");
    setLastSavedAt(new Date());
    pendingRef.current = {};
  }, [playbook]);

  const saveNow = useCallback(async () => {
    if (Object.keys(pendingRef.current).length === 0) {
      // still show feedback
      setStatus("saved");
      setLastSavedAt(new Date());
      return;
    }
    await persist(pendingRef.current);
  }, [persist]);

  const setState: Dispatch<SetStateAction<Record<string, boolean>>> = useCallback((updater) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function"
        ? (updater as (p: Record<string, boolean>) => Record<string, boolean>)(prev)
        : updater;
      if (userIdRef.current && hydratedRef.current) {
        const changes: Record<string, boolean> = {};
        const keys = new Set([...Object.keys(prevRef.current), ...Object.keys(next)]);
        keys.forEach((k) => {
          const before = !!prevRef.current[k];
          const after = !!next[k];
          if (before !== after) { changes[k] = after; pendingRef.current[k] = after; }
        });
        if (Object.keys(changes).length > 0) {
          void persist(changes);
        }
        prevRef.current = next;
      }
      return next;
    });
  }, [persist]);

  const completedCount = Object.values(state).filter(Boolean).length;
  const pendingCount = Object.keys(pendingRef.current).length;

  return [state, setState, { status, lastSavedAt, pendingCount, saveNow, completedCount }];
}
