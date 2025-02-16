-- Add payment_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add index on payment_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Create RLS policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY; 