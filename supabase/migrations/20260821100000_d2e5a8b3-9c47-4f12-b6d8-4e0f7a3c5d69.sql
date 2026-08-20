-- Nightly Google Calendar re-sync for every connected account — keeps
-- Affirmation/Evaluation due-date events and the TPE weekly reminder
-- current even for accounts that never re-open the app. The function
-- itself no-ops gracefully if GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET
-- aren't configured yet, so this is safe to schedule ahead of that setup.
SELECT cron.schedule(
  'google-calendar-nightly-sync', '0 2 * * *',
  $$ SELECT net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/google-calendar-sync',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ); $$
);
