import React, { useState, useEffect } from 'react';
import { Lock, Globe, Key, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
  redirectUrl: string;
  scopes?: string;
  additionalConfig?: Record<string, string>;
}

export default function OAuthSettingsPage() {
  const [providers, setProviders] = useState<Record<string, OAuthProvider>>({
    google: {
      name: 'Google',
      clientId: '',
      clientSecret: '',
      enabled: false,
      redirectUrl: '/auth/callback',
      scopes: 'email profile',
      additionalConfig: {
        prompt: 'consent'
      }
    },
    facebook: {
      name: 'Facebook',
      clientId: '',
      clientSecret: '',
      enabled: false,
      redirectUrl: '/auth/callback',
      scopes: 'email public_profile'
    },
    github: {
      name: 'GitHub',
      clientId: '',
      clientSecret: '',
      enabled: false,
      redirectUrl: '/auth/callback',
      scopes: 'user:email'
    }
  });

  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // First try to get existing settings
      const { data, error } = await supabase
        .from('oauth_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, create initial record
      if (!data) {
        const { error: insertError } = await supabase
          .from('oauth_settings')
          .insert([{}])
          .select()
          .single();

        if (insertError) throw insertError;
        return; // Settings will be empty, use defaults
      }

      // Update providers with saved settings
      setProviders(prevProviders => ({
        ...prevProviders,
        ...Object.keys(prevProviders).reduce((acc, key) => ({
          ...acc,
          [key]: {
            ...prevProviders[key],
            clientId: data[`${key}_client_id`] || '',
            clientSecret: data[`${key}_client_secret`] || '',
            enabled: data[`${key}_enabled`] || false
          }
        }), {})
      }));
    } catch (error) {
      console.error('Error loading OAuth settings:', error);
      toast.error('Failed to load OAuth settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settings = Object.entries(providers).reduce((acc, [key, provider]) => ({
        ...acc,
        [`${key}_client_id`]: provider.clientId,
        [`${key}_client_secret`]: provider.clientSecret,
        [`${key}_enabled`]: provider.enabled
      }), {});

      const { error } = await supabase
        .from('oauth_settings')
        .update(settings)
        .neq('id', null); // Update all records (should only be one)

      if (error) throw error;

      toast.success('OAuth settings saved successfully');
    } catch (error) {
      console.error('Error saving OAuth settings:', error);
      toast.error('Failed to save OAuth settings');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (provider: string) => {
    setTestStatus(prev => ({ ...prev, [provider]: true }));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}${providers[provider].redirectUrl}`,
          scopes: providers[provider].scopes,
          ...providers[provider].additionalConfig
        }
      });

      if (error) throw error;
      toast.success(`${providers[provider].name} connection test successful`);
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      toast.error(`Failed to test ${provider} connection`);
    } finally {
      setTestStatus(prev => ({ ...prev, [provider]: false }));
    }
  };

  const updateProvider = (
    provider: string,
    field: keyof OAuthProvider,
    value: string | boolean
  ) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">OAuth Settings</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-500">Important Notes</h3>
            <ul className="list-disc list-inside text-yellow-400/80 space-y-1 mt-2">
              <li>Create OAuth applications in the respective provider's developer console</li>
              <li>Use the exact redirect URL shown below for each provider</li>
              <li>Enable the necessary APIs and permissions in the provider's console</li>
              <li>Keep client secrets secure and never share them</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(providers).map(([key, provider]) => (
          <div key={key} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  {key === 'google' ? (
                    <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  ) : key === 'facebook' ? (
                    <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{provider.name}</h2>
                  <p className="text-gray-400 text-sm">Configure {provider.name} OAuth settings</p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={(e) => updateProvider(key, 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Key className="w-4 h-4 inline-block mr-1" />
                  Client ID
                </label>
                <input
                  type="text"
                  value={provider.clientId}
                  onChange={(e) => updateProvider(key, 'clientId', e.target.value)}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  placeholder={`Enter ${provider.name} Client ID`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Lock className="w-4 h-4 inline-block mr-1" />
                  Client Secret
                </label>
                <input
                  type="password"
                  value={provider.clientSecret}
                  onChange={(e) => updateProvider(key, 'clientSecret', e.target.value)}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  placeholder={`Enter ${provider.name} Client Secret`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Globe className="w-4 h-4 inline-block mr-1" />
                  Redirect URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={provider.redirectUrl}
                    readOnly
                    className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(provider.redirectUrl)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Use this URL in your {provider.name} OAuth application settings
                </p>
              </div>

              {provider.scopes && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Required Scopes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {provider.scopes.split(' ').map(scope => (
                      <span
                        key={scope}
                        className="px-2 py-1 bg-pink-500/10 text-pink-400 rounded text-sm"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => testConnection(key)}
                  disabled={!provider.enabled || !provider.clientId || !provider.clientSecret || testStatus[key]}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700 rounded text-sm flex items-center gap-2"
                >
                  {testStatus[key] ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}