import React from 'react';
import { useSupabaseCheck } from '../lib/hooks/useSupabaseCheck';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface DatabaseCheckProps {
  children: React.ReactNode;
}

export function DatabaseCheck({ children }: DatabaseCheckProps) {
  const { isConnected, loading, error, retry } = useSupabaseCheck();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b] flex items-center justify-center p-4">
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-red-500/20 p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={retry}
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:opacity-90 transition-all"
          >
            <RefreshCw size={20} className="mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b] flex items-center justify-center p-4">
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-yellow-500/20 p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Database Unavailable</h2>
          <p className="text-gray-300 mb-6">
            Unable to connect to the database. Please check your connection and try again.
          </p>
          <button
            onClick={retry}
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:opacity-90 transition-all"
          >
            <RefreshCw size={20} className="mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}