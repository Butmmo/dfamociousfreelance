-- =========== MENTOR-REPORTED ESCALATIONS: 48-72h SLA workflow ===========
-- The mentor's "structural shock" reporting function
-- (references/leadership-by-influence.md): when a 40-day checkpoint
-- review finds the Rep, sponsor, an expected DBI employee, or DBI itself
-- isn't maintaining the activity a mentee's success actually depends on,
-- this is the defined online channel for reporting it — not an informal
-- aside. Acknowledged within 48-72 hours, then classified with BEF's
-- Acceptable/Correctable/Disciplinary framework (identity-and-framework.md)
-- — support first, sanction only for a real pattern, never by default.
-- Reassigning the mentee to a different Rep is always on the table
-- regardless of classification, since the mentee's outcome shouldn't wait
-- on how the Rep's case resolves.

CREATE TABLE public.mentorship_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
  review_id uuid REFERENCES public.mentorship_reviews(id) ON DELETE SET NULL,
  raised_by uuid NOT NULL REFERENCES auth.users(id),
  description text NOT NULL,
  raised_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  classification text CHECK (classification IN ('acceptable', 'correctable', 'disciplinary')),
  classification_note text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_note text,
  reassigned boolean NOT NULL DEFAULT false,
  -- Guards against the hourly sweep re-sending the same alert every hour.
  reminder_48h_sent_at timestamptz,
  breach_72h_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mentorship_escalations TO authenticated;
GRANT ALL ON public.mentorship_escalations TO service_role;
ALTER TABLE public.mentorship_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants and admins read escalations" ON public.mentorship_escalations FOR SELECT TO authenticated
  USING (
    raised_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.mentorships m WHERE m.id = mentorship_id AND (m.mentor_id = auth.uid() OR m.mentee_id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE TRIGGER touch_mentorship_escalations_updated BEFORE UPDATE ON public.mentorship_escalations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Instant admin notification the moment a mentor raises one — fire-and-
-- forget via pg_net, the same mechanism the existing weekly/monthly
-- citadel-report cron already uses successfully. SECURITY DEFINER so the
-- "authenticated" role (a mentor inserting a row) doesn't need direct
-- privileges on the net schema — mirrors has_role/is_super_admin's own
-- use of SECURITY DEFINER elsewhere in this schema for the same reason.
CREATE OR REPLACE FUNCTION public.notify_mentorship_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/mentorship-escalation-notify',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('reason', 'raised', 'escalation_id', NEW.id)
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_mentorship_escalation_after_insert AFTER INSERT ON public.mentorship_escalations
  FOR EACH ROW EXECUTE FUNCTION public.notify_mentorship_escalation();

-- Hourly sweep: sends the 48h reminder and 72h breach alert exactly once
-- each per escalation (guarded by the *_sent_at columns above), and never
-- touches anything already acknowledged.
SELECT cron.schedule(
  'mentorship-escalation-sweep',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/mentorship-escalation-notify',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('reason', 'sweep')
    );
  $$
);
