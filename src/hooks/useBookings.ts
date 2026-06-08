import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, approveBooking, rejectBooking, cancelBooking } from '@/services/bookings';
import type { QueryFilters } from '@/types/database';
import { toast } from '@/hooks/useToast';

export function useBookings(filters: QueryFilters = {}) {
  return useQuery({ queryKey: ['bookings', filters], queryFn: () => getBookings(filters) });
}

export function useApproveBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveBooking,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast({ title: 'Booking approved', variant: 'success' }); },
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectBooking,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast({ title: 'Booking rejected', variant: 'success' }); },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast({ title: 'Booking cancelled', variant: 'success' }); },
  });
}
