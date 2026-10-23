CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  consent boolean NOT NULL DEFAULT false,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  consented_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_normalized CHECK (email = lower(trim(email))),
  CONSTRAINT newsletter_subscribers_consent_required CHECK (consent)
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "public_insert_newsletter_subscribers" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (consent);

DROP POLICY IF EXISTS "admin_select_newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admin_select_newsletter_subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (user_role() = 'admin');
