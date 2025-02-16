import React from 'react';
import { Users, Download, Music, ImageIcon, TrendingUp, Calendar, Clock, ArrowUp } from 'lucide-react';
import { useStats } from '../hooks/useStats';

function DashboardPage() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-100">Total Users</h3>
            <Users className="text-blue-400" size={24} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</span>
            <div className="flex items-center text-blue-400 text-sm">
              <TrendingUp size={16} className="mr-1" />
              <span>Active</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-100">Total Downloads</h3>
            <Download className="text-green-400" size={24} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</span>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUp size={16} className="mr-1" />
              <span>This Month</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-100">Total Content</h3>
            <div className="flex items-center space-x-2 text-purple-400">
              <ImageIcon size={20} />
              <Music size={20} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{stats.totalContent.toLocaleString()}</span>
            <div className="flex items-center text-purple-400 text-sm">
              <Clock size={16} className="mr-1" />
              <span>All Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Content Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon size={20} className="text-pink-500 mr-2" />
                <span className="text-white">Wallpapers</span>
              </div>
              <span className="text-lg font-semibold text-white">{stats.wallpaperCount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-pink-500 h-full rounded-full"
                style={{ width: `${(stats.wallpaperCount / (stats.totalContent || 1)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <Music size={20} className="text-blue-500 mr-2" />
                <span className="text-white">Ringtones</span>
              </div>
              <span className="text-lg font-semibold text-white">{stats.ringtoneCount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${(stats.ringtoneCount / (stats.totalContent || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/content'}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg border border-pink-500/20 hover:from-pink-500/30 hover:to-pink-600/30 transition-all"
            >
              <ImageIcon size={24} className="mb-2 text-pink-400" />
              <span className="text-white">Manage Content</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all"
            >
              <Users size={24} className="mb-2 text-blue-400" />
              <span className="text-white">Manage Users</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/categories'}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/20 hover:from-purple-500/30 hover:to-purple-600/30 transition-all"
            >
              <Music size={24} className="mb-2 text-purple-400" />
              <span className="text-white">Categories</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-500/20 hover:from-green-500/30 hover:to-green-600/30 transition-all"
            >
              <Download size={24} className="mb-2 text-green-400" />
              <span className="text-white">Downloads</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;