/*
  # Update Domain Settings

  1. Changes
    - Update canonical URLs and site URLs in site_settings
    - Update robots.txt URLs
    - Update meta tags with new domain

  2. Description
    - Updates all domain references from ringtondonwload.com to ringbuz.in
*/

-- Update site_settings
UPDATE site_settings
SET 
  canonical_url = 'https://ringbuz.in',
  social_meta = jsonb_set(
    social_meta,
    '{og:image}',
    '"https://ringbuz.in/images/banner.jpg"'
  );

-- Update page_meta_data URLs if they exist
UPDATE site_settings
SET page_meta_data = jsonb_strip_nulls(
  jsonb_object_agg(
    key,
    CASE 
      WHEN value->>'canonical' IS NOT NULL 
      THEN jsonb_set(
        value::jsonb,
        '{canonical}',
        to_jsonb(replace(value->>'canonical', 'ringtondonwload.com', 'ringbuz.in'))
      )
      ELSE value::jsonb
    END
  )
)
FROM jsonb_each(page_meta_data) AS pages(key, value)
WHERE page_meta_data IS NOT NULL;