import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Image as ImageIcon, 
  Music, 
  Battery as Category, 
  Shield, 
  Loader, 
  Settings, 
  BarChart, 
  Download,
  Code,
  Globe,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ContentItem = Database['public']['Tables']['content_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

type Stats = {
  totalUsers: number;
  totalContent: number;
  totalDownloads: number;
  wallpaperCount: number;
  ringtoneCount: number;
};

type WebsiteSettings = {
  headerScripts: string;
  googleAnalytics: string;
  adsenseCode: string;
  metaDescription: string;
  keywords: string;
  socialLogins: {
    google: boolean;
    facebook: boolean;
  };
  adPlacements: {
    header: boolean;
    sidebar: boolean;
    downloadPage: boolean;
    beforeDownload: boolean;
  };
  storage: {
    provider: 'supabase' | 's3';
    region: string;
    bucket: string;
  };
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'categories' | 'settings' | 'seo' | 'ads'>('dashboard');
  const [users, setUsers] = useState<Profile[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalContent: 0,
    totalDownloads: 0,
    wallpaperCount: 0,
    ringtoneCount: 0
  });
  const [settings, setSettings] = useState<WebsiteSettings>({
    headerScripts: '',
    googleAnalytics: '',
    adsenseCode: '',
    metaDescription: '',
    keywords: '',
    socialLogins: {
      google: false,
      facebook: false
    },
    adPlacements: {
      header: false,
      sidebar: false,
      downloadPage: false,
      beforeDownload: true
    },
    storage: {
      provider: 'supabase',
      region: '',
      bucket: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'wallpapers' as const });
  const [searchTerm, setSearchTerm] = useState('');
  const [contentFilter, setContentFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Add filtered content and users
  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [usersData, contentData] = await Promise.all([
        supabase.from('profiles').select('count'),
        supabase.from('content_items').select('*')
      ]);

      if (usersData.error || contentData.error) throw new Error('Error fetching stats');

      const totalUsers = usersData.count || 0;
      const items = contentData.data || [];
      const totalDownloads = items.reduce((sum, item) => sum + item.downloads, 0);
      const wallpaperCount = items.filter(item => item.type === 'wallpapers').length;
      const ringtoneCount = items.filter(item => item.type === 'ringtones').length;

      setStats({
        totalUsers,
        totalContent: items.length,
        totalDownloads,
        wallpaperCount,
        ringtoneCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error fetching dashboard stats');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUsers(data || []);
      } else if (activeTab === 'content') {
        let query = supabase
          .from('content_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (contentFilter !== 'all') {
          query = query.eq('is_approved', contentFilter === 'approved');
        }

        const { data, error } = await query;
        if (error) throw error;
        setContent(data || []);
      } else if (activeTab === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (error) throw error;
        setCategories(data || []);
      }
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      // In a real app, save to database
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Error saving settings');
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      if (error) throw error;
      toast.success('User role updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Error updating user role');
      console.error('Error:', error);
    }
  };

  const handleContentApproval = async (contentId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ is_approved: isApproved })
        .eq('id', contentId);
      if (error) throw error;
      toast.success(isApproved ? 'Content approved' : 'Content rejected');
      fetchData();
    } catch (error) {
      toast.error('Error updating content status');
      console.error('Error:', error);
    }
  };

  const handleContentDelete = async (contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', contentId);
      if (error) throw error;
      toast.success('Content deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Error deleting content');
      console.error('Error:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);
      if (error) throw error;
      toast.success('Category added successfully');
      setNewCategory({ name: '', type: 'wallpapers' });
      fetchData();
    } catch (error) {
      toast.error('Error adding category');
      console.error('Error:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Error deleting category');
      console.error('Error:', error);
    }
  };

  const renderSettingsTab = () => (
    <div className="space-y-8">
      {/* Header Scripts */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Header Scripts</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Google Analytics</label>
            <textarea
              value={settings.googleAnalytics}
              onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3 font-mono text-sm"
              placeholder="<!-- Google Analytics code -->"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Google AdSense</label>
            <textarea
              value={settings.adsenseCode}
              onChange={(e) => setSettings({ ...settings, adsenseCode: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3 font-mono text-sm"
              placeholder="<!-- AdSense code -->"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Custom Header Scripts</label>
            <textarea
              value={settings.headerScripts}
              onChange={(e) => setSettings({ ...settings, headerScripts: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3 font-mono text-sm"
              placeholder="<!-- Custom scripts -->"
            />
          </div>
        </div>
      </div>

      {/* Social Login Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Social Login</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="googleLogin"
              checked={settings.socialLogins.google}
              onChange={(e) => setSettings({
                ...settings,
                socialLogins: { ...settings.socialLogins, google: e.target.checked }
              })}
              className="mr-3"
            />
            <label htmlFor="googleLogin">Enable Google Login</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="facebookLogin"
              checked={settings.socialLogins.facebook}
              onChange={(e) => setSettings({
                ...settings,
                socialLogins: { ...settings.socialLogins, facebook: e.target.checked }
              })}
              className="mr-3"
            />
            <label htmlFor="facebookLogin">Enable Facebook Login</label>
          </div>
        </div>
      </div>

      {/* Storage Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Storage Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Storage Provider</label>
            <select
              value={settings.storage.provider}
              onChange={(e) => setSettings({
                ...settings,
                storage: { ...settings.storage, provider: e.target.value as 'supabase' | 's3' }
              })}
              className="w-full bg-gray-700 rounded px-3 py-2"
            >
              <option value="supabase">Supabase Storage</option>
              <option value="s3">Amazon S3</option>
            </select>
          </div>
          {settings.storage.provider === 's3' && (
            <>
              <div>
                <label className="block text-sm mb-2">Region</label>
                <input
                  type="text"
                  value={settings.storage.region}
                  onChange={(e) => setSettings({
                    ...settings,
                    storage: { ...settings.storage, region: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="us-east-1"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Bucket Name</label>
                <input
                  type="text"
                  value={settings.storage.bucket}
                  onChange={(e) => setSettings({
                    ...settings,
                    storage: { ...settings.storage, bucket: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="my-bucket"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSettingsSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderSEOTab = () => (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Meta Description</label>
            <textarea
              value={settings.metaDescription}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3"
              placeholder="Enter website meta description..."
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Keywords</label>
            <textarea
              value={settings.keywords}
              onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
              className="w-full h-32 bg-gray-700 rounded p-3"
              placeholder="Enter keywords (comma separated)..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdsTab = () => (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Ad Placements</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="headerAd"
              checked={settings.adPlacements.header}
              onChange={(e) => setSettings({
                ...settings,
                adPlacements: { ...settings.adPlacements, header: e.target.checked }
              })}
              className="mr-3"
            />
            <label htmlFor="headerAd">Show header ad</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sidebarAd"
              checked={settings.adPlacements.sidebar}
              onChange={(e) => setSettings({
                ...settings,
                adPlacements: { ...settings.adPlacements, sidebar: e.target.checked }
              })}
              className="mr-3"
            />
            <label htmlFor="sidebarAd">Show sidebar ad</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="downloadPageAd"
              checked={settings.adPlacements.downloadPage}
              onChange={(e) => setSettings({
                ...settings,
                adPlacements: { ...settings.adPlacements, downloadPage: e.target.checked }
              })}
              className="mr-3"
            />
            <label htmlFor="downloadPageAd">Show download page ad</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="beforeDownloadAd"
              checked={settings.adPlacements.beforeDownload}
              onChange={(e) => setSettings({
                ...settings,
                adPlacements: { ...settings.adPlacements, beforeDownload: e.target.checked }
              })}
              className="mr-3"
            />
            <label htmlFor="beforeDownloadAd">Show ad before download</label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <BarChart className="mr-2" size={20} />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Users className="mr-2" size={20} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'content' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Shield className="mr-2" size={20} />
          Content
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'categories' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Category className="mr-2" size={20} />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Settings className="mr-2" size={20} />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'seo' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Globe className="mr-2" size={20} />
          SEO
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'ads' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <DollarSign className="mr-2" size={20} />
          Ads
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <div className="flex items-center justify-between">
              <Users size={24} className="text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Total Downloads</h3>
            <div className="flex items-center justify-between">
              <Download size={24} className="text-green-500" />
              <span className="text-2xl font-bold">{stats.totalDownloads}</span>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Content Distribution</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <ImageIcon size={20} className="text-purple-500 mr-2" />
                  <span>Wallpapers: {stats.wallpaperCount}</span>
                </div>
                <div className="flex items-center">
                  <Music size={20} className="text-yellow-500 mr-2" />
                  <span>Ringtones: {stats.ringtoneCount}</span>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats.totalContent}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && renderSettingsTab()}
      {activeTab === 'seo' && renderSEOTab()}
      {activeTab === 'ads' && renderAdsTab()}

      {(activeTab === 'users' || activeTab === 'content') && (
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2"
          />
          {activeTab === 'content' && (
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as 'all' | 'pending' | 'approved')}
              className="bg-gray-700 rounded-lg px-4 py-2"
            >
              <option value="all">All Content</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700">
                    <td className="py-3">{user.username}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleUpdate(user.id, e.target.value as 'user' | 'admin')}
                        className="bg-gray-700 rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Content Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Downloads</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        {item.type === 'wallpapers' ? (
                          <ImageIcon size={20} className="mr-2" />
                        ) : (
                          <Music size={20} className="mr-2" />
                        )}
                        {item.title}
                      </div>
                    </td>
                    <td className="py-3">{item.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.is_approved ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {item.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3">{item.downloads}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleContentApproval(item.id, !item.is_approved)}
                          className={`px-3 py-1 rounded ${
                            item.is_approved
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {item.is_approved ? 'Reject' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleContentDelete(item.id)}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Category Management</h2>
          
          <form onSubmit={handleAddCategory} className="mb-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category name"
                className="flex-1 bg-gray-700 rounded px-3 py-2"
                required
              />
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'wallpapers' | 'ringtones' })}
                className="bg-gray-700 rounded px-3 py-2"
              >
                <option value="wallpapers">Wallpapers</option>
                <option value="ringtones">Ringtones</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Add Category
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between bg-gray-700 rounded p-4"
              >
                <div className="flex items-center">
                  {category.type === 'wallpapers' ? (
                    <ImageIcon size={20} className="mr-2" />
                  ) : (
                    <Music size={20} className="mr-2" />
                  )}
                  <span>{category.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">{category.type}</span>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}