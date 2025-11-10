import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StreakPatternChartProps {
  data: Array<{ date: string; journalStreak: number; messageStreak: number; workshopStreak: number }>;
}

export function StreakPatternChart({ data }: StreakPatternChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Streak Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="journalStreak" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Journal" />
            <Area type="monotone" dataKey="messageStreak" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Messages" />
            <Area type="monotone" dataKey="workshopStreak" stackId="1" stroke="#10b981" fill="#10b981" name="Workshops" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
