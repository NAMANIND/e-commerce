-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public Read All" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Make sure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simple policies that allow authenticated users to do everything
CREATE POLICY "Allow Public Select"
  ON storage.objects FOR SELECT
  USING (true);

CREATE POLICY "Allow Authenticated Insert"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow Authenticated Update"
  ON storage.objects FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow Authenticated Delete"
  ON storage.objects FOR DELETE
  USING (auth.role() = 'authenticated');

-- Make sure permissions are granted
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon; 