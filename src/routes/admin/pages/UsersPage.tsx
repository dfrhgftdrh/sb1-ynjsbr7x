import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { User, Shield, Trash2, Edit } from 'lucide-react';
import { EditUserModal } from '../components/EditUserModal';
import toast from 'react-hot-toast';
import type { Profile } from '../../../lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // First get the current user's profile to verify admin status
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update roles');
      }

      // Update the user's role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('User role updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error instanceof Error ? error.message : 'Error updating user role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 pl-10"
          />
          <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Username</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="py-3">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                      {user.username}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.role === 'admin' ? 'bg-pink-500' : 'bg-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleRoleUpdate(
                          user.id,
                          user.role === 'admin' ? 'user' : 'admin'
                        )}
                        className="p-2 hover:bg-gray-700 rounded"
                        title={`Make ${user.role === 'admin' ? 'user' : 'admin'}`}
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-gray-700 rounded text-red-500 hover:text-red-400"
                        title="Delete user"
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

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}