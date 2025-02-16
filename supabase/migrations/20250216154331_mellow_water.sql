-- Create pages table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pages') THEN
    CREATE TABLE pages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      content text NOT NULL,
      meta_title text,
      meta_description text,
      meta_keywords text,
      meta_robots text DEFAULT 'index,follow',
      "order" integer DEFAULT 0,
      show_in_menu boolean DEFAULT false,
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
    WHERE tablename = 'pages' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
  DROP POLICY IF EXISTS "Only admins can insert pages" ON pages;
  DROP POLICY IF EXISTS "Only admins can update pages" ON pages;
  DROP POLICY IF EXISTS "Only admins can delete pages" ON pages;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

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

-- Insert default pages if they don't exist
INSERT INTO pages (title, slug, content, meta_title, meta_description, show_in_menu, "order")
SELECT * FROM (VALUES
  (
    'About Us',
    'about',
    'Welcome to RingBuz, your premier destination for high-quality wallpapers and ringtones. Our mission is to provide a platform where users can discover, share, and download the best content to personalize their devices.',
    'About RingBuz - Free Wallpapers & Ringtones',
    'Learn about RingBuz, your premier destination for high-quality wallpapers and ringtones. Discover our mission and features.',
    true,
    1
  ),
  (
    'Copyright Policy',
    'copyright',
    'RingBuz respects the intellectual property rights of others and expects its users to do the same. We take copyright infringement seriously and will respond to notices of alleged copyright infringement that comply with applicable law.',
    'Copyright Information - RingBuz',
    'Read about RingBuz copyright policies, DMCA compliance, and content usage guidelines.',
    true,
    2
  ),
  (
    'Privacy Policy',
    'privacy',
    'Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.',
    'Privacy Policy - RingBuz',
    'Read our privacy policy to understand how we collect, use, and protect your personal information.',
    true,
    3
  ),
  (
    'Terms of Service',
    'terms',
    'By using RingBuz, you agree to these terms of service. Please read them carefully before using our platform.',
    'Terms of Service - RingBuz',
    'Read our terms of service to understand the rules and guidelines for using RingBuz.',
    true,
    4
  )
) AS v(title, slug, content, meta_title, meta_description, show_in_menu, "order")
WHERE NOT EXISTS (
  SELECT 1 FROM pages WHERE slug IN ('about', 'copyright', 'privacy', 'terms')
);