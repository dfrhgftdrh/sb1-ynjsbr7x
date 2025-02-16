import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FileText, Edit, Trash2, Plus, Globe, Code } from 'lucide-react';
import toast from 'react-hot-toast';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_robots: string;
  order: number;
  show_in_menu: boolean;
  created_at: string;
  updated_at: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    meta_robots: 'index,follow',
    order: 0,
    show_in_menu: false
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('order');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      meta_robots: page.meta_robots,
      order: page.order,
      show_in_menu: page.show_in_menu
    });
    setShowEditor(true);
  };

  const handleDelete = async (pageId: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      toast.success('Page deleted successfully');
      await fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Error deleting page');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPage) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update(formData)
          .eq('id', editingPage.id);

        if (error) throw error;
        toast.success('Page updated successfully');
      } else {
        // Create new page
        const { error } = await supabase
          .from('pages')
          .insert([formData]);

        if (error) throw error;
        toast.success('Page created successfully');
      }

      setShowEditor(false);
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        meta_robots: 'index,follow',
        order: 0,
        show_in_menu: false
      });
      await fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Error saving page');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pages</h1>
        <button
          onClick={() => {
            setEditingPage(null);
            setFormData({
              title: '',
              slug: '',
              content: '',
              meta_title: '',
              meta_description: '',
              meta_keywords: '',
              meta_robots: 'index,follow',
              order: pages.length,
              show_in_menu: false
            });
            setShowEditor(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={20} className="mr-2" />
          Add Page
        </button>
      </div>

      {showEditor ? (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">
            {editingPage ? 'Edit Page' : 'Create Page'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-64 bg-gray-700 rounded px-3 py-2 font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                HTML formatting is supported
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe size={20} className="mr-2" />
                SEO Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full h-24 bg-gray-700 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    placeholder="Comma-separated keywords"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meta Robots</label>
                  <select
                    value={formData.meta_robots}
                    onChange={(e) => setFormData({ ...formData, meta_robots: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                  >
                    <option value="index,follow">Index, Follow</option>
                    <option value="noindex,follow">No Index, Follow</option>
                    <option value="index,nofollow">Index, No Follow</option>
                    <option value="noindex,nofollow">No Index, No Follow</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Code size={20} className="mr-2" />
                Display Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Menu Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    min="0"
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.show_in_menu}
                    onChange={(e) => setFormData({ ...formData, show_in_menu: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500"
                  />
                  <span>Show in menu</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditor(false);
                  setEditingPage(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingPage ? 'Update Page' : 'Create Page'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3">Menu Order</th>
                  <th className="pb-3">Last Updated</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <FileText size={20} className="text-gray-400 mr-2" />
                        {page.title}
                      </div>
                    </td>
                    <td className="py-3">{page.slug}</td>
                    <td className="py-3">
                      {page.show_in_menu ? page.order : '-'}
                    </td>
                    <td className="py-3">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 hover:bg-gray-700 rounded"
                          title="Edit page"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 hover:bg-gray-700 rounded text-red-500 hover:text-red-400"
                          title="Delete page"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}