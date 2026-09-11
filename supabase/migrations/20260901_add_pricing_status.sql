-- Add pricing_status to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_status text DEFAULT 'pending';

-- Add constraint for valid status values
ALTER TABLE products ADD CONSTRAINT valid_pricing_status CHECK (pricing_status IN ('pending', 'validated'));

-- Set existing products as validated (they already have prices)
UPDATE products SET pricing_status = 'validated' WHERE pricing_status IS NULL OR pricing_status = 'pending';
