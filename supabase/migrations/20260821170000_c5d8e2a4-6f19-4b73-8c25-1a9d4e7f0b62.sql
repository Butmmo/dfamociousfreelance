-- =========== CALENDAR: user-created events ===========
-- Backs the Calendar page's Month/Week/Day time-grid rebuild. Purely
-- personal scheduling — own rows only, no admin/mentor visibility, no
-- Google Calendar sync wiring yet (that's a separate, already-scaffolded
-- concern gated on the user supplying real API credentials).

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  color text NOT NULL DEFAULT 'gold',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendar_events_time_order CHECK (end_at >= start_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar events" ON public.calendar_events FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_calendar_events_user_start ON public.calendar_events(user_id, start_at);
CREATE TRIGGER touch_calendar_events_updated BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
