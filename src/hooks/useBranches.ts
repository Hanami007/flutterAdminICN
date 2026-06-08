import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBranches, createBranch, updateBranch, deleteBranch } from '@/services/branches';
import type { Branch } from '@/types/database';
import { toast } from '@/hooks/useToast';

export function useBranches() {
  return useQuery({ queryKey: ['branches'], queryFn: getBranches });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Branch>) => createBranch(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast({ title: 'Branch created', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) => updateBranch(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast({ title: 'Branch updated', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast({ title: 'Branch deleted', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}
