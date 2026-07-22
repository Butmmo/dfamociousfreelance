-- Escalation grace period + Ascent access control
-- 1) Global setting: escalation tracking start date. Anything before this is not judged.
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_settings readable by authenticated" ON public.app_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_settings writable by admins" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (key, value)
VALUES ('escalation_start_date', to_jsonb('2026-07-06'::text))
ON CONFLICT (key) DO NOTHING;

-- 2) Per-user Ascent access; only super-admin can toggle.
CREATE TABLE IF NOT EXISTS public.ascent_access (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);
GRANT SELECT ON public.ascent_access TO authenticated;
GRANT ALL ON public.ascent_access TO service_role;
ALTER TABLE public.ascent_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own row; admins can read all
CREATE POLICY "ascent_access self read" ON public.ascent_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Only service_role writes (server functions gate on is_super_admin).
