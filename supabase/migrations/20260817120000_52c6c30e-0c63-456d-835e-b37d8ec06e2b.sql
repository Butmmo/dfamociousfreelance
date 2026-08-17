-- =========== COHORT SYSTEM + MESSAGE REQUESTS ===========
-- Everyone currently on the app belongs to one shared cohort. Going
-- forward only the super admin can form a new cohort; the moment one
-- exists its group chat (cohort_messages, filtered by cohort_id) is
-- already live and active — there's no separate "create the chat" step,
-- just the cohorts.active flag that gates it. Cohorts are auto-named
-- sequentially ("Cohort-00001", "Cohort-00002", ...) so the caller never
-- has to invent a label.

ALTER TABLE public.cohorts ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE public.cohorts ADD COLUMN seq_number integer;

CREATE SEQUENCE public.cohort_number_seq;
GRANT USAGE, SELECT ON SEQUENCE public.cohort_number_seq TO authenticated;
GRANT ALL ON SEQUENCE public.cohort_number_seq TO service_role;

CREATE OR REPLACE FUNCTION public.assign_cohort_name()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.seq_number IS NULL THEN
    NEW.seq_number := nextval('public.cohort_number_seq');
  END IF;
  IF NEW.name IS NULL OR btrim(NEW.name) = '' THEN
    NEW.name := 'Cohort-' || lpad(NEW.seq_number::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER assign_cohort_name_before_insert BEFORE INSERT ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.assign_cohort_name();

-- Only the super admin forms a cohort; any admin may still update one
-- (e.g. toggling active), and only the super admin deletes one.
DROP POLICY IF EXISTS "Admins manage cohorts" ON public.cohorts;
CREATE POLICY "Super admin creates cohorts" ON public.cohorts FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Admins update cohorts" ON public.cohorts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Super admin deletes cohorts" ON public.cohorts FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Every existing beneficiary/admin who isn't already in a cohort joins
-- the founding one — in practice, everyone available on the app is in
-- the same cohort right now.
UPDATE public.profiles SET cohort_id = (
  SELECT id FROM public.cohorts ORDER BY created_at ASC LIMIT 1
) WHERE cohort_id IS NULL;

-- New signups default into that same shared cohort unless an invitation
-- names a different one explicitly.
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
  is_founder BOOLEAN;
  default_cohort UUID;
BEGIN
  SELECT full_name, cohort_id, role
    INTO invited_full_name, invited_cohort, invited_role
  FROM public.invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  is_founder := LOWER(NEW.email) = 'boluwatifefamokunwa@gmail.com';

  SELECT id INTO default_cohort FROM public.cohorts ORDER BY created_at ASC LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, cohort_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(invited_full_name, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(invited_cohort, default_cohort)
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

-- A cohort's chat is only live while the cohort itself is active.
DROP POLICY IF EXISTS "Cohort members read cohort messages" ON public.cohort_messages;
DROP POLICY IF EXISTS "Cohort members post cohort messages" ON public.cohort_messages;
CREATE POLICY "Cohort members read cohort messages" ON public.cohort_messages FOR SELECT TO authenticated
  USING (
    (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.cohort_id = cohort_messages.cohort_id)
      AND EXISTS (SELECT 1 FROM public.cohorts c WHERE c.id = cohort_messages.cohort_id AND c.active)
    )
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Cohort members post cohort messages" ON public.cohort_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.cohort_id = cohort_messages.cohort_id)
    AND EXISTS (SELECT 1 FROM public.cohorts c WHERE c.id = cohort_messages.cohort_id AND c.active)
  );

-- =========== GENERAL DBI GROUP CHAT ===========
-- App-wide, always-on — every authenticated member belongs to it,
-- independent of cohort.
CREATE TABLE public.general_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.general_messages TO authenticated;
GRANT ALL ON public.general_messages TO service_role;
ALTER TABLE public.general_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read general messages" ON public.general_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated post general messages" ON public.general_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- =========== MESSAGE REQUESTS ===========
-- Anyone can ask to start a private conversation with anyone else they
-- can see (cohort mates, general-chat members). RLS here is read-only
-- for participants, same as mentorships — the accept/decline transition
-- is enforced server-side via supabaseAdmin so only the recipient can
-- act on their own inbound request.
CREATE TABLE public.message_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT requester_not_recipient CHECK (requester_id <> recipient_id)
);
-- At most one open (pending) request per unordered pair.
CREATE UNIQUE INDEX one_open_request_per_pair ON public.message_requests (
  LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id)
) WHERE status = 'pending';

GRANT SELECT ON public.message_requests TO authenticated;
GRANT ALL ON public.message_requests TO service_role;
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read message requests" ON public.message_requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- =========== DIRECT MESSAGES: real relationship required ===========
-- The original policy let any authenticated user DM any other with no
-- gating at all. Tighten it to admin, an admin_assignment (Rep ↔
-- beneficiary), an active mentorship, or an accepted message_request —
-- the only ways two people are supposed to be able to reach each other.
CREATE OR REPLACE FUNCTION public.can_message(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.has_role(_a, 'admin') OR public.has_role(_b, 'admin')
    OR EXISTS (
      SELECT 1 FROM public.admin_assignments aa
      WHERE (aa.admin_id = _a AND aa.beneficiary_id = _b) OR (aa.admin_id = _b AND aa.beneficiary_id = _a)
    )
    OR EXISTS (
      SELECT 1 FROM public.mentorships m
      WHERE m.status = 'active' AND ((m.mentor_id = _a AND m.mentee_id = _b) OR (m.mentor_id = _b AND m.mentee_id = _a))
    )
    OR EXISTS (
      SELECT 1 FROM public.message_requests mr
      WHERE mr.status = 'accepted' AND ((mr.requester_id = _a AND mr.recipient_id = _b) OR (mr.requester_id = _b AND mr.recipient_id = _a))
    )
$$;

DROP POLICY IF EXISTS "Participants send DMs" ON public.direct_messages;
CREATE POLICY "Related participants send DMs" ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.can_message(sender_id, recipient_id));

-- =========== AUTO-START MENTOR/MENTEE CONVERSATION ===========
-- The instant a mentorship goes active (both sides confirmed), seed a
-- starter DM so the thread already exists rather than being merely
-- reachable.
CREATE OR REPLACE FUNCTION public.seed_mentorship_conversation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  mentor_name text;
BEGIN
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.direct_messages
      WHERE (sender_id = NEW.mentor_id AND recipient_id = NEW.mentee_id)
         OR (sender_id = NEW.mentee_id AND recipient_id = NEW.mentor_id)
    ) THEN
      SELECT full_name INTO mentor_name FROM public.profiles WHERE id = NEW.mentor_id;
      INSERT INTO public.direct_messages (sender_id, recipient_id, body)
      VALUES (
        NEW.mentor_id,
        NEW.mentee_id,
        COALESCE(mentor_name, 'Your mentor') || ' is now your mentor — say hello and set up your first check-in.'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER seed_mentorship_conversation_after_write AFTER INSERT OR UPDATE ON public.mentorships
  FOR EACH ROW EXECUTE FUNCTION public.seed_mentorship_conversation();
