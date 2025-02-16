/*
  # Add Category Thumbnails and Meta Information

  1. New Columns
    - `thumbnail_url` (text) - URL for category thumbnail image
    - `meta_title` (text) - SEO meta title
    - `meta_description` (text) - SEO meta description
    - `about` (text) - Detailed category description/about text

  2. Changes
    - Add new columns to categories table
    - Add default values for existing rows
*/

-- Add new columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS about text;