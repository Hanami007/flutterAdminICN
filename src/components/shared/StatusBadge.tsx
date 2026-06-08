import { Badge } from '@/components/ui/badge';
import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Badge variant="outline" className={cn(getStatusColor(status), 'border-0 capitalize', className)}>
      {label}
    </Badge>
  );
}
