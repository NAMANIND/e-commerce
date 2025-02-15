-- Add name and phone fields to addresses table
ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NOT NULL DEFAULT '';

-- Remove the default values after adding the columns
ALTER TABLE addresses
ALTER COLUMN name DROP DEFAULT,
ALTER COLUMN phone DROP DEFAULT; 