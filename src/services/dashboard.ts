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

  if (!data || data.length === 0) {
    // Generate sample data for demo
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      return {
        date: date.toISOString().split('T')[0]!,
        revenue: Math.floor(Math.random() * 50000) + 10000,
      };
    });
  }

  const grouped: Record<string, number> = {};
  data.forEach((p) => {
    const date = new Date(p.created_at).toISOString().split('T')[0]!;
    grouped[date] = (grouped[date] || 0) + p.amount;
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

  if (!data || data.length === 0) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      return {
        date: date.toISOString().split('T')[0]!,
        enrollments: Math.floor(Math.random() * 20) + 5,
      };
    });
  }

  const grouped: Record<string, number> = {};
  data.forEach((e) => {
    const date = new Date(e.created_at).toISOString().split('T')[0]!;
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, enrollments]) => ({ date, enrollments }));
}

export async function getRecentActivities(limit: number = 10): Promise<Activity[]> {
  const { data } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) {
    // Sample activities for demo
    return [
      { id: '1', type: 'enrollment', title: 'New Enrollment', description: 'John Smith enrolled in React Masterclass', user_name: 'John Smith', metadata: null, created_at: new Date(Date.now() - 300000).toISOString() },
      { id: '2', type: 'payment', title: 'Payment Received', description: '฿2,500 payment for Advanced TypeScript', user_name: 'Jane Doe', metadata: null, created_at: new Date(Date.now() - 900000).toISOString() },
      { id: '3', type: 'course_created', title: 'Course Published', description: 'New course: UI/UX Design Fundamentals', user_name: 'Admin', metadata: null, created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: '4', type: 'booking', title: 'Booking Approved', description: 'Booking for Python Workshop approved', user_name: 'Staff', metadata: null, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: '5', type: 'review', title: 'New Review', description: '5-star review on Data Science course', user_name: 'Alice Chen', metadata: null, created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: '6', type: 'enrollment', title: 'New Enrollment', description: 'Bob Lee enrolled in Flutter Development', user_name: 'Bob Lee', metadata: null, created_at: new Date(Date.now() - 10800000).toISOString() },
      { id: '7', type: 'session', title: 'Session Started', description: 'React Workshop at Bangkok Branch started', user_name: null, metadata: null, created_at: new Date(Date.now() - 14400000).toISOString() },
      { id: '8', type: 'payment', title: 'Refund Issued', description: '฿1,200 refund for cancelled enrollment', user_name: 'Support', metadata: null, created_at: new Date(Date.now() - 18000000).toISOString() },
    ];
  }

  return data as Activity[];
}
