/*
  # Add Header Settings

  1. New Table
    - `site_settings`
      - `id` (uuid, primary key)
      - `header_scripts` (text) - For custom header scripts
      - `google_analytics` (text) - Google Analytics code
      - `adsense_code` (text) - AdSense code
      - `meta_title` (text) - Default meta title
      - `meta_description` (text) - Default meta description
      - `meta_keywords` (text) - Default meta keywords
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `site_settings` table
    - Add policies for admin access
*/

-- Create site_settings table
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  header_scripts text,
  google_analytics text,
  adsense_code text,
  meta_title text DEFAULT 'RingBuz - Free Wallpapers & Ringtones',
  meta_description text DEFAULT 'Download high-quality wallpapers and ringtones for your devices. Latest ringtone downloads for mobile, top 100 ringtones, and new song ringtones in mp3!',
  meta_keywords text DEFAULT 'wallpapers, ringtones, mobile wallpapers, phone ringtones, free wallpapers, free ringtones',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update site settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_timestamp
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert initial settings
INSERT INTO site_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;