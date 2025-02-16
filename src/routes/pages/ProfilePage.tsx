import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContentCard } from '../../components/ContentCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { User, Link as LinkIcon, Facebook, Twitter, Instagram, MapPin, Calendar, Music, ImageIcon, Grid, AlertCircle } from 'lucide-react';
import { updateMetaTags } from '../../lib/utils';
import type { Profile, ContentItem } from '../../lib/types';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'ringtones'>('wallpapers');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProfileAndContent();
  }, [id]);

  useEffect(() => {
    if (profile) {
      updateMetaTags({
        title: `${profile.username}'s Profile - RingBuz`,
        description: profile.bio || `Check out ${profile.username}'s content on RingBuz. Browse their collection of wallpapers and ringtones.`,
        ogImage: profile.avatar_url || 'https://ringbuz.in/images/banner.jpg',
        canonicalUrl: `https://ringbuz.in/profile/${profile.id}`,
        ogTitle: `${profile.username} on RingBuz`,
        ogDescription: profile.bio || `View ${profile.username}'s wallpapers and ringtones collection on RingBuz.`
      });
    }
  }, [profile]);

  const fetchProfileAndContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      setProfile(profileData);

      // Fetch user's content
      const { data: contentData, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;
      setContent(contentData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async (item: ContentItem) => {
    if (item.type !== 'ringtones') return;

    if (currentlyPlaying === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(item.id);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-red-500/20 p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-300 mb-4">{error || 'The requested profile could not be found.'}</p>
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

  const wallpapers = content.filter(item => item.type === 'wallpapers');
  const ringtones = content.filter(item => item.type === 'ringtones');
  const activeContent = activeTab === 'wallpapers' ? wallpapers : ringtones;

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-pink-500/20 to-blue-500/20 relative">
        {profile.cover_image && (
          <img
            src={profile.cover_image}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <div className="bg-[#1a1b2e]/95 backdrop-blur-lg rounded-3xl border border-pink-500/20 p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#1a1b2e] -mt-20 bg-gray-800">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={48} className="text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                      {profile.location && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          {profile.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    {profile.social_links?.facebook && (
                      <a
                        href={profile.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {profile.social_links?.twitter && (
                      <a
                        href={profile.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {profile.social_links?.instagram && (
                      <a
                        href={profile.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        <LinkIcon size={20} />
                      </a>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-gray-300 mt-4">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex gap-8 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{wallpapers.length}</div>
                    <div className="text-sm text-gray-400">Wallpapers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{ringtones.length}</div>
                    <div className="text-sm text-gray-400">Ringtones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {content.reduce((sum, item) => sum + item.downloads, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Downloads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
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
            Wallpapers ({wallpapers.length})
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
            Ringtones ({ringtones.length})
          </button>
        </div>

        {/* Content Grid */}
        {activeContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {activeContent.map((item) => (
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
            <Grid size={48} className="mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold text-white mb-2">No Content Yet</h2>
            <p className="text-gray-400">
              {profile.username} hasn't uploaded any {activeTab} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}