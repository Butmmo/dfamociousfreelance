-- =========== BPS Financial Goal: daily tracker + checkpoint actuals ===========
-- Today the only thing tracked daily is the binary activity checklist —
-- the five structural finance numbers a "direct" beneficiary sets
-- (leads/messages/new clients/returning clients/avg price) have a target
-- but nothing ever records the actual daily count against it. This adds
-- that daily numeric tracker, plus the two checkpoint snapshots (day 14 —
-- same window as the Affirmation Goal — and day 40 — same window as the
-- Evaluation Goal) that get computed automatically when the beneficiary
-- submits those goals, mirroring how affirmation_score/evaluation_score
-- already work.
CREATE TABLE public.bps_finance_daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.bps_monthly_goals(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  leads_contacted integer NOT NULL DEFAULT 0 CHECK (leads_contacted >= 0),
  messages_sent integer NOT NULL DEFAULT 0 CHECK (messages_sent >= 0),
  new_clients_closed integer NOT NULL DEFAULT 0 CHECK (new_clients_closed >= 0),
  returning_clients_closed integer NOT NULL DEFAULT 0 CHECK (returning_clients_closed >= 0),
  revenue_usd numeric(10,2) NOT NULL DEFAULT 0 CHECK (revenue_usd >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, goal_id, entry_date)
);
GRANT SELECT, INSERT, UPDATE ON public.bps_finance_daily_entries TO authenticated;
GRANT ALL ON public.bps_finance_daily_entries TO service_role;
ALTER TABLE public.bps_finance_daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own BPS finance daily entries" ON public.bps_finance_daily_entries FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_bps_finance_daily_entries_user_date ON public.bps_finance_daily_entries(user_id, entry_date);
CREATE TRIGGER touch_bps_finance_daily_entries_updated BEFORE UPDATE ON public.bps_finance_daily_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- A tracker not marked on its own day can never be marked afterward — no
-- backfilling. Enforced here, not just in the UI, since the UI is trivial
-- to bypass with a direct client call.
CREATE OR REPLACE FUNCTION public.enforce_finance_entry_same_day()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.entry_date <> CURRENT_DATE THEN
    RAISE EXCEPTION 'Daily tracker entries can only be recorded for today (%) — % can no longer be marked.', CURRENT_DATE, NEW.entry_date;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_finance_entry_same_day_before_insert BEFORE INSERT ON public.bps_finance_daily_entries
  FOR EACH ROW EXECUTE FUNCTION public.enforce_finance_entry_same_day();

-- Checkpoint snapshots: computed once, at submission time, same as
-- affirmation_score/evaluation_score — a permanent record of what was
-- actually done in that window, not a value that can drift later.
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_checkpoint_leads_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_checkpoint_messages_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_checkpoint_new_clients_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_checkpoint_returning_clients_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_checkpoint_revenue_actual numeric(10,2);
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_final_leads_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_final_messages_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_final_new_clients_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_final_returning_clients_actual integer;
ALTER TABLE public.bps_monthly_goals ADD COLUMN finance_final_revenue_actual numeric(10,2);

-- Per-pillar privacy: a beneficiary can hide any pillar (built-in or
-- custom) from their sponsor/mentor/rep entirely — the BPS is meant to be
-- usable for personal tracking too, not just what gets reported upward.
-- Pillar keys ("finance","self_dev","mlm","relationship") or a custom
-- pillar's own key.
ALTER TABLE public.bps_monthly_goals ADD COLUMN hidden_pillars text[] NOT NULL DEFAULT '{}';

-- =========== TPE weekly compliance + 12-month defaulting flag ===========
-- Compulsory as of the week of 2026-08-24: at least one TPE session
-- listened per Mon-Sun week. A missed week flags the account for 12
-- months — a visibility signal surfaced in the Calendar, BPS goals, BPS
-- daily tracker and the Report escalation band, same non-punitive
-- treatment as the cadence bands themselves (no fine, no suspension).
ALTER TABLE public.profiles ADD COLUMN tpe_defaulting_since date;
ALTER TABLE public.profiles ADD COLUMN tpe_defaulting_until date;

-- =========== Mentee activity feed ===========
-- Automated reports (BPS checkpoint/final results, TPE compliance, etc.)
-- land here as a descriptive entry a mentor/rep can read against their
-- mentee — the second of the three required channels (chat message,
-- this feed, then email), never email-only.
CREATE TABLE public.mentee_activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mentee_activity_feed TO authenticated;
GRANT ALL ON public.mentee_activity_feed TO service_role;
ALTER TABLE public.mentee_activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentee, their mentor/rep, and admins read the feed" ON public.mentee_activity_feed FOR SELECT TO authenticated
  USING (
    mentee_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.mentorships m WHERE m.mentee_id = mentee_activity_feed.mentee_id AND m.mentor_id = auth.uid() AND m.status = 'active')
    OR EXISTS (SELECT 1 FROM public.admin_assignments aa WHERE aa.beneficiary_id = mentee_activity_feed.mentee_id AND aa.admin_id = auth.uid())
  );
CREATE INDEX idx_mentee_activity_feed_mentee ON public.mentee_activity_feed(mentee_id, created_at DESC);

-- =========== In-app notification center ===========
-- Every push notification the app already fires (escalations, mentorship,
-- BPS, DFY, admin/council actions, messages) gets logged here too, so a
-- beneficiary without a working push subscription — or who simply missed
-- the OS-level toast — still sees the full history in-app via the bell
-- dropdown next to their avatar.
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read and mark their own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users mark their own notifications read" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;
