-- First drop the existing foreign key constraint
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Then add the correct foreign key constraint to auth.users
ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL; 