import { supabase } from '@/lib/supabase';
import type { ClassSession, QueryFilters, PaginatedResponse } from '@/types/database';

export async function getSessions(filters: QueryFilters = {}): Promise<PaginatedResponse<ClassSession>> {
  const { page = 1, pageSize = 10, search, sortBy = 'start_time', sortOrder = 'desc', status } = filters;

  let query = supabase
    .from('class_sessions')
    .select('*, course:courses(*), teacher:teachers(*), branch:branches(*)', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as ClassSession[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getSession(id: string): Promise<ClassSession> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*, course:courses(*), teacher:teachers(*), branch:branches(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ClassSession;
}

export async function createSession(session: Partial<ClassSession>): Promise<ClassSession> {
  const { data, error } = await supabase.from('class_sessions').insert(session).select().single();
  if (error) throw error;
  return data as ClassSession;
}

export async function updateSession(id: string, session: Partial<ClassSession>): Promise<ClassSession> {
  const { data, error } = await supabase
    .from('class_sessions')
    .update({ ...session, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ClassSession;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('class_sessions').delete().eq('id', id);
  if (error) throw error;
}
