import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Queue {
  id: string;
  name: string;
  code: string;
  max_capacity: number;
  avg_service_time: number;
  is_paused: boolean;
  current_serving: number;
  created_at: string;
}

export interface QueueUser {
  id: string;
  queue_id: string;
  position: number;
  name: string | null;
  phone: string | null;
  status: string;
  joined_at: string;
  served_at: string | null;
}

/**
 * Hook for real-time queue data subscription
 */
export function useQueue(queueId: string | null) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [users, setUsers] = useState<QueueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queueId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchQueue = async () => {
      try {
        const { data: queueData, error: queueError } = await supabase
          .from('queues')
          .select('*')
          .eq('id', queueId)
          .maybeSingle();

        if (queueError) throw queueError;
        setQueue(queueData);

        const { data: usersData, error: usersError } = await supabase
          .from('queue_users')
          .select('*')
          .eq('queue_id', queueId)
          .eq('status', 'waiting')
          .order('position', { ascending: true });

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    // Real-time subscription for queue changes
    const queueChannel = supabase
      .channel(`queue-${queueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues', filter: `id=eq.${queueId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setQueue(payload.new as Queue);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_users', filter: `queue_id=eq.${queueId}` },
        async () => {
          // Refetch all waiting users on any change
          const { data } = await supabase
            .from('queue_users')
            .select('*')
            .eq('queue_id', queueId)
            .eq('status', 'waiting')
            .order('position', { ascending: true });
          
          setUsers(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, [queueId]);

  return { queue, users, loading, error };
}

/**
 * Hook to find queue by code
 */
export function useQueueByCode(code: string | null) {
  const [queueId, setQueueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }

    const findQueue = async () => {
      try {
        const { data, error: err } = await supabase
          .from('queues')
          .select('id')
          .eq('code', code.toUpperCase())
          .maybeSingle();

        if (err) throw err;
        if (!data) throw new Error('Queue not found');
        
        setQueueId(data.id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    findQueue();
  }, [code]);

  return { queueId, loading, error };
}
