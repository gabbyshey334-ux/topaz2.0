-- ============================================================================
-- FIX PHOTO UPLOAD - SUPABASE STORAGE BUCKET SETUP
-- This script ensures the entry-photos bucket exists with correct permissions
-- ============================================================================

-- Note: Storage buckets cannot be created via SQL in Supabase
-- You must create the bucket manually in the Supabase dashboard first!
-- 
-- Steps to create bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: entry-photos
-- 4. Public bucket: YES (checked) ← IMPORTANT!
-- 5. Click "Create bucket"

-- After creating the bucket manually, run this SQL to set up RLS policies:
--
-- IMPORTANT (TOPAZ scoring web app): The Vite app uses the Supabase ANON key.
-- Policies that only grant INSERT to "authenticated" will NOT allow browser uploads.
-- Include the "anon" policies below (or use only anon policies for this MVP).

-- ============================================================================
-- STORAGE POLICIES FOR entry-photos BUCKET
-- ============================================================================

-- Policy 1: Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload entry photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entry-photos'
);

-- Policy 2: Allow public read access to all photos
CREATE POLICY "Anyone can view entry photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'entry-photos'
);

-- Policy 3: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update entry photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'entry-photos'
)
WITH CHECK (
  bucket_id = 'entry-photos'
);

-- Policy 4: Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete entry photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'entry-photos'
);

-- Policy 5–7: ANON role (required for TOPAZ scoring app — uses VITE_SUPABASE_ANON_KEY)
DROP POLICY IF EXISTS "Anon can upload entry photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon can update entry photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon can delete entry photos" ON storage.objects;

CREATE POLICY "Anon can upload entry photos"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'entry-photos');

CREATE POLICY "Anon can update entry photos"
ON storage.objects FOR UPDATE TO anon
USING (bucket_id = 'entry-photos')
WITH CHECK (bucket_id = 'entry-photos');

CREATE POLICY "Anon can delete entry photos"
ON storage.objects FOR DELETE TO anon
USING (bucket_id = 'entry-photos');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies created for entry-photos bucket!';
  RAISE NOTICE '📸 Authenticated + anon users can now upload entry photos';
  RAISE NOTICE '👁️ Public can view photos';
  RAISE NOTICE '🔧 Authenticated + anon users can update/delete photos';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANT: Make sure the entry-photos bucket exists first!';
  RAISE NOTICE '   Go to: Supabase Dashboard → Storage → New bucket';
  RAISE NOTICE '   Name: entry-photos';
  RAISE NOTICE '   Public: YES (checked)';
END $$;

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%entry photo%';





