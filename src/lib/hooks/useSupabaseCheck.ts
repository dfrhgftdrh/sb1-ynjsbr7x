import { useState, useEffect, useRef } from 'react';
import { supabase, checkSupabaseConnection } from '../supabase';
import toast from 'react-hot-toast';

export function useSupabaseCheck() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    checkConnection();

    // Set up realtime subscription for connection status
    const channel = supabase.channel('system')
      .on('system', { event: '*' }, (payload) => {
        if (payload.event === 'disconnected') {
          setIsConnected(false);
          toast.error('Database connection lost');
          checkConnection();
        } else if (payload.event === 'connected') {
          setIsConnected(true);
          setError(null);
          toast.success('Database connection restored');
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        setIsConnected(true);
        retryCount.current = 0;
      } else {
        throw new Error('Unable to connect to the database');
      }
    } catch (err) {
      console.error('Database connection error:', err);
      setIsConnected(false);
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
        setTimeout(checkConnection, delay);
        setError(`Connection attempt ${retryCount.current} of ${maxRetries} failed. Retrying...`);
      } else {
        setError('Unable to connect to the database. Please check your connection and try again.');
        toast.error('Database connection failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    retryCount.current = 0;
    checkConnection();
  };

  return { isConnected, loading, error, retry };
}