import React, { useState } from 'react';
import { DollarSign, Layout, Settings, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdsPage() {
  const [settings, setSettings] = useState({
    adsense: {
      clientId: '',
      enabled: true,
      autoAds: true
    },
    placements: {
      header: {
        enabled: true,
        code: '<!-- Ad code here -->'
      },
      sidebar: {
        enabled: true,
        code: '<!-- Ad code here -->'
      },
      content: {
        enabled: true,
        code: '<!-- Ad code here -->'
      },
      downloadPage: {
        enabled: true,
        code: '<!-- Ad code here -->'
      }
    },
    customCode: ''
  });

  const handleSave = async () => {
    try {
      // In a real app, save to database
      toast.success('Ad settings saved successfully');
    } catch (error) {
      toast.error('Error saving ad settings');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Ad Management</h1>

      {/* AdSense Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <DollarSign className="mr-2" />
          Google AdSense
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Publisher ID</label>
            <input
              type="text"
              value={settings.adsense.clientId}
              onChange={(e) => setSettings({
                ...settings,
                adsense: { ...settings.adsense, clientId: e.target.value }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="pub-xxxxxxxxxxxxxxxx"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.adsense.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  adsense: { ...settings.adsense, enabled: e.target.checked }
                })}
                className="mr-2"
              />
              Enable AdSense
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.adsense.autoAds}
                onChange={(e) => setSettings({
                  ...settings,
                  adsense: { ...settings.adsense, autoAds: e.target.checked }
                })}
                className="mr-2"
              />
              Enable Auto Ads
            </label>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Layout className="mr-2" />
          Ad Placements
        </h2>
        <div className="space-y-6">
          {Object.entries(settings.placements).map(([key, placement]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="checkbox"
                  checked={placement.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    placements: {
                      ...settings.placements,
                      [key]: { ...placement, enabled: e.target.checked }
                    }
                  })}
                />
              </div>
              <textarea
                value={placement.code}
                onChange={(e) => setSettings({
                  ...settings,
                  placements: {
                    ...settings.placements,
                    [key]: { ...placement, code: e.target.value }
                  }
                })}
                className="w-full h-24 bg-gray-700 rounded p-3 font-mono text-sm"
                placeholder="Paste ad code here..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Ad Code */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Code className="mr-2" />
          Custom Ad Code
        </h2>
        <div>
          <textarea
            value={settings.customCode}
            onChange={(e) => setSettings({ ...settings, customCode: e.target.value })}
            className="w-full h-48 bg-gray-700 rounded p-3 font-mono text-sm"
            placeholder="Add any custom ad code here..."
          />
          <p className="text-sm text-gray-400 mt-1">
            This code will be added to the &lt;head&gt; section of your site
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Save Ad Settings
        </button>
      </div>
    </div>
  );
}