import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Music, ImageIcon, Upload as UploadIcon, Search, Edit, Link as LinkIcon } from 'lucide-react';
import { UploadModal } from '../../../components/UploadModal';
import { EditContentModal } from '../components/EditContentModal';
import toast from 'react-hot-toast';
import type { ContentItem } from '../../../lib/types';

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [uploadType, setUploadType] = useState<'wallpapers' | 'ringtones'>('wallpapers');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchContent();
  }, [filter]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
    }
  };

  const fetchContent = async () => {
    try {
      let query = supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('is_approved', filter === 'approved');
      }

      const { data, error } = await query;
      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (contentId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ is_approved: isApproved })
        .eq('id', contentId);

      if (error) throw error;
      toast.success(isApproved ? 'Content approved' : 'Content rejected');
      await fetchContent();
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Error updating content status');
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      toast.success('Content deleted successfully');
      await fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Error deleting content');
    }
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tags && item.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setUploadType('wallpapers');
              setShowUploadModal(true);
            }}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center"
          >
            <ImageIcon size={20} className="mr-2" />
            Upload Wallpaper
          </button>
          <button
            onClick={() => {
              setUploadType('ringtones');
              setShowUploadModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center"
          >
            <Music size={20} className="mr-2" />
            Upload Ringtone
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="bg-gray-700 rounded-lg px-4 py-2"
        >
          <option value="all">All Content</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Title</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Downloads</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => (
                <tr key={item.id} className="border-b border-gray-700">
                  <td className="py-3">
                    <div className="flex items-center">
                      {item.type === 'wallpapers' ? (
                        <div className="w-10 h-10 rounded overflow-hidden mr-3">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mr-3">
                          <Music size={20} className="text-white" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-400">
                          {item.tags?.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{item.type}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.is_approved ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {item.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3">
                    {item.url.startsWith('http') ? (
                      <span className="flex items-center text-blue-400">
                        <LinkIcon size={16} className="mr-1" />
                        External URL
                      </span>
                    ) : (
                      <span className="flex items-center text-green-400">
                        <UploadIcon size={16} className="mr-1" />
                        Uploaded File
                      </span>
                    )}
                  </td>
                  <td className="py-3">{item.downloads}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleApproval(item.id, !item.is_approved)}
                        className={`px-3 py-1 rounded ${
                          item.is_approved
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {item.is_approved ? 'Reject' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && userId && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          type={uploadType}
          userId={userId}
          isAdmin={true}
        />
      )}

      {showEditModal && selectedItem && (
        <EditContentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onUpdate={fetchContent}
        />
      )}
    </div>
  );
}