import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudents } from '@/hooks/useStudents';
import { getInitials, formatDate } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import type { Student } from '@/types/database';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStudents({ page, search });

  const columns: Column<Student>[] = [
    {
      key: 'full_name', label: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={s.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(s.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{s.full_name}</p>
            <p className="text-xs text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (s) => s.phone || '—' },
    { key: 'is_active', label: 'Status', render: (s) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-slate-500/15 text-slate-700'}`}>
        {s.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'created_at', label: 'Joined', render: (s) => formatDate(s.created_at) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Students"
        description="View and manage student accounts"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Students' }]}
      />
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone..."
        page={page}
        totalPages={data?.totalPages || 1}
        totalCount={data?.count}
        onPageChange={setPage}
        emptyMessage="No students found"
        emptyIcon={<GraduationCap className="h-10 w-10" />}
      />
    </div>
  );
}
