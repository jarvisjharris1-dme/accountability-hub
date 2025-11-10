import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProgressHistoryTimelineProps {
  goalId: string;
}

export function ProgressHistoryTimeline({ goalId }: ProgressHistoryTimelineProps) {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    fetchUpdates();
  }, [goalId]);

  const fetchUpdates = async () => {
    const { data } = await supabase
      .from('goal_updates')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });
    setUpdates(data || []);
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Progress History</Label>
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-4">
          {updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No progress updates yet</p>
          ) : (
            updates.map((update, index) => (
              <div key={update.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  {index < updates.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {format(new Date(update.created_at), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(update.created_at), 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.notes}</p>
                  {update.progress_value !== null && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Progress: {update.progress_value}%
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
