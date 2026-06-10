import { supabase } from '@/lib/supabase';
import type { Booking, QueryFilters, PaginatedResponse } from '@/types/database';

export async function getBookings(filters: QueryFilters = {}): Promise<PaginatedResponse<Booking>> {
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', status } = filters;

  let query = supabase
    .from('bookings')
    .select('*, student:students(*), session:class_sessions!fk_bookings_session(*, course:courses(*), teacher:teachers(*), branch:branches(*))', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (search) query = query.or(`notes.ilike.%${search}%`);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Booking[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function approveBooking(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function rejectBooking(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}
