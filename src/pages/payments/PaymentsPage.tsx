import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { usePayments, useRevenueSummary } from '@/hooks/usePayments';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { refundPayment } from '@/services/payments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, ArrowUpRight, Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Payment } from '@/types/database';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Refund dialog states
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Slip preview dialog state
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);

  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    page,
    search,
    status: status === 'all' ? undefined : status,
  });

  const { data: summary, isLoading: summaryLoading } = useRevenueSummary();

  const queryClient = useQueryClient();
  const refundMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      refundPayment(id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Payment Refunded', description: 'The payment has been successfully refunded.', variant: 'success' });
      setRefundTarget(null);
      setRefundAmount('');
      setRefundReason('');
    },
    onError: (err: Error) => {
      toast({ title: 'Refund Failed', description: err.message, variant: 'destructive' });
    },
  });

  const handleRefundSubmit = () => {
    if (!refundTarget) return;
    const amount = Number(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > refundTarget.amount) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid refund amount.', variant: 'destructive' });
      return;
    }
    refundMutation.mutate({
      id: refundTarget.id,
      amount,
      reason: refundReason,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
            <ArrowUpRight className="h-3.5 w-3.5" /> Refunded
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            <Ban className="h-3.5 w-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600">
            <AlertCircle className="h-3.5 w-3.5" /> {status}
          </span>
        );
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'transaction_id',
      label: 'Transaction ID / Date',
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.slip_url ? (
            <div
              onClick={() => setSelectedSlipUrl(p.slip_url)}
              className="w-10 h-10 shrink-0 rounded border border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
              title="Click to view slip"
            >
              <img src={p.slip_url} alt="Slip" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white font-semibold">View</span>
              </div>
            </div>
          ) : (
            p.payment_method === 'qr_scan' && (
              <div className="w-10 h-10 shrink-0 rounded border border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-semibold" title="No slip uploaded">
                No Slip
              </div>
            )
          )}
          <div>
            <p className="font-semibold text-sm font-mono text-foreground">{p.transaction_id || '—'}</p>
            <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.student?.full_name || 'Anonymous Student'}</p>
          <p className="text-xs text-muted-foreground">{p.student?.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (p) => <p className="text-sm font-medium truncate max-w-xs">{p.course?.title || 'Platform Fee / Booking'}</p>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (p) => (
        <div>
          <p className="font-semibold text-foreground">{formatCurrency(p.amount)}</p>
          {p.refund_amount && (
            <p className="text-xs text-amber-600">Refunded: {formatCurrency(p.refund_amount)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => getStatusBadge(p.status),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (p) =>
        p.status === 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefundTarget(p);
              setRefundAmount(p.amount.toString());
            }}
          >
            Refund
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payments & Transactions"
        description="Monitor enrollment payments, refunds, and financial summaries"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Payments' }]}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold tracking-tight mt-1">
                {formatCurrency(summary?.total || 0)}
              </h3>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Revenue (This Month)</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-primary">
                {formatCurrency(summary?.thisMonth || 0)}
              </h3>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Revenue (Last Month)</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold tracking-tight mt-1">
                {formatCurrency(summary?.lastMonth || 0)}
              </h3>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Refunded</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600">
                {formatCurrency(summary?.refunded || 0)}
              </h3>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
          <div className="w-full sm:w-auto flex-1 max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID..."
            />
          </div>
          <div className="w-full sm:w-40 shrink-0">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paymentsData?.data || []}
          loading={paymentsLoading}
          page={page}
          totalPages={paymentsData?.totalPages || 1}
          totalCount={paymentsData?.count}
          onPageChange={setPage}
          emptyMessage="No transactions matching filters"
          emptyIcon={<CreditCard className="h-10 w-10 text-muted-foreground" />}
        />
      </div>

      {/* Refund Dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground">
              Are you sure you want to issue a refund for this transaction? The student will be refunded the amount specified.
            </div>
            {refundTarget && (
              <div className="space-y-1 p-3 bg-muted rounded-lg text-sm">
                <p><strong>Transaction ID:</strong> <span className="font-mono text-xs">{refundTarget.transaction_id}</span></p>
                <p><strong>Original Amount:</strong> {formatCurrency(refundTarget.amount)}</p>
                <p><strong>Student:</strong> {refundTarget.student?.full_name}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Refund Amount (THB) *</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason for Refund *</Label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Student requested cancellation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefundSubmit}
              disabled={!refundAmount || !refundReason || refundMutation.isPending}
              variant="destructive"
            >
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Slip Dialog */}
      <Dialog open={!!selectedSlipUrl} onOpenChange={(open) => !open && setSelectedSlipUrl(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Slip</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 bg-muted rounded-lg overflow-hidden max-h-[70vh]">
            {selectedSlipUrl && (
              <img
                src={selectedSlipUrl}
                alt="Payment Slip"
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlipUrl(null)}>
              Close
            </Button>
            {selectedSlipUrl && (
              <Button asChild>
                <a href={selectedSlipUrl} target="_blank" rel="noopener noreferrer">
                  Open in New Tab
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
