import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeacher, useCreateTeacher, useUpdateTeacher } from '@/hooks/useTeachers';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';

const teacherSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  experience_years: z.coerce.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function TeacherFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: teacher, isLoading } = useTeacher(id || '');
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues: { is_active: true },
  });

  useEffect(() => {
    if (teacher && isEdit) {
      reset({
        full_name: teacher.full_name,
        email: teacher.email,
        phone: teacher.phone || '',
        bio: teacher.bio || '',
        specialization: teacher.specialization || '',
        experience_years: teacher.experience_years || undefined,
        is_active: teacher.is_active,
      });
    }
  }, [teacher, isEdit, reset]);

  const onSubmit = (data: TeacherFormData) => {
    if (isEdit && id) {
      updateMutation.mutate({ id, data }, { onSuccess: () => navigate('/teachers') });
    } else {
      createMutation.mutate({ ...data, rating: 0, total_reviews: 0 }, { onSuccess: () => navigate('/teachers') });
    }
  };

  if (isEdit && isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Teacher' : 'Add Teacher'}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Teachers', href: '/teachers' }, { label: isEdit ? 'Edit' : 'Create' }]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Teacher Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input {...register('full_name')} placeholder="John Doe" />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...register('email')} placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register('phone')} placeholder="+66 8x xxx xxxx" />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input {...register('specialization')} placeholder="e.g. Web Development" />
              </div>
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input type="number" {...register('experience_years')} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea {...register('bio')} placeholder="Brief biography..." rows={4} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/teachers')}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4" /> {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
