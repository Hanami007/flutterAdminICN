import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, Users, Award, Star } from 'lucide-react';

type Period = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const { data, isLoading } = useAnalytics(period);

  const formatPeriodLabel = (val: Period) => {
    switch (val) {
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case '90d':
        return 'Last 90 Days';
      case '1y':
        return 'Last Year';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Business Analytics"
        description="Comprehensive insights into revenue, enrollments, teacher performance, and platform engagement"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Analytics' }]}
        actions={
          <div className="w-40">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BarChart3 className="h-10 w-10 mb-2" />
            <p>No analytics data available for the selected period.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trends */}
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Revenue Trends
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily earnings growth summary ({formatPeriodLabel(period)})
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue_trends} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%, 0.3)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(220, 9%, 46%)"
                    />
                    <YAxis
                      tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(220, 9%, 46%)"
                    />
                    <Tooltip
                      formatter={(v: any) => [formatCurrency(Number(v)), 'Revenue']}
                      labelFormatter={(lbl) => new Date(lbl).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      contentStyle={{
                        backgroundColor: 'hsl(224, 71%, 4%)',
                        border: '1px solid hsl(215, 27%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(213, 31%, 91%)',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(262, 83%, 58%)"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Student Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" /> Student Growth
              </CardTitle>
              <p className="text-xs text-muted-foreground">Cumulative newly registered student accounts</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.student_growth} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%, 0.3)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(220, 9%, 46%)"
                    />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                    <Tooltip
                      formatter={(v: any) => [v, 'Students']}
                      labelFormatter={(lbl) => new Date(lbl).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      contentStyle={{
                        backgroundColor: 'hsl(224, 71%, 4%)',
                        border: '1px solid hsl(215, 27%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(213, 31%, 91%)',
                        fontSize: '11px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(173, 58%, 39%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Course Completion Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Completion Rates
              </CardTitle>
              <p className="text-xs text-muted-foreground">Student course completion benchmarks (%)</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.completion_rates} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220, 13%, 91%, 0.3)" />
                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                    <YAxis dataKey="name" type="category" width={80} fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                    <Tooltip
                      formatter={(v: any) => [`${v}%`, 'Completion Rate']}
                      contentStyle={{
                        backgroundColor: 'hsl(224, 71%, 4%)',
                        border: '1px solid hsl(215, 27%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(213, 31%, 91%)',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="rate" fill="hsl(43, 74%, 66%)" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Performing Courses</CardTitle>
              <p className="text-xs text-muted-foreground">Highest enrollment and revenue generating courses</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_courses} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%, 0.3)" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                    <Tooltip
                      formatter={(v: any, name: any) => [
                        name === 'revenue' ? formatCurrency(Number(v)) : v,
                        name === 'revenue' ? 'Revenue' : 'Enrollments'
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(224, 71%, 4%)',
                        border: '1px solid hsl(215, 27%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(213, 31%, 91%)',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="enrollments" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Teachers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Teacher Leaderboard</CardTitle>
              <p className="text-xs text-muted-foreground">Top instructors ranked by active student count and ratings</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.top_teachers.map((teacher, index) => (
                  <div key={teacher.name} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-muted">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.students} students taught</p>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-sm text-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {teacher.rating.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
