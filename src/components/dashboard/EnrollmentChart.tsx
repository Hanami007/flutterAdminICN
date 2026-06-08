import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnrollmentChart } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export function EnrollmentChart() {
  const { data, isLoading } = useEnrollmentChart(30);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Enrollments</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Enrollments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%, 0.3)" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric' })}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="hsl(220, 9%, 46%)"
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
              <Tooltip
                formatter={(value: any) => [value, 'Enrollments']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                contentStyle={{
                  backgroundColor: 'hsl(224, 71%, 4%)',
                  border: '1px solid hsl(215, 27%, 17%)',
                  borderRadius: '8px',
                  color: 'hsl(213, 31%, 91%)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="enrollments" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
