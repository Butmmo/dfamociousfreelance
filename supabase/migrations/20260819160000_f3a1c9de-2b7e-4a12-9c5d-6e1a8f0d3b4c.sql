-- =========== Generic push-trigger helper + concrete wiring ===========
-- Same fire-and-forget net.http_post pattern notify_mentorship_escalation
-- already uses, generalized into one reusable SECURITY DEFINER function so
-- any future trigger can push without repeating the http_post boilerplate.
-- Two systems are wired here as the DB-side proof this reaches "every
-- system": DFY month verification/dispute, and escalation acknowledgment/
-- resolution (an admin/council action distinct from the raise/sweep
-- pushes mentorship-escalation-notify already sends).
CREATE OR REPLACE FUNCTION public.trigger_push(user_ids uuid[], category text, title text, body text, url text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hvciiodxmugcaqbjzvkn.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('user_ids', to_jsonb(user_ids), 'category', category, 'title', title, 'body', body, 'url', url)
  );
END;
$$;

-- DFY: push the beneficiary the moment their month is verified or disputed.
CREATE OR REPLACE FUNCTION public.notify_dfy_month_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('verified', 'disputed') THEN
    PERFORM public.trigger_push(
      ARRAY[NEW.user_id],
      'dfy',
      CASE WHEN NEW.status = 'verified' THEN 'DFY month verified' ELSE 'DFY month disputed' END,
      to_char(NEW.period_month, 'Month YYYY') || ' — ' ||
        CASE WHEN NEW.status = 'verified' THEN 'confirmed by the council.' ELSE 'flagged for review — check your notes.' END,
      '/dfy'
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_dfy_month_status_after_update AFTER UPDATE OF status ON public.dfy_months
  FOR EACH ROW EXECUTE FUNCTION public.notify_dfy_month_status();

-- Escalations: push the mentor and mentee once the council acknowledges or
-- resolves what a mentor raised — the raise/reminder/breach pushes belong
-- to mentorship-escalation-notify since those already fan out to admins.
CREATE OR REPLACE FUNCTION public.notify_escalation_council_action()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_mentor_id uuid;
  v_mentee_id uuid;
BEGIN
  SELECT mentor_id, mentee_id INTO v_mentor_id, v_mentee_id
    FROM public.mentorships WHERE id = NEW.mentorship_id;

  IF NEW.acknowledged_at IS NOT NULL AND OLD.acknowledged_at IS NULL THEN
    PERFORM public.trigger_push(
      ARRAY[v_mentor_id, v_mentee_id], 'admin', 'Escalation acknowledged',
      'The council has acknowledged the escalation you were part of.', '/mentorship'
    );
  END IF;
  IF NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL THEN
    PERFORM public.trigger_push(
      ARRAY[v_mentor_id, v_mentee_id], 'admin', 'Escalation resolved',
      'The council has resolved the escalation you were part of.', '/mentorship'
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_escalation_council_action_after_update AFTER UPDATE OF acknowledged_at, resolved_at ON public.mentorship_escalations
  FOR EACH ROW EXECUTE FUNCTION public.notify_escalation_council_action();
