import useSWR from 'swr';
import { useApi } from './useApi';
import type { QueueResponse } from '@/types';

export function useQueue() {
  const { fetcher } = useApi();

  const { data, error, isLoading, mutate } = useSWR<QueueResponse>(
    '/api/queue',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    actions: data?.actions ?? [],
    grouped: data?.grouped ?? { conversions: [], replies: [], walkthrough: [], outreach: [] },
    isLoading,
    error,
    mutate,
  };
}
