DROP POLICY IF EXISTS "Anyone can log a search" ON public.search_logs;
CREATE POLICY "Visitors can log their own searches" ON public.search_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND char_length(query) BETWEEN 1 AND 300
    AND char_length(normalized_query) <= 300
    AND (visitor_id IS NULL OR char_length(visitor_id) <= 64)
    AND (locale IS NULL OR char_length(locale) <= 10)
  );

DROP POLICY IF EXISTS "Anyone can record a visit" ON public.site_visits;
CREATE POLICY "Visitors can record their own visits" ON public.site_visits
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND char_length(path) BETWEEN 1 AND 500
    AND (visitor_id IS NULL OR char_length(visitor_id) <= 64)
    AND (locale IS NULL OR char_length(locale) <= 10)
    AND (referrer IS NULL OR char_length(referrer) <= 1000)
  );

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can list their own avatar files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);