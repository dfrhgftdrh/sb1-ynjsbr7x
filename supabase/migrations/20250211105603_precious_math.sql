-- Add noindex and sitemap columns to content_items
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS no_index boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS include_in_sitemap boolean DEFAULT true;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS content_items_no_index_idx ON content_items (no_index);
CREATE INDEX IF NOT EXISTS content_items_include_in_sitemap_idx ON content_items (include_in_sitemap);