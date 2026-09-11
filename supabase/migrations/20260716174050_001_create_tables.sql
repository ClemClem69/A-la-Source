/*
# Create core tables for "Du Champ à l'Assiette"

## Overview
Creates all tables and enums for the farm-to-table marketplace.
Policies are added in a separate migration.

## New Tables
1. profiles, 2. producers, 3. categories, 4. products, 5. orders, 6. order_items,
7. reviews, 8. loyalty_points, 9. blog_posts, 10. recipes, 11. messages,
12. producer_documents, 13. settings

## Enums
- user_role, producer_status, product_unit, order_status, delivery_type
*/

-- ENUMS
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('consumer', 'producer', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE producer_status AS ENUM ('pending', 'active', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE product_unit AS ENUM ('kg', 'piece', 'bunch', 'tray', 'liter'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE delivery_type AS ENUM ('pickup'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'consumer',
  full_name text, phone text, address text, city text, postal_code text, preferences text, avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION (after profiles table exists)
CREATE OR REPLACE FUNCTION user_role() RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PRODUCERS
CREATE TABLE IF NOT EXISTS producers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL, siret text, description text,
  address text, city text, region text, postal_code text,
  latitude numeric(9,6), longitude numeric(9,6),
  certifications text[] DEFAULT '{}',
  status producer_status NOT NULL DEFAULT 'pending',
  logo_url text, cover_url text, farming_methods text,
  delivery_zones text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, slug text UNIQUE NOT NULL, icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL, slug text NOT NULL, description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  unit product_unit NOT NULL DEFAULT 'kg',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  image_url text, season text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_producer ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  delivery_type delivery_type NOT NULL DEFAULT 'pickup',
  delivery_address text, delivery_city text, delivery_postal_code text,
  delivery_slot text, pickup_point text, payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_consumer ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  producer_id uuid NOT NULL REFERENCES producers(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  quantity numeric(10,2) NOT NULL CHECK (quantity > 0),
  price_at_order numeric(10,2) NOT NULL,
  unit product_unit NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_producer ON order_items(producer_id);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  producer_id uuid REFERENCES producers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (product_id IS NOT NULL OR producer_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_producer ON reviews(producer_id);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- LOYALTY POINTS
CREATE TABLE IF NOT EXISTS loyalty_points (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, slug text UNIQUE NOT NULL,
  excerpt text, content text NOT NULL, image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RECIPES
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, slug text UNIQUE NOT NULL,
  excerpt text, content text NOT NULL, image_url text,
  prep_time integer, cook_time integer, servings integer,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- PRODUCER DOCUMENTS
CREATE TABLE IF NOT EXISTS producer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  type text NOT NULL, url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE producer_documents ENABLE ROW LEVEL SECURITY;

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1,
  platform_commission numeric(5,2) NOT NULL DEFAULT 10.00,
  validation_rules text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
INSERT INTO settings (id, platform_commission) VALUES (1, 10.00) ON CONFLICT (id) DO NOTHING;

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'consumer') ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();