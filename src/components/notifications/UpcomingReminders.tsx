import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar } from 'lucide-react';
import { format, formatDistanceToNow, addDays, isBefore } from 'date-fns';

interface Reminder {
  id: string;
  goal_id: string;
  reminder_type: string;
  reminder_time: string | null;
  days_before_deadline: number | null;
  custom_date: string | null;
  is_active: boolean;
  goals: {
    title: string;
    target_date: string;
  };
}

export function UpcomingReminders({ userId }: { userId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    const { data } = await supabase
      .from('goal_reminders')
      .select(`
        *,
        goals:goal_id (
          title,
          target_date
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setReminders(data as any);
  };

  const getNextReminderDate = (reminder: Reminder) => {
    if (reminder.custom_date) {
      return new Date(reminder.custom_date);
    }
    if (reminder.days_before_deadline && reminder.goals?.target_date) {
      return addDays(new Date(reminder.goals.target_date), -reminder.days_before_deadline);
    }
    return new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Goal Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No upcoming reminders</p>
        ) : (
          reminders.map((reminder) => {
            const nextDate = getNextReminderDate(reminder);
            return (
              <div key={reminder.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{reminder.goals?.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {reminder.reminder_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {isBefore(nextDate, new Date()) 
                        ? 'Overdue' 
                        : formatDistanceToNow(nextDate, { addSuffix: true })}
                    </span>
                  </div>
                  {reminder.reminder_time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      at {reminder.reminder_time}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
