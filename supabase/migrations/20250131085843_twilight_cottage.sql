/*
  # Create categories table and add initial data

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (text, either 'wallpapers' or 'ringtones')
      - `created_at` (timestamp)
      - `slug` (text, unique)
      - `description` (text)

  2. Security
    - Enable RLS on `categories` table
    - Add policies for:
      - Public read access
      - Admin-only write access

  3. Initial Data
    - Add default categories for both wallpapers and ringtones
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('wallpapers', 'ringtones')),
  created_at timestamptz DEFAULT now(),
  slug text UNIQUE NOT NULL,
  description text
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete categories"
  ON categories FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default categories
INSERT INTO categories (name, type, slug, description) VALUES
  -- Wallpaper categories
  ('Nature', 'wallpapers', 'nature', 'Beautiful nature and landscape wallpapers'),
  ('Abstract', 'wallpapers', 'abstract', 'Creative abstract and artistic wallpapers'),
  ('Anime', 'wallpapers', 'anime', 'Anime and manga inspired wallpapers'),
  ('Gaming', 'wallpapers', 'gaming', 'Video game themed wallpapers'),
  ('Minimal', 'wallpapers', 'minimal', 'Clean and minimalistic wallpapers'),
  
  -- Ringtone categories
  ('Popular', 'ringtones', 'popular', 'Most popular and trending ringtones'),
  ('Classical', 'ringtones', 'classical', 'Classical music ringtones'),
  ('Electronic', 'ringtones', 'electronic', 'Electronic and EDM ringtones'),
  ('Acoustic', 'ringtones', 'acoustic', 'Acoustic and instrumental ringtones'),
  ('Notification', 'ringtones', 'notification', 'Short notification sounds and alerts')
ON CONFLICT (slug) DO NOTHING;