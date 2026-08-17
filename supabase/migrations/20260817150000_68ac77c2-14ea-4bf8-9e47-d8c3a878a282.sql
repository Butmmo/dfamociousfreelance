-- =========== BPS: the Blazer Productivity Scheme, made native ===========
-- Source: dfg's references/bps-cadence.md and nbo's references/nbc-curriculum.md
-- (Assignment 5's daily binary tracker, Assignment 6's Three Goals System).
-- Three nested layers become three tables: a chosen-activities list + daily
-- 1/0 checks (the binary tracking layer), and a monthly goals table
-- carrying the Belief -> Affirmation -> Evaluation cycle. The weekly
-- reporting layer isn't a fourth table — it's a rollup computed from the
-- daily checks, surfaced in the UI and to DSE Rep oversight, since it's
-- derived data with nothing of its own to store.
--
-- This also folds in the CRM: the "Notion CRM" every path playbook
-- currently instructs beneficiaries to build externally (23 columns,
-- documented verbatim in src/routes/_authenticated/playbooks/plan.tsx)
-- becomes a real table instead, so paths point at this app rather than a
-- third-party tool. Grouped under the BPS banner per the founder's
-- direction: this whole surface is one system, named BPS.

-- =========== CRM: client/lead pipeline (replaces the Notion CRM) ===========
CREATE TABLE public.crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_key text,
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_linkedin text,
  website_url text,
  city text,
  country text,
  niche text,
  google_reviews_count integer,
  lead_score integer CHECK (lead_score BETWEEN 0 AND 10),
  priority text CHECK (priority IN ('hot','warm','cold')),
  stage text NOT NULL DEFAULT 'not_contacted' CHECK (stage IN (
    'not_contacted','contacted','replied_positively','replied_negatively',
    'call_booked','proposal_sent','closed','retainer'
  )),
  the_gap text,
  the_leak text,
  the_lift text,
  email_1_sent boolean NOT NULL DEFAULT false,
  email_2_sent boolean NOT NULL DEFAULT false,
  email_3_sent boolean NOT NULL DEFAULT false,
  linkedin_connected boolean NOT NULL DEFAULT false,
  linkedin_dm_sent boolean NOT NULL DEFAULT false,
  last_contacted_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_clients TO authenticated;
GRANT ALL ON public.crm_clients TO service_role;
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own CRM clients" ON public.crm_clients FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid());
CREATE TRIGGER touch_crm_clients_updated BEFORE UPDATE ON public.crm_clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_crm_clients_user ON public.crm_clients(user_id);

-- =========== BPS: daily binary tracking (1/0) ===========
-- Up to 4 chosen activities at a time, matching Assignment 5's tracking
-- sheet ("4 chosen activities as columns, days of the week as rows,
-- scored 1 or 0"). The cap is enforced in the server function, not here.
CREATE TABLE public.bps_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bps_activities TO authenticated;
GRANT ALL ON public.bps_activities TO service_role;
ALTER TABLE public.bps_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own BPS activities" ON public.bps_activities FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.bps_daily_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.bps_activities(id) ON DELETE CASCADE,
  check_date date NOT NULL,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, check_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bps_daily_checks TO authenticated;
GRANT ALL ON public.bps_daily_checks TO service_role;
ALTER TABLE public.bps_daily_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own BPS daily checks" ON public.bps_daily_checks FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_bps_daily_checks_user_date ON public.bps_daily_checks(user_id, check_date);

-- =========== BPS: the Three Goals System (Belief -> Affirmation -> Evaluation) ===========
-- Four pillars per NBC Assignment 6, each with 3 action items (stored as
-- jsonb [{text, done}] rather than 12 separate columns, since the item
-- count per pillar is fixed by the doctrine but the item text is
-- freeform). Affirmation/evaluation score, percent and remark are never
-- client-writable — RLS here grants SELECT only; the fixed-language
-- remark computation happens in bps.functions.ts, the same way
-- mentorship status is computed server-side rather than trusted from the
-- client.
CREATE TABLE public.bps_monthly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_month date NOT NULL,
  finance_goal text,
  finance_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  self_dev_goal text,
  self_dev_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  mlm_goal text NOT NULL DEFAULT 'NIL – Not yet a distributor',
  mlm_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  relationship_goal text,
  relationship_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  belief_submitted_at timestamptz,
  affirmation_submitted_at timestamptz,
  affirmation_score numeric,
  affirmation_total numeric,
  affirmation_percent numeric,
  affirmation_remark text,
  evaluation_submitted_at timestamptz,
  evaluation_score numeric,
  evaluation_total numeric,
  evaluation_percent numeric,
  evaluation_remark text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_month)
);
GRANT SELECT ON public.bps_monthly_goals TO authenticated;
GRANT ALL ON public.bps_monthly_goals TO service_role;
ALTER TABLE public.bps_monthly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users and admins read BPS monthly goals" ON public.bps_monthly_goals FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_bps_monthly_goals_updated BEFORE UPDATE ON public.bps_monthly_goals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
