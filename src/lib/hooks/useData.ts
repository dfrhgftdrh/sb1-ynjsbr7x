import { useState, useEffect } from 'react';
import { supabase, fetchWithCache, batchFetch } from '../supabase';
import type { Database } from '../database.types';

type Table = keyof Database['public']['Tables'];
type Row<T extends Table> = Database['public']['Tables'][T]['Row'];

interface UseDataOptions {
  cacheTime?: number;
  batchSize?: number;
  prefetch?: boolean;
  revalidate?: boolean;
}

export function useData<T extends Table>(
  table: T,
  query: any = {},
  options: UseDataOptions = {}
) {
  const [data, setData] = useState<Row<T>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    batchSize = 100,
    prefetch = false,
    revalidate = false
  } = options;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cacheKey = `${table}:${JSON.stringify(query)}`;
        
        const data = await fetchWithCache(
          cacheKey,
          async () => {
            let supabaseQuery = supabase.from(table).select('*');

            // Apply filters
            if (query.filter) {
              Object.entries(query.filter).forEach(([key, value]) => {
                supabaseQuery = supabaseQuery.eq(key, value);
              });
            }

            // Apply ordering
            if (query.orderBy) {
              supabaseQuery = supabaseQuery.order(query.orderBy.column, {
                ascending: query.orderBy.ascending
              });
            }

            // Apply pagination
            if (query.limit) {
              supabaseQuery = supabaseQuery.limit(query.limit);
            }

            const { data, error } = await supabaseQuery;
            if (error) throw error;
            return data;
          },
          cacheTime
        );

        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription if revalidate is true
    if (revalidate) {
      const subscription = supabase
        .channel(`${table}-changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [table, JSON.stringify(query), cacheTime, revalidate]);

  // Prefetch related data if specified
  useEffect(() => {
    if (prefetch && data && data.length > 0) {
      const relatedIds = data.map(item => item.id);
      
      if (relatedIds.length > 0) {
        batchFetch(relatedIds, async (batchIds) => {
          const { data: relatedData } = await supabase
            .from(table)
            .select('*')
            .in('id', batchIds)
            .limit(batchSize);
          
          return relatedData || [];
        });
      }
    }
  }, [data, prefetch, batchSize]);

  return { data, loading, error };
}