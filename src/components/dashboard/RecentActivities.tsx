import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecentActivities } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { BookOpen, CreditCard, GraduationCap, CalendarCheck, Star, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const activityIcons: Record<string, { icon: typeof BookOpen; color: string }> = {
  enrollment: { icon: GraduationCap, color: 'bg-blue-500/15 text-blue-600' },
  payment: { icon: CreditCard, color: 'bg-emerald-500/15 text-emerald-600' },
  course_created: { icon: BookOpen, color: 'bg-purple-500/15 text-purple-600' },
  booking: { icon: CalendarCheck, color: 'bg-amber-500/15 text-amber-600' },
  review: { icon: Star, color: 'bg-yellow-500/15 text-yellow-600' },
  session: { icon: CalendarDays, color: 'bg-pink-500/15 text-pink-600' },
};

export function RecentActivities() {
  const { data, isLoading } = useRecentActivities(8);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[380px]">
          <div className="space-y-1 px-6 pb-6">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-3">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              : data?.map((activity) => {
                  const config = activityIcons[activity.type] || activityIcons.enrollment!;
                  const Icon = config.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-3 border-b last:border-0 animate-fade-in"
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          config.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {activity.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
