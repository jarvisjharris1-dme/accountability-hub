import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function PhoneVerificationTrendsChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: verifications } = await supabase
        .from('phone_verifications')
        .select('created_at, verified_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const dailyStats = new Map();
      verifications?.forEach(v => {
        const date = new Date(v.created_at).toLocaleDateString();
        if (!dailyStats.has(date)) {
          dailyStats.set(date, { date, attempts: 0, successful: 0 });
        }
        const stats = dailyStats.get(date);
        stats.attempts++;
        if (v.verified_at) stats.successful++;
      });

      setData(Array.from(dailyStats.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
    } catch (error) {
      console.error('Error fetching trends:', error);
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
        <CardTitle>Verification Trends (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="attempts" stroke="#8884d8" name="Attempts" />
            <Line type="monotone" dataKey="successful" stroke="#82ca9d" name="Successful" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
