import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTeachers, useDeleteTeacher } from '@/hooks/useTeachers';
import { getInitials } from '@/lib/utils';
import { Plus, MoreHorizontal, Pencil, Trash2, Star, Users } from 'lucide-react';
import type { Teacher } from '@/types/database';

export default function TeachersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const { data, isLoading } = useTeachers({ page, search });
  const deleteMutation = useDeleteTeacher();

  const columns: Column<Teacher>[] = [
    {
      key: 'full_name',
      label: 'Teacher',
      render: (t) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={t.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(t.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{t.full_name}</p>
            <p className="text-xs text-muted-foreground">{t.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialization', label: 'Specialization', render: (t) => t.specialization || '—' },
    {
      key: 'rating',
      label: 'Rating',
      render: (t) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{t.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({t.total_reviews})</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (t) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-slate-500/15 text-slate-700'}`}>
          {t.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-12',
      render: (t) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/teachers/${t.id}`)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(t)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Teachers"
        description="Manage instructors and their profiles"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Teachers' }]}
        actions={<Button onClick={() => navigate('/teachers/new')}><Plus className="h-4 w-4" /> Add Teacher</Button>}
      />
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search teachers..."
        page={page}
        totalPages={data?.totalPages || 1}
        totalCount={data?.count}
        onPageChange={setPage}
        emptyMessage="No teachers found"
        emptyIcon={<Users className="h-10 w-10" />}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Teacher"
        description={`Delete "${deleteTarget?.full_name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
      />
    </div>
  );
}
