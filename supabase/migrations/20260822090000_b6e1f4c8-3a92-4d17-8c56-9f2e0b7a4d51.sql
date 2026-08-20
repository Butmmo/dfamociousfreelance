-- =========== NBO POCKET SYSTEM v2: BPN linkage, gated Investments/Emergency/Savings ===========

-- BPN (Blazer People Network) enrollment — null means not enrolled, which
-- is the normal/expected state for most DSE participants (BPN is
-- explicitly not compulsory).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bpn_enrolled_at timestamptz;

-- Records how much of a given month's nominal MLM share got redirected to
-- Investments instead (not enrolled in BPN, over the monthly ceiling, or
-- the running MLM balance was already at its $1,500 cap) — kept as its
-- own column purely for beneficiary-facing transparency; investments_usd
-- already includes it.
ALTER TABLE public.pocket_allocations ADD COLUMN IF NOT EXISTS mlm_diverted_usd numeric NOT NULL DEFAULT 0;

-- The Investments Pocket is mentor-released, not self-service: a mentor
-- (or an admin) unlocks a specific amount when there's something the
-- beneficiary is actively building toward, or the annual safeguard
-- unlocks whatever's still locked once a year regardless. Available
-- balance = sum(pocket_allocations.investments_usd) - sum(this table).
CREATE TABLE public.investment_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL CHECK (amount_usd > 0),
  unlocked_by uuid REFERENCES auth.users(id),
  is_annual_safeguard boolean NOT NULL DEFAULT false,
  note text,
  unlocked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.investment_unlocks TO authenticated;
GRANT ALL ON public.investment_unlocks TO service_role;
ALTER TABLE public.investment_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own unlocks and admins" ON public.investment_unlocks FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- The Emergency Pocket's twice-yearly, no-request automatic release (40%
-- of the current balance, every March and October) reuses the existing
-- withdrawal-request table rather than a parallel one — it's recorded as
-- an already-approved, system-decided request, so it flows through the
-- same balance math getMyPocketSummary already does. auto_release_period
-- ("YYYY-03"/"YYYY-10") guards against releasing twice in the same window.
ALTER TABLE public.emergency_withdrawal_requests ADD COLUMN IF NOT EXISTS auto_release_period text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_emergency_withdrawal_requests_auto_period
  ON public.emergency_withdrawal_requests(user_id, auto_release_period) WHERE auto_release_period IS NOT NULL;

-- The Savings Pocket's 3-year cycle: profiles.pocket_savings_started_at
-- marks the CURRENT cycle's start. When a cycle completes, the sweep
-- snapshots what accrued during it into a permit row here (permanently
-- withdrawable from that point on) and resets pocket_savings_started_at
-- to begin the next cycle — so future contributions accrue toward the
-- next permit, not the one already issued.
CREATE TABLE public.savings_withdrawal_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_started_at timestamptz NOT NULL,
  cycle_ended_at timestamptz NOT NULL,
  amount_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.savings_withdrawal_permits TO authenticated;
GRANT ALL ON public.savings_withdrawal_permits TO service_role;
ALTER TABLE public.savings_withdrawal_permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own permits and admins" ON public.savings_withdrawal_permits FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Daily sweep covering all three periodic pocket mechanics above
-- (Investments annual safeguard, Emergency biannual release, Savings
-- 3-year rollover) — one edge function, one cron, same fire-and-forget
-- pg_net pattern as every other sweep in this schema.
SELECT cron.schedule(
  'pocket-sweep-daily',
  '0 2 * * *',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/pocket-sweep',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('reason', 'sweep')
    );
  $$
);
