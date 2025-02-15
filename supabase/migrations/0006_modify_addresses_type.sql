-- Set default value for type column and make it optional
ALTER TABLE addresses
ALTER COLUMN type SET DEFAULT 'shipping',
ALTER COLUMN type DROP NOT NULL;

-- Update existing records to have type='shipping' where it's null
UPDATE addresses
SET type = 'shipping'
WHERE type IS NULL; 