-- First drop the existing foreign key constraint
ALTER TABLE addresses
DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;

-- Then add the correct foreign key constraint to auth.users
ALTER TABLE addresses
ADD CONSTRAINT addresses_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE; 