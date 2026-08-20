-- =========== Per-user local time ===========
-- Every "which day is this" decision in the app — the finance daily
-- tracker's same-day-only lock chief among them — was implicitly running
-- on server/UTC time. This column lets each user's actual local day
-- govern that instead. Client auto-detects and keeps this in sync via
-- Intl.DateTimeFormat().resolvedOptions().timeZone on every login;
-- defaults to WAT since that's this operation's home base until detected.
ALTER TABLE public.profiles ADD COLUMN timezone text NOT NULL DEFAULT 'Africa/Lagos';

-- The same-day-only lock now checks the beneficiary's own local calendar
-- day (via their stored timezone) instead of the database server's
-- CURRENT_DATE — someone working late in a timezone behind or ahead of
-- the server should never have their "today" boundary land at the wrong
-- local hour.
CREATE OR REPLACE FUNCTION public.enforce_finance_entry_same_day()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_tz text;
  v_local_today date;
BEGIN
  SELECT timezone INTO v_tz FROM public.profiles WHERE id = NEW.user_id;
  v_local_today := (now() AT TIME ZONE COALESCE(v_tz, 'Africa/Lagos'))::date;
  IF NEW.entry_date <> v_local_today THEN
    RAISE EXCEPTION 'Daily tracker entries can only be recorded for today (%) — % can no longer be marked.', v_local_today, NEW.entry_date;
  END IF;
  RETURN NEW;
END;
$$;
