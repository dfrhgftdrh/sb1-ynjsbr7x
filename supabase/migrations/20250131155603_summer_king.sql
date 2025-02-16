/*
  # Add Profile Features

  1. New Columns
    - Add bio, website, social links, and image fields to profiles table
    - Add updated_at timestamp for tracking profile changes

  2. Storage
    - Create storage bucket for profile images
    - Set up storage policies for profile images

  3. Changes
    - Add new columns to profiles table
    - Add storage configuration
    - Update RLS policies
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{"facebook": "", "twitter": "", "instagram": ""}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Create storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profile images
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Allow users to upload their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] IN ('avatars', 'covers')
);

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles' AND owner = auth.uid())
WITH CHECK (bucket_id = 'profiles' AND owner = auth.uid());

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles' AND owner = auth.uid());

-- Update storage bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB limit for profile images
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'profiles';

-- Add RLS policies for profile updates
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add index for faster profile lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);