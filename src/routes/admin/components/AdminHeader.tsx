import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogOut, Menu } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/95 backdrop-blur-lg border-b border-pink-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden mr-4 text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-white hover:text-pink-400 transition-colors">
              <Home size={24} />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}