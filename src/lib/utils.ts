// Add function to get canonical URL
export function getCanonicalUrl(path: string = ''): string {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://ringbuz.in';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Add function to update meta tags
export function updateMetaTags(config: {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
}) {
  // Cache DOM queries
  const head = document.head;
  const existingMeta = new Map();
  head.querySelectorAll('meta').forEach(meta => {
    const key = meta.getAttribute('name') || meta.getAttribute('property');
    if (key) existingMeta.set(key, meta);
  });

  // Helper to update or create meta tag
  const updateMeta = (attributes: Record<string, string>) => {
    const key = attributes.name || attributes.property;
    let meta = existingMeta.get(key);
    
    if (!meta) {
      meta = document.createElement('meta');
      head.appendChild(meta);
    }
    
    Object.entries(attributes).forEach(([attr, value]) => {
      meta.setAttribute(attr, value);
    });
  };

  // Update title
  if (config.title) {
    document.title = config.title;
  }

  // Update basic meta tags
  if (config.description) {
    updateMeta({ name: 'description', content: config.description });
  }

  if (config.keywords) {
    updateMeta({ name: 'keywords', content: config.keywords });
  }

  // Update Open Graph tags
  const ogTags = {
    'og:title': config.ogTitle || config.title,
    'og:description': config.ogDescription || config.description,
    'og:type': 'website',
    'og:url': config.canonicalUrl,
    'og:image': config.ogImage,
    'og:site_name': 'RingBuz'
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    if (content) {
      updateMeta({ property, content });
    }
  });

  // Update Twitter Card tags
  const twitterTags = {
    'twitter:card': 'summary_large_image',
    'twitter:title': config.ogTitle || config.title,
    'twitter:description': config.ogDescription || config.description,
    'twitter:image': config.ogImage
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    if (content) {
      updateMeta({ name, content });
    }
  });

  // Update robots meta
  updateMeta({
    name: 'robots',
    content: config.noIndex ? 'noindex, nofollow' : 'index, follow'
  });

  // Update canonical URL
  let canonical = head.querySelector('link[rel="canonical"]');
  if (!canonical && config.canonicalUrl) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    head.appendChild(canonical);
  }
  if (canonical && config.canonicalUrl) {
    canonical.setAttribute('href', config.canonicalUrl);
  }

  // Add structured data if provided
  if (config.structuredData) {
    let script = head.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      head.appendChild(script);
    }
    script.textContent = JSON.stringify(config.structuredData);
  }
}

// Add function to generate meta description
export function generateMetaDescription(type: string, data: any): string {
  switch (type) {
    case 'wallpaper':
      return `Download ${data.title} wallpaper for your device. High-quality ${data.category} wallpaper available for free download.`;
    case 'ringtone':
      return `Download ${data.title} ringtone in MP3 format. High-quality ${data.category} ringtone available for free download.`;
    case 'category':
      return `Browse and download ${data.name} ${data.type}. High-quality collection of ${data.name.toLowerCase()} ${data.type} for your device.`;
    case 'tag':
      return `Explore ${data} wallpapers and ringtones. Download high-quality content tagged with ${data}.`;
    case 'profile':
      return `Check out ${data.username}'s content on RingBuz. Browse their collection of wallpapers and ringtones.`;
    case 'search':
      return `Search results for "${data}" on RingBuz. Find and download high-quality wallpapers and ringtones.`;
    default:
      return 'Download high-quality wallpapers and ringtones for your devices. Latest content updated daily.';
  }
}

// Add function to generate keywords
export function generateKeywords(type: string, data: any): string {
  const baseKeywords = ['download', 'free', 'high quality'];
  
  switch (type) {
    case 'wallpaper':
      return [...baseKeywords, data.title, 'wallpaper', data.category, ...(data.tags || [])].join(', ');
    case 'ringtone':
      return [...baseKeywords, data.title, 'ringtone', 'mp3', data.category, ...(data.tags || [])].join(', ');
    case 'category':
      return [...baseKeywords, data.name, data.type, `${data.name} ${data.type}`].join(', ');
    case 'tag':
      return [...baseKeywords, data, 'wallpapers', 'ringtones', `${data} wallpapers`, `${data} ringtones`].join(', ');
    case 'profile':
      return [...baseKeywords, data.username, 'content', 'wallpapers', 'ringtones'].join(', ');
    case 'search':
      return [...baseKeywords, data, 'search results', 'wallpapers', 'ringtones'].join(', ');
    default:
      return 'wallpapers, ringtones, mobile wallpapers, phone ringtones, free wallpapers, free ringtones';
  }
}

// Add function to generate structured data
export function generateStructuredData(type: string, data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'publisher': {
      '@type': 'Organization',
      'name': 'RingBuz',
      'url': 'https://ringbuz.in'
    }
  };

  switch (type) {
    case 'wallpaper':
    case 'ringtone':
      return {
        ...baseData,
        '@type': 'Product',
        'name': data.title,
        'description': data.description,
        'category': data.category,
        'image': data.url,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock'
        }
      };

    case 'category':
      return {
        ...baseData,
        '@type': 'CollectionPage',
        'name': `${data.name} ${data.type}`,
        'description': generateMetaDescription('category', data)
      };

    case 'profile':
      return {
        ...baseData,
        '@type': 'ProfilePage',
        'name': `${data.username}'s Profile`,
        'description': generateMetaDescription('profile', data)
      };

    default:
      return baseData;
  }
}