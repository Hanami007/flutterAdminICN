import { supabase } from '@/lib/supabase';
import type { Payment, QueryFilters, PaginatedResponse } from '@/types/database';

export async function getPayments(filters: QueryFilters = {}): Promise<PaginatedResponse<Payment>> {
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', status } = filters;

  let query = supabase
    .from('payments')
    .select('*, student:students(*), course:courses(*)', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (search) query = query.or(`transaction_id.ilike.%${search}%`);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Payment[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getPayment(id: string): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, student:students(*), course:courses(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function refundPayment(id: string, amount: number, reason: string): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status: 'refunded',
      refund_amount: amount,
      refund_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function getRevenueSummary(): Promise<{
  total: number;
  thisMonth: number;
  lastMonth: number;
  refunded: number;
}> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const [all, thisMonth, lastMonth, refunds] = await Promise.all([
    supabase.from('payments').select('amount').eq('status', 'completed'),
    supabase.from('payments').select('amount').eq('status', 'completed').gte('created_at', thisMonthStart),
    supabase.from('payments').select('amount').eq('status', 'completed').gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    supabase.from('payments').select('refund_amount').in('status', ['refunded', 'partially_refunded']),
  ]);

  return {
    total: all.data?.reduce((s, p) => s + p.amount, 0) || 0,
    thisMonth: thisMonth.data?.reduce((s, p) => s + p.amount, 0) || 0,
    lastMonth: lastMonth.data?.reduce((s, p) => s + p.amount, 0) || 0,
    refunded: refunds.data?.reduce((s, p) => s + (p.refund_amount || 0), 0) || 0,
  };
}
