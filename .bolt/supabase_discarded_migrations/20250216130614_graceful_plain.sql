/*
  # Add SEO Fields to Site Settings

  1. Changes
    - Add canonical_url field to site_settings
    - Add page_meta_data JSONB field for storing page-specific meta data
    - Add social_meta JSONB field for social media meta tags

  2. Description
    - canonical_url: Store the base canonical URL for the site
    - page_meta_data: Store page-specific meta titles, descriptions, and canonical URLs
    - social_meta: Store social media meta tags (og:image, twitter:card, etc.)
*/

-- Add new columns to site_settings
ALTER TABLE site_settings
ADD COLUMN canonical_url text DEFAULT 'https://ringtondonwload.com',
ADD COLUMN page_meta_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN social_meta jsonb DEFAULT json_build_object(
  'og:type', 'website',
  'og:image', 'https://ringtondonwload.com/images/banner.jpg',
  'twitter:card', 'summary_large_image',
  'twitter:site', '@ringbuz'
)::jsonb;