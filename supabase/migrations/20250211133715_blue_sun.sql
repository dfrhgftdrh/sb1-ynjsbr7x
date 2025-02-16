-- Create oauth_settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'oauth_settings') THEN
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
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'oauth_settings' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE oauth_settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Only admins can view oauth settings" ON oauth_settings;
  DROP POLICY IF EXISTS "Only admins can insert oauth settings" ON oauth_settings;
  DROP POLICY IF EXISTS "Only admins can update oauth settings" ON oauth_settings;
  DROP POLICY IF EXISTS "Only admins can delete oauth settings" ON oauth_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Only admins can view oauth settings"
  ON oauth_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert oauth settings"
  ON oauth_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update oauth settings"
  ON oauth_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete oauth settings"
  ON oauth_settings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_oauth_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_oauth_settings_timestamp ON oauth_settings;
CREATE TRIGGER update_oauth_settings_timestamp
  BEFORE UPDATE ON oauth_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_oauth_settings_updated_at();

-- Insert initial record if none exists
INSERT INTO oauth_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM oauth_settings);