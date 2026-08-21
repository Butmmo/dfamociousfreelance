-- =========== PUBLIC SIGNUP: apply, pick a cohort, pay before access ===========
-- Until now every account was admin-invited. This adds a public front
-- door: a prospective participant fills their own details, picks an
-- open cohort, and pays the DSE entry fee (Stripe or the NBO-Nigeria
-- Paystack rate, same rules as the existing beneficiary payments flow)
-- — the account itself is only created once that payment succeeds
-- (stripe-webhook / paystack-webhook), so "added to the cohort" and
-- "made available" both happen at the same moment, not before.
--
-- signup_requests is the pre-account record of that intent. It has no
-- anon/authenticated write policy at all — every insert goes through
-- src/lib/signup.functions.ts using the service role, which is where
-- the actual validation (NBO identification, Paystack eligibility,
-- cohort must be active) lives, mirroring how payment_transactions
-- itself is never written to directly by a client.

CREATE TABLE public.signup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  country text,
  sponsor_name text NOT NULL DEFAULT 'Boluwatife Famokunwa',
  entry_channel text NOT NULL DEFAULT 'direct' CHECK (entry_channel IN ('nbo', 'direct')),
  cohort_id uuid REFERENCES public.cohorts(id),
  bef_number text,
  nbo_id_card_number text,
  nigeria_id_type text CHECK (nigeria_id_type IN ('nin', 'voters_card', 'drivers_license', 'passport')),
  nigeria_id_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'provisioned', 'abandoned')),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.signup_requests TO authenticated;
GRANT ALL ON public.signup_requests TO service_role;
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view signup requests" ON public.signup_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_signup_requests_updated BEFORE UPDATE ON public.signup_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- A signup's checkout is created before any auth.users row exists, so
-- payment_transactions.user_id has to be optional now — the row is
-- linked by signup_request_id instead until the webhook provisions the
-- account and backfills user_id for consistency with every other row.
ALTER TABLE public.payment_transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.payment_transactions ADD COLUMN signup_request_id uuid REFERENCES public.signup_requests(id);
ALTER TABLE public.payment_transactions ADD CONSTRAINT payment_transactions_owner_chk
  CHECK (user_id IS NOT NULL OR signup_request_id IS NOT NULL);
