// Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const { title, body, data: notificationData } = data;

  const options = {
    body: body,
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    data: notificationData,
    vibrate: notificationData?.type === 'emergency' ? [300, 100, 300, 100, 300] : [200, 100, 200],
    tag: notificationData?.conversationId || notificationData?.type || 'default',
    requireInteraction: notificationData?.type === 'emergency',
    actions: notificationData?.type === 'message' ? [
      { action: 'view', title: 'View Message' },
      { action: 'dismiss', title: 'Dismiss' }
    ] : []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }

  const urlToOpen = notificationData?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUnaffected: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
