import React, { useState } from 'react';
import { X, Upload, User, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import type { Profile } from '../../../lib/types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  onUpdate: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onUpdate }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    role: user.role,
    bio: user.bio || '',
    website: user.website || '',
    social_links: user.social_links || {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: Partial<Profile> = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (avatarFile) {
        updates.avatar_url = await handleFileUpload(avatarFile);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User profile updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Error updating user profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit User Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700">
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Change
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
              className="w-full bg-gray-700 rounded px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full h-24 bg-gray-700 rounded px-3 py-2 resize-none"
              placeholder="Tell us about the user..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder="https://..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <input
                type="url"
                value={formData.social_links.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: {
                    ...formData.social_links,
                    facebook: e.target.value
                  }
                })}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="url"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: {
                    ...formData.social_links,
                    twitter: e.target.value
                  }
                })}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: {
                    ...formData.social_links,
                    instagram: e.target.value
                  }
                })}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}