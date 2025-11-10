import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Download, RefreshCw, CheckCircle, AlertCircle, Play, Trash2 } from 'lucide-react';
import { BackupConfigurationDialog } from './BackupConfigurationDialog';
import { RestoreBackupDialog } from './RestoreBackupDialog';
import { BackupExecutionLogs } from './BackupExecutionLogs';
import { ScheduledBackupStatus } from './ScheduledBackupStatus';


export function BackupManagement() {
  const [backups, setBackups] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [backupsRes, configsRes] = await Promise.all([
        supabase.from('backups').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('backup_configurations').select('*').order('created_at', { ascending: false })
      ]);

      if (backupsRes.data) setBackups(backupsRes.data);
      if (configsRes.data) setConfigs(configsRes.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (configId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: { configurationId: configId, backupType: 'manual', userId: user?.id }
      });

      if (error) throw error;
      toast.success('Backup started');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const verifyBackup = async (backupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('verify-backup', {
        body: { backupId, userId: user?.id }
      });

      if (error) throw error;
      toast.success(data.verified ? 'Backup verified' : 'Backup verification failed');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const downloadBackup = (backup: any) => {
    const dataStr = JSON.stringify(backup.backup_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${backup.backup_name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Backup & Restore</h2>
        <Button onClick={() => setShowConfigDialog(true)}>New Configuration</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Backup Configurations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {configs.map(config => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{config.name}</p>
                  <p className="text-sm text-muted-foreground">{config.tables_to_backup.length} tables</p>
                </div>
                <Button size="sm" onClick={() => createBackup(config.id)}>
                  <Play className="w-4 h-4 mr-1" /> Run
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Backups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {backups.slice(0, 5).map(backup => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{backup.backup_name}</p>
                  <p className="text-xs text-muted-foreground">{backup.row_count} rows</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => verifyBackup(backup.id)}>
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadBackup(backup)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={() => { setSelectedBackup(backup); setShowRestoreDialog(true); }}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ScheduledBackupStatus />

      <BackupExecutionLogs />

      <BackupConfigurationDialog open={showConfigDialog} onOpenChange={setShowConfigDialog} onSuccess={loadData} />
      <RestoreBackupDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog} backup={selectedBackup} onSuccess={loadData} />

    </div>
  );
}
