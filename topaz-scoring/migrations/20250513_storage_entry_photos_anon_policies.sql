-- TOPAZ scoring app uses VITE_SUPABASE_ANON_KEY (role: anon), not Supabase Auth.
-- Without these policies, uploads to entry-photos fail with RLS / permission errors
-- even when the bucket exists and is public.
--
-- If the `entry-photos` bucket already exists (public), you only need this file:
-- applying the anon policies is enough for browser uploads. You do not have to
-- re-create the bucket or add the older "authenticated-only" policies for this app.
--
-- If the bucket does not exist yet: Dashboard → Storage → New bucket → name
-- `entry-photos`, enable Public — then run this SQL in the same project as .env.

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
