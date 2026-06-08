import { useToast } from '@/hooks/useToast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-slide-up rounded-xl border bg-background p-4 shadow-lg flex items-start gap-3',
            t.variant === 'destructive' && 'border-red-500/30 bg-red-500/5',
            t.variant === 'success' && 'border-emerald-500/30 bg-emerald-500/5'
          )}
        >
          {t.variant === 'destructive' && <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
          {t.variant === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
          {(!t.variant || t.variant === 'default') && <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
