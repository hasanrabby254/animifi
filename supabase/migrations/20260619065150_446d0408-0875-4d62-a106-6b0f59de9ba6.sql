
-- Tighten results table policies
DROP POLICY IF EXISTS "Public read results" ON public.results;
DROP POLICY IF EXISTS "Anyone can insert result" ON public.results;

CREATE POLICY "Public read public results"
ON public.results
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- Tighten storage policies on animify bucket
DROP POLICY IF EXISTS "Public read animify" ON storage.objects;
DROP POLICY IF EXISTS "Anyone upload animify" ON storage.objects;

CREATE POLICY "Public read animify morphs"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'animify' AND name LIKE 'morphs/%');
