import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type Stats = {
  totalUsers: number;
  totalContent: number;
  totalDownloads: number;
  wallpaperCount: number;
  ringtoneCount: number;
};

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalContent: 0,
    totalDownloads: 0,
    wallpaperCount: 0,
    ringtoneCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, contentData] = await Promise.all([
        supabase.from('profiles').select('count'),
        supabase.from('content_items').select('*')
      ]);

      if (usersData.error) throw usersData.error;
      if (contentData.error) throw contentData.error;

      const items = contentData.data || [];
      const totalDownloads = items.reduce((sum, item) => sum + (item.downloads || 0), 0);
      const wallpaperCount = items.filter(item => item.type === 'wallpapers').length;
      const ringtoneCount = items.filter(item => item.type === 'ringtones').length;

      setStats({
        totalUsers: usersData.count || 0,
        totalContent: items.length,
        totalDownloads,
        wallpaperCount,
        ringtoneCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}