import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PlayCircle, Clock, CheckCircle2 } from 'lucide-react';

export function ScheduledBackupStatus() {
  const [checking, setChecking] = useState(false);

  const triggerScheduledCheck = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-backup-check');
      
      if (error) throw error;
      
      toast.success(`Checked ${data.checked} configurations, executed ${data.executed} backups`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scheduled Backup System</CardTitle>
            <CardDescription>Automated backup scheduler runs hourly</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Checks every hour</span>
          </div>
        </div>
        
        <Button 
          onClick={triggerScheduledCheck} 
          disabled={checking}
          className="w-full"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {checking ? 'Checking...' : 'Run Manual Check Now'}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          This will check all enabled backup configurations and execute any that are due based on their cron schedules.
        </p>
      </CardContent>
    </Card>
  );
}