import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'];

export function ErrorTypeAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchErrorData();
  }, []);

  const fetchErrorData = async () => {
    try {
      const { data: verifications } = await supabase
        .from('phone_verifications')
        .select('error_type')
        .not('error_type', 'is', null);

      const errorCounts = new Map();
      verifications?.forEach(v => {
        const error = v.error_type || 'Unknown';
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      });

      const chartData = Array.from(errorCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setData(chartData);
    } catch (error) {
      console.error('Error fetching error data:', error);
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
        <CardTitle>Common Error Types</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-8">No error data available</p>
        )}
      </CardContent>
    </Card>
  );
}
