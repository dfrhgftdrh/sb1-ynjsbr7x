import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const databaseName = import.meta.env.VITE_DATABASE_NAME || 'ringbuz';

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  },
  // Add caching configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add request timeout and caching
  fetch: (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    return fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Cache-Control': 'public, max-age=300' // 5 minute cache
      }
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  }
});

// Add caching layer
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  duration = CACHE_DURATION
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < duration) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
};

// Enhanced connection check with retries and caching
export const checkSupabaseConnection = async (retries = 3): Promise<boolean> => {
  const cacheKey = 'connection-status';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
    return cached.data;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const isConnected = !error;
      cache.set(cacheKey, { data: isConnected, timestamp: Date.now() });
      return isConnected;
    } catch (error) {
      console.error('Supabase connection error:', error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
    }
  }
  return false;
};

// Connection status monitoring
let isConnected = true;
export const getConnectionStatus = () => isConnected;

// Set up connection monitoring with reconnection
supabase.channel('system')
  .on('system', { event: '*' }, (payload) => {
    if (payload.event === 'disconnected') {
      isConnected = false;
      console.warn('Supabase connection lost');
      handleReconnect();
    } else if (payload.event === 'connected') {
      isConnected = true;
      console.log('Supabase connection restored');
      // Clear connection error cache
      cache.delete('connection-status');
    }
  })
  .subscribe();

// Add reconnection handler
let reconnectTimeout: NodeJS.Timeout | null = null;

const handleReconnect = async () => {
  if (!isConnected) {
    const connected = await checkSupabaseConnection();
    if (connected) {
      isConnected = true;
      console.log('Supabase connection restored');
      cache.delete('connection-status');
    } else {
      // Try again in 5 seconds
      reconnectTimeout = setTimeout(handleReconnect, 5000);
    }
  }
};

// Clean up on window unload
window.addEventListener('unload', () => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  cache.clear();
});

// Add batch fetching utility
export const batchFetch = async <T>(
  ids: string[],
  fetcher: (batchIds: string[]) => Promise<T[]>
): Promise<T[]> => {
  const BATCH_SIZE = 100;
  const results: T[] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    const batchResults = await fetcher(batchIds);
    results.push(...batchResults);
  }

  return results;
};

// Add prefetch utility
export const prefetchData = async (paths: string[]) => {
  const fetchers = paths.map(path => {
    const key = `prefetch:${path}`;
    if (cache.has(key)) return null;

    return fetchWithCache(key, async () => {
      const { data, error } = await supabase
        .from(path.split('/')[0])
        .select('*')
        .limit(20);
      
      if (error) throw error;
      return data;
    });
  });

  await Promise.all(fetchers.filter(Boolean));
};