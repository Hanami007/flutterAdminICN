import { useQuery } from '@tanstack/react-query';
import { getPayments, getRevenueSummary } from '@/services/payments';
import type { QueryFilters } from '@/types/database';

export function usePayments(filters: QueryFilters = {}) {
  return useQuery({ queryKey: ['payments', filters], queryFn: () => getPayments(filters) });
}

export function useRevenueSummary() {
  return useQuery({ queryKey: ['payments', 'revenue-summary'], queryFn: getRevenueSummary, staleTime: 300_000 });
}
