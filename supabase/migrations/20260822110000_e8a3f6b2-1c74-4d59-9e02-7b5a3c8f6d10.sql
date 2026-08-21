-- =========== NBO IDENTIFICATION ===========
-- Every NBO participant (entry_channel = 'nbo') must present either their
-- BEF number or their NBO Identity card number before the subsidized DSE
-- entry fee can be paid. Nigerian NBO participants — the only ones who
-- can use the Paystack ₦75,000 rate — must additionally present a
-- standard means of national identification. Enforced server-side in
-- createDseEntryCheckout (payments.functions.ts), not just in the UI.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bef_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nbo_id_card_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nigeria_id_type text
  CHECK (nigeria_id_type IN ('nin', 'voters_card', 'drivers_license', 'passport'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nigeria_id_number text;
