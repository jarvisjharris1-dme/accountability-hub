import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationPermissionBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, [user]);

  async function checkNotificationStatus() {
    if (!user || dismissed) return;
    
    // Check if browser supports notifications
    if (!('Notification' in window)) return;
    
    // Check if already granted or denied
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
    
    // Check if service worker is registered
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) return;
    }
    
    // Show banner if permission is default
    setShow(true);
  }

  async function handleEnable() {
    if (!user) return;
    const success = await subscribeToPushNotifications(user.id);
    if (success) {
      setShow(false);
    }
  }

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
  }

  if (!show) return null;

  return (
    <Alert className="mb-4">
      <Bell className="h-4 w-4" />
      <AlertTitle>Enable Push Notifications</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Stay updated with messages, @mentions, and group activity</span>
        <div className="flex gap-2 ml-4">
          <Button size="sm" onClick={handleEnable}>
            Enable
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
