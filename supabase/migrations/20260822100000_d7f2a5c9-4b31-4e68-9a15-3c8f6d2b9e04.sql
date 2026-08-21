-- =========== PAYMENTS: Stripe (international) + Paystack (Nigeria-only NBO subsidy) ===========
-- Three real money flows, one ledger. Paystack is deliberately narrow: it
-- only ever handles the further-subsidized ₦75,000 DSE entry fee for NBO
-- entrants paying from Nigeria (a flat local price, not an FX conversion —
-- "or local equivalent" is shown wherever this displays, per instruction,
-- so the one-country subsidy doesn't read as favoritism). Every other
-- payment — direct-entry DSE, DFY remittances, SUC entry — goes through
-- Stripe only.

CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('dse_entry', 'dfy_remittance', 'suc_entry')),
  purpose_ref_id uuid, -- dfy_months.id for a remittance payment; null for entry fees
  provider text NOT NULL CHECK (provider IN ('stripe', 'paystack')),
  provider_reference text, -- Stripe Checkout Session id / Paystack transaction reference
  amount_usd numeric NOT NULL CHECK (amount_usd > 0), -- canonical ledger figure, always USD
  charged_currency text NOT NULL, -- 'USD' or 'NGN'
  charged_amount numeric NOT NULL, -- actual amount charged, in charged_currency
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  metadata jsonb NOT NULL DEFAULT '{}',
  paid_at timestamptz,
  marked_paid_by uuid REFERENCES auth.users(id), -- set only for an admin's manual override
  marked_paid_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own transactions and admins" ON public.payment_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_provider_ref ON public.payment_transactions(provider, provider_reference);
CREATE TRIGGER touch_payment_transactions_updated BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dse_entry_paid_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suc_entry_paid_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suc_entry_tier text CHECK (suc_entry_tier IN ('standard_2000', 'direct_6000', 'direct_24000'));
