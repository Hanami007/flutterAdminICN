import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLessons, createLesson, updateLesson, deleteLesson, reorderLessons } from '@/services/videos';
import type { Lesson } from '@/types/database';
import { toast } from '@/hooks/useToast';

export function useLessons(courseId: string) {
  return useQuery({ queryKey: ['lessons', courseId], queryFn: () => getLessons(courseId), enabled: !!courseId });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lesson>) => createLesson(data),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['lessons', vars.course_id] }); toast({ title: 'Lesson created', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => updateLesson(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); toast({ title: 'Lesson updated', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); toast({ title: 'Lesson deleted', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useReorderLessons() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonIds }: { courseId: string; lessonIds: string[] }) => reorderLessons(courseId, lessonIds),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); toast({ title: 'Lessons reordered', variant: 'success' }); },
  });
}
