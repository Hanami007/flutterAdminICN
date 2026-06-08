import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCourses, useDeleteCourse, usePublishCourse, useUnpublishCourse } from '@/hooks/useCourses';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import type { Course } from '@/types/database';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const { data, isLoading } = useCourses({ page, search, status: statusFilter || undefined });
  const deleteMutation = useDeleteCourse();
  const publishMutation = usePublishCourse();
  const unpublishMutation = useUnpublishCourse();

  const columns: Column<Course>[] = [
    {
      key: 'title',
      label: 'Course',
      render: (course) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{course.title}</p>
            <p className="text-xs text-muted-foreground">{course.category?.name || 'No category'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (course) => course.teacher?.full_name || '—',
    },
    {
      key: 'price',
      label: 'Price',
      render: (course) => formatCurrency(course.price),
    },
    {
      key: 'level',
      label: 'Level',
      render: (course) => (
        <span className="capitalize text-sm">{course.level.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (course) => <StatusBadge status={course.status} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (course) => formatDate(course.created_at),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-12',
      render: (course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/courses/${course.id}`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {course.status === 'draft' ? (
              <DropdownMenuItem onClick={() => publishMutation.mutate(course.id)}>
                <Eye className="mr-2 h-4 w-4" /> Publish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => unpublishMutation.mutate(course.id)}>
                <EyeOff className="mr-2 h-4 w-4" /> Unpublish
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setDeleteTarget(course)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Courses"
        description="Manage your course catalog"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Courses' }]}
        actions={
          <Button onClick={() => navigate('/courses/new')}>
            <Plus className="h-4 w-4" /> Add Course
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses..."
        page={page}
        totalPages={data?.totalPages || 1}
        totalCount={data?.count}
        onPageChange={setPage}
        emptyMessage="No courses found"
        emptyIcon={<BookOpen className="h-10 w-10" />}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}
