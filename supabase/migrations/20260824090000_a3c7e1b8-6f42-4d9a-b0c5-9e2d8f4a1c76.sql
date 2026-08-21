-- =========== COHORT ASSIGNMENT: founder-only, capped at 12, no silent inheritance ===========
-- Until now every new account silently landed in "whichever cohort was
-- created most recently" — handle_new_user()'s COALESCE(invited_cohort,
-- default_cohort) fallback. That auto-inheritance is exactly what this
-- removes: going forward a cohort is assigned only two ways — the
-- founder names one specifically (invitations.cohort_id, still honored
-- exactly as before), or an admin has opted into random assignment among
-- cohorts with room (app_settings.random_cohort_assignment_enabled,
-- default off). Neither path applying leaves cohort_id NULL until the
-- founder assigns one by hand (see setBeneficiaryCohort).

INSERT INTO public.app_settings (key, value)
VALUES ('random_cohort_assignment_enabled', to_jsonb(false))
ON CONFLICT (key) DO NOTHING;

-- Hard cap: no cohort may exceed 12 members, enforced at the row level so
-- every path that ever sets profiles.cohort_id — handle_new_user's own
-- insert, an admin's invite-driven signup, a founder's manual
-- reassignment, random assignment — goes through the same gate.
CREATE OR REPLACE FUNCTION public.enforce_cohort_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_count integer;
BEGIN
  IF NEW.cohort_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.cohort_id IS NOT DISTINCT FROM OLD.cohort_id THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO member_count FROM public.profiles WHERE cohort_id = NEW.cohort_id;
  IF member_count >= 12 THEN
    RAISE EXCEPTION 'Cohort is full (12/12) — pick another cohort.';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_cohort_capacity_before_write ON public.profiles;
CREATE TRIGGER enforce_cohort_capacity_before_write BEFORE INSERT OR UPDATE OF cohort_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cohort_capacity();

-- handle_new_user(): drop the "most recently created cohort" default.
-- A specific cohort still comes from invitations.cohort_id (the founder
-- set it at invite time, or a self-signup carries none); absent that,
-- only pick a random cohort with room if an admin has explicitly turned
-- that on — otherwise leave cohort_id NULL for the founder to assign.
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
  random_enabled BOOLEAN;
  resolved_cohort UUID;
BEGIN
  SELECT full_name, cohort_id, role, sponsor_name, entry_channel
    INTO invited_full_name, invited_cohort, invited_role, invited_sponsor_name, invited_entry_channel
  FROM public.invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  resolved_cohort := invited_cohort;
  IF resolved_cohort IS NULL THEN
    random_enabled := COALESCE(
      (SELECT (value #>> '{}')::boolean FROM public.app_settings WHERE key = 'random_cohort_assignment_enabled'),
      false
    );
    IF random_enabled THEN
      SELECT c.id INTO resolved_cohort
      FROM public.cohorts c
      WHERE c.active = true
        AND (SELECT count(*) FROM public.profiles p WHERE p.cohort_id = c.id) < 12
      ORDER BY random()
      LIMIT 1;
    END IF;
  END IF;

  is_founder := LOWER(NEW.email) = 'boluwatifefamokunwa@gmail.com';

  INSERT INTO public.profiles (id, email, full_name, cohort_id, path_deadline, sponsor_name, entry_channel, consumer_access_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(invited_full_name, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    resolved_cohort,
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
