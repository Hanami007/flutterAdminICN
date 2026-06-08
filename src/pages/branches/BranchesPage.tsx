import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/useBranches';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Building2, MapPin, Phone } from 'lucide-react';
import type { Branch } from '@/types/database';

export default function BranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deleteMutation = useDeleteBranch();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', email: '', is_active: true, capacity: '' });

  const openCreate = () => { setEditTarget(null); setForm({ name: '', address: '', city: '', phone: '', email: '', is_active: true, capacity: '' }); setDialogOpen(true); };
  const openEdit = (b: Branch) => { setEditTarget(b); setForm({ name: b.name, address: b.address, city: b.city, phone: b.phone || '', email: b.email || '', is_active: b.is_active, capacity: b.capacity?.toString() || '' }); setDialogOpen(true); };

  const handleSubmit = () => {
    const data = { ...form, capacity: form.capacity ? parseInt(form.capacity) : null };
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Branches" description="Manage physical branch locations" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Branches' }]} actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Branch</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>) : branches?.length === 0 ? (
          <Card className="col-span-full"><CardContent className="flex flex-col items-center py-12 text-muted-foreground"><Building2 className="h-10 w-10 mb-2" /><p>No branches yet</p></CardContent></Card>
        ) : branches?.map((b) => (
          <Card key={b.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{b.name}</p>
                    <span className={`text-xs font-medium ${b.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>{b.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(b)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{b.address}, {b.city}</span></div>
                {b.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /><span>{b.phone}</span></div>}
                {b.capacity && <p className="text-xs">Capacity: {b.capacity}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Branch' : 'Add Branch'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Address *</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>City *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.address || !form.city}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Branch" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" loading={deleteMutation.isPending} onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }} />
    </div>
  );
}
