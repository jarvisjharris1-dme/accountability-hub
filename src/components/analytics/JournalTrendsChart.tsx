import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JournalTrendsChartProps {
  data: Array<{ date: string; entries: number; mood: number }>;
}

export function JournalTrendsChart({ data }: JournalTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Entry Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="entries" stroke="#8b5cf6" strokeWidth={2} name="Entries" />
            <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} name="Avg Mood" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
