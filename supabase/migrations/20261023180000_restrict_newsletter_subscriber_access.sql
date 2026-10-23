DROP POLICY IF EXISTS "admin_select_newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admin_select_newsletter_subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (
    user_role() = 'admin'
    AND lower(auth.jwt() ->> 'email') = 'ledclement341@gmail.com'
  );
