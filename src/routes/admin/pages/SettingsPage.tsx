import React, { useState } from 'react';
import { Upload, Globe, Settings as SettingsIcon, FileText, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    site: {
      name: 'RingBuz',
      description: 'Download high-quality wallpapers and ringtones for your devices',
      favicon: '/vite.svg',
      logo: 'https://i.ibb.co/Jk0Gf1Z/ringbuz.png'
    },
    downloads: {
      desktop: {
        enabled: true,
        width: 1920,
        height: 1080
      },
      tablet: {
        enabled: true,
        width: 1024,
        height: 768
      },
      mobile: {
        enabled: true,
        width: 720,
        height: 1280
      }
    },
    social: {
      facebook: '',
      twitter: '',
      instagram: ''
    },
    content: {
      itemsPerPage: 20,
      relatedItemsCount: 5,
      loadMoreEnabled: true,
      autoPlayRelated: false,
      simultaneousLoading: {
        enabled: true,
        wallpapers: 20,
        ringtones: 20
      }
    },
    files: {
      robotsTxt: `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://ringbuz.in/sitemap.xml

# Disallow admin routes
Disallow: /admin/
Disallow: /auth/

# Allow specific content paths
Allow: /content/
Allow: /tag/
Allow: /explore/
Allow: /sitemap/`,
      adsTxt: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`,
    },
    urls: {
      contentUrlPattern: 'content/:id', // Default pattern
      customUrlPattern: ':slug', // Custom pattern
      useCustomUrls: false
    }
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a real app, save to database
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Site Settings</h1>

      {/* Basic Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <SettingsIcon className="mr-2" />
          Basic Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Site Name</label>
            <input
              type="text"
              value={settings.site.name}
              onChange={(e) => setSettings({
                ...settings,
                site: { ...settings.site, name: e.target.value }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Site Description</label>
            <textarea
              value={settings.site.description}
              onChange={(e) => setSettings({
                ...settings,
                site: { ...settings.site, description: e.target.value }
              })}
              className="w-full h-24 bg-gray-700 rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* URL Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <LinkIcon className="mr-2" />
          URL Settings
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Custom URLs</h3>
              <p className="text-sm text-gray-400">Enable custom URLs for content</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.urls.useCustomUrls}
                onChange={(e) => setSettings({
                  ...settings,
                  urls: { ...settings.urls, useCustomUrls: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {settings.urls.useCustomUrls && (
            <div>
              <label className="block text-sm font-medium mb-2">Custom URL Pattern</label>
              <input
                type="text"
                value={settings.urls.customUrlPattern}
                onChange={(e) => setSettings({
                  ...settings,
                  urls: { ...settings.urls, customUrlPattern: e.target.value }
                })}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder=":slug"
              />
              <p className="text-sm text-gray-400 mt-1">
                Use :slug as a placeholder for the custom URL part
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Default URL Pattern</label>
            <input
              type="text"
              value={settings.urls.contentUrlPattern}
              onChange={(e) => setSettings({
                ...settings,
                urls: { ...settings.urls, contentUrlPattern: e.target.value }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="content/:id"
            />
            <p className="text-sm text-gray-400 mt-1">
              Use :id as a placeholder for the content ID
            </p>
          </div>
        </div>
      </div>

      {/* File Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <FileText className="mr-2" />
          File Settings
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">robots.txt</label>
            <textarea
              value={settings.files.robotsTxt}
              onChange={(e) => setSettings({
                ...settings,
                files: { ...settings.files, robotsTxt: e.target.value }
              })}
              className="w-full h-64 bg-gray-700 rounded px-3 py-2 font-mono text-sm"
              placeholder="Enter robots.txt content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ads.txt</label>
            <textarea
              value={settings.files.adsTxt}
              onChange={(e) => setSettings({
                ...settings,
                files: { ...settings.files, adsTxt: e.target.value }
              })}
              className="w-full h-32 bg-gray-700 rounded px-3 py-2 font-mono text-sm"
              placeholder="Enter ads.txt content..."
            />
            <p className="text-sm text-gray-400 mt-1">
              Format: domain, publisher ID, relationship type, certification authority ID
            </p>
          </div>
        </div>
      </div>

      {/* Download Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Download Settings</h2>
        {Object.entries(settings.downloads).map(([device, config]) => (
          <div key={device} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium capitalize">{device}</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    downloads: {
                      ...settings.downloads,
                      [device]: { ...config, enabled: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Enable
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Width</label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => setSettings({
                    ...settings,
                    downloads: {
                      ...settings.downloads,
                      [device]: { ...config, width: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Height</label>
                <input
                  type="number"
                  value={config.height}
                  onChange={(e) => setSettings({
                    ...settings,
                    downloads: {
                      ...settings.downloads,
                      [device]: { ...config, height: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Globe className="mr-2" />
          Social Links
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Facebook</label>
            <input
              type="url"
              value={settings.social.facebook}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, facebook: e.target.value }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Twitter</label>
            <input
              type="url"
              value={settings.social.twitter}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, twitter: e.target.value }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Instagram</label>
            <input
              type="url"
              value={settings.social.instagram}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, instagram: e.target.value }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}