import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBookings, useApproveBooking, useRejectBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatDateTime, cn } from '@/lib/utils';
import { MoreHorizontal, Check, X, Ban, CalendarCheck, ChevronLeft, ChevronRight, List } from 'lucide-react';
import type { Booking } from '@/types/database';

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useBookings({
    page: viewMode === 'list' ? page : 1,
    pageSize: viewMode === 'list' ? 10 : 200, // Fetch more for calendar view to span the month
    status: statusFilter || undefined,
  });

  const approveMutation = useApproveBooking();
  const rejectMutation = useRejectBooking();
  const cancelMutation = useCancelBooking();

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    daysGrid.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day),
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month padding
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const getBookingsForDate = (date: Date) => {
    if (!data?.data) return [];
    return data.data.filter((booking) => {
      if (!booking.session?.start_time) return false;
      const bDate = new Date(booking.session.start_time);
      return (
        bDate.getDate() === date.getDate() &&
        bDate.getMonth() === date.getMonth() &&
        bDate.getFullYear() === date.getFullYear()
      );
    });
  };

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="flex items-center bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex items-center gap-1.5"
          >
            <CalendarCheck className="h-4 w-4" /> Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1.5"
          >
            <List className="h-4 w-4" /> List
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between bg-card border border-border p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-bold tracking-tight min-w-[150px] text-center">
                {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="border border-border rounded-lg bg-background overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 gap-px text-center font-semibold text-sm py-2 bg-muted border-b border-border text-muted-foreground">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-muted">
              {daysGrid.map(({ day, isCurrentMonth, date }, idx) => {
                const bookingsOnDate = getBookingsForDate(date);
                const isToday =
                  new Date().getDate() === date.getDate() &&
                  new Date().getMonth() === date.getMonth() &&
                  new Date().getFullYear() === date.getFullYear();

                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[120px] bg-background p-2 flex flex-col justify-between transition-colors hover:bg-accent/5",
                      !isCurrentMonth && "text-muted-foreground/30 bg-muted/5",
                      isToday && "bg-primary/5 font-bold"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {day}
                      </span>
                      {bookingsOnDate.length > 0 && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {bookingsOnDate.length} booking{bookingsOnDate.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                      {bookingsOnDate.map((b) => (
                        <button
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className={cn(
                            "w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate font-medium block border hover:shadow-sm transition-shadow cursor-pointer",
                            b.status === 'approved' && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                            b.status === 'pending' && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
                            b.status === 'rejected' && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
                            b.status === 'cancelled' && "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20"
                          )}
                        >
                          <span className="font-semibold">{b.student?.full_name || 'Guest'}: </span>
                          {b.session?.title || 'Session'}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedBooking.student?.full_name || 'Guest'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.student?.email || 'No email'}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.student?.phone || 'No phone'}</p>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="border-t border-b border-border py-3 space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Class Session: </span>
                  <span className="font-medium">{selectedBooking.session?.title || 'Class Session'}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Course: </span>
                  <span>{selectedBooking.session?.course?.title || selectedBooking.session?.course?.name || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Teacher: </span>
                  <span>{selectedBooking.session?.teacher?.full_name || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Branch/Location: </span>
                  <span>{selectedBooking.session?.branch?.name || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Date & Time: </span>
                  <span>{selectedBooking.session ? formatDateTime(selectedBooking.session.start_time) : '—'}</span>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Notes: </span>
                    <p className="mt-1 p-2 bg-muted rounded text-xs">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        rejectMutation.mutate(selectedBooking.id, {
                          onSuccess: () => setSelectedBooking(null),
                        });
                      }}
                      disabled={rejectMutation.isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        approveMutation.mutate(selectedBooking.id, {
                          onSuccess: () => setSelectedBooking(null),
                        });
                      }}
                      disabled={approveMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                    </Button>
                  </>
                )}
                {(selectedBooking.status === 'pending' || selectedBooking.status === 'approved') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      cancelMutation.mutate(selectedBooking.id, {
                        onSuccess: () => setSelectedBooking(null),
                      });
                    }}
                    disabled={cancelMutation.isPending}
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" /> Cancel Booking
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
