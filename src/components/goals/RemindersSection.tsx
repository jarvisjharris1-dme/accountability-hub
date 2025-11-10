import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Bell, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Reminder {
  id: string;
  reminder_type: string;
  reminder_time: string | null;
  days_before_deadline: number | null;
  custom_date: string | null;
  is_active: boolean;
}

export function RemindersSection({ goalId }: { goalId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [daysBefore, setDaysBefore] = useState(1);
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    loadReminders();
  }, [goalId]);

  const loadReminders = async () => {
    const { data } = await supabase
      .from('goal_reminders')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });
    if (data) setReminders(data);
  };

  const addReminder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reminderData: any = {
      goal_id: goalId,
      user_id: user.id,
      reminder_type: newType,
    };

    if (newType === 'daily' || newType === 'weekly') {
      reminderData.reminder_time = time;
    } else if (newType === 'before_deadline') {
      reminderData.days_before_deadline = daysBefore;
    } else if (newType === 'custom') {
      reminderData.custom_date = customDate;
    }

    const { error } = await supabase.from('goal_reminders').insert(reminderData);
    if (error) {
      toast.error('Failed to add reminder');
    } else {
      toast.success('Reminder added');
      loadReminders();
      setShowAdd(false);
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('goal_reminders')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (!error) loadReminders();
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from('goal_reminders').delete().eq('id', id);
    if (!error) {
      toast.success('Reminder deleted');
      loadReminders();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Reminders
        </h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {showAdd && (
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <Label>Type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="before_deadline">Before Deadline</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(newType === 'daily' || newType === 'weekly') && (
            <div>
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          )}

          {newType === 'before_deadline' && (
            <div>
              <Label>Days Before</Label>
              <Input type="number" min="1" value={daysBefore} onChange={(e) => setDaysBefore(Number(e.target.value))} />
            </div>
          )}

          {newType === 'custom' && (
            <div>
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
            </div>
          )}

          <Button onClick={addReminder} className="w-full">Save Reminder</Button>
        </div>
      )}

      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium capitalize">{reminder.reminder_type.replace('_', ' ')}</p>
              <p className="text-sm text-muted-foreground">
                {reminder.reminder_time && `at ${reminder.reminder_time}`}
                {reminder.days_before_deadline && `${reminder.days_before_deadline} days before`}
                {reminder.custom_date && new Date(reminder.custom_date).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={reminder.is_active} onCheckedChange={() => toggleReminder(reminder.id, reminder.is_active)} />
              <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {reminders.length === 0 && !showAdd && (
          <p className="text-center text-muted-foreground py-4">No reminders set</p>
        )}
      </div>
    </div>
  );
}
