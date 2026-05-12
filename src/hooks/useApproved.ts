import useSWR from 'swr';
import { useApi } from './useApi';
import type { ApprovedResponse } from '@/types';

export function useApproved(dateRange = 'all', actionType = 'all') {
  const { fetcher } = useApi();

  const { data, error, isLoading, mutate } = useSWR<ApprovedResponse>(
    `/api/approved?dateRange=${dateRange}&actionType=${actionType}`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  return {
    items: data?.items || [],
    isLoading,
    error,
    mutate,
  };
}
