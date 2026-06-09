import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { useCourses } from '@/hooks/useCourses';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson, useReorderLessons } from '@/hooks/useVideos';
import { uploadVideo } from '@/services/videos';
import { toast } from '@/hooks/useToast';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Video, ArrowUp, ArrowDown, ExternalLink, Upload, Loader2 } from 'lucide-react';
import type { Lesson } from '@/types/database';

export default function VideosPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lesson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);

  // Form states
  const [lessonId, setLessonId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [isFree, setIsFree] = useState(false);
  const [contentType, setContentType] = useState<'video' | 'text' | 'quiz' | 'assignment'>('video');

  const { data: coursesData, isLoading: coursesLoading } = useCourses({ pageSize: 1000 });
  const courses = coursesData?.data || [];

  const { data: lessons, isLoading: lessonsLoading } = useLessons(selectedCourseId);

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();
  const reorderMutation = useReorderLessons();

  const openCreate = () => {
    setEditTarget(null);
    setLessonId(self.crypto?.randomUUID() || Math.random().toString(36).substring(2, 15));
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setDuration(0);
    setIsFree(false);
    setContentType('video');
    setDialogOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditTarget(lesson);
    setLessonId(lesson.id);
    setTitle(lesson.title);
    setDescription(lesson.description || '');
    setVideoUrl(lesson.video_url || '');
    setDuration(lesson.video_duration || 0);
    setIsFree(lesson.is_free);
    setContentType(lesson.content_type);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data: Partial<Lesson> = {
      id: editTarget ? editTarget.id : lessonId,
      course_id: selectedCourseId,
      title,
      description,
      video_url: videoUrl || null,
      video_duration: duration || null,
      is_free: isFree,
      content_type: contentType,
      is_published: true,
    };

    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      const nextSortOrder = (lessons?.length || 0) + 1;
      createMutation.mutate(
        { ...data, sort_order: nextSortOrder },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file (mp4, webm, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const durationSec = await new Promise<number>((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve(Math.round(video.duration));
        };
        video.onerror = () => resolve(0);
        video.src = URL.createObjectURL(file);
      });

      if (durationSec > 0) {
        setDuration(durationSec);
      }

      const uploadedUrl = await uploadVideo(file, selectedCourseId, lessonId);
      setVideoUrl(uploadedUrl);

      toast({
        title: 'Video uploaded successfully',
        variant: 'success',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload video file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!lessons) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const temp = newLessons[index]!;
    newLessons[index] = newLessons[targetIndex]!;
    newLessons[targetIndex] = temp;

    const lessonIds = newLessons.map((l) => l.id);
    reorderMutation.mutate({ courseId: selectedCourseId, lessonIds });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Videos & Lessons"
        description="Manage course curriculum and educational video content"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Videos' }]}
        actions={
          selectedCourseId && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Lesson
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-80 space-y-1.5">
              <Label>Select Course</Label>
              {coursesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course to manage" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {!selectedCourseId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-6">
                <Video className="h-4 w-4" />
                <span>Select a course from the dropdown to start managing lessons.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCourseId && (
        <div className="space-y-4">
          {lessonsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))
          ) : !lessons || lessons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mb-3 text-muted-foreground/55" />
                <h3 className="font-semibold text-lg text-foreground">No lessons yet</h3>
                <p className="text-sm mt-1 mb-4">Get started by creating the first lesson for this course.</p>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Add First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {lessons.map((lesson, index) => (
                <Card key={lesson.id} className="group hover:border-primary/30 transition-all">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Reordering Controls */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded"
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded"
                        disabled={index === lessons.length - 1 || reorderMutation.isPending}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-muted font-medium px-2 py-0.5 rounded text-muted-foreground">
                          L{index + 1}
                        </span>
                        <p className="font-medium truncate text-foreground">{lesson.title}</p>
                        {lesson.is_free && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-semibold capitalize">
                            Preview
                          </span>
                        )}
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold capitalize">
                          {lesson.content_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        {lesson.video_duration ? (
                          <span>{Math.floor(lesson.video_duration / 60)}m {lesson.video_duration % 60}s</span>
                        ) : (
                          <span>No duration</span>
                        )}
                        {lesson.video_url && (
                          <a
                            href={lesson.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            Watch Video <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(lesson)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteTarget(lesson)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Lesson Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to React state"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={(v) => setContentType(v as Lesson['content_type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Article / Text</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={duration || ''}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="e.g. 600"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Video URL / Embed Link</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://vimeo.com/... or https://youtube.com/..."
                    disabled={isUploading}
                    className="pr-16"
                  />
                  {videoUrl && (
                    <div className="absolute right-3 top-2.5 text-emerald-500 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold capitalize">
                      Ready
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    id="video-file-upload"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => document.getElementById('video-file-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="text-xs text-muted-foreground flex items-center gap-2 px-1 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                  <span>Uploading video to storage and extracting duration...</span>
                </div>
              )}

              {videoUrl && videoUrl.includes('supabase.co') && (
                <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/10 rounded-md p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Video className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate font-medium">Uploaded Storage File</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setVideoUrl('');
                      setDuration(0);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description / Transcript</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview of this lesson..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={isFree} onCheckedChange={setIsFree} />
              <div className="space-y-0.5">
                <Label>Free Preview Lesson</Label>
                <p className="text-xs text-muted-foreground">Allow students to view this lesson without buying the course.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title || createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? 'Save Changes' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </div>
  );
}
