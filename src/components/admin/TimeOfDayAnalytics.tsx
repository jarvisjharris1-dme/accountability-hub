import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function TimeOfDayAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeOfDayData();
  }, []);

  const fetchTimeOfDayData = async () => {
    try {
      const { data: verifications } = await supabase
        .from('phone_verifications')
        .select('created_at, verified_at');

      const hourlyStats = new Map();
      for (let i = 0; i < 24; i++) {
        hourlyStats.set(i, { hour: i, attempts: 0, successful: 0, successRate: 0 });
      }

      verifications?.forEach(v => {
        const hour = new Date(v.created_at).getHours();
        const stats = hourlyStats.get(hour)!;
        stats.attempts++;
        if (v.verified_at) stats.successful++;
      });

      const chartData = Array.from(hourlyStats.values()).map(s => ({
        ...s,
        successRate: s.attempts > 0 ? ((s.successful / s.attempts) * 100).toFixed(1) : 0,
        hourLabel: `${s.hour.toString().padStart(2, '0')}:00`
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching time of day data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Success Rate by Time of Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hourLabel" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="successRate" stroke="#8884d8" name="Success Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
