-- Three more daily check-in slots (7:30pm/bps-daily-tracker-reminder
-- already existed) — morning load-in, midday check, final call — plus a
-- once-daily Affirmation/Evaluation due-day reminder. All times WAT
-- (UTC+1), matching the existing 7:30pm slot's convention.
SELECT cron.schedule(
  'bps-daily-checkin-morning', '0 6 * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-daily-checkin',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('slot', 'morning')
  ); $$
);
SELECT cron.schedule(
  'bps-daily-checkin-midday', '0 12 * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-daily-checkin',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('slot', 'midday')
  ); $$
);
SELECT cron.schedule(
  'bps-daily-checkin-final', '0 21 * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-daily-checkin',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('slot', 'final')
  ); $$
);
SELECT cron.schedule(
  'bps-checkpoint-due-reminder', '0 8 * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-checkpoint-due-reminder',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ); $$
);
