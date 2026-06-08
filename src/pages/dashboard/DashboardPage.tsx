import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { EnrollmentChart } from '@/components/dashboard/EnrollmentChart';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { useDashboardStats } from '@/hooks/useDashboard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, Users, BookOpen, GraduationCap, UserCheck, CalendarDays } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.total_revenue) : '฿0'}
          change={stats?.revenue_change}
          icon={DollarSign}
          gradient="gradient-primary"
          loading={isLoading}
        />
        <StatsCard
          title="Total Students"
          value={stats ? formatNumber(stats.total_students) : '0'}
          change={stats?.students_change}
          icon={Users}
          gradient="gradient-info"
          loading={isLoading}
        />
        <StatsCard
          title="Total Courses"
          value={stats ? formatNumber(stats.total_courses) : '0'}
          change={stats?.courses_change}
          icon={BookOpen}
          gradient="gradient-success"
          loading={isLoading}
        />
        <StatsCard
          title="Enrollments"
          value={stats ? formatNumber(stats.total_enrollments) : '0'}
          change={stats?.enrollments_change}
          icon={GraduationCap}
          gradient="gradient-warning"
          loading={isLoading}
        />
        <StatsCard
          title="Teachers"
          value={stats ? formatNumber(stats.total_teachers) : '0'}
          icon={UserCheck}
          gradient="bg-gradient-to-br from-pink-500 to-rose-500"
          loading={isLoading}
        />
        <StatsCard
          title="Upcoming Classes"
          value={stats ? formatNumber(stats.upcoming_classes) : '0'}
          icon={CalendarDays}
          gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <RevenueChart />
        <EnrollmentChart />
      </div>

      {/* Activities */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <RecentActivities />
      </div>
    </div>
  );
}
