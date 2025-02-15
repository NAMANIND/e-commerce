-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading orders with user information
CREATE POLICY "Allow reading orders with user info" ON orders
    FOR SELECT
    USING (true);  -- This allows anyone to read orders. Adjust if you need more restrictive access

-- Create policy to allow joining with auth.users
CREATE POLICY "Allow reading user emails for orders" ON auth.users
    FOR SELECT
    USING (true);  -- This allows reading email addresses for orders. Adjust if needed 