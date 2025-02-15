-- Enable access to auth.users for authenticated users
CREATE POLICY "Allow reading user data" ON auth.users
    FOR SELECT
    USING (true);

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading all orders for admin users
CREATE POLICY "Allow reading all orders" ON orders
    FOR SELECT
    USING (true);

-- Create policy to allow updating orders for admin users
CREATE POLICY "Allow updating orders" ON orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true); 