import { supabase } from '@/lib/supabase';
import type { Branch } from '@/types/database';

export async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as Branch[]) || [];
}

export async function getBranch(id: string): Promise<Branch> {
  const { data, error } = await supabase.from('branches').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Branch;
}

export async function createBranch(branch: Partial<Branch>): Promise<Branch> {
  const { data, error } = await supabase.from('branches').insert(branch).select().single();
  if (error) throw error;
  return data as Branch;
}

export async function updateBranch(id: string, branch: Partial<Branch>): Promise<Branch> {
  const { data, error } = await supabase.from('branches').update({ ...branch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as Branch;
}

export async function deleteBranch(id: string): Promise<void> {
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) throw error;
}
