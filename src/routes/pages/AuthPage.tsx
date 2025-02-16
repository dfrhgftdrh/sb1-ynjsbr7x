import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signInWithEmail, signUpWithEmail, sendPasswordResetEmail } from '../../lib/auth';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register' | 'reset';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for redirect after login
  useEffect(() => {
    const { hash } = window.location;
    if (hash && hash.includes('access_token')) {
      handleRedirect();
    }
  }, []);

  const handleRedirect = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session) {
        navigate('/');
        toast.success('Successfully logged in');
      }
    } catch (error) {
      console.error('Error handling redirect:', error);
      toast.error('Error logging in');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(email);
        setResetSent(true);
        toast.success('Password reset instructions sent');
        return;
      }

      if (mode === 'login') {
        await signInWithEmail(email, password);
        toast.success('Successfully logged in');
        navigate('/');
      } else {
        await signUpWithEmail(email, password, username);
        toast.success('Successfully signed up');
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2742&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-luminosity" />
      
      <div className="w-full max-w-md">
        <div className="bg-[#1a1b2e]/90 backdrop-blur-lg rounded-2xl border border-pink-500/20 p-8">
          {mode === 'reset' && !resetSent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-pink-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-gray-400">Enter your email to receive reset instructions</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1b2e] border border-pink-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/40"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full flex items-center justify-center text-gray-400 hover:text-white transition-colors mt-4"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Login
                </button>
              </form>
            </>
          ) : mode === 'reset' && resetSent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
              <p className="text-gray-400 mb-8">
                We've sent password reset instructions to your email address.
              </p>
              <button
                onClick={() => setMode('login')}
                className="text-pink-400 hover:text-pink-300 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn size={32} className="text-pink-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-400">
                  {mode === 'login' 
                    ? 'Sign in to continue to RingBuz'
                    : 'Join RingBuz to start sharing'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1b2e] border border-pink-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/40"
                    required
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#1a1b2e] border border-pink-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/40"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1b2e] border border-pink-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/40"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      {mode === 'login' ? 'Signing in...' : 'Creating Account...'}
                    </div>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  {mode === 'login'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}