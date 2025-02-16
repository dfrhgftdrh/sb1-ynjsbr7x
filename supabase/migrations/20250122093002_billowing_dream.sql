/*
  # Add new fields to content_items table

  1. Changes
    - Add description field for content details
    - Add tags array for better content organization
    - Add file_size field for download information
    - Add dimensions field for wallpaper dimensions
    - Add duration field for ringtone length

  2. Notes
    - All new fields are nullable except description
    - Tags stored as text array for flexible categorization
    - File size stored in bytes
    - Dimensions stored as string (e.g., "1920x1080")
    - Duration stored in seconds
*/

-- Add new columns to content_items table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_items' AND column_name = 'description'
  ) THEN
    ALTER TABLE content_items ADD COLUMN description text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_items' AND column_name = 'tags'
  ) THEN
    ALTER TABLE content_items ADD COLUMN tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_items' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE content_items ADD COLUMN file_size bigint DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_items' AND column_name = 'dimensions'
  ) THEN
    ALTER TABLE content_items ADD COLUMN dimensions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_items' AND column_name = 'duration'
  ) THEN
    ALTER TABLE content_items ADD COLUMN duration numeric;
  END IF;
END $$;