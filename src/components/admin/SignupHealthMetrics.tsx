import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface SignupHealthMetricsProps {
  totalSignups: number;
  successfulSignups: number;
  errorCount: number;
  profileFailures: number;
  errorRate: number;
  profileFailureRate: number;
}

export function SignupHealthMetrics({
  totalSignups,
  successfulSignups,
  errorCount,
  profileFailures,
  errorRate,
  profileFailureRate,
}: SignupHealthMetricsProps) {
  const successRate = totalSignups > 0 ? ((successfulSignups / totalSignups) * 100).toFixed(1) : '0';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSignups}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">{successfulSignups} successful</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <XCircle className={`h-4 w-4 ${errorRate > 10 ? 'text-red-600' : 'text-yellow-600'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{errorCount} errors</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profile Failures</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${profileFailureRate > 5 ? 'text-red-600' : 'text-yellow-600'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profileFailureRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{profileFailures} failed</p>
        </CardContent>
      </Card>
    </div>
  );
}
