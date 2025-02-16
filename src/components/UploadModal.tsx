import React, { useState, useRef, useEffect } from 'react';
import { X, Upload as UploadIcon, Music, ImageIcon, AlertCircle, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStorage } from '../lib/hooks/useStorage';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'wallpapers' | 'ringtones';
  userId: string;
  isAdmin?: boolean;
}

export function UploadModal({ isOpen, onClose, type, userId, isAdmin = false }: UploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    tagInput: '',
    uploadMethod: 'file' as 'file' | 'url',
    url: '',
    file: null as File | null,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    metaImage: '',
    noIndex: false
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, error: uploadError } = useStorage();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [type, isOpen]);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
        if (!formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      } else {
        toast.error('No categories available. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories. Please try again.');
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleTagAdd = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && formData.tags.length < 5 && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const validateCustomUrl = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('URL validation timed out. Please check the URL and try again.');
        }
      }
      return false;
    }
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

    try {
      setLoading(true);

      let url = formData.url;
      let metadata: any = {};

      if (formData.uploadMethod === 'file') {
        url = await upload(formData.file!, { folder: type });
        metadata.file_size = formData.file!.size;

        if (type === 'wallpapers' && formData.file!.type.startsWith('image/')) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(formData.file!);
          });
          metadata.dimensions = `${img.width}x${img.height}`;
        } else if (type === 'ringtones' && formData.file!.type.startsWith('audio/')) {
          const audio = new Audio();
          await new Promise((resolve, reject) => {
            audio.onloadedmetadata = resolve;
            audio.onerror = reject;
            audio.src = URL.createObjectURL(formData.file!);
          });
          metadata.duration = audio.duration;
        }
      } else {
        const isValid = await validateCustomUrl(formData.url);
        if (!isValid) {
          throw new Error('Invalid URL or file not accessible');
        }
      }

      const { error: insertError } = await supabase
        .from('content_items')
        .insert([{
          title: formData.title,
          description: formData.description,
          type,
          url,
          category: formData.category,
          user_id: userId,
          tags: formData.tags,
          is_approved: isAdmin,
          meta_title: formData.metaTitle || null,
          meta_description: formData.metaDescription || null,
          meta_keywords: formData.metaKeywords || null,
          meta_image: formData.metaImage || null,
          meta_robots: formData.noIndex ? 'noindex,nofollow' : 'index,follow',
          ...metadata
        }]);

      if (insertError) throw insertError;

      toast.success('Content uploaded successfully!');
      onClose();
      
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        tagInput: '',
        uploadMethod: 'file',
        url: '',
        file: null,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        metaImage: '',
        noIndex: false
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
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

        <h2 className="text-2xl font-bold mb-6 flex items-center">
          {type === 'wallpapers' ? (
            <>
              <ImageIcon size={24} className="mr-2 text-pink-500" />
              Upload Wallpaper
            </>
          ) : (
            <>
              <Music size={24} className="mr-2 text-pink-500" />
              Upload Ringtone
            </>
          )}
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
            {fetchingCategories ? (
              <div className="w-full bg-gray-700 rounded px-3 py-2 text-gray-400">
                Loading categories...
              </div>
            ) : (
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-700 rounded px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-2">
              <input
                type="checkbox"
                checked={formData.uploadMethod === 'url'}
                onChange={(e) => setFormData({ ...formData, uploadMethod: e.target.checked ? 'url' : 'file' })}
                className="mr-2"
              />
              Use Custom URL
            </label>

            {formData.uploadMethod === 'url' ? (
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="Enter direct URL to content"
                required={formData.uploadMethod === 'url'}
              />
            ) : (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  accept={type === 'wallpapers' ? 'image/jpeg,image/png,image/webp' : 'audio/mpeg,audio/wav'}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <UploadIcon size={24} className="mb-2" />
                    {formData.file ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-300 mb-1">{formData.file.name}</p>
                        <p className="text-xs text-gray-400">{Math.round(formData.file.size / 1024)} KB</p>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-gray-300">
                          Click to select {type === 'wallpapers' ? 'image' : 'audio file'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {type === 'wallpapers' 
                            ? 'Supported formats: JPEG, PNG, WebP (max 50MB)'
                            : 'Supported formats: MP3, WAV (max 50MB)'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
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
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title (optional)</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="Custom meta title for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meta Description (optional)</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full h-24 bg-gray-700 rounded px-3 py-2 resize-none"
                  placeholder="Custom meta description for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meta Keywords (optional)</label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="Comma-separated keywords"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meta Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.metaImage}
                  onChange={(e) => setFormData({ ...formData, metaImage: e.target.value })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="Custom social media image URL"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.noIndex}
                  onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500"
                />
                <span>Prevent search engines from indexing this content</span>
              </label>
            </div>
          </div>

          {uploadError && (
            <div className="bg-red-900/20 border border-red-500/20 rounded p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <p className="text-red-400 text-sm">{uploadError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || fetchingCategories || categories.length === 0}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Uploading... {progress > 0 && `${Math.round(progress)}%`}
              </div>
            ) : (
              'Upload'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}