-- Make the classmate-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'classmate-images';