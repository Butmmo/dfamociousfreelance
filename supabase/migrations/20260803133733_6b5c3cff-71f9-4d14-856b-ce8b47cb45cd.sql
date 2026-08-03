-- 1. Seven paths of digital engineering
CREATE TABLE IF NOT EXISTS public.paths (
  key text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.paths TO authenticated;
GRANT ALL ON public.paths TO service_role;
ALTER TABLE public.paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paths readable by authenticated" ON public.paths FOR SELECT TO authenticated USING (true);
CREATE POLICY "paths writable by admins" ON public.paths FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.paths (key, name, tagline, sort_order) VALUES
  ('smb',        'SMB Optimisation System',   'Local service businesses · Google Review Automation', 1),
  ('ascent',     'High-Ticket Closing Machine','Commission-only closing for high-ticket offers',      2),
  ('revenue',    'Revenue Recovery Engine',    'E-commerce abandoned-revenue recovery',               3),
  ('carebridge', 'The Care Bridge',            'Senior & home-care rapid-response intake',            4),
  ('ministry',   'Digital Ministry Systems',   'Churches & ministries digital operations',            5),
  ('broadcast',  'The Broadcast Engine',       'Podcast growth & monetisation systems',               6),
  ('authority',  'The Authority Engine',       'Expert authority, content and lead engines',          7)
ON CONFLICT (key) DO NOTHING;

-- 2. Path assignment on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS path_key text REFERENCES public.paths(key),
  ADD COLUMN IF NOT EXISTS path_chosen_at timestamptz,
  ADD COLUMN IF NOT EXISTS path_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS path_auto_assigned boolean NOT NULL DEFAULT false;

-- Every existing beneficiary continues on the SMB Optimisation System
UPDATE public.profiles
   SET path_key = 'smb',
       path_chosen_at = COALESCE(path_chosen_at, now())
 WHERE path_key IS NULL;

-- 3. New signups get a 24-hour window to choose
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

  INSERT INTO public.profiles (id, email, full_name, cohort_id, path_deadline)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(invited_full_name, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    invited_cohort,
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

-- 4. The Ascent gate is retired; it becomes one of the seven paths instead
DROP TABLE IF EXISTS public.ascent_access;