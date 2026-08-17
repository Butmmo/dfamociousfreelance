-- =========== LEADERSHIP BY INFLUENCE: mentorship tracking ===========
CREATE TABLE public.mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_confirmed boolean NOT NULL DEFAULT false,
  mentee_confirmed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','declined','ended')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  ended_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mentor_not_self CHECK (mentor_id <> mentee_id)
);
CREATE UNIQUE INDEX one_open_mentorship_per_mentee ON public.mentorships (mentee_id)
  WHERE status IN ('pending','active');

CREATE OR REPLACE FUNCTION public.compute_mentorship_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL THEN
    NEW.status := CASE WHEN NEW.started_at IS NULL THEN 'declined' ELSE 'ended' END;
  ELSIF NEW.mentor_confirmed AND NEW.mentee_confirmed THEN
    NEW.status := 'active';
    IF NEW.started_at IS NULL THEN NEW.started_at := now(); END IF;
  ELSE
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER compute_mentorship_status_before_write BEFORE INSERT OR UPDATE ON public.mentorships
  FOR EACH ROW EXECUTE FUNCTION public.compute_mentorship_status();
CREATE TRIGGER touch_mentorships_updated BEFORE UPDATE ON public.mentorships
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT ON public.mentorships TO authenticated;
GRANT ALL ON public.mentorships TO service_role;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants and admins read mentorships" ON public.mentorships FOR SELECT TO authenticated
  USING (mentor_id = auth.uid() OR mentee_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mentorship_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
  logged_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_of date NOT NULL,
  happened boolean NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentorship_id, week_of, logged_by)
);
GRANT SELECT ON public.mentorship_checkins TO authenticated;
GRANT ALL ON public.mentorship_checkins TO service_role;
ALTER TABLE public.mentorship_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants and admins read checkins" ON public.mentorship_checkins FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.mentorships m WHERE m.id = mentorship_id AND (m.mentor_id = auth.uid() OR m.mentee_id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TABLE public.mentorship_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
  checkpoint_number int NOT NULL CHECK (checkpoint_number > 0),
  mentee_progress_note text,
  rep_support_assessment text,
  flag_raised boolean NOT NULL DEFAULT false,
  flag_note text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentorship_id, checkpoint_number)
);
GRANT SELECT ON public.mentorship_reviews TO authenticated;
GRANT ALL ON public.mentorship_reviews TO service_role;
ALTER TABLE public.mentorship_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants and admins read reviews" ON public.mentorship_reviews FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.mentorships m WHERE m.id = mentorship_id AND (m.mentor_id = auth.uid() OR m.mentee_id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TABLE public.cohort_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.cohort_messages TO authenticated;
GRANT ALL ON public.cohort_messages TO service_role;
ALTER TABLE public.cohort_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohort members read cohort messages" ON public.cohort_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.cohort_id = cohort_messages.cohort_id)
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Cohort members post cohort messages" ON public.cohort_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.cohort_id = cohort_messages.cohort_id)
  );