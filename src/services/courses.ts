import { supabase } from '@/lib/supabase';
import type { Course, QueryFilters, PaginatedResponse } from '@/types/database';

const PAGE_SIZE = 10;

export async function getCourses(filters: QueryFilters = {}): Promise<PaginatedResponse<Course>> {
  const {
    page = 1,
    pageSize = PAGE_SIZE,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    status,
    category_id,
    teacher_id,
    level,
  } = filters;

  let query = supabase
    .from('courses')
    .select('*, category:categories(*), teacher:teachers(*)', { count: 'exact' });

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (status) query = query.eq('status', status);
  if (category_id) query = query.eq('category_id', category_id);
  if (teacher_id) query = query.eq('teacher_id', teacher_id);
  if (level) query = query.eq('level', level);

  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Course[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getCourse(id: string): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .select('*, category:categories(*), teacher:teachers(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Course;
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update({ ...course, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

export async function publishCourse(id: string): Promise<Course> {
  return updateCourse(id, { status: 'published' });
}

export async function unpublishCourse(id: string): Promise<Course> {
  return updateCourse(id, { status: 'draft' });
}

export async function uploadCourseThumbnail(file: File, courseId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `courses/${courseId}/thumbnail.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('course-thumbnails')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('course-thumbnails').getPublicUrl(filePath);
  return data.publicUrl;
}
