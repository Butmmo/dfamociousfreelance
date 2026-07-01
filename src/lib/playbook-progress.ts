import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Persist a keyed boolean map for a playbook to task_progress.
 * The key stored in task_progress.task_id combines a section prefix + task id,
 * so different tabs (e.g. "score" vs "plan") can share a hook.
 */
export function usePlaybookProgress(playbook: string) {
  const [state, setState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      userIdRef.current = uid;
      if (!uid) { if (!cancelled) setLoading(false); return; }
      const { data } = await supabase
        .from("task_progress")
        .select("task_id, completed")
        .eq("user_id", uid)
        .eq("playbook", playbook);
      if (cancelled) return;
      const initial: Record<string, boolean> = {};
      (data ?? []).forEach((r) => { if (r.completed) initial[r.task_id] = true; });
      setState(initial);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [playbook]);

  const toggle = useCallback(async (taskId: string) => {
    setState((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      const done = next[taskId];
      const uid = userIdRef.current;
      if (uid) {
        supabase
          .from("task_progress")
          .upsert(
            {
              user_id: uid,
              playbook,
              task_id: taskId,
              completed: done,
              completed_at: done ? new Date().toISOString() : null,
            },
            { onConflict: "user_id,playbook,task_id" },
          )
          .then(({ error }) => { if (error) console.error("[task_progress]", error); });
      }
      return next;
    });
  }, [playbook]);

  const setKey = useCallback((taskId: string, value: boolean) => {
    setState((prev) => (prev[taskId] === value ? prev : { ...prev, [taskId]: value }));
    const uid = userIdRef.current;
    if (!uid) return;
    supabase
      .from("task_progress")
      .upsert(
        { user_id: uid, playbook, task_id: taskId, completed: value, completed_at: value ? new Date().toISOString() : null },
        { onConflict: "user_id,playbook,task_id" },
      )
      .then(({ error }) => { if (error) console.error("[task_progress]", error); });
  }, [playbook]);

  const reset = useCallback(async () => {
    const uid = userIdRef.current;
    setState({});
    if (uid) {
      await supabase.from("task_progress").delete().eq("user_id", uid).eq("playbook", playbook);
    }
  }, [playbook]);

  return { state, setState: setKey, toggle, reset, loading };
}
