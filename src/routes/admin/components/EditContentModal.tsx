import React, { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, FileUp, Globe, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { useStorage } from '../../../lib/hooks/useStorage';
import type { ContentItem } from '../../../lib/types';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
  onUpdate: () => void;
}

export function EditContentModal({ isOpen, onClose, item, onUpdate }: EditContentModalProps) {
  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    category: item.category || '',
    tags: item.tags || [],
    tagInput: '',
    uploadMethod: 'keep' as 'keep' | 'file' | 'url',
    url: item.url || '',
    file: null as File | null,
    include_in_sitemap: item.include_in_sitemap ?? true,
    no_index: item.no_index ?? false,
    slug: item.slug || ''
  });

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, error: uploadError } = useStorage();

  const handleTagAdd = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && formData.tags.length < 5 && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
        tagInput: ''
      });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.uploadMethod === 'file' && !formData.file) {
      toast.error('Please select a file');
      return;
    }

    if (formData.uploadMethod === 'url' && !formData.url) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      let fileUrl = item.url;
      let fileSize = item.file_size;

      if (formData.uploadMethod === 'url') {
        // Validate URL
        try {
          const response = await fetch(formData.url, { method: 'HEAD' });
          if (!response.ok) throw new Error('URL is not accessible');
          
          fileUrl = formData.url;
          fileSize = parseInt(response.headers.get('content-length') || '0');
        } catch (error) {
          throw new Error('Invalid URL or file not accessible');
        }
      } else if (formData.uploadMethod === 'file') {
        if (!formData.file) throw new Error('No file selected');
        fileUrl = await upload(formData.file, { folder: item.type });
        fileSize = formData.file.size;
      }

      // Generate slug if not provided
      const slug = formData.slug.trim() || generateSlug(formData.title);

      // Check if slug is unique
      const { data: existingContent, error: slugCheckError } = await supabase
        .from('content_items')
        .select('id')
        .eq('slug', slug)
        .neq('id', item.id)
        .single();

      if (slugCheckError && slugCheckError.code !== 'PGRST116') {
        throw slugCheckError;
      }

      if (existingContent) {
        // If slug exists, append a unique identifier
        const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
        formData.slug = uniqueSlug;
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('content_items')
        .update({
          title: formData.title,
          description: formData.description,
          url: fileUrl,
          category: formData.category,
          file_size: fileSize,
          tags: formData.tags,
          include_in_sitemap: formData.include_in_sitemap,
          no_index: formData.no_index,
          slug: formData.slug || slug
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      toast.success('Content updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Edit {item.type === 'wallpapers' ? 'Wallpaper' : 'Ringtone'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Custom Slug (optional)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="Leave empty to generate from title"
            />
            <p className="text-sm text-gray-400 mt-1">
              Custom URL: {window.location.origin}/{formData.slug || generateSlug(formData.title)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-gray-700 rounded px-3 py-2 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              required
            >
              <option value="">Select a category</option>
              <option value="nature">Nature</option>
              <option value="abstract">Abstract</option>
              <option value="anime">Anime</option>
              <option value="gaming">Gaming</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (max 5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 hover:text-pink-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
                className="flex-1 bg-gray-700 rounded px-3 py-2"
                disabled={formData.tags.length >= 5}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                disabled={!formData.tagInput.trim() || formData.tags.length >= 5}
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Globe size={20} className="mr-2" />
              SEO Settings
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.include_in_sitemap}
                  onChange={(e) => setFormData({ ...formData, include_in_sitemap: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500"
                />
                <span>Include in sitemap</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.no_index}
                  onChange={(e) => setFormData({ ...formData, no_index: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500"
                />
                <span>Add noindex tag</span>
              </label>

              {formData.no_index && (
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-3 text-sm text-yellow-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Search size={16} />
                    <strong>Note:</strong>
                  </div>
                  This content will not be indexed by search engines. It will still be accessible via direct link.
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Updating...
              </div>
            ) : (
              'Update'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}