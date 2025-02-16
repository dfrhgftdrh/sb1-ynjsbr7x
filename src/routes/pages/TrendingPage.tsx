import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ContentCard } from '../../components/ContentCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TrendingUp, Music, ImageIcon } from 'lucide-react';
import { updateMetaTags } from '../../lib/utils';
import type { ContentItem } from '../../lib/types';

export default function TrendingPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'ringtones'>('wallpapers');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    updateMetaTags({
      title: 'Trending Content - RingBuz',
      description: 'Discover the most popular and trending wallpapers and ringtones. Download the latest trending content for your device.',
      keywords: 'trending, popular, top downloads, best wallpapers, best ringtones',
      canonicalUrl: 'https://ringbuz.in/trending',
      ogImage: 'https://ringbuz.in/images/banner.jpg'
    });
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    fetchTrendingContent();
  }, [activeTab]);

  const fetchTrendingContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('type', activeTab)
        .eq('is_approved', true)
        .order('downloads', { ascending: false })
        .limit(30);

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      setError('Failed to load trending content');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async (item: ContentItem) => {
    if (!audioRef.current || item.type !== 'ringtones') return;

    try {
      if (currentlyPlaying === item.id) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        if (isPlaying) {
          audioRef.current.pause();
        }
        
        audioRef.current.src = item.url;
        audioRef.current.load();
        
        await new Promise((resolve) => {
          if (audioRef.current) {
            audioRef.current.oncanplaythrough = resolve;
          }
        });
        
        await audioRef.current.play();
        setCurrentlyPlaying(item.id);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <TrendingUp size={32} className="text-pink-500" />
        <h1 className="text-3xl font-bold text-white">Trending Now</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('wallpapers')}
          className={`flex items-center px-6 py-2 rounded-full ${
            activeTab === 'wallpapers'
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          } transition-colors`}
        >
          <ImageIcon size={20} className="mr-2" />
          Wallpapers
        </button>
        <button
          onClick={() => setActiveTab('ringtones')}
          className={`flex items-center px-6 py-2 rounded-full ${
            activeTab === 'ringtones'
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          } transition-colors`}
        >
          <Music size={20} className="mr-2" />
          Ringtones
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchTrendingContent}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      ) : content.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {content.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onPlayPause={handlePlayPause}
              isPlaying={isPlaying}
              currentlyPlaying={currentlyPlaying}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold text-white mb-2">No Trending Content</h2>
          <p className="text-gray-400">
            There's no trending content at the moment. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}