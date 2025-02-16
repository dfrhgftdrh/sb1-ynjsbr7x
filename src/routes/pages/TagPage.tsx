import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContentCard } from '../../components/ContentCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Tag, AlertCircle, Music, ImageIcon, RefreshCw } from 'lucide-react';
import { updateMetaTags, generateMetaDescription, generateKeywords, generateStructuredData } from '../../lib/utils';
import type { ContentItem } from '../../lib/types';

export default function TagPage() {
  const { tag: urlTag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tag = urlTag ? decodeURIComponent(urlTag.replace(/^:/, '')) : null;

  useEffect(() => {
    if (!tag) {
      navigate('/', { replace: true });
      return;
    }
    initializeContent();
  }, [tag, navigate]);

  useEffect(() => {
    if (tag) {
      const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      updateMetaTags({
        title: `${formattedTag} Content - RingBuz`,
        description: generateMetaDescription('tag', tag),
        keywords: generateKeywords('tag', tag),
        canonicalUrl: `https://ringbuz.in/tag/${encodeURIComponent(tag)}`,
        ogImage: 'https://ringbuz.in/images/banner.jpg',
        structuredData: generateStructuredData('tag', tag)
      });
    }
  }, [tag]);

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

  const initializeContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);

      await fetchContent();
    } catch (error) {
      console.error('Error initializing content:', error);
      setError('Failed to initialize content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    if (!tag) return;
    
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_approved', true)
        .contains('tags', [tag])
        .order('downloads', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again.');
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

  if (!tag) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-red-500/20 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-6">Unable to connect to the server. Please check your internet connection and try again.</p>
          <button
            onClick={() => initializeContent()}
            className="inline-flex items-center px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  const wallpapers = content.filter(item => item.type === 'wallpapers');
  const ringtones = content.filter(item => item.type === 'ringtones');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="text-pink-500" size={24} />
          <h1 className="text-3xl font-bold text-white">
            {formattedTag}
          </h1>
        </div>
        <p className="text-gray-300 max-w-3xl">
          {generateMetaDescription('tag', tag)}
        </p>
        <p className="text-gray-400 mt-2">
          Found {content.length} {content.length === 1 ? 'item' : 'items'} in this collection
        </p>
      </div>

      {error ? (
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-red-500/20 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Content</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => initializeContent()}
            className="inline-flex items-center px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Try Again
          </button>
        </div>
      ) : content.length > 0 ? (
        <div className="space-y-12">
          {wallpapers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ImageIcon size={24} className="text-pink-500" />
                Wallpapers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {wallpapers.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onPlayPause={handlePlayPause}
                    isPlaying={isPlaying}
                    currentlyPlaying={currentlyPlaying}
                  />
                ))}
              </div>
            </div>
          )}

          {ringtones.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Music size={24} className="text-pink-500" />
                Ringtones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ringtones.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onPlayPause={handlePlayPause}
                    isPlaying={isPlaying}
                    currentlyPlaying={currentlyPlaying}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20">
          <AlertCircle size={48} className="mx-auto mb-4 text-pink-500" />
          <h2 className="text-xl font-semibold text-white mb-2">No Content Found</h2>
          <p className="text-gray-400 mb-6">
            We couldn't find any content tagged with "{tag}". Try exploring other categories or check back later.
          </p>
          <Link
            to="/sitemap/categories"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
          >
            <Music size={20} className="mr-2" />
            Browse Categories
          </Link>
        </div>
      )}
    </div>
  );
}