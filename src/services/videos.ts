import { supabase } from '@/lib/supabase';
import type { Lesson } from '@/types/database';

export async function getLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as Lesson[]) || [];
}

export async function getLesson(id: string): Promise<Lesson> {
  const { data, error } = await supabase.from('lessons').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Lesson;
}

export async function createLesson(lesson: Partial<Lesson>): Promise<Lesson> {
  const { data, error } = await supabase.from('lessons').insert(lesson).select().single();
  if (error) throw error;
  return data as Lesson;
}

export async function updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update({ ...lesson, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
  const updates = lessonIds.map((id, index) => ({
    id,
    course_id: courseId,
    sort_order: index,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('lessons').upsert(updates);
  if (error) throw error;
}

export async function uploadVideo(file: File, courseId: string, lessonId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `courses/${courseId}/lessons/${lessonId}.${fileExt}`;

  const { error } = await supabase.storage
    .from('lesson-videos')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('lesson-videos').getPublicUrl(filePath);
  return data.publicUrl;
}
