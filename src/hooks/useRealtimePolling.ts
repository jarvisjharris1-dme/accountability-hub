import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface UseRealtimePollingOptions {
  table: string;
  pollInterval?: number; // milliseconds, default 10000 (10 seconds)
  enabled?: boolean;
}

/**
 * Custom hook for real-time data updates with automatic polling fallback
 * Tries realtime first, falls back to polling if realtime fails
 */
export function useRealtimePolling<T>(
  queryBuilder: () => PostgrestFilterBuilder<any, any, T[]>,
  options: UseRealtimePollingOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [usePolling, setUsePolling] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);
  
  const { table, pollInterval = 10000, enabled = true } = options;

  // Load data function
  const loadData = async () => {
    try {
      const { data: result, error } = await queryBuilder();
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error(`Error loading ${table}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime or polling
  useEffect(() => {
    if (!enabled) return;

    loadData();

    // Try realtime subscription
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`✅ Realtime update on ${table}:`, payload.eventType);
          loadData();
        }
      )
      .subscribe((status) => {
        console.log(`${table} subscription status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Realtime enabled for ${table}`);
          setUsePolling(false);
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`⚠️ Realtime failed for ${table}, using polling`);
          setUsePolling(true);
        }
      });

    channelRef.current = channel;

    // Fallback to polling after 5 seconds if realtime doesn't connect
    const fallbackTimer = setTimeout(() => {
      if (!channel.state || channel.state !== 'joined') {
        console.warn(`⚠️ Realtime timeout for ${table}, using polling`);
        setUsePolling(true);
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [enabled, table]);

  // Setup polling if needed
  useEffect(() => {
    if (usePolling && enabled) {
      console.log(`🔄 Polling ${table} every ${pollInterval}ms`);
      
      pollingInterval.current = setInterval(() => {
        loadData();
      }, pollInterval);

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [usePolling, enabled, pollInterval]);

  return {
    data,
    loading,
    reload: loadData,
    isPolling: usePolling
  };
}
