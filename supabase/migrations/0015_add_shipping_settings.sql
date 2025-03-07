-- Add shipping settings
INSERT INTO settings (type, settings)
VALUES (
    'shipping',
    '{
        "shipping_rate": 40,
        "free_shipping_threshold": 400
    }'::jsonb
)
ON CONFLICT (type) 
DO UPDATE SET 
    settings = EXCLUDED.settings,
    updated_at = TIMEZONE('utc'::text, NOW()); 