-- Add final_price column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS final_price numeric(10,2);

-- Set final_price to current price for existing products
UPDATE products SET final_price = price WHERE final_price IS NULL;

-- Make final_price not null and add check constraint
ALTER TABLE products ALTER COLUMN final_price SET NOT NULL;
ALTER TABLE products ADD CONSTRAINT final_price_check CHECK (final_price >= 0);
