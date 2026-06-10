import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourse, useCreateCourse, useUpdateCourse } from '@/hooks/useCourses';
import { useCategories } from '@/hooks/useCategories';
import { useTeachers } from '@/hooks/useTeachers';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { slugify } from '@/lib/utils';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  original_price: z.coerce.number().optional(),
  currency: z.string().default('THB'),
  duration_hours: z.coerce.number().min(0).default(0),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']),
  category_id: z.string().min(1, 'Category is required'),
  teacher_id: z.string().optional(),
  max_students: z.coerce.number().optional(),
  is_featured: z.boolean().default(false),
  what_you_will_learn: z.string().optional(),
  requirements: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: course, isLoading: courseLoading } = useCourse(id || '');
  const { data: categories } = useCategories();
  const { data: teachers } = useTeachers();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      currency: 'THB',
      level: 'beginner',
      is_featured: false,
      price: 0,
      duration_hours: 0,
      category_id: '',
      teacher_id: '',
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (!isEdit && title) {
      setValue('slug', slugify(title));
    }
  }, [title, isEdit, setValue]);

  useEffect(() => {
    if (course && isEdit) {
      reset({
        title: course.title,
        slug: course.slug,
        description: course.description,
        short_description: course.short_description || '',
        price: course.price,
        original_price: course.original_price || undefined,
        currency: course.currency,
        duration_hours: course.duration_hours,
        level: course.level,
        category_id: course.category_id || undefined,
        teacher_id: course.teacher_id || undefined,
        max_students: course.max_students || undefined,
        is_featured: course.is_featured,
        what_you_will_learn: course.what_you_will_learn?.join('\n') || '',
        requirements: course.requirements?.join('\n') || '',
      });
    }
  }, [course, isEdit, reset]);

  const onSubmit = (data: CourseFormData) => {
    const formattedData = {
      ...data,
      category_id: data.category_id || null,
      teacher_id: data.teacher_id || null,
      what_you_will_learn: data.what_you_will_learn
        ? data.what_you_will_learn.split('\n').map(line => line.trim()).filter(line => line !== '')
        : [],
      requirements: data.requirements
        ? data.requirements.split('\n').map(line => line.trim()).filter(line => line !== '')
        : [],
    };
    if (isEdit && id) {
      updateMutation.mutate(
        { id, data: formattedData as any },
        { onSuccess: () => navigate('/courses') }
      );
    } else {
      createMutation.mutate(formattedData as any, { onSuccess: () => navigate('/courses') });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && courseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title={isEdit ? 'Edit Course' : 'Create Course'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Courses', href: '/courses' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register('title')} placeholder="e.g. React Masterclass" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register('slug')} placeholder="react-masterclass" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input id="short_description" {...register('short_description')} placeholder="Brief course summary" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" {...register('description')} placeholder="Full course description..." rows={5} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (THB) *</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price</Label>
                <Input id="original_price" type="number" step="0.01" {...register('original_price')} placeholder="For showing discount" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duration (hours)</Label>
                <Input id="duration_hours" type="number" {...register('duration_hours')} />
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={watch('level')} onValueChange={(v) => setValue('level', v as CourseFormData['level'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="all_levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={watch('category_id') || ''} onValueChange={(v) => setValue('category_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={watch('teacher_id') || ''} onValueChange={(v) => setValue('teacher_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers?.data?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_students">Max Students</Label>
                <Input id="max_students" type="number" {...register('max_students')} placeholder="Unlimited" />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={watch('is_featured')}
                  onCheckedChange={(v) => setValue('is_featured', v)}
                />
                <Label>Featured Course</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Details (What You'll Learn & Requirements) */}
        <Card>
          <CardHeader>
            <CardTitle>Course Curriculum Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="what_you_will_learn">What You'll Learn (One point per line)</Label>
                <Textarea
                  id="what_you_will_learn"
                  {...register('what_you_will_learn')}
                  placeholder="e.g. Master React fundamentals&#10;Build 5 real-world projects&#10;Understand state management"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (One point per line)</Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  placeholder="e.g. Basic HTML/CSS knowledge&#10;No previous programming experience required&#10;A computer with internet connection"
                  rows={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/courses')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
