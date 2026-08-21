-- Paystack-only payments (Stripe paused until its merchant account is
-- live) + real NIN verification gating the ₦75,000 NBO local rate.
-- nigeria_id_type/nigeria_id_number already exist; this just records
-- whether the number was actually confirmed against the applicant's name
-- by the verification provider — never settable by the client itself,
-- only by the server functions that call that provider.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nigeria_id_verified_at timestamptz;
ALTER TABLE public.signup_requests ADD COLUMN IF NOT EXISTS nigeria_id_verified_at timestamptz;
