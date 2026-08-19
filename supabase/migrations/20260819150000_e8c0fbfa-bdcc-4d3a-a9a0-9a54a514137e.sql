-- =========== PUSH NOTIFICATIONS ===========
-- Web Push subscriptions, one row per browser/device a user has enabled
-- notifications on (a person can have several — phone, laptop). Every
-- category of notification is compulsory once subscribed EXCEPT messages
-- (direct/group/cohort chat), which the beneficiary can silence without
-- losing the underlying subscription — deep focus work shouldn't be
-- interrupted by chat pings the way an escalation or a mentor check-in
-- should be.
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own push subscriptions" ON public.push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- The one opt-out: message pushes only. Every other category (escalations,
-- mentorship, BPS weekly report, DFY, admin/council actions) always fires
-- once a beneficiary has an active subscription — there is no toggle for
-- those, by design.
ALTER TABLE public.profiles ADD COLUMN push_messages_enabled boolean NOT NULL DEFAULT true;
