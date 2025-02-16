/*
  # Fix Content RLS Policies

  1. Changes
    - Update content_items RLS policies to allow admin users to manage content
    - Add policy for admin content management
    - Fix insert policy for authenticated users
*/

-- Drop existing content policies
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content_items;
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content_items;
DROP POLICY IF EXISTS "Users can update own content" ON content_items;
DROP POLICY IF EXISTS "Users can delete own content" ON content_items;

-- Create new policies
-- Allow public read access to approved content
CREATE POLICY "Content is viewable by everyone"
  ON content_items FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Allow authenticated users to insert content
CREATE POLICY "Authenticated users can insert content"
  ON content_items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow users to update their own content or admins to update any content
CREATE POLICY "Users can update own content or admins can update any"
  ON content_items FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow users to delete their own content or admins to delete any content
CREATE POLICY "Users can delete own content or admins can delete any"
  ON content_items FOR DELETE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );