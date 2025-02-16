import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Music, ImageIcon, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Category } from '../../lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const wallpaperCategories = categories.filter(cat => cat.type === 'wallpapers');
  const ringtoneCategories = categories.filter(cat => cat.type === 'ringtones');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Categories</h1>

      <div className="space-y-12">
        {/* Wallpaper Categories */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <ImageIcon size={24} className="text-pink-500 mr-2" />
            Wallpaper Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallpaperCategories.map((category) => (
              <Link
                key={category.id}
                to={`/explore/${category.slug}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 p-6 hover:border-pink-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  <ArrowRight className="w-5 h-5 text-pink-500 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Ringtone Categories */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Music size={24} className="text-pink-500 mr-2" />
            Ringtone Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ringtoneCategories.map((category) => (
              <Link
                key={category.id}
                to={`/explore/${category.slug}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  <ArrowRight className="w-5 h-5 text-blue-500 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}