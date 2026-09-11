-- Contact form messages and administrator replies
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages(created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_contact_messages" ON public.contact_messages;
CREATE POLICY "public_insert_contact_messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_contact_messages" ON public.contact_messages;
CREATE POLICY "admin_select_contact_messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (user_role() = 'admin');

DROP POLICY IF EXISTS "admin_update_contact_messages" ON public.contact_messages;
CREATE POLICY "admin_update_contact_messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (user_role() = 'admin')
  WITH CHECK (user_role() = 'admin');
