-- Entry music columns + anon storage policies for the scoring app (uses anon key, not Auth).

INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-music', 'entry-music', true)
ON CONFLICT (id) DO UPDATE SET public = true;

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS music_url TEXT,
  ADD COLUMN IF NOT EXISTS music_file_name TEXT;

DROP POLICY IF EXISTS "Anon can upload entry music" ON storage.objects;
DROP POLICY IF EXISTS "Anon can update entry music" ON storage.objects;
DROP POLICY IF EXISTS "Anon can delete entry music" ON storage.objects;

CREATE POLICY "Anon can upload entry music"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'entry-music');

CREATE POLICY "Anon can update entry music"
ON storage.objects FOR UPDATE TO anon
USING (bucket_id = 'entry-music')
WITH CHECK (bucket_id = 'entry-music');

CREATE POLICY "Anon can delete entry music"
ON storage.objects FOR DELETE TO anon
USING (bucket_id = 'entry-music');
