import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContentCard } from '../../components/ContentCard';
import { AuthModal } from '../../components/AuthModal';
import { UploadModal } from '../../components/UploadModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Music, ImageIcon, Upload } from 'lucide-react';
import { updateMetaTags } from '../../lib/utils';
import type { Database } from '../../lib/database.types';
import type { Profile } from '../../lib/types';
import toast from 'react-hot-toast';

type ContentItem = Database['public']['Tables']['content_items']['Row'];

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<Profile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'ringtones'>('ringtones');
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    updateMetaTags({
      title: 'RingBuz - Free Wallpapers & Ringtones',
      description: 'Download high-quality wallpapers and ringtones for your devices. Latest ringtone downloads for mobile, top 100 ringtones, and new song ringtones in mp3!',
      keywords: 'wallpapers, ringtones, mobile wallpapers, phone ringtones, free wallpapers, free ringtones, mp3 ringtones',
      ogImage: 'https://ringbuz.in/images/banner.jpg',
      canonicalUrl: 'https://ringbuz.in'
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchQuery(search);
  }, [location.search]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(location.search);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      setCurrentItem(null);
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
    if (searchQuery.trim()) {
      const filtered = content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
      setFilteredContent(filtered);
    } else {
      setFilteredContent(content);
    }
  }, [searchQuery, content]);

  const handlePlayPause = async (item: ContentItem) => {
    if (!audioRef.current) return;

    try {
      if (currentlyPlaying === item.id) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          if (audioRef.current.src === item.url) {
            await audioRef.current.play();
            setIsPlaying(true);
          } else {
            audioRef.current.src = item.url;
            audioRef.current.load();
            await new Promise((resolve) => {
              audioRef.current!.oncanplaythrough = resolve;
            });
            await audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } else {
        if (isPlaying) {
          audioRef.current.pause();
        }
        
        audioRef.current.src = item.url;
        audioRef.current.load();
        
        await new Promise((resolve) => {
          audioRef.current!.oncanplaythrough = resolve;
        });
        
        await audioRef.current.play();
        setCurrentlyPlaying(item.id);
        setCurrentItem(item);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      setCurrentItem(null);
    }
  };

  const fetchContent = async (isLoadMore = false) => {
    try {
      setIsLoading(true);
      const from = isLoadMore ? page * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (isLoadMore) {
          setContent(prev => [...prev, ...data]);
        } else {
          setContent(data);
        }
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Error loading content');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setPage(prev => prev + 1);
    await fetchContent(true);
  };

  useEffect(() => {
    // Add a small delay before fetching content to ensure smooth initial render
    const timer = setTimeout(() => {
      initializeApp();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) setUser(data);
      }

      const { data: contentData } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_approved', true)
        .order('downloads', { ascending: false })
        .limit(18);

      if (contentData) {
        setContent(contentData);
        setFeaturedContent(contentData.slice(0, 6));
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      // Don't show error toast to users, just log it
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowUploadModal(true);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-64 bg-gray-800/50 rounded-3xl mb-12"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800/50 rounded-2xl"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {user && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          type={activeTab}
          userId={user.id}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-[#2a1b3d] to-[#1b2a3d] border border-pink-500/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2000&auto=format')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20"></div>
          <div className="relative z-10 px-8 py-16 md:py-24 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
              Discover Amazing {activeTab === 'wallpapers' ? 'Wallpapers' : 'Ringtones'}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl">
              Download high-quality {activeTab === 'wallpapers' ? 'wallpapers' : 'ringtones'} for your devices. Express your style with our curated collection.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('ringtones')}
                className={`flex items-center px-8 py-3 rounded-full ${
                  activeTab === 'ringtones'
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } transition-all`}
              >
                <Music size={20} className="mr-2" />
                Ringtones
              </button>
              <button
                onClick={() => setActiveTab('wallpapers')}
                className={`flex items-center px-8 py-3 rounded-full ${
                  activeTab === 'wallpapers'
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } transition-all`}
              >
                <ImageIcon size={20} className="mr-2" />
                Wallpapers
              </button>
              <button
                onClick={handleUploadClick}
                className="flex items-center px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                <Upload size={20} className="mr-2" />
                Upload {activeTab === 'wallpapers' ? 'Wallpaper' : 'Ringtone'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Featured {activeTab === 'wallpapers' ? 'Wallpapers' : 'Ringtones'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {(searchQuery ? filteredContent : featuredContent)
              .filter(item => item.type === activeTab)
              .map((item) => (
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

        <div>
          <h2 className="text-3xl font-bold mb-8 text-white">
            {searchQuery ? 'Search Results' : `Latest ${activeTab === 'wallpapers' ? 'Wallpapers' : 'Ringtones'}`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {(searchQuery ? filteredContent : content)
              .filter(item => item.type === activeTab)
              .map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onPlayPause={handlePlayPause}
                  isPlaying={isPlaying}
                  currentlyPlaying={currentlyPlaying}
                />
            ))}
          </div>
          
          {searchQuery && filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          )}

          {!searchQuery && hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}