import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

interface EmailPerformanceChartProps {
  data: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  }>;
}

export function EmailPerformanceChart({ data }: EmailPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sent" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Sent"
            />
            <Line 
              type="monotone" 
              dataKey="opened" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Opened"
            />
            <Line 
              type="monotone" 
              dataKey="clicked" 
              stroke="#ffc658" 
              strokeWidth={2}
              name="Clicked"
            />
            <Line 
              type="monotone" 
              dataKey="bounced" 
              stroke="#ff8042" 
              strokeWidth={2}
              name="Bounced"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
