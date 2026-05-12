import useSWR from 'swr';
import { useApi } from './useApi';
import type { DashboardStats } from '@/types';

export function useStats() {
  const { fetcher } = useApi();

  const { data, error, isLoading } = useSWR<DashboardStats>(
    '/api/stats',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}
