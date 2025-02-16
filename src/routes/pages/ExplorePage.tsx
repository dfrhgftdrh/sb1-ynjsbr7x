import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContentCard } from '../../components/ContentCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Music, ImageIcon, ArrowLeft } from 'lucide-react';
import { updateMetaTags, generateMetaDescription, generateKeywords, generateStructuredData } from '../../lib/utils';
import type { ContentItem, Category } from '../../lib/types';

export default function ExplorePage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (!categorySlug) return;
    fetchCategoryAndContent();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      updateMetaTags({
        title: `${category.name} ${category.type === 'wallpapers' ? 'Wallpapers' : 'Ringtones'} - RingBuz`,
        description: generateMetaDescription('category', category),
        keywords: generateKeywords('category', category),
        canonicalUrl: `https://ringbuz.in/explore/${category.slug}`,
        ogImage: category.thumbnail_url || 'https://ringbuz.in/images/banner.jpg',
        structuredData: generateStructuredData('category', category)
      });
    }
  }, [category]);

  const fetchCategoryAndContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('Category not found');

      setCategory(categoryData);

      // Fetch content for category
      const { data: contentData, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('category', categoryData.name)
        .eq('is_approved', true)
        .order('downloads', { ascending: false });

      if (contentError) throw contentError;
      setContent(contentData || []);
    } catch (error) {
      console.error('Error fetching category:', error);
      setError(error instanceof Error ? error.message : 'Failed to load category');
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

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">Category Not Found</h2>
          <p className="text-gray-300 mb-6">{error || 'The requested category could not be found.'}</p>
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20 overflow-hidden mb-8">
        {/* Thumbnail */}
        {category.thumbnail_url && (
          <div className="aspect-[3/1] w-full overflow-hidden">
            <img
              src={category.thumbnail_url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/categories"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} className="mr-1" />
              Categories
            </Link>
            <div className="flex items-center gap-2">
              {category.type === 'wallpapers' ? (
                <ImageIcon size={24} className="text-pink-500" />
              ) : (
                <Music size={24} className="text-pink-500" />
              )}
              <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            </div>
          </div>

          {category.about ? (
            <div 
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: category.about }}
            />
          ) : category.description && (
            <p className="text-gray-300">{category.description}</p>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {content.length > 0 ? (
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
          <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
            {category.type === 'wallpapers' ? (
              <ImageIcon size={32} className="text-pink-500" />
            ) : (
              <Music size={32} className="text-pink-500" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Content Yet</h2>
          <p className="text-gray-400 mb-6">
            There's no content in this category yet. Check back later or explore other categories.
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
          >
            <ArrowLeft size={20} className="mr-2" />
            Browse Categories
          </Link>
        </div>
      )}
    </div>
  );
}