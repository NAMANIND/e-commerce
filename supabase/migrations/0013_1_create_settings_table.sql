BEGIN;

-- Create settings table and related objects
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on the type column
CREATE INDEX IF NOT EXISTS idx_settings_type ON settings(type);

-- Create the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE settings
    DROP CONSTRAINT IF EXISTS unique_setting_type CASCADE,
    DROP CONSTRAINT IF EXISTS valid_setting_type CASCADE,
    DROP CONSTRAINT IF EXISTS valid_settings_json CASCADE;

ALTER TABLE settings
    ADD CONSTRAINT unique_setting_type UNIQUE (type),
    ADD CONSTRAINT valid_setting_type CHECK (type IN ('shipping', 'store', 'email', 'payment', 'content')),
    ADD CONSTRAINT valid_settings_json CHECK (jsonb_typeof(settings) = 'object');

COMMIT; 