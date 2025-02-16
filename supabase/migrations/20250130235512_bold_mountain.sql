/*
  # Update Storage Configuration

  1. Changes
    - Enable public access for storage bucket
    - Set file size limit to 50MB
    - Define allowed MIME types for audio and images
*/

-- Update storage bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'image/jpeg', 'image/png', 'image/webp']
WHERE id = 'content';

-- Add storage configuration for CORS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-public',
  'content-public',
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;