/*
  # Add storage bucket for content

  1. Changes
    - Create a new storage bucket named 'content' for storing wallpapers and ringtones
    - Enable RLS policies for the bucket
    - Add policies for authenticated users to upload and read content
*/

-- Enable storage by creating the bucket
INSERT INTO storage.buckets (id, name)
VALUES ('content', 'content')
ON CONFLICT DO NOTHING;

-- Set up RLS for the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to view content
CREATE POLICY "Content is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'content');

-- Allow authenticated users to upload content
CREATE POLICY "Users can upload content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own content
CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content' AND owner = auth.uid())
WITH CHECK (bucket_id = 'content' AND owner = auth.uid());

-- Allow users to delete their own content
CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content' AND owner = auth.uid());