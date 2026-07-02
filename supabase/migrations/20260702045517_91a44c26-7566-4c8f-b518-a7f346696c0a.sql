
-- Super-admin identity helper
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND lower(email) = 'boluwatifefamokunwa@gmail.com'
  )
$$;

-- Admin assignment table: which admin mentors which beneficiary
CREATE TABLE IF NOT EXISTS public.admin_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (beneficiary_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_assignments TO authenticated;
GRANT ALL ON public.admin_assignments TO service_role;
ALTER TABLE public.admin_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read assignments" ON public.admin_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR beneficiary_id = auth.uid());
CREATE POLICY "Super admin manages assignments" ON public.admin_assignments FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- Escalation flags: at-risk beneficiaries
CREATE TABLE IF NOT EXISTS public.escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'watch' CHECK (level IN ('watch','at_risk','critical','resolved')),
  reason text,
  opened_by uuid REFERENCES auth.users(id),
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.escalations TO authenticated;
GRANT ALL ON public.escalations TO service_role;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins & mentee read escalations" ON public.escalations FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR beneficiary_id = auth.uid()
);
CREATE POLICY "Admins write escalations" ON public.escalations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER escalations_touch BEFORE UPDATE ON public.escalations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Manual admin check-ins with beneficiaries
CREATE TABLE IF NOT EXISTS public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood text CHECK (mood IN ('green','yellow','red')),
  summary text NOT NULL,
  next_action text,
  next_action_due date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.check_ins TO authenticated;
GRANT ALL ON public.check_ins TO service_role;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin & mentee read check-ins" ON public.check_ins FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR beneficiary_id = auth.uid()
);
CREATE POLICY "Admins write check-ins" ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());
CREATE POLICY "Admins update own check-ins" ON public.check_ins FOR UPDATE TO authenticated
  USING (admin_id = auth.uid()) WITH CHECK (admin_id = auth.uid());

-- Direct messages between assigned admin and beneficiary
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read DMs" ON public.direct_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Participants send DMs" ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Recipient marks read" ON public.direct_messages FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
