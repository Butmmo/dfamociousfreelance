
-- =========== ENUMS ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'beneficiary');
CREATE TYPE public.rank_tier AS ENUM ('recruit', 'operator', 'closer', 'lion', 'crown');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- =========== COHORTS ===========
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  country TEXT,
  city TEXT,
  niche TEXT,
  positioning_statement TEXT,
  cohort_id UUID REFERENCES public.cohorts(id),
  rank rank_tier NOT NULL DEFAULT 'recruit',
  xp INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  google_calendar_connected BOOLEAN NOT NULL DEFAULT false,
  google_refresh_token TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========== USER ROLES (separate table — never on profiles) ===========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========== SECURITY DEFINER: has_role ===========
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========== INVITATIONS ===========
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'beneficiary',
  cohort_id UUID REFERENCES public.cohorts(id),
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_email ON public.invitations(LOWER(email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- =========== PROGRESS TRACKING ===========
CREATE TABLE public.task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  playbook TEXT NOT NULL,        -- '45day' | 'grandslam' | 'prospecting' | 'global'
  task_id TEXT NOT NULL,         -- task identifier from the playbook data
  day_number INTEGER,            -- for 45-day playbook
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, playbook, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_progress TO authenticated;
GRANT ALL ON public.task_progress TO service_role;
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;

-- =========== WEEKLY CHECK-INS / REPORTS ===========
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  outreach_count INTEGER NOT NULL DEFAULT 0,
  demos_built INTEGER NOT NULL DEFAULT 0,
  calls_booked INTEGER NOT NULL DEFAULT 0,
  clients_closed INTEGER NOT NULL DEFAULT 0,
  revenue_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  wins TEXT,
  blockers TEXT,
  next_week_focus TEXT,
  at_risk BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reports TO authenticated;
GRANT ALL ON public.weekly_reports TO service_role;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- =========== RLS POLICIES ===========

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins insert profiles" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- cohorts
CREATE POLICY "Authenticated view cohorts" ON public.cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage cohorts" ON public.cohorts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- invitations
CREATE POLICY "Admins manage invitations" ON public.invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- task_progress
CREATE POLICY "Users manage own progress" ON public.task_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

-- weekly_reports
CREATE POLICY "Users manage own reports" ON public.weekly_reports FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

-- =========== TRIGGER: handle new user signup ===========
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
BEGIN
  -- Match an active invitation by email
  SELECT full_name, cohort_id, role
    INTO invited_full_name, invited_cohort, invited_role
  FROM public.invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  is_founder := LOWER(NEW.email) = 'boluwatifefamokunwa@gmail.com';

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, cohort_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(invited_full_name, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    invited_cohort
  )
  ON CONFLICT (id) DO NOTHING;

  -- Assign role
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
    -- No invitation and not founder → grant beneficiary by default but they will be vetted
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'beneficiary')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== updated_at trigger ===========
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER touch_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_task_progress_updated BEFORE UPDATE ON public.task_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== Default cohort ===========
INSERT INTO public.cohorts (name, description) VALUES ('Founding Cohort', 'The inaugural DFS beneficiary intake');
