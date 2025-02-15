-- Drop the shipping_address column if it exists
ALTER TABLE orders
DROP COLUMN IF EXISTS shipping_address;

-- Add shipping_address_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_address_id'
    ) THEN
        ALTER TABLE orders
        ADD COLUMN shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_id ON orders(shipping_address_id); 