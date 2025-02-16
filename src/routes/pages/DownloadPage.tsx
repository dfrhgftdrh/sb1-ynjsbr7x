import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContentCard } from '../../components/ContentCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Play, Pause, Download, Heart, Share2, Tag, Calendar, Music, ImageIcon, User, Folder, Clock } from 'lucide-react';
import { updateMetaTags, generateMetaDescription, generateKeywords, generateStructuredData } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { ContentItem, Profile, Category } from '../../lib/types';

export default function DownloadPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedItems, setRelatedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    initializeContent();
  }, [slug]);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleEnded = () => {
      setIsPlaying(false);
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
    if (item) {
      // Update meta tags when item data is available
      updateMetaTags({
        title: `${item.title} - Download ${item.type === 'wallpapers' ? 'Wallpaper' : 'Ringtone'} | RingBuz`,
        description: generateMetaDescription(item.type === 'wallpapers' ? 'wallpaper' : 'ringtone', item),
        keywords: generateKeywords(item.type === 'wallpapers' ? 'wallpaper' : 'ringtone', item),
        ogImage: item.type === 'wallpapers' ? item.url : 'https://ringbuz.in/images/banner.jpg',
        canonicalUrl: `https://ringbuz.in/${item.slug || item.id}`,
        noIndex: item.no_index,
        structuredData: generateStructuredData(item.type, item)
      });
    }
  }, [item]);

  const initializeContent = async () => {
    if (!slug) return;

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
    try {
      // First try to find by slug
      let { data: contentData, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      // If not found by slug, try by ID
      if (!contentData && !contentError) {
        ({ data: contentData, error: contentError } = await supabase
          .from('content_items')
          .select('*')
          .eq('id', slug)
          .maybeSingle());
      }

      if (contentError) throw contentError;
      if (!contentData) throw new Error('Content not found');

      setItem(contentData);

      // Fetch author profile
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', contentData.user_id)
        .single();

      if (authorError) throw authorError;
      setAuthor(authorData);

      // Fetch category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('name', contentData.category)
        .eq('type', contentData.type)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);
      }

      // Fetch related items
      const { data: relatedData, error: relatedError } = await supabase
        .from('content_items')
        .select('*')
        .eq('type', contentData.type)
        .eq('is_approved', true)
        .eq('category', contentData.category)
        .neq('id', contentData.id)
        .limit(6);

      if (relatedError) throw relatedError;
      setRelatedItems(relatedData || []);

    } catch (error) {
      console.error('Error fetching content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content');
    }
  };

  const formatDuration = (duration: number | null): string => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !item || item.type !== 'ringtones') return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.src !== item.url) {
          audioRef.current.src = item.url;
          audioRef.current.load();
          await new Promise((resolve) => {
            if (audioRef.current) {
              audioRef.current.oncanplaythrough = resolve;
            }
          });
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Error playing audio');
      setIsPlaying(false);
    }
  };

  const handleDownload = async () => {
    if (!item || downloading) return;

    try {
      setDownloading(true);

      // Increment download count
      const { error: updateError } = await supabase
        .from('content_items')
        .update({ downloads: (item.downloads || 0) + 1 })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Fetch the file
      const response = await fetch(item.url);
      if (!response.ok) {
        throw new Error('Failed to download file. Please try again.');
      }

      const blob = await response.blob();
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title}.${item.type === 'wallpapers' ? 'jpg' : 'mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : 'Error starting download');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: item?.title,
        url: window.location.href
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Error sharing content');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !item || !author) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-red-500/20 p-8 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">Content Not Found</h2>
          <p className="text-gray-300 mb-4">{error || 'The requested content could not be found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20 p-8">
          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-pink-500/20">
            <div className="flex items-center text-gray-300">
              <Download size={20} className="text-pink-500 mr-2" />
              <span className="text-2xl font-bold">{item?.downloads.toLocaleString()}</span>
              <span className="ml-2 text-gray-400">downloads</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Calendar size={20} className="mr-2" />
              <span>Uploaded {new Date(item?.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              {item.type === 'wallpapers' ? (
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={handlePlayPause}
                        className="w-20 h-20 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center transition-all transform hover:scale-110 mb-3"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white" />
                        )}
                      </button>
                      {item.duration && (
                        <div className="flex items-center text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Clock size={16} className="mr-2" />
                          {formatDuration(item.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-2 mb-4">
                {item.type === 'wallpapers' ? (
                  <ImageIcon size={24} className="text-pink-500" />
                ) : (
                  <Music size={24} className="text-pink-500" />
                )}
                <h1 className="text-3xl font-bold text-white">{item.title}</h1>
              </div>

              <p className="text-gray-300 mb-6">{item.description}</p>

              <div className="space-y-4 mb-8">
                {category && (
                  <Link
                    to={`/explore/${category.slug}`}
                    className="flex items-center text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    <Folder size={16} className="mr-2" />
                    {category.name}
                  </Link>
                )}
                {item.file_size > 0 && (
                  <div className="flex items-center text-gray-400">
                    <Music size={16} className="mr-2" />
                    {formatFileSize(item.file_size)}
                  </div>
                )}
                <Link
                  to={`/profile/${author.id}`}
                  className="flex items-center text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <User size={16} className="mr-2" />
                  {author.username}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {item.tags?.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tag/${tag}`}
                      className="flex items-center px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-full text-sm transition-colors"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg py-3 hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={20} className="mr-2" />
                      Download
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Share2 size={20} />
                </button>
                <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Content */}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Related {item.type === 'wallpapers' ? 'Wallpapers' : 'Ringtones'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {relatedItems.map((relatedItem) => (
                <ContentCard
                  key={relatedItem.id}
                  item={relatedItem}
                  onPlayPause={handlePlayPause}
                  isPlaying={isPlaying}
                  currentlyPlaying={item.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}