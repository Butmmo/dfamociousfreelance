-- =========== TPE: 12-topic enterprise audio series ===========
-- The 12 topics themselves and their audio files are static content
-- (src/lib/tpe.ts + public/audio/tpe/*.mp3) — no table needed for that.
-- Listened/not-listened completion reuses the existing task_progress
-- table exactly like every other playbook (playbook = 'tpe', task_id =
-- the topic key) — same mechanism the escalation/XP/report system
-- already reads from, so TPE completions show up there automatically
-- with no new code path. The one genuinely new piece of state is the
-- beneficiary's own written takeaway per topic, which task_progress has
-- no column for.
CREATE TABLE public.tpe_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_key text NOT NULL,
  note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_key)
);
GRANT SELECT, INSERT, UPDATE ON public.tpe_reflections TO authenticated;
GRANT ALL ON public.tpe_reflections TO service_role;
ALTER TABLE public.tpe_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own TPE reflections" ON public.tpe_reflections FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid());
CREATE TRIGGER touch_tpe_reflections_updated BEFORE UPDATE ON public.tpe_reflections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
