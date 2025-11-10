import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User, Shield, Mail, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  created_at: string;
  profiles?: { full_name: string; avatar_url?: string };
}

interface UserActivityLogProps {
  userId?: string;
  limit?: number;
}

export const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId, limit = 50 }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <User className="h-4 w-4" />;
    if (action.includes('role') || action.includes('admin')) return <Shield className="h-4 w-4" />;
    if (action.includes('email')) return <Mail className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('suspend') || action.includes('delete')) return 'destructive';
    if (action.includes('admin') || action.includes('role')) return 'default';
    return 'secondary';
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading activity...</div>;
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2 p-4">
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No activity found</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <div className="mt-1">{getActionIcon(activity.action)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {activity.profiles?.full_name || 'Unknown User'}
                  </span>
                  <Badge variant={getActionColor(activity.action)} className="text-xs">
                    {activity.action.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {activity.resource_type && (
                  <div className="text-xs text-muted-foreground">
                    {activity.resource_type}: {activity.resource_id}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(activity.created_at), 'PPp')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
