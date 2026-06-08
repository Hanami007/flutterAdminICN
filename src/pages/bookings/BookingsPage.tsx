import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useBookings, useApproveBooking, useRejectBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatDateTime } from '@/lib/utils';
import { MoreHorizontal, Check, X, Ban, CalendarCheck } from 'lucide-react';
import type { Booking } from '@/types/database';

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useBookings({ page, search, status: statusFilter || undefined });
  const approveMutation = useApproveBooking();
  const rejectMutation = useRejectBooking();
  const cancelMutation = useCancelBooking();

  const columns: Column<Booking>[] = [
    {
      key: 'student', label: 'Student',
      render: (b) => b.student?.full_name || '—',
    },
    {
      key: 'session', label: 'Session',
      render: (b) => b.session?.title || '—',
    },
    {
      key: 'session_time', label: 'Date/Time',
      render: (b) => b.session ? formatDateTime(b.session.start_time) : '—',
    },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'created_at', label: 'Booked At', render: (b) => formatDateTime(b.created_at) },
    {
      key: 'actions', label: '', className: 'w-12',
      render: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {b.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => approveMutation.mutate(b.id)}><Check className="mr-2 h-4 w-4 text-emerald-500" /> Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => rejectMutation.mutate(b.id)}><X className="mr-2 h-4 w-4 text-red-500" /> Reject</DropdownMenuItem>
              </>
            )}
            {(b.status === 'pending' || b.status === 'approved') && (
              <DropdownMenuItem onClick={() => cancelMutation.mutate(b.id)}><Ban className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bookings"
        description="Manage class session bookings"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Bookings' }]}
      />
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bookings..."
        page={page}
        totalPages={data?.totalPages || 1}
        totalCount={data?.count}
        onPageChange={setPage}
        emptyMessage="No bookings found"
        emptyIcon={<CalendarCheck className="h-10 w-10" />}
      />
    </div>
  );
}
