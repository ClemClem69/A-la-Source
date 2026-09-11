-- Avoid circular RLS evaluation between orders and order_items
CREATE OR REPLACE FUNCTION public.producer_can_access_order(order_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN producers pr ON pr.id = oi.producer_id
    WHERE oi.order_id = order_uuid
      AND pr.user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = consumer_id
    OR user_role() = 'admin'
    OR producer_can_access_order(id)
  );

DROP POLICY IF EXISTS "update_own_or_producer_or_admin_order" ON orders;
CREATE POLICY "update_own_or_producer_or_admin_order" ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = consumer_id
    OR user_role() = 'admin'
    OR producer_can_access_order(id)
  )
  WITH CHECK (
    auth.uid() = consumer_id
    OR user_role() = 'admin'
    OR producer_can_access_order(id)
  );
