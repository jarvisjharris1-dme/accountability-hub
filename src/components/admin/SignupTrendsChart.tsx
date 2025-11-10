import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

interface SignupTrendsChartProps {
  data: Array<{
    time: string;
    successful: number;
    errors: number;
    profileFailures: number;
  }>;
}

export function SignupTrendsChart({ data }: SignupTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup Trends (24 Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis 
              dataKey="time" 
              stroke="#888888"
              fontSize={12}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="successful" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Successful"
            />
            <Line 
              type="monotone" 
              dataKey="errors" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Errors"
            />
            <Line 
              type="monotone" 
              dataKey="profileFailures" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Profile Failures"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
