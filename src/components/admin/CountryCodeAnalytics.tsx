import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function CountryCodeAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryData();
  }, []);

  const fetchCountryData = async () => {
    try {
      const { data: verifications } = await supabase
        .from('phone_verifications')
        .select('country_code, verified_at');

      const countryStats = new Map();
      verifications?.forEach(v => {
        const code = v.country_code || 'Unknown';
        if (!countryStats.has(code)) {
          countryStats.set(code, { country: code, total: 0, successful: 0 });
        }
        const stats = countryStats.get(code);
        stats.total++;
        if (v.verified_at) stats.successful++;
      });

      const chartData = Array.from(countryStats.values())
        .map(s => ({
          ...s,
          successRate: ((s.successful / s.total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setData(chartData);
    } catch (error) {
      console.error('Error fetching country data:', error);
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
        <CardTitle>Success Rate by Country Code</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total Attempts" />
            <Bar dataKey="successful" fill="#82ca9d" name="Successful" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
