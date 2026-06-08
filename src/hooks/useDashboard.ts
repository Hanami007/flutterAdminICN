import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRevenueChart, getEnrollmentChart, getRecentActivities } from '@/services/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 60_000,
  });
}

export function useRevenueChart(days: number = 30) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-chart', days],
    queryFn: () => getRevenueChart(days),
    staleTime: 300_000,
  });
}

export function useEnrollmentChart(days: number = 30) {
  return useQuery({
    queryKey: ['dashboard', 'enrollment-chart', days],
    queryFn: () => getEnrollmentChart(days),
    staleTime: 300_000,
  });
}

export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: () => getRecentActivities(limit),
    staleTime: 30_000,
  });
}
