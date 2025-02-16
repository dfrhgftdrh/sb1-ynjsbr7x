import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogIn, Upload, Settings, Menu, X, Music, Volume2, Grid, MessageCircle, Battery as Category, TrendingUp, Info, Copyright } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Profile } from '../lib/types';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ searchQuery = '', onSearchChange = () => {} }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchValue = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
    navigate(`/search?q=${encodeURIComponent(searchValue)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/95 backdrop-blur-lg border-b border-pink-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center transform -rotate-6 shadow-lg">
                  <Music size={24} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Volume2 size={10} className="text-white" />
                </div>
              </div>
              <div className="ml-2">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
                  Ring<span className="text-blue-500">Buz</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/categories"
              className="text-gray-300 hover:text-pink-500 transition-colors flex items-center"
            >
              <Category size={20} className="mr-2" />
              Categories
            </Link>
            <Link
              to="/trending"
              className="text-gray-300 hover:text-pink-500 transition-colors flex items-center"
            >
              <TrendingUp size={20} className="mr-2" />
              Trending
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-pink-500 transition-colors flex items-center"
            >
              <Info size={20} className="mr-2" />
              About
            </Link>
            <Link
              to="/copyright"
              className="text-gray-300 hover:text-pink-500 transition-colors flex items-center"
            >
              <Copyright size={20} className="mr-2" />
              Copyright
            </Link>
            {isLoading ? (
              <div className="w-8 h-8 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
            ) : user ? (
              <>
                <Link
                  to="/chat"
                  className="text-gray-300 hover:text-pink-500 transition-colors flex items-center"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Chat History
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="text-gray-300 hover:text-pink-500 transition-colors"
                >
                  {user.username}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all"
                  >
                    <Settings size={20} className="mr-2" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
              >
                <LogIn size={20} className="mr-2" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="py-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="search"
                name="search"
                placeholder="Search wallpapers & ringtones..."
                className="w-full bg-gray-800 rounded-full px-5 py-2 pl-12 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                defaultValue={searchQuery}
              />
              <Search className="absolute left-4 top-2.5 text-gray-400" size={20} />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-500/20">
            <div className="space-y-4">
              <Link
                to="/categories"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Category size={20} className="mr-2" />
                Categories
              </Link>
              <Link
                to="/trending"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp size={20} className="mr-2" />
                Trending
              </Link>
              <Link
                to="/about"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info size={20} className="mr-2" />
                About
              </Link>
              <Link
                to="/copyright"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Copyright size={20} className="mr-2" />
                Copyright
              </Link>
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
                </div>
              ) : user ? (
                <>
                  <Link
                    to="/chat"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Chat History
                  </Link>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-pink-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.username}
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={20} className="mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-2 text-gray-300 hover:text-pink-500 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
                >
                  <LogIn size={20} className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}