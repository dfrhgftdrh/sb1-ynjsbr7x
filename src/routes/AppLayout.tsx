import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Toaster } from 'react-hot-toast';
import { updateMetaTags } from '../lib/utils';

export function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    // Update meta tags with default values
    updateMetaTags({
      title: 'RingBuz - Free Wallpapers & Ringtones',
      description: 'Download high-quality wallpapers and ringtones for your devices. Latest ringtone downloads for mobile, top 100 ringtones, and new song ringtones in mp3!',
      keywords: 'wallpapers, ringtones, mobile wallpapers, phone ringtones, free wallpapers, free ringtones',
      ogImage: 'https://ringbuz.in/images/banner.jpg',
      canonicalUrl: `${window.location.origin}${location.pathname}`
    });
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b]">
      <Toaster position="top-right" />
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
}