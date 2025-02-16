import React, { useEffect } from 'react';
import { updateMetaTags } from '../../lib/utils';

export default function AboutPage() {
  useEffect(() => {
    updateMetaTags({
      title: 'About RingBuz - Free Wallpapers & Ringtones',
      description: 'Learn about RingBuz, your premier destination for high-quality wallpapers and ringtones. Discover our mission and features.',
      keywords: 'about ringbuz, wallpaper site, ringtone site, download platform',
      canonicalUrl: 'https://ringbuz.in/about',
      ogImage: 'https://ringbuz.in/images/banner.jpg'
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">About RingBuz</h1>
        
        <div className="bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20 p-8 space-y-6">
          <p className="text-gray-300">
            RingBuz is your premier destination for high-quality wallpapers and ringtones. 
            We curate and provide a vast collection of content to personalize your devices 
            and express your unique style.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300">
              Our mission is to provide a platform where users can discover, share, and 
              download the best wallpapers and ringtones. We believe in making device 
              personalization accessible and enjoyable for everyone.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>High-quality wallpapers and ringtones</li>
              <li>User-friendly interface</li>
              <li>Regular content updates</li>
              <li>Community-driven platform</li>
              <li>Secure downloads</li>
              <li>Multiple device support</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300">
              Have questions or suggestions? We'd love to hear from you. Contact us at{' '}
              <a href="mailto:support@ringbuz.in" className="text-pink-400 hover:text-pink-300">
                support@ringbuz.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}