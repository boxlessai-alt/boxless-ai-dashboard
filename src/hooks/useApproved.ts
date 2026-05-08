import useSWR from 'swr';
import { useApi } from './useApi';
import type { ApprovedResponse, FilterType } from '@/types';

export function useApproved(filter: FilterType = 'all') {
  const { fetcher } = useApi();

  const { data, error, isLoading, mutate } = useSWR<ApprovedResponse>(
    `/api/approved?filter=${filter}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    items: data?.items ?? [],
    isLoading,
    error,
    mutate,
  };
}
