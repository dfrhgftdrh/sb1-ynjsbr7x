/*
  # Update pages table and policies

  1. Changes
    - Add missing columns if they don't exist
    - Update RLS policies for better admin access control
    - Add trigger for updated_at timestamp

  2. Security
    - Update policies to use profiles table for admin role check
*/

-- Add columns if they don't exist
DO $$ 
BEGIN
  -- Add meta_title if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE pages ADD COLUMN meta_title text;
  END IF;

  -- Add meta_description if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE pages ADD COLUMN meta_description text;
  END IF;

  -- Add meta_keywords if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE pages ADD COLUMN meta_keywords text;
  END IF;

  -- Add meta_robots if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'meta_robots'
  ) THEN
    ALTER TABLE pages ADD COLUMN meta_robots text DEFAULT 'index,follow';
  END IF;

  -- Add order if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'order'
  ) THEN
    ALTER TABLE pages ADD COLUMN "order" integer DEFAULT 0;
  END IF;

  -- Add show_in_menu if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'show_in_menu'
  ) THEN
    ALTER TABLE pages ADD COLUMN show_in_menu boolean DEFAULT false;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Only admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Only admins can update pages" ON pages;
DROP POLICY IF EXISTS "Only admins can delete pages" ON pages;

-- Create new policies
CREATE POLICY "Pages are viewable by everyone"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert pages"
  ON pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update pages"
  ON pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete pages"
  ON pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_pages_timestamp ON pages;
CREATE TRIGGER update_pages_timestamp
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();