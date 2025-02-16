/*
  # Add OAuth Settings Table

  1. New Tables
    - `oauth_settings` - Stores OAuth provider configurations
      - `id` (uuid, primary key)
      - `google_client_id` (text)
      - `google_client_secret` (text)
      - `google_enabled` (boolean)
      - `facebook_client_id` (text) 
      - `facebook_client_secret` (text)
      - `facebook_enabled` (boolean)
      - `github_client_id` (text)
      - `github_client_secret` (text) 
      - `github_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for admin access only
*/

-- Create oauth_settings table
CREATE TABLE oauth_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_client_id text,
  google_client_secret text,
  google_enabled boolean DEFAULT false,
  facebook_client_id text,
  facebook_client_secret text,
  facebook_enabled boolean DEFAULT false,
  github_client_id text,
  github_client_secret text,
  github_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE oauth_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Only admins can view oauth settings"
  ON oauth_settings
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can insert oauth settings"
  ON oauth_settings
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can update oauth settings"
  ON oauth_settings
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can delete oauth settings"
  ON oauth_settings
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_oauth_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_oauth_settings_timestamp
  BEFORE UPDATE ON oauth_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_oauth_settings_updated_at();

-- Insert initial empty record
INSERT INTO oauth_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;