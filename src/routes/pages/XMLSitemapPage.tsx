import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ContentItem, Category } from '../../lib/types';

export default function XMLSitemapPage() {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      // Fetch all approved content
      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      // Fetch all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      const baseURL = window.location.origin;
      const currentDate = new Date().toISOString();

      // Generate XML content
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap/1.1">
  <url>
    <loc>${baseURL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseURL}/categories</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseURL}/trending</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${categories?.map((category: Category) => `
  <url>
    <loc>${baseURL}/explore/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
  ${content?.map((item: ContentItem) => `
  <url>
    <loc>${baseURL}/${item.slug || item.id}</loc>
    <lastmod>${item.created_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    ${item.type === 'wallpapers' ? `
    <image:image>
      <image:loc>${item.url}</image:loc>
      <image:title>${item.title}</image:title>
      <image:caption>${item.description || item.title}</image:caption>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

      setXmlContent(xml);

      // Set content type to XML
      document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'text/xml; charset=utf-8');
      document.head.appendChild(meta);

    } catch (error) {
      console.error('Error generating sitemap:', error);
    }
  };

  // Return pre-formatted XML
  return (
    <pre style={{ 
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      margin: 0,
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '14px',
      backgroundColor: '#1a1b2e',
      color: '#fff'
    }}>
      {xmlContent}
    </pre>
  );
}