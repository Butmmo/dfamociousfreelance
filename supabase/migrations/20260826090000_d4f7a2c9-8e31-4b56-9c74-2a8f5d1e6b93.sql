-- =========== PATH CHOICE: warning, 48h revision window, founder-only reset ===========
-- path_chosen_at already tracks "when the CURRENT choice was made" and gets
-- overwritten every time a beneficiary switches paths. path_first_chosen_at
-- is new and different: it's stamped exactly once, the very first time a
-- path is ever chosen, and never touched again by an ordinary path switch —
-- it's the anchor for the one-time 48-hour revision window. Only a
-- founder-issued reset (resetBeneficiaryPath) clears it, reopening
-- everything from scratch.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS path_first_chosen_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS path_permanence_notified_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS path_reset_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS path_reset_by uuid REFERENCES auth.users(id);

-- Backfill: every beneficiary already on a path today has obviously long
-- since passed any 48h window, and must NOT receive a retroactive
-- "path permanence" notification blast the moment this ships — so both
-- fields backfill together in one pass.
UPDATE public.profiles
SET path_first_chosen_at = COALESCE(path_first_chosen_at, path_chosen_at),
    path_permanence_notified_at = COALESCE(path_permanence_notified_at, now())
WHERE path_key IS NOT NULL;

-- =========== COHORTS: open/closed becomes a founder-only call ===========
-- Nothing in the app currently issues a cohorts UPDATE besides the founder's
-- own cohort-creation flow, so tightening this from "any admin" to
-- "founder only" has no other caller to break.
DROP POLICY IF EXISTS "Admins update cohorts" ON public.cohorts;
CREATE POLICY "Super admin updates cohorts" ON public.cohorts FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
