import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRevenueChart } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export function RevenueChart() {
  const { data, isLoading } = useRevenueChart(30);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2 min-w-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%, 0.3)" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="hsl(220, 9%, 46%)"
              />
              <YAxis
                tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="hsl(220, 9%, 46%)"
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                contentStyle={{
                  backgroundColor: 'hsl(224, 71%, 4%)',
                  border: '1px solid hsl(215, 27%, 17%)',
                  borderRadius: '8px',
                  color: 'hsl(213, 31%, 91%)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(262, 83%, 58%)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
