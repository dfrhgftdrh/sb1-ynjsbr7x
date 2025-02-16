import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateMetaTags } from '../lib/utils';

interface PageMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function PageMetaTags({
  title = 'RingBuz - Free Wallpapers & Ringtones',
  description = 'Download high-quality wallpapers and ringtones for your devices. Latest ringtone downloads for mobile, top 100 ringtones, and new song ringtones in mp3!',
  keywords = 'wallpapers, ringtones, mobile wallpapers, phone ringtones, free wallpapers, free ringtones',
  ogTitle,
  ogDescription,
  ogImage = 'https://ringbuz.in/images/banner.jpg',
  noIndex = false
}: PageMetaTagsProps) {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = `${window.location.origin}${location.pathname}`;
    
    updateMetaTags({
      title,
      description,
      keywords,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogImage,
      noIndex,
      canonicalUrl
    });
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, noIndex, location]);

  return null;
}