-- =========== WALKTHROUGH ===========
-- The onboarding tour shows on every app load until a beneficiary
-- explicitly turns it off for good. "Skip" (closes this one showing) is
-- deliberately NOT stored anywhere — it writes nothing, so the tour is
-- back next reload. Only "Don't show this again" writes here.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_dismissed_at timestamptz;
