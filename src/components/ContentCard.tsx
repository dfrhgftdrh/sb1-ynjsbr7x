import React from 'react';
import { Play, Pause, Download, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContentItem } from '../lib/types';
import { useData } from '../lib/hooks/useData';

interface ContentCardProps {
  item: ContentItem;
  onPlayPause?: (item: ContentItem) => void;
  isPlaying?: boolean;
  currentlyPlaying?: string | null;
}

export function ContentCard({ item, onPlayPause, isPlaying, currentlyPlaying }: ContentCardProps) {
  const isCurrentlyPlaying = currentlyPlaying === item.id;

  // Fetch author data with caching
  const { data: author } = useData('profiles', {
    filter: { id: item.user_id }
  }, {
    cacheTime: 30 * 60 * 1000 // Cache author data for 30 minutes
  });

  return (
    <div className="group relative">
      {item.type === 'wallpapers' ? (
        <Link to={`/${item.slug || item.id}`} className="block">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800">
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </Link>
      ) : (
        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => onPlayPause?.(item)}
              className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center transition-all transform group-hover:scale-110"
            >
              {isCurrentlyPlaying && isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3">
        <Link 
          to={`/${item.slug || item.id}`}
          className="text-white hover:text-pink-400 transition-colors line-clamp-1"
        >
          {item.title}
        </Link>
        <div className="flex items-center justify-between mt-1">
          <Link
            to={`/profile/${item.user_id}`}
            className="flex items-center text-sm text-gray-400 hover:text-pink-400 transition-colors"
          >
            <User size={14} className="mr-1" />
            {author?.[0]?.username || 'Loading...'}
          </Link>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">
              <Download size={14} className="inline mr-1" />
              {item.downloads.toLocaleString()}
            </div>
            <button className="text-gray-400 hover:text-pink-400 transition-colors">
              <Heart size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}