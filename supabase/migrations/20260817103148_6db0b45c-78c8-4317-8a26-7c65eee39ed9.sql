CREATE TABLE public.group_messages (
  id uuid primary key default gen_random_uuid(),
  room text not null default 'dbi',
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT ON public.group_messages TO authenticated;
GRANT ALL ON public.group_messages TO service_role;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read the DBI group chat" ON public.group_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members post to the DBI group chat" ON public.group_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE INDEX group_messages_room_created_idx ON public.group_messages (room, created_at);

CREATE TABLE public.message_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, recipient_id)
);
GRANT SELECT, INSERT, UPDATE ON public.message_requests TO authenticated;
GRANT ALL ON public.message_requests TO service_role;
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read message requests" ON public.message_requests FOR SELECT TO authenticated USING (requester_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Members create message requests" ON public.message_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid() AND recipient_id <> auth.uid());
CREATE POLICY "Recipient responds to message requests" ON public.message_requests FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  SELECT id INTO default_cohort FROM public.cohorts ORDER BY created_at DESC LIMIT 1;

  is_founder := LOWER(NEW.email) = 'boluwatifefamokunwa@gmail.com';

  INSERT INTO public.profiles (id, email, full_name, cohort_id, path_deadline)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(invited_full_name, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(invited_cohort, default_cohort),
    now() + interval '24 hours'
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
$function$;