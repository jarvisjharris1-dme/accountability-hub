import { supabase } from './supabase';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

export async function subscribeToPushNotifications(userId: string) {
  const registration = await registerServiceWorker();
  if (!registration) return false;

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return false;

  try {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    const subscriptionJson = subscription.toJSON();
    
    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscriptionJson.endpoint!,
      p256dh: subscriptionJson.keys!.p256dh!,
      auth: subscriptionJson.keys!.auth!
    });

    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(userId: string) {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    await supabase.from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
  }
}
