/*
  # Fix storage policies for content uploads

  1. Changes
    - Update storage RLS policies to allow proper file uploads
    - Simplify path validation
    - Keep public read access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Content is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload content" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own content" ON storage.objects;

-- Create new, simpler policies
-- Allow public read access
CREATE POLICY "Content is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'content');

-- Allow authenticated users to upload content
CREATE POLICY "Users can upload content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content');

-- Allow users to update their own content
CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content' AND owner = auth.uid());

-- Allow users to delete their own content
CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content' AND owner = auth.uid());