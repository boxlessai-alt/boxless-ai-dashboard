import useSWR from 'swr';
import { useApi } from './useApi';
import type { QueueResponse } from '@/types';

export function useQueue() {
  const { fetcher } = useApi();

  const { data, error, isLoading, mutate } = useSWR<QueueResponse>(
    '/api/queue',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  return {
    actions: data?.actions || [],
    stats: data?.stats,
    repliedFlagged: data?.repliedFlagged || false,
    pendingCount: data?.pendingCount || 0,
    isLoading,
    error,
    mutate,
  };
}
