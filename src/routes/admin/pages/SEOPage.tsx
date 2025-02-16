import React, { useState } from 'react';
import { Globe, Search, Code, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

export default function SEOPage() {
  const [settings, setSettings] = useState({
    metaDescription: 'Download high-quality wallpapers and ringtones for your devices',
    keywords: 'wallpapers, ringtones, mobile wallpapers, phone ringtones, free wallpapers, free ringtones',
    googleVerification: '',
    bingVerification: '',
    yandexVerification: '',
    robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://yourdomain.com/sitemap.xml`,
    customMetaTags: [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'og:type', content: 'website' }
    ]
  });

  const [generatingSitemap, setGeneratingSitemap] = useState(false);

  const handleSave = async () => {
    try {
      // In a real app, save to database
      toast.success('SEO settings saved successfully');
    } catch (error) {
      toast.error('Error saving SEO settings');
    }
  };

  const generateSitemap = async () => {
    try {
      setGeneratingSitemap(true);

      // Fetch all approved content
      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      // Generate XML content
      const currentDate = new Date().toISOString();
      const baseURL = window.location.origin;

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap/1.1">
    <url>
        <loc>${baseURL}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.1</priority>
    </url>
    <url>
        <loc>${baseURL}/categories</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.1</priority>
    </url>
    <url>
        <loc>${baseURL}/latest</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.1</priority>
    </url>
    <url>
        <loc>${baseURL}/trending</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.1</priority>
    </url>
    <url>
        <loc>${baseURL}/popularity</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.1</priority>
    </url>
    ${content?.map(item => `
    <url>
        <loc>${baseURL}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</loc>
        <lastmod>${item.created_at}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`).join('\n')}
</urlset>`;

      // Create and download sitemap file
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Sitemap generated successfully!');
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast.error('Error generating sitemap');
    } finally {
      setGeneratingSitemap(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">SEO Settings</h1>

      {/* Meta Description */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Search className="mr-2" />
          Meta Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Meta Description</label>
            <textarea
              value={settings.metaDescription}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3"
              placeholder="Enter website meta description..."
            />
            <p className="text-sm text-gray-400 mt-1">
              Recommended length: 150-160 characters
            </p>
          </div>
          <div>
            <label className="block text-sm mb-2">Keywords</label>
            <textarea
              value={settings.keywords}
              onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3"
              placeholder="Enter keywords (comma separated)..."
            />
            <p className="text-sm text-gray-400 mt-1">
              Separate keywords with commas
            </p>
          </div>
        </div>
      </div>

      {/* Sitemap Generation */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Globe className="mr-2" />
          XML Sitemap
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            Generate a new XML sitemap with all your approved content. The sitemap will include all pages, categories, and content items with their latest modification dates.
          </p>
          <button
            onClick={generateSitemap}
            disabled={generatingSitemap}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {generatingSitemap ? (
              <>
                <RefreshCw size={20} className="mr-2 animate-spin" />
                Generating Sitemap...
              </>
            ) : (
              <>
                <RefreshCw size={20} className="mr-2" />
                Generate New Sitemap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Other SEO settings... */}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Save SEO Settings
        </button>
      </div>
    </div>
  );
}