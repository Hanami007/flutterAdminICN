import { supabase } from '@/lib/supabase';
import type { DashboardStats, RevenueDataPoint, EnrollmentDataPoint, Activity } from '@/types/database';

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    { count: totalStudents },
    { count: totalCourses },
    { count: totalEnrollments },
    { count: totalTeachers },
    { count: upcomingClasses },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('class_sessions').select('*', { count: 'exact', head: true }).gte('start_time', new Date().toISOString()),
  ]);

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return {
    total_revenue: totalRevenue,
    total_students: totalStudents || 0,
    total_courses: totalCourses || 0,
    total_enrollments: totalEnrollments || 0,
    total_teachers: totalTeachers || 0,
    upcoming_classes: upcomingClasses || 0,
    revenue_change: 12.5,
    students_change: 8.3,
    courses_change: 5.1,
    enrollments_change: 15.2,
  };
}

export async function getRevenueChart(days: number = 30): Promise<RevenueDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('payments')
    .select('amount, created_at')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  const grouped: Record<string, number> = {};
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]!;
    grouped[dateStr] = 0;
  }

  data?.forEach((p) => {
    const dateStr = new Date(p.created_at).toISOString().split('T')[0]!;
    if (grouped[dateStr] !== undefined) {
      grouped[dateStr] += Number(p.amount || 0);
    }
  });

  return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
}

export async function getEnrollmentChart(days: number = 30): Promise<EnrollmentDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('enrollments')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  const grouped: Record<string, number> = {};
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]!;
    grouped[dateStr] = 0;
  }

  data?.forEach((e) => {
    const dateStr = new Date(e.created_at).toISOString().split('T')[0]!;
    if (grouped[dateStr] !== undefined) {
      grouped[dateStr] += 1;
    }
  });

  return Object.entries(grouped).map(([date, enrollments]) => ({ date, enrollments }));
}

export async function getRecentActivities(limit: number = 10): Promise<Activity[]> {
  const { data: dbActivities } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (dbActivities && dbActivities.length > 0) {
    return dbActivities as Activity[];
  }

  try {
    const [
      { data: enrollments },
      { data: payments },
      { data: bookings },
    ] = await Promise.all([
      supabase
        .from('enrollments')
        .select('created_at, student:students(full_name), course:courses(title)')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('payments')
        .select('created_at, amount, student:students(full_name), course:courses(title)')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('bookings')
        .select('created_at, status, student:students(full_name), session:class_sessions(title)')
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    const items: Activity[] = [];

    enrollments?.forEach((e: any, idx) => {
      const studentName = e.student?.full_name || 'Student';
      const courseTitle = e.course?.title || 'Course';
      items.push({
        id: `enrollment-${idx}-${e.created_at}`,
        type: 'enrollment',
        title: 'New Enrollment',
        description: `${studentName} enrolled in "${courseTitle}"`,
        user_name: studentName,
        metadata: null,
        created_at: e.created_at,
      });
    });

    payments?.forEach((p: any, idx) => {
      const studentName = p.student?.full_name || 'Student';
      const courseTitle = p.course?.title || 'Course';
      items.push({
        id: `payment-${idx}-${p.created_at}`,
        type: 'payment',
        title: 'Payment Received',
        description: `฿${p.amount?.toLocaleString()} payment received for "${courseTitle}"`,
        user_name: studentName,
        metadata: null,
        created_at: p.created_at,
      });
    });

    bookings?.forEach((b: any, idx) => {
      const studentName = b.student?.full_name || 'Student';
      const sessionTitle = b.session?.title || 'Class Session';
      items.push({
        id: `booking-${idx}-${b.created_at}`,
        type: 'booking',
        title: `Booking ${b.status}`,
        description: `Booking for "${sessionTitle}" was marked ${b.status}`,
        user_name: studentName,
        metadata: null,
        created_at: b.created_at,
      });
    });

    return items
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (err) {
    console.error('Failed to aggregate recent activities:', err);
    return [];
  }
}
