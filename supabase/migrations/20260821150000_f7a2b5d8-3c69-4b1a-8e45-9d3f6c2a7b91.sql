-- =========== Reminders now fire on each user's own local time ===========
-- The four daily check-in slots and the checkpoint-due reminder were all
-- pinned to one fixed UTC hour, silently assuming everyone is in WAT.
-- Both edge functions were rewritten to check each user's own
-- profiles.timezone and only fire when it's actually that local hour for
-- them — which means the cron itself now has to tick often enough to
-- catch every timezone's local moment, rather than firing once at a
-- single UTC time. Old fixed-hour jobs are retired; bps-daily-tracker-
-- reminder's old 7:30pm-UTC job is retired outright since that slot is
-- now the "evening" slot inside bps-daily-checkin.
SELECT cron.unschedule('bps-daily-checkin-morning');
SELECT cron.unschedule('bps-daily-checkin-midday');
SELECT cron.unschedule('bps-daily-checkin-final');
SELECT cron.unschedule('bps-checkpoint-due-reminder');
SELECT cron.unschedule('bps-daily-tracker-reminder');

SELECT cron.schedule(
  'bps-daily-checkin', '*/15 * * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-daily-checkin',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ); $$
);
SELECT cron.schedule(
  'bps-checkpoint-due-reminder', '*/15 * * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-checkpoint-due-reminder',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ); $$
);
