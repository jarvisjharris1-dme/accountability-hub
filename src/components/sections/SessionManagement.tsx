import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionCard } from '@/components/sessions/SessionCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';

export function SessionManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-active-sessions', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      const { error } = await supabase.functions.invoke('revoke-session', {
        body: { sessionId, userId: user?.id }
      });

      if (error) throw error;

      toast.success('Session logged out successfully');
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to log out session');
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    const otherSessions = sessions.filter(s => !s.is_current);
    for (const session of otherSessions) {
      await handleRevokeSession(session.id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage devices where you're currently logged in
            </CardDescription>
          </div>
          {sessions.filter(s => !s.is_current).length > 0 && (
            <Button variant="outline" onClick={handleRevokeAll}>
              Log Out All Other Sessions
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No active sessions found</p>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={handleRevokeSession}
              isRevoking={revoking === session.id}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}