import { supabase } from '@/lib/supabase';
import type { Teacher, QueryFilters, PaginatedResponse } from '@/types/database';

export async function getTeachers(filters: QueryFilters = {}): Promise<PaginatedResponse<Teacher>> {
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc' } = filters;

  let query = supabase.from('teachers').select('*', { count: 'exact' });

  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Teacher[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getTeacher(id: string): Promise<Teacher> {
  const { data, error } = await supabase.from('teachers').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Teacher;
}

export async function createTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
  const { data, error } = await supabase.from('teachers').insert(teacher).select().single();
  if (error) throw error;
  return data as Teacher;
}

export async function updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher> {
  const { data, error } = await supabase.from('teachers').update({ ...teacher, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as Teacher;
}

export async function deleteTeacher(id: string): Promise<void> {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) throw error;
}
