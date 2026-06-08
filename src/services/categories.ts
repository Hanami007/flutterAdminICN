import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as Category[]) || [];
}

export async function getCategory(id: string): Promise<Category> {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Category;
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ ...category, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
