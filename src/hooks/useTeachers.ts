import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } from '@/services/teachers';
import type { Teacher, QueryFilters } from '@/types/database';
import { toast } from '@/hooks/useToast';

export function useTeachers(filters: QueryFilters = {}) {
  return useQuery({ queryKey: ['teachers', filters], queryFn: () => getTeachers(filters) });
}

export function useTeacher(id: string) {
  return useQuery({ queryKey: ['teachers', id], queryFn: () => getTeacher(id), enabled: !!id });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Teacher>) => createTeacher(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast({ title: 'Teacher created', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Teacher> }) => updateTeacher(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast({ title: 'Teacher updated', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast({ title: 'Teacher deleted', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}
