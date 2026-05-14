-- TOPAZ scoring app uses VITE_SUPABASE_ANON_KEY (role: anon), not Supabase Auth.
-- Without these policies, uploads to entry-photos fail with RLS / permission errors
-- even when the bucket exists and is public.
--
-- Prerequisite: create bucket `entry-photos` in Dashboard → Storage (public = on).
-- Then run this in the SQL Editor (same project as the app URL in .env).

-- Idempotent: drop if re-running
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
