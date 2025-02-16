/*
  # Add custom slugs to content items

  1. Changes
    - Add slug column to content_items table
    - Add unique constraint on slug
    - Add function to generate slug from title if not provided
  
  2. Notes
    - Slugs must be unique across all content
    - Default slug will be generated from title if not provided
    - Custom slugs can be set manually
*/

-- Add slug column if it doesn't exist
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_content_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate slug from title
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          NEW.title,
          '[^a-zA-Z0-9\s-]',
          ''
        ),
        '\s+',
        '-'
      )
    );
    
    -- Append random string if slug exists
    IF EXISTS (SELECT 1 FROM content_items WHERE slug = NEW.slug) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
DROP TRIGGER IF EXISTS generate_content_slug_trigger ON content_items;
CREATE TRIGGER generate_content_slug_trigger
  BEFORE INSERT OR UPDATE OF title, slug
  ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION generate_content_slug();