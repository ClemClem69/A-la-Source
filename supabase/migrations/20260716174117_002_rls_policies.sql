/*
# RLS Policies for "Du Champ à l'Assiette"

## Overview
Adds Row Level Security policies to all tables created in migration 001.

## Security Model
- Public (anon) can read: active products, active producers, categories, published blog/recipes, all reviews, settings.
- Authenticated consumers: CRUD their own profile, orders, reviews, loyalty, messages.
- Authenticated producers: manage their own producer profile, products, see orders containing their products.
- Admins: full access to everything.

## Policy Naming
Each policy uses a descriptive name prefixed with the table and action.
*/

-- PROFILES
DROP POLICY IF EXISTS "select_own_or_admin_profile" ON profiles;
CREATE POLICY "select_own_or_admin_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR user_role() = 'admin');

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- PRODUCERS
DROP POLICY IF EXISTS "select_producers" ON producers;
CREATE POLICY "select_producers" ON producers FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR auth.uid() = user_id OR user_role() = 'admin');

DROP POLICY IF EXISTS "insert_own_producer" ON producers;
CREATE POLICY "insert_own_producer" ON producers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_or_admin_producer" ON producers;
CREATE POLICY "update_own_or_admin_producer" ON producers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_role() = 'admin')
  WITH CHECK (auth.uid() = user_id OR user_role() = 'admin');

-- CATEGORIES
DROP POLICY IF EXISTS "select_categories" ON categories;
CREATE POLICY "select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_categories" ON categories;
CREATE POLICY "admin_manage_categories" ON categories FOR ALL
  TO authenticated
  USING (user_role() = 'admin')
  WITH CHECK (user_role() = 'admin');

-- PRODUCTS
DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    OR EXISTS (SELECT 1 FROM producers p WHERE p.id = products.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  );

DROP POLICY IF EXISTS "insert_own_product" ON products;
CREATE POLICY "insert_own_product" ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = products.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  );

DROP POLICY IF EXISTS "update_own_or_admin_product" ON products;
CREATE POLICY "update_own_or_admin_product" ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = products.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = products.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  );

DROP POLICY IF EXISTS "delete_own_or_admin_product" ON products;
CREATE POLICY "delete_own_or_admin_product" ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = products.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  );

-- ORDERS
DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = consumer_id
    OR user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = orders.id
      AND EXISTS (
        SELECT 1 FROM products p JOIN producers pr ON p.producer_id = pr.id
        WHERE p.id = oi.product_id AND pr.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "insert_own_order" ON orders;
CREATE POLICY "insert_own_order" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = consumer_id);

DROP POLICY IF EXISTS "update_own_or_producer_or_admin_order" ON orders;
CREATE POLICY "update_own_or_producer_or_admin_order" ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = consumer_id
    OR user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = orders.id
      AND EXISTS (
        SELECT 1 FROM products p JOIN producers pr ON p.producer_id = pr.id
        WHERE p.id = oi.product_id AND pr.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    auth.uid() = consumer_id
    OR user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM order_items oi WHERE oi.order_id = orders.id
      AND EXISTS (
        SELECT 1 FROM products p JOIN producers pr ON p.producer_id = pr.id
        WHERE p.id = oi.product_id AND pr.user_id = auth.uid()
      )
    )
  );

-- ORDER ITEMS
DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.consumer_id = auth.uid())
    OR user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM producers pr WHERE pr.id = order_items.producer_id AND pr.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.consumer_id = auth.uid())
  );

-- REVIEWS
DROP POLICY IF EXISTS "select_reviews" ON reviews;
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_review" ON reviews;
CREATE POLICY "insert_own_review" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_review" ON reviews;
CREATE POLICY "delete_own_review" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- LOYALTY POINTS
DROP POLICY IF EXISTS "select_own_loyalty" ON loyalty_points;
CREATE POLICY "select_own_loyalty" ON loyalty_points FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_loyalty" ON loyalty_points;
CREATE POLICY "insert_own_loyalty" ON loyalty_points FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_loyalty" ON loyalty_points;
CREATE POLICY "update_own_loyalty" ON loyalty_points FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BLOG POSTS
DROP POLICY IF EXISTS "select_published_blog" ON blog_posts;
CREATE POLICY "select_published_blog" ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL OR user_role() = 'admin');

DROP POLICY IF EXISTS "admin_manage_blog" ON blog_posts;
CREATE POLICY "admin_manage_blog" ON blog_posts FOR ALL
  TO authenticated
  USING (user_role() = 'admin')
  WITH CHECK (user_role() = 'admin');

-- RECIPES
DROP POLICY IF EXISTS "select_published_recipes" ON recipes;
CREATE POLICY "select_published_recipes" ON recipes FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL OR user_role() = 'admin');

DROP POLICY IF EXISTS "admin_manage_recipes" ON recipes;
CREATE POLICY "admin_manage_recipes" ON recipes FOR ALL
  TO authenticated
  USING (user_role() = 'admin')
  WITH CHECK (user_role() = 'admin');

-- MESSAGES
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "insert_own_message" ON messages;
CREATE POLICY "insert_own_message" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- PRODUCER DOCUMENTS
DROP POLICY IF EXISTS "select_own_or_admin_documents" ON producer_documents;
CREATE POLICY "select_own_or_admin_documents" ON producer_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = producer_documents.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  );

DROP POLICY IF EXISTS "insert_own_documents" ON producer_documents;
CREATE POLICY "insert_own_documents" ON producer_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = producer_documents.producer_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_or_admin_documents" ON producer_documents;
CREATE POLICY "delete_own_or_admin_documents" ON producer_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM producers p WHERE p.id = producer_documents.producer_id AND p.user_id = auth.uid())
    OR user_role() = 'admin'
  );

-- SETTINGS
DROP POLICY IF EXISTS "select_settings" ON settings;
CREATE POLICY "select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_settings" ON settings;
CREATE POLICY "admin_manage_settings" ON settings FOR ALL
  TO authenticated
  USING (user_role() = 'admin')
  WITH CHECK (user_role() = 'admin');