-- Centralized audit trail for administrator activity monitoring
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
  ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_event_type
  ON public.audit_events(event_type);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_audit_events" ON public.audit_events;
CREATE POLICY "admin_select_audit_events" ON public.audit_events
  FOR SELECT TO authenticated
  USING (user_role() = 'admin');

CREATE OR REPLACE FUNCTION public.record_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF TG_TABLE_NAME = 'profiles' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
      VALUES ('account_created', 'account', NEW.id, actor, 'Création d’un compte',
        jsonb_build_object('email', NEW.email, 'role', NEW.role, 'name', NEW.full_name));
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
      VALUES ('account_deleted', 'account', OLD.id, actor, 'Suppression d’un compte',
        jsonb_build_object('email', OLD.email, 'role', OLD.role, 'name', OLD.full_name));
    END IF;
  ELSIF TG_TABLE_NAME = 'producers' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('producer_created', 'producer', NEW.id, actor, 'Création d’un compte producteur',
      jsonb_build_object('company_name', NEW.company_name, 'user_id', NEW.user_id));
  ELSIF TG_TABLE_NAME = 'producers' AND TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('producer_status_changed', 'producer', NEW.id, actor, 'Modification du statut producteur',
      jsonb_build_object('company_name', NEW.company_name, 'old_status', OLD.status, 'new_status', NEW.status));
  ELSIF TG_TABLE_NAME = 'products' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('product_created', 'product', NEW.id, actor, 'Mise en ligne d’un article',
      jsonb_build_object('name', NEW.name, 'producer_id', NEW.producer_id, 'is_active', NEW.is_active));
  ELSIF TG_TABLE_NAME = 'products' AND TG_OP = 'UPDATE' AND OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('product_visibility_changed', 'product', NEW.id, actor,
      CASE WHEN NEW.is_active THEN 'Mise en ligne d’un article' ELSE 'Retrait d’un article' END,
      jsonb_build_object('name', NEW.name, 'old_is_active', OLD.is_active, 'new_is_active', NEW.is_active));
  ELSIF TG_TABLE_NAME = 'products' AND TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('product_deleted', 'product', OLD.id, actor, 'Suppression d’un article',
      jsonb_build_object('name', OLD.name, 'producer_id', OLD.producer_id));
  ELSIF TG_TABLE_NAME = 'orders' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('sale_created', 'order', NEW.id, actor, 'Vente réalisée',
      jsonb_build_object('consumer_id', NEW.consumer_id, 'total', NEW.total, 'status', NEW.status));
  ELSIF TG_TABLE_NAME = 'orders' AND TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_events (event_type, entity_type, entity_id, actor_id, title, details)
    VALUES ('sale_status_changed', 'order', NEW.id, actor, 'Statut d’une vente modifié',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'total', NEW.total));
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();

DROP TRIGGER IF EXISTS audit_producers_changes ON public.producers;
CREATE TRIGGER audit_producers_changes
  AFTER INSERT OR UPDATE OF status ON public.producers
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();

DROP TRIGGER IF EXISTS audit_products_changes ON public.products;
CREATE TRIGGER audit_products_changes
  AFTER INSERT OR UPDATE OF is_active OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();

DROP TRIGGER IF EXISTS audit_orders_changes ON public.orders;
CREATE TRIGGER audit_orders_changes
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();
