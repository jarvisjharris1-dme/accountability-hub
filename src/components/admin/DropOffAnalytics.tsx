import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function DropOffAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDropOffData();
  }, []);

  const fetchDropOffData = async () => {
    try {
      const { data: verifications } = await supabase
        .from('phone_verifications')
        .select('drop_off_stage, verified_at');

      const stages = ['phone_entry', 'otp_request', 'otp_verification', 'completed'];
      const stageCounts = new Map(stages.map(s => [s, 0]));

      verifications?.forEach(v => {
        if (v.verified_at) {
          stageCounts.set('completed', stageCounts.get('completed')! + 1);
        } else if (v.drop_off_stage) {
          stageCounts.set(v.drop_off_stage, stageCounts.get(v.drop_off_stage)! + 1);
        }
      });

      const chartData = Array.from(stageCounts.entries())
        .map(([stage, count]) => ({
          stage: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: verifications?.length ? ((count / verifications.length) * 100).toFixed(1) : 0
        }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching drop-off data:', error);
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
        <CardTitle>User Drop-Off Points</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Users">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
