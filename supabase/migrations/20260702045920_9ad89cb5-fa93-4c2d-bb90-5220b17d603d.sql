
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Weekly: Mondays 07:00 UTC
SELECT cron.schedule(
  'dfs-weekly-report',
  '0 7 * * 1',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/citadel-report',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('period','weekly')
    );
  $$
);

-- Monthly: 1st of month, 07:00 UTC
SELECT cron.schedule(
  'dfs-monthly-report',
  '0 7 1 * *',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/citadel-report',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('period','monthly')
    );
  $$
);
