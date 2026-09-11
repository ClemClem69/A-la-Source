-- Restrict orders to pickup points for the initial launch.
DO $$
BEGIN
  ALTER TABLE orders ALTER COLUMN delivery_type DROP DEFAULT;
  UPDATE orders SET delivery_type = 'pickup';

  ALTER TYPE delivery_type RENAME TO delivery_type_legacy;
  CREATE TYPE delivery_type AS ENUM ('pickup');
  ALTER TABLE orders
    ALTER COLUMN delivery_type TYPE delivery_type
    USING 'pickup'::delivery_type;
  DROP TYPE delivery_type_legacy;

  ALTER TABLE orders ALTER COLUMN delivery_type SET DEFAULT 'pickup';
END $$;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pickup_only;
ALTER TABLE orders ADD CONSTRAINT orders_pickup_only CHECK (delivery_type = 'pickup');