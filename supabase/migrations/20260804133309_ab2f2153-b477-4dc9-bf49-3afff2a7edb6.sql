CREATE POLICY "anyone can read scheme images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'scheme-images');
CREATE POLICY "admins upload scheme images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'scheme-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update scheme images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'scheme-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete scheme images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'scheme-images' AND public.has_role(auth.uid(), 'admin'));