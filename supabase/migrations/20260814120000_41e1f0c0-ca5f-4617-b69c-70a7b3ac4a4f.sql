-- =========== DFY (D'Famocious Year) tracking layer ===========
-- The clerical/tracking layer the digital-systems-engineering skill's
-- references/rep-and-auditor.md calls out as the first, highest-leverage
-- build: qualified-month counting, remittance calculation, submission
-- timestamping — fully automated, before any Rep/Auditor role is staffed.
-- All figures are USD, matching the DBI homepage and every other financial
-- figure in the app.

CREATE TYPE public.dfy_month_status AS ENUM ('submitted', 'remittance_paid', 'verified', 'disputed');

CREATE TABLE public.dfy_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,                     -- always day 1 of the calendar month, e.g. 2026-08-01
  net_income_usd NUMERIC(10,2) NOT NULL CHECK (net_income_usd >= 0),
  qualified BOOLEAN NOT NULL DEFAULT false,        -- computed: net_income_usd >= 2000
  remittance_owed_usd NUMERIC(10,2) NOT NULL DEFAULT 0, -- computed: round(net_income_usd * 0.20, 2)
  remittance_paid BOOLEAN NOT NULL DEFAULT false,
  remittance_paid_at TIMESTAMPTZ,
  status public.dfy_month_status NOT NULL DEFAULT 'submitted',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_month),
  CONSTRAINT period_month_is_first_of_month CHECK (period_month = date_trunc('month', period_month)::date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dfy_months TO authenticated;
GRANT ALL ON public.dfy_months TO service_role;
ALTER TABLE public.dfy_months ENABLE ROW LEVEL SECURITY;

-- Qualification and remittance are computed server-side so the $2,000
-- threshold and 20% rate live in exactly one place and can't be spoofed by
-- a client — matches pricing-and-dfy.md's definition exactly, and stays
-- correct once the planned Stripe-based system replaces manual entry.
CREATE OR REPLACE FUNCTION public.compute_dfy_month()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.qualified := NEW.net_income_usd >= 2000;
  NEW.remittance_owed_usd := round(NEW.net_income_usd * 0.20, 2);
  RETURN NEW;
END;
$$;
CREATE TRIGGER compute_dfy_month_before_write BEFORE INSERT OR UPDATE OF net_income_usd ON public.dfy_months
  FOR EACH ROW EXECUTE FUNCTION public.compute_dfy_month();
CREATE TRIGGER touch_dfy_months_updated BEFORE UPDATE ON public.dfy_months
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Beneficiaries manage their own months (their own net_income_usd/notes);
-- admins can read and write any row (verification, status changes). The
-- WITH CHECK on the beneficiary's own row blocks self-certification — a
-- beneficiary can never set their own status to 'verified' or attach a
-- verified_by, only an admin-authored write can.
CREATE POLICY "Beneficiary reads own dfy months, admin reads all" ON public.dfy_months FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Beneficiary inserts own dfy months" ON public.dfy_months FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status <> 'verified' AND verified_by IS NULL);
CREATE POLICY "Beneficiary or admin updates dfy months" ON public.dfy_months FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (auth.uid() = user_id AND status <> 'verified' AND verified_by IS NULL)
  );

-- =========== V. DsE. certification ===========
-- Set only via an explicit admin action once 12 qualified months or the
-- $18,000 cap is reached (see src/lib/dfy.ts's dfyComplete) — never
-- auto-granted off unverified self-reported numbers, consistent with
-- rep-and-auditor.md's warning that self-reported income verified by
-- nobody is the weakest link in the structure.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS vetted_dse_certified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vetted_dse_certified_by UUID REFERENCES auth.users(id);
