import useSWR from 'swr';
import { useApi } from './useApi';
import type { PipelineResponse } from '@/types';

export function usePipeline() {
  const { fetcher } = useApi();

  const { data, error, isLoading, mutate } = useSWR<PipelineResponse>(
    '/api/pipeline',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    lanes: data?.lanes ?? [],
    isLoading,
    error,
    mutate,
  };
}
