import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessions, createSession, updateSession, deleteSession } from '@/services/sessions';
import type { ClassSession, QueryFilters } from '@/types/database';
import { toast } from '@/hooks/useToast';

export function useSessions(filters: QueryFilters = {}) {
  return useQuery({ queryKey: ['sessions', filters], queryFn: () => getSessions(filters) });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ClassSession>) => createSession(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast({ title: 'Session created', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClassSession> }) => updateSession(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast({ title: 'Session updated', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast({ title: 'Session deleted', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}
