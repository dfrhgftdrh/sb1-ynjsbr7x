/*
  # Add meta fields to content items

  1. Changes
    - Add meta_title column to content_items
    - Add meta_description column to content_items
    - Add meta_keywords column to content_items
    - Add meta_image column to content_items
    - Add meta_robots column to content_items

  2. Notes
    - These fields will store user/admin provided meta information
    - If not provided, system will generate default values
*/

-- Add meta fields to content_items
ALTER TABLE content_items
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text,
ADD COLUMN IF NOT EXISTS meta_image text,
ADD COLUMN IF NOT EXISTS meta_robots text DEFAULT 'index,follow';

-- Add meta fields to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text,
ADD COLUMN IF NOT EXISTS meta_image text,
ADD COLUMN IF NOT EXISTS meta_robots text DEFAULT 'index,follow';

-- Create function to update meta fields if empty
CREATE OR REPLACE FUNCTION update_empty_meta_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- For content items
  IF TG_TABLE_NAME = 'content_items' THEN
    NEW.meta_title = COALESCE(NEW.meta_title, NEW.title || ' - Download ' || 
      CASE WHEN NEW.type = 'wallpapers' THEN 'Wallpaper' ELSE 'Ringtone' END || 
      ' | RingBuz');
      
    NEW.meta_description = COALESCE(NEW.meta_description, 
      'Download ' || NEW.title || ' ' || NEW.type || ' for your device. High-quality ' || 
      NEW.category || ' ' || NEW.type || ' available for free download.');
      
    NEW.meta_keywords = COALESCE(NEW.meta_keywords, 
      array_to_string(ARRAY['download', 'free', NEW.title, NEW.type, NEW.category] || NEW.tags, ', '));
      
    NEW.meta_image = COALESCE(NEW.meta_image, 
      CASE WHEN NEW.type = 'wallpapers' THEN NEW.url 
      ELSE 'https://ringbuz.in/images/banner.jpg' END);
  
  -- For categories
  ELSIF TG_TABLE_NAME = 'categories' THEN
    NEW.meta_title = COALESCE(NEW.meta_title, 
      NEW.name || ' ' || NEW.type || ' - RingBuz');
      
    NEW.meta_description = COALESCE(NEW.meta_description, 
      'Browse and download ' || NEW.name || ' ' || NEW.type || 
      '. High-quality collection of ' || lower(NEW.name) || ' ' || NEW.type || 
      ' for your device.');
      
    NEW.meta_keywords = COALESCE(NEW.meta_keywords, 
      array_to_string(ARRAY['download', 'free', NEW.name, NEW.type, 
      NEW.name || ' ' || NEW.type], ', '));
      
    NEW.meta_image = COALESCE(NEW.meta_image, NEW.thumbnail_url);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for content items
DROP TRIGGER IF EXISTS update_content_meta_fields ON content_items;
CREATE TRIGGER update_content_meta_fields
  BEFORE INSERT OR UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_empty_meta_fields();

-- Create triggers for categories
DROP TRIGGER IF EXISTS update_category_meta_fields ON categories;
CREATE TRIGGER update_category_meta_fields
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_empty_meta_fields();