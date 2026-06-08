import { useQuery } from '@tanstack/react-query';
import { getAnalyticsData } from '@/services/analytics';

export function useAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => getAnalyticsData(period),
    staleTime: 300_000,
  });
}
