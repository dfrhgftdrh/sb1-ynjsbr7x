import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}