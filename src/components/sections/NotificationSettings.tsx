import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    new_messages: true,
    mentions: true,
    group_activity: true,
    circle_invitations: true,
    emergency_alerts: true,
    journal_reminders: true,
    workshop_updates: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
    checkPushSubscription();
  }, [user]);

  async function loadPreferences() {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences({
        new_messages: data.new_messages,
        circle_invitations: data.circle_invitations,
        emergency_alerts: data.emergency_alerts,
        journal_reminders: data.journal_reminders,
        workshop_updates: data.workshop_updates
      });
    } else if (!error || error.code === 'PGRST116') {
      await supabase.from('notification_preferences').insert({
        user_id: user.id,
        ...preferences
      });
    }
    setLoading(false);
  }

  async function checkPushSubscription() {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    }
  }

  async function updatePreference(key: string, value: boolean) {
    if (!user) return;
    
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...newPrefs,
        updated_at: new Date().toISOString()
      });
  }

  async function togglePushNotifications() {
    if (!user) return;

    if (pushEnabled) {
      await unsubscribeFromPushNotifications(user.id);
      setPushEnabled(false);
      toast({ title: 'Push notifications disabled' });
    } else {
      const success = await subscribeToPushNotifications(user.id);
      if (success) {
        setPushEnabled(true);
        toast({ title: 'Push notifications enabled' });
      } else {
        toast({ title: 'Failed to enable notifications', variant: 'destructive' });
      }
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Enable browser notifications for real-time alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={togglePushNotifications} variant={pushEnabled ? 'destructive' : 'default'}>
            {pushEnabled ? <BellOff className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
            {pushEnabled ? 'Disable Push Notifications' : 'Enable Push Notifications'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="new_messages">New Messages</Label>
            <Switch
              id="new_messages"
              checked={preferences.new_messages}
              onCheckedChange={(v) => updatePreference('new_messages', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="mentions">@Mentions</Label>
            <Switch
              id="mentions"
              checked={preferences.mentions}
              onCheckedChange={(v) => updatePreference('mentions', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="group_activity">Group Activity</Label>
            <Switch
              id="group_activity"
              checked={preferences.group_activity}
              onCheckedChange={(v) => updatePreference('group_activity', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="circle_invitations">Circle Invitations</Label>
            <Switch
              id="circle_invitations"
              checked={preferences.circle_invitations}
              onCheckedChange={(v) => updatePreference('circle_invitations', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="emergency_alerts">Emergency Alerts</Label>
            <Switch
              id="emergency_alerts"
              checked={preferences.emergency_alerts}
              onCheckedChange={(v) => updatePreference('emergency_alerts', v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
