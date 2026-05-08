import useSWR from 'swr';
import { useApi } from './useApi';
import type { StatsResponse } from '@/types';

export function useStats() {
  const { fetcher } = useApi();

  const { data, error, isLoading } = useSWR<StatsResponse>(
    '/api/stats',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}
