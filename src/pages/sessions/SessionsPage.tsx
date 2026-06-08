import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSessions, useDeleteSession } from '@/hooks/useSessions';
import { formatDateTime } from '@/lib/utils';
import { Plus, MoreHorizontal, Pencil, Trash2, CalendarDays, MapPin, Monitor } from 'lucide-react';
import type { ClassSession } from '@/types/database';

export default function SessionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ClassSession | null>(null);

  const { data, isLoading } = useSessions({ page, search });
  const deleteMutation = useDeleteSession();

  const columns: Column<ClassSession>[] = [
    { key: 'title', label: 'Session', render: (s) => (
      <div>
        <p className="font-medium">{s.title}</p>
        <p className="text-xs text-muted-foreground">{s.course?.title || '—'}</p>
      </div>
    )},
    { key: 'teacher', label: 'Teacher', render: (s) => s.teacher?.full_name || '—' },
    { key: 'type', label: 'Type', render: (s) => (
      <Badge variant="outline" className="gap-1">
        {s.type === 'online' ? <Monitor className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
        {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
      </Badge>
    )},
    { key: 'capacity', label: 'Capacity', render: (s) => `${s.enrolled_count}/${s.capacity}` },
    { key: 'start_time', label: 'Date/Time', render: (s) => formatDateTime(s.start_time) },
    { key: 'branch', label: 'Branch', render: (s) => s.branch?.name || '—' },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
    { key: 'actions', label: '', className: 'w-12', render: (s) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/sessions/${s.id}`)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Class Sessions"
        description="Schedule and manage class sessions"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Class Sessions' }]}
        actions={<Button onClick={() => navigate('/sessions/new')}><Plus className="h-4 w-4" /> New Session</Button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} search={search} onSearchChange={setSearch} searchPlaceholder="Search sessions..." page={page} totalPages={data?.totalPages || 1} totalCount={data?.count} onPageChange={setPage} emptyMessage="No sessions found" emptyIcon={<CalendarDays className="h-10 w-10" />} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Session" description={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" variant="destructive" loading={deleteMutation.isPending} onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }} />
    </div>
  );
}
