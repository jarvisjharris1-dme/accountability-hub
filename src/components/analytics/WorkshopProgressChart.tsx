import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkshopProgressChartProps {
  data: Array<{ name: string; completed: number; inProgress: number; notStarted: number }>;
}

export function WorkshopProgressChart({ data }: WorkshopProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workshop Completion Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
            <Bar dataKey="notStarted" fill="#ef4444" name="Not Started" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
