-- Cron entries for the two new path-choice notification edge functions.
SELECT cron.schedule(
  'path-permanence-notify', '*/15 * * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/path-permanence-notify',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ); $$
);
SELECT cron.schedule(
  'playbook-daily-reminder', '*/15 * * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/playbook-daily-reminder',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ); $$
);
