import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

export function VerificationTimeAnalytics() {
  const [stats, setStats] = useState({
    avgTime: 0,
    medianTime: 0,
    fastestTime: 0,
    slowestTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeStats();
  }, []);

  const fetchTimeStats = async () => {
    try {
      const { data: verifications } = await supabase
        .from('phone_verifications')
        .select('created_at, verified_at')
        .not('verified_at', 'is', null);

      if (verifications && verifications.length > 0) {
        const times = verifications.map(v => {
          const start = new Date(v.created_at).getTime();
          const end = new Date(v.verified_at!).getTime();
          return (end - start) / 1000; // seconds
        }).sort((a, b) => a - b);

        const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
        const median = times[Math.floor(times.length / 2)];

        setStats({
          avgTime: Math.round(avg),
          medianTime: Math.round(median),
          fastestTime: Math.round(times[0]),
          slowestTime: Math.round(times[times.length - 1])
        });
      }
    } catch (error) {
      console.error('Error fetching time stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Time Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Average Time</p>
              <p className="text-2xl font-bold">{formatTime(stats.avgTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Median Time</p>
              <p className="text-2xl font-bold">{formatTime(stats.medianTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Fastest</p>
              <p className="text-2xl font-bold">{formatTime(stats.fastestTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Slowest</p>
              <p className="text-2xl font-bold">{formatTime(stats.slowestTime)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
