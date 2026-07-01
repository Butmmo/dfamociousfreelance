import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * A drop-in replacement for `useState<Record<string, boolean>>({})` that
 * hydrates from and persists to public.task_progress under a given playbook key.
 * Callsites keep using `setDone(prev => ({ ...prev, [id]: !prev[id] }))` unchanged.
 */
export function useSyncedTaskMap(
  playbook: string,
): [Record<string, boolean>, Dispatch<SetStateAction<Record<string, boolean>>>] {
  const [state, setStateRaw] = useState<Record<string, boolean>>({});
  const userIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const prevRef = useRef<Record<string, boolean>>({});

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

  const setState: Dispatch<SetStateAction<Record<string, boolean>>> = useCallback((updater) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function"
        ? (updater as (p: Record<string, boolean>) => Record<string, boolean>)(prev)
        : updater;
      // Diff against server-known state and persist changes only after hydration
      const uid = userIdRef.current;
      if (uid && hydratedRef.current) {
        const changes: { user_id: string; playbook: string; task_id: string; completed: boolean; completed_at: string | null }[] = [];
        const keys = new Set([...Object.keys(prevRef.current), ...Object.keys(next)]);
        keys.forEach((k) => {
          const before = !!prevRef.current[k];
          const after = !!next[k];
          if (before !== after) {
            changes.push({
              user_id: uid,
              playbook,
              task_id: k,
              completed: after,
              completed_at: after ? new Date().toISOString() : null,
            });
          }
        });
        if (changes.length > 0) {
          supabase
            .from("task_progress")
            .upsert(changes, { onConflict: "user_id,playbook,task_id" })
            .then(({ error }: { error: unknown }) => {
              if (error) console.error("[task_progress upsert]", error);
            });
        }
        prevRef.current = next;
      }
      return next;
    });
  }, [playbook]);

  return [state, setState];
}
