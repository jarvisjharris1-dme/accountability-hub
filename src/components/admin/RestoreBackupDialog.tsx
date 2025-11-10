import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface RestoreBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: any;
  onSuccess: () => void;
}

export function RestoreBackupDialog({ open, onOpenChange, backup, onSuccess }: RestoreBackupDialogProps) {
  const [restoreMode, setRestoreMode] = useState('replace');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleRestore = async () => {
    if (!confirmed) {
      toast.error('Please confirm the restore operation');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { backupId: backup.id, userId: user?.id, restoreMode }
      });

      if (error) throw error;

      toast.success('Database restored successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!backup) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Backup</DialogTitle>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This operation will modify your database. Make sure you have a recent backup before proceeding.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Backup: {backup.backup_name}</p>
            <p className="text-sm text-muted-foreground">Rows: {backup.row_count}</p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(backup.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <Label>Restore Mode</Label>
            <RadioGroup value={restoreMode} onValueChange={setRestoreMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace">Replace existing data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge">Merge with existing data</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="confirm">I understand this will modify the database</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleRestore} disabled={loading || !confirmed} variant="destructive">
            Restore Backup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
