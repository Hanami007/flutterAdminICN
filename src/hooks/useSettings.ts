import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/services/settings';
import type { PlatformSettings } from '@/types/database';
import { toast } from '@/hooks/useToast';

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: getSettings });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PlatformSettings>) => updateSettings(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast({ title: 'Settings saved', variant: 'success' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}
