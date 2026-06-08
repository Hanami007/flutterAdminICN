import { supabase } from '@/lib/supabase';
import type { Student, Enrollment, Payment, QueryFilters, PaginatedResponse } from '@/types/database';

export async function getStudents(filters: QueryFilters = {}): Promise<PaginatedResponse<Student>> {
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc' } = filters;

  let query = supabase.from('students').select('*', { count: 'exact' });

  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Student[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getStudent(id: string): Promise<Student> {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Student;
}

export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Enrollment[]) || [];
}

export async function getStudentPayments(studentId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, course:courses(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Payment[]) || [];
}
