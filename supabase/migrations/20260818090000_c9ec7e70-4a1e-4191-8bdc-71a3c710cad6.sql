-- =========== SPONSOR + ENTRY CHANNEL ===========
-- Every beneficiary has a named sponsor and came in through one of two
-- channels. Boluwatife Famokunwa is the sponsor of everyone currently on
-- the app except Fayodade Awopetu and Feranmi Nathaniel Dada, whose
-- sponsor is Fiyinfoluwa Awopetu — backfilled below by name since no
-- structured sponsor data existed before this.

ALTER TABLE public.profiles ADD COLUMN entry_channel text NOT NULL DEFAULT 'direct' CHECK (entry_channel IN ('nbo','direct'));
ALTER TABLE public.profiles ADD COLUMN sponsor_name text;

ALTER TABLE public.invitations ADD COLUMN entry_channel text NOT NULL DEFAULT 'direct' CHECK (entry_channel IN ('nbo','direct'));
ALTER TABLE public.invitations ADD COLUMN sponsor_name text;

UPDATE public.profiles SET sponsor_name = 'Boluwatife Famokunwa' WHERE sponsor_name IS NULL;
UPDATE public.profiles SET sponsor_name = 'Fiyinfoluwa Awopetu'
  WHERE full_name ILIKE '%Fayodade Awopetu%' OR full_name ILIKE '%Feranmi Nathaniel Dada%' OR full_name ILIKE '%Feranmi Dada%';

-- =========== DSE REP CONSUMER ACCESS ===========
-- Only meaningful for role='admin' — beneficiaries are never gated by
-- this (the client-side check is role !== 'admin' OR granted), so
-- defaulting everyone to 'none' is harmless for existing beneficiaries
-- and correctly conservative for admins going forward.
ALTER TABLE public.profiles ADD COLUMN consumer_access_status text NOT NULL DEFAULT 'none'
  CHECK (consumer_access_status IN ('none', 'requested', 'granted'));
-- Beneficiaries (the overwhelming majority of existing rows) don't need
-- to request anything they already have by virtue of not being admins,
-- but marking them granted keeps the column meaningful if a beneficiary
-- is later promoted and demoted.
UPDATE public.profiles SET consumer_access_status = 'granted' WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- handle_new_user() propagates the new invitation fields, built on top of
-- the function's current live definition (cohort defaults to the most
-- recently created one, path_deadline is set) so neither regresses.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invited_full_name TEXT;
  invited_cohort UUID;
  invited_role app_role;
  invited_sponsor_name TEXT;
  invited_entry_channel TEXT;
  is_founder BOOLEAN;
  default_cohort UUID;
BEGIN
  SELECT full_name, cohort_id, role, sponsor_name, entry_channel
    INTO invited_full_name, invited_cohort, invited_role, invited_sponsor_name, invited_entry_channel
  FROM public.invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT id INTO default_cohort FROM public.cohorts ORDER BY created_at DESC LIMIT 1;

  is_founder := LOWER(NEW.email) = 'boluwatifefamokunwa@gmail.com';

  INSERT INTO public.profiles (id, email, full_name, cohort_id, path_deadline, sponsor_name, entry_channel, consumer_access_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(invited_full_name, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(invited_cohort, default_cohort),
    now() + interval '24 hours',
    COALESCE(invited_sponsor_name, 'Boluwatife Famokunwa'),
    COALESCE(invited_entry_channel, 'direct'),
    CASE WHEN is_founder THEN 'granted' WHEN invited_role = 'admin' THEN 'none' ELSE 'granted' END
  )
  ON CONFLICT (id) DO NOTHING;

  IF is_founder THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSIF invited_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, invited_role)
    ON CONFLICT DO NOTHING;
    UPDATE public.invitations
      SET status = 'accepted', accepted_at = now()
      WHERE LOWER(email) = LOWER(NEW.email) AND status = 'pending';
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'beneficiary')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- =========== BPS: custom pillars + structured DBI-direct finance goal ===========
-- The fixed 4-pillar/3-item structure stays the default shape (jsonb
-- arrays were already unbounded — the app-level 3-item cap simply
-- relaxes, no schema change needed there). What's new: room for entirely
-- custom goal types, and a structured finance target for beneficiaries
-- who didn't come through NBO (the freeform finance_goal/finance_items
-- stay as-is for entry_channel = 'nbo').
ALTER TABLE public.bps_monthly_goals ADD COLUMN custom_pillars jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_leads_target integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_messages_target integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_new_clients_target integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_returning_clients_target integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_avg_price_usd numeric(10,2);

-- =========== BPS: daily tracker activities are auto-derived from the goal ===========
-- No more manual "type an activity name" — each Belief Goal action item
-- (built-in pillars + custom pillars) becomes its own tracked activity,
-- scoped to that cycle.
ALTER TABLE public.bps_activities ADD COLUMN goal_id uuid REFERENCES public.bps_monthly_goals(id) ON DELETE CASCADE;
CREATE INDEX idx_bps_activities_goal ON public.bps_activities(goal_id);

-- =========== BPS: automated weekly report ===========
-- Populated only by the bps-weekly-report edge function (service_role) on
-- its Monday cron run — never a manual client submission, matching the
-- "automatic, not manual" requirement directly.
CREATE TABLE public.bps_weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.bps_monthly_goals(id) ON DELETE SET NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  activities_done integer NOT NULL DEFAULT 0,
  activities_total integer NOT NULL DEFAULT 0,
  percent numeric NOT NULL DEFAULT 0,
  notified_mentor boolean NOT NULL DEFAULT false,
  notified_rep boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
GRANT SELECT ON public.bps_weekly_reports TO authenticated;
GRANT ALL ON public.bps_weekly_reports TO service_role;
ALTER TABLE public.bps_weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users and admins read BPS weekly reports" ON public.bps_weekly_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========== MESSAGING: attachments ===========
ALTER TABLE public.direct_messages ADD COLUMN attachment_url text;
ALTER TABLE public.direct_messages ADD COLUMN attachment_type text;
ALTER TABLE public.group_messages ADD COLUMN attachment_url text;
ALTER TABLE public.group_messages ADD COLUMN attachment_type text;
ALTER TABLE public.cohort_messages ADD COLUMN attachment_url text;
ALTER TABLE public.cohort_messages ADD COLUMN attachment_type text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Message attachments readable by signed-in users" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'message-attachments');
CREATE POLICY "Users upload their own message attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
