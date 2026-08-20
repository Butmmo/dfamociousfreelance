-- Weekly TPE compliance sweep — Monday 7am UTC, same slot as the other
-- weekly reports. The function itself no-ops for any week before
-- 2026-08-24 (the first compulsory week), so this is safe to schedule now.
SELECT cron.schedule(
  'tpe-weekly-compliance',
  '0 7 * * 1',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/tpe-weekly-compliance',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
  $$
);

-- Daily financial-tracker reminder — 7:30pm WAT (18:30 UTC), the hour
-- before most people wind down for the night.
SELECT cron.schedule(
  'bps-daily-tracker-reminder',
  '30 18 * * *',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-daily-tracker-reminder',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
  $$
);
