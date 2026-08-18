-- =========== BPS WEEKLY AUTO-REPORT CRON ===========
-- Every Monday, score last week's Belief Goal cadence and notify the
-- beneficiary's mentor, sponsor, and DSE Rep (or the founder if no Rep
-- is assigned) — same fire-and-forget net.http_post pattern already used
-- by dfs-weekly-report and mentorship-escalation-sweep. The edge function
-- itself is idempotent per (user_id, week_start), so a manual re-fire or
-- a retried cron tick never double-reports a week.
SELECT cron.schedule(
  'bps-weekly-report',
  '0 7 * * 1',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/bps-weekly-report',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
  $$
);
