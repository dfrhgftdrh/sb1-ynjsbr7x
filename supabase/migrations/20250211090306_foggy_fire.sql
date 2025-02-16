/*
  # Update Storage Configuration

  1. Changes
    - Create and configure content bucket
    - Update bucket settings
    - Update storage policies
    
  2. Security
    - Ensure RLS is enabled
    - Update policies if they exist
*/

-- Create content bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Configure bucket settings
UPDATE storage.buckets
SET file_size_limit = 52428800, -- 50MB limit
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'audio/mpeg',
      'audio/wav'
    ]
WHERE id = 'content';

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Content is publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload content" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own content" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own content" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create new policies
CREATE POLICY "Content is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'content');

CREATE POLICY "Users can upload content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content');

CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content' AND owner = auth.uid());

CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content' AND owner = auth.uid());