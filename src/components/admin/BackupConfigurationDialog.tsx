import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BackupConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AVAILABLE_TABLES = [
  'profiles', 'journal_entries', 'messages', 'goals', 'achievements',
  'workshops', 'groups', 'notifications', 'user_roles'
];

export function BackupConfigurationDialog({ open, onOpenChange, onSuccess }: BackupConfigurationDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleCron, setScheduleCron] = useState('0 2 * * *');
  const [retentionDays, setRetentionDays] = useState(30);
  const [selectedTables, setSelectedTables] = useState<string[]>(AVAILABLE_TABLES);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('backup_configurations').insert({
        name,
        description,
        schedule_cron: scheduleCron,
        tables_to_backup: selectedTables,
        retention_days: retentionDays,
        is_active: true
      });

      if (error) throw error;

      toast.success('Backup configuration created');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Backup Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Schedule (Cron)</Label>
            <Input value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} required />
            <p className="text-xs text-muted-foreground mt-1">Default: Daily at 2 AM</p>
          </div>
          <div>
            <Label>Retention Days</Label>
            <Input type="number" value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} required />
          </div>
          <div>
            <Label>Tables to Backup</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {AVAILABLE_TABLES.map(table => (
                <div key={table} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTables.includes(table)}
                    onCheckedChange={(checked) => {
                      setSelectedTables(checked 
                        ? [...selectedTables, table]
                        : selectedTables.filter(t => t !== table)
                      );
                    }}
                  />
                  <label className="text-sm">{table}</label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>Create Configuration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
