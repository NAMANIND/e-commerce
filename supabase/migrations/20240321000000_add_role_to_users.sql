-- Add role column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have customer role
UPDATE users
SET role = 'customer'
WHERE role IS NULL; 