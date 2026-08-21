-- 1. Pin search_path on functions missing it
ALTER FUNCTION public.compute_dfy_month() SET search_path = public;
ALTER FUNCTION public.assign_cohort_name() SET search_path = public;
ALTER FUNCTION public.enforce_finance_entry_same_day() SET search_path = public;

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from public/anon
REVOKE ALL ON FUNCTION public.can_message(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.trigger_push(uuid[], text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_dfy_month_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_escalation_council_action() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_pocket_withdrawal() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_cohort_capacity() FROM PUBLIC, anon, authenticated;
-- keep the RLS-policy helpers callable by signed-in users (required by policies)
GRANT EXECUTE ON FUNCTION public.can_message(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- 3. Explicit write policies for mentorship escalations
CREATE POLICY "Participants raise escalations"
ON public.mentorship_escalations FOR INSERT TO authenticated
WITH CHECK (
  raised_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.mentorships m
    WHERE m.id = mentorship_id AND (m.mentor_id = auth.uid() OR m.mentee_id = auth.uid())
  )
);

CREATE POLICY "Admins update escalations"
ON public.mentorship_escalations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Storage: message attachments readable only by uploader or message participants
DROP POLICY IF EXISTS "Message attachments readable by signed-in users" ON storage.objects;

CREATE POLICY "Message attachments readable by participants"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.direct_messages dm WHERE dm.attachment_url = storage.objects.name)
    OR EXISTS (SELECT 1 FROM public.cohort_messages cm WHERE cm.attachment_url = storage.objects.name)
    OR EXISTS (SELECT 1 FROM public.group_messages gm WHERE gm.attachment_url = storage.objects.name)
  )
);

CREATE POLICY "Users update their own message attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);