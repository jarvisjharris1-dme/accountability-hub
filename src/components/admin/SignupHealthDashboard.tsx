import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SignupHealthMetrics } from './SignupHealthMetrics';
import { SignupTrendsChart } from './SignupTrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SignupEvent {
  id: string;
  event_type: string;
  error_message: string | null;
  created_at: string;
}

interface HealthAlert {
  id: string;
  alert_type: string;
  current_rate: number;
  threshold_exceeded: number;
  time_period: string;
  notified_at: string;
}

export function SignupHealthDashboard() {
  const [events, setEvents] = useState<SignupEvent[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchData = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: eventsData } = await supabase
        .from('signup_events')
        .select('*')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      const { data: alertsData } = await supabase
        .from('signup_health_alerts')
        .select('*')
        .is('resolved_at', null)
        .order('notified_at', { ascending: false })
        .limit(10);

      setEvents(eventsData || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching signup health data:', error);
      toast.error('Failed to load signup health data');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-signup-health');
      
      if (error) throw error;
      
      toast.success(`Health check complete. ${data.alerts} alerts generated.`);
      fetchData();
    } catch (error) {
      console.error('Error checking health:', error);
      toast.error('Failed to check signup health');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalSignups = events.length;
  const successfulSignups = events.filter(e => e.event_type === 'success').length;
  const errorCount = events.filter(e => e.event_type === 'error').length;
  const profileFailures = events.filter(e => e.event_type === 'profile_failed').length;
  const errorRate = totalSignups > 0 ? (errorCount / totalSignups) * 100 : 0;
  const profileFailureRate = totalSignups > 0 ? (profileFailures / totalSignups) * 100 : 0;

  const trendData = generateTrendData(events);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Signup Health Monitoring</h2>
        <Button onClick={checkHealth} disabled={checking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          Run Health Check
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Alert key={alert.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {alert.alert_type === 'high_error_rate' ? 'High Error Rate Detected' : 'High Profile Failure Rate'}
              </AlertTitle>
              <AlertDescription>
                Current rate: {alert.current_rate.toFixed(1)}% (threshold: {alert.threshold_exceeded}%)
                - {alert.time_period}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <SignupHealthMetrics
        totalSignups={totalSignups}
        successfulSignups={successfulSignups}
        errorCount={errorCount}
        profileFailures={profileFailures}
        errorRate={errorRate}
        profileFailureRate={profileFailureRate}
      />

      <SignupTrendsChart data={trendData} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.filter(e => e.event_type === 'error').slice(0, 10).map(event => (
              <div key={event.id} className="p-3 bg-red-50 rounded-lg text-sm">
                <p className="font-medium text-red-900">{event.error_message}</p>
                <p className="text-xs text-red-700 mt-1">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {events.filter(e => e.event_type === 'error').length === 0 && (
              <p className="text-sm text-muted-foreground">No recent errors</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateTrendData(events: SignupEvent[]) {
  const hours = 24;
  const data = [];
  
  for (let i = hours - 1; i >= 0; i--) {
    const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
    const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);
    
    const hourEvents = events.filter(e => {
      const eventTime = new Date(e.created_at);
      return eventTime >= hourStart && eventTime < hourEnd;
    });
    
    data.push({
      time: hourStart.getHours() + ':00',
      successful: hourEvents.filter(e => e.event_type === 'success').length,
      errors: hourEvents.filter(e => e.event_type === 'error').length,
      profileFailures: hourEvents.filter(e => e.event_type === 'profile_failed').length,
    });
  }
  
  return data;
}
