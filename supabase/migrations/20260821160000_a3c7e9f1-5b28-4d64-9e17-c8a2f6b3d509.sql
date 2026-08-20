-- =========== NBO POCKET SYSTEM: binding Pocket Policy ===========
-- Every BPS Month's revenue (the exact window beliefDueDate..evaluationDueDate
-- — see bps.ts's bpsMonthWindowDays) is split five ways the moment the
-- Evaluation Goal for that cycle is submitted. The split is policy, not a
-- suggestion: Upkeep/Spending 25%, Savings (long-term, 3-year cycles) 25%,
-- Investments 20%, MLM Product Purchase 20% (capped at ~250 PPV-equivalent
-- on Neolife Back-Office — unspent balance rolls into Savings), Emergency
-- (short-term, Rep-approved) 10%.

CREATE TABLE public.pocket_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.bps_monthly_goals(id) ON DELETE SET NULL,
  target_month date NOT NULL,
  revenue_usd numeric NOT NULL DEFAULT 0,
  upkeep_usd numeric NOT NULL DEFAULT 0,
  savings_usd numeric NOT NULL DEFAULT 0,
  investments_usd numeric NOT NULL DEFAULT 0,
  mlm_usd numeric NOT NULL DEFAULT 0,
  mlm_actual_spend_usd numeric NOT NULL DEFAULT 0,
  emergency_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_month)
);
GRANT SELECT ON public.pocket_allocations TO authenticated;
GRANT ALL ON public.pocket_allocations TO service_role;
ALTER TABLE public.pocket_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own allocations and admins" ON public.pocket_allocations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_pocket_allocations_updated BEFORE UPDATE ON public.pocket_allocations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- The 3-year Savings Pocket cycle starts counting from a beneficiary's
-- first-ever allocation, not per-month — set once, read many times via
-- savingsUnlockDate() in pocket.ts.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pocket_savings_started_at timestamptz;

-- =========== Emergency Pocket withdrawals: Rep -> Sponsor/Mentor -> Founder ===========
-- Doctrine (user's own words): propose to the Rep; if the Rep stalls 48h,
-- escalate to sponsor or mentor; if that failsafe also stalls, escalate to
-- the DFG Founder/current equivalent. No explicit second timeout was given,
-- so — consistent with the first stage — a second 48h SLA is applied
-- before the founder stage, rather than leaving stage two unbounded.
CREATE TABLE public.emergency_withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL CHECK (amount_usd > 0),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  escalation_level text NOT NULL DEFAULT 'rep' CHECK (escalation_level IN ('rep', 'sponsor_mentor', 'founder')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  rep_escalated_at timestamptz,
  second_escalated_at timestamptz,
  decided_at timestamptz,
  decided_by uuid REFERENCES auth.users(id),
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.emergency_withdrawal_requests TO authenticated;
GRANT ALL ON public.emergency_withdrawal_requests TO service_role;
ALTER TABLE public.emergency_withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own requests and admins" ON public.emergency_withdrawal_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_emergency_withdrawal_requests_updated BEFORE UPDATE ON public.emergency_withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Instant Rep notification the moment a withdrawal is requested — same
-- fire-and-forget pg_net pattern as notify_mentorship_escalation.
CREATE OR REPLACE FUNCTION public.notify_pocket_withdrawal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/pocket-emergency-notify',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('reason', 'raised', 'request_id', NEW.id)
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_pocket_withdrawal_after_insert AFTER INSERT ON public.emergency_withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_pocket_withdrawal();

-- Hourly sweep: escalates rep -> sponsor_mentor at 48h, sponsor_mentor ->
-- founder at another 48h, for anything still pending. Idempotent by
-- construction — once a row's escalation_level changes, it stops matching
-- the query for the level it just left.
SELECT cron.schedule(
  'pocket-emergency-sweep',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/pocket-emergency-notify',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('reason', 'sweep')
    );
  $$
);
