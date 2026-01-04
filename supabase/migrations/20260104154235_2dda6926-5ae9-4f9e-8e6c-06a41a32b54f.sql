-- =====================================================
-- FIX 1: Remove privilege escalation vulnerability in user_roles
-- The handle_new_user trigger uses SECURITY DEFINER and bypasses RLS,
-- so we don't need any INSERT policy for regular users
-- =====================================================
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;

-- =====================================================
-- FIX 2: Secure images table - require authentication
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view images" ON public.images;
DROP POLICY IF EXISTS "Anyone can upload images" ON public.images;
DROP POLICY IF EXISTS "Anyone can delete images" ON public.images;

-- Authenticated users can view all images (shared content)
CREATE POLICY "Authenticated users can view images"
ON public.images
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON public.images
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can delete images
CREATE POLICY "Admins can delete images"
ON public.images
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- FIX 3: Secure storage bucket - make private and require auth
-- =====================================================
UPDATE storage.buckets 
SET public = false 
WHERE id = 'classmate-images';

-- Drop existing permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload images to classmate-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images in classmate-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images from classmate-images" ON storage.objects;

-- Authenticated users can upload to classmate-images
CREATE POLICY "Authenticated users can upload to classmate-images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'classmate-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can view images in classmate-images
CREATE POLICY "Authenticated users can view classmate-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'classmate-images' AND auth.uid() IS NOT NULL);

-- Only admins can delete from classmate-images
CREATE POLICY "Admins can delete from classmate-images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'classmate-images' AND has_role(auth.uid(), 'admin'));