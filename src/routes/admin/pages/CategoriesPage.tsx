import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Music, ImageIcon, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Category } from '../../../lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'wallpapers' as const,
    description: '',
    meta_title: '',
    meta_description: '',
    about: '',
    thumbnail_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('content')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setUploading(true);

      let thumbnailUrl = newCategory.thumbnail_url;
      if (selectedFile) {
        thumbnailUrl = await uploadThumbnail(selectedFile);
      }

      const slug = newCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { error } = await supabase
        .from('categories')
        .insert([{
          ...newCategory,
          slug,
          thumbnail_url: thumbnailUrl
        }]);

      if (error) throw error;

      toast.success('Category added successfully');
      setNewCategory({
        name: '',
        type: 'wallpapers',
        description: '',
        meta_title: '',
        meta_description: '',
        about: '',
        thumbnail_url: ''
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error adding category');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      toast.success('Category deleted successfully');
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>

      {/* Add Category Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Add New Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2">Category Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Type</label>
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'wallpapers' | 'ringtones' })}
              className="w-full bg-gray-700 rounded px-3 py-2"
            >
              <option value="wallpapers">Wallpapers</option>
              <option value="ringtones">Ringtones</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="w-full h-24 bg-gray-700 rounded px-3 py-2 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">About (HTML supported)</label>
            <textarea
              value={newCategory.about}
              onChange={(e) => setNewCategory({ ...newCategory, about: e.target.value })}
              className="w-full h-24 bg-gray-700 rounded px-3 py-2 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Meta Title</label>
            <input
              type="text"
              value={newCategory.meta_title}
              onChange={(e) => setNewCategory({ ...newCategory, meta_title: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Meta Description</label>
            <textarea
              value={newCategory.meta_description}
              onChange={(e) => setNewCategory({ ...newCategory, meta_description: e.target.value })}
              className="w-full h-24 bg-gray-700 rounded px-3 py-2 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Thumbnail</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center">
                <Upload size={24} className="mb-2" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-300 mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{Math.round(selectedFile.size / 1024)} KB</p>
                  </div>
                ) : (
                  <span className="text-sm text-gray-300">Click to select thumbnail image</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {uploading ? 'Adding Category...' : 'Add Category'}
        </button>
      </form>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-900">
              {category.thumbnail_url ? (
                <img
                  src={category.thumbnail_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {category.type === 'wallpapers' ? (
                    <ImageIcon size={48} className="text-gray-700" />
                  ) : (
                    <Music size={48} className="text-gray-700" />
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  category.type === 'wallpapers' ? 'bg-pink-500' : 'bg-blue-500'
                }`}>
                  {category.type}
                </span>
              </div>
              
              {category.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}