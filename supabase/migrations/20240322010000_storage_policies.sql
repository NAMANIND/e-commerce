-- Drop any existing policies first
DROP POLICY IF EXISTS "Public Access for Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for Site Content" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Site Content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Site Content" ON storage.objects;
DROP POLICY IF EXISTS "Public Read All" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Create necessary buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('category-images', 'category-images', true),
  ('product-images', 'product-images', true),
  ('site-content', 'site-content', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for all necessary operations
CREATE POLICY "Public Read All" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated Insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Grant usage on storage schema and buckets
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated; 