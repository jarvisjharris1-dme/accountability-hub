const CACHE_NAME = 'discovering-me-v1';
const OFFLINE_PAGE = '/offline.html';

// Install service worker (don't pre-cache anything to avoid errors)
self.addEventListener('install', (event) => {
  console.log('✅ Service worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        // Optionally pre-cache offline page
        const cache = await caches.open(CACHE_NAME);
        // Only cache offline page if it exists
        try {
          await cache.add(OFFLINE_PAGE);
          console.log('✅ Offline page cached');
        } catch (err) {
          console.log('ℹ️ No offline page to cache (this is fine)');
        }
      } catch (error) {
        console.error('❌ Error during service worker installation:', error);
      }
      
      // Always skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        
        // Delete old caches
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        console.log('✅ Old caches cleaned up');
      } catch (error) {
        console.error('❌ Error cleaning up caches:', error);
      }
      
      // Take control of all clients immediately
      await self.clients.claim();
      console.log('✅ Service worker activated and claimed clients');
    })()
  );
});

// 🔥 IMPROVED: Fetch with comprehensive error handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extension and browser-internal requests
  if (
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.startsWith('moz-extension://') ||
    event.request.url.startsWith('safari-extension://') ||
    event.request.url.includes('extension://')
  ) {
    return;
  }
  
  // Skip Supabase auth endpoints (they handle their own caching)
  if (event.request.url.includes('/auth/v1/')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);
        
        // 🔥 CRITICAL: Validate response before caching
        if (isValidResponse(networkResponse)) {
          // Clone response for caching (can only read response once)
          const responseToCache = networkResponse.clone();
          
          // Cache in background (don't await to avoid blocking)
          cacheResponse(event.request, responseToCache)
            .catch((err) => {
              console.warn('⚠️ Failed to cache response:', err.message);
            });
        }
        
        return networkResponse;
        
      } catch (networkError) {
        console.log('🌐 Network failed, trying cache for:', event.request.url);
        
        try {
          // Try to get from cache
          const cachedResponse = await caches.match(event.request);
          
          if (cachedResponse) {
            console.log('✅ Serving from cache:', event.request.url);
            return cachedResponse;
          }
          
          // No cache available, return fallback
          return createFallbackResponse(event.request);
          
        } catch (cacheError) {
          console.error('❌ Cache error:', cacheError);
          return createFallbackResponse(event.request);
        }
      }
    })()
  );
});

// 🔥 NEW: Validate response before caching
function isValidResponse(response) {
  // Must have a response
  if (!response) {
    return false;
  }
  
  // Must be successful status
  if (response.status !== 200) {
    return false;
  }
  
  // Must be basic or cors type (not opaque)
  if (!['basic', 'cors'].includes(response.type)) {
    return false;
  }
  
  // Must have valid headers
  if (!response.headers) {
    return false;
  }
  
  // Don't cache error responses
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html') && response.url.includes('error')) {
    return false;
  }
  
  return true;
}

// 🔥 NEW: Safely cache response with error handling
async function cacheResponse(request, response) {
  try {
    // Validate before caching
    if (!isValidResponse(response)) {
      console.log('ℹ️ Skipping cache for invalid response');
      return;
    }
    
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
    console.log('💾 Cached:', request.url);
    
  } catch (error) {
    // Don't throw - just log and continue
    console.warn('⚠️ Cache write failed:', error.message);
  }
}

// 🔥 NEW: Create fallback response with proper error handling
function createFallbackResponse(request) {
  try {
    // For navigation requests (page loads), show offline page
    if (request.mode === 'navigate' || request.destination === 'document') {
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offline - Discovering Me</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 500px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            h1 {
              font-size: 3em;
              margin: 0 0 20px 0;
            }
            p {
              font-size: 1.2em;
              margin: 0 0 30px 0;
              opacity: 0.9;
            }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 15px 30px;
              font-size: 1em;
              font-weight: bold;
              border-radius: 50px;
              cursor: pointer;
              transition: transform 0.2s;
            }
            button:hover {
              transform: scale(1.05);
            }
            .icon {
              font-size: 4em;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📡</div>
            <h1>You're Offline</h1>
            <p>It looks like you've lost your internet connection. Please check your connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // For API requests, return JSON error
    if (request.url.includes('/api/') || request.url.includes('/rest/')) {
      return new Response(
        JSON.stringify({
          error: 'Network unavailable',
          message: 'You appear to be offline. Please check your internet connection.',
          offline: true
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // For images, return placeholder
    if (request.destination === 'image') {
      // Return transparent 1x1 pixel GIF
      const pixel = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const blob = base64ToBlob(pixel, 'image/gif');
      return new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    // For everything else, return text error
    return new Response(
      'Network unavailable. Please check your internet connection.',
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      }
    );
    
  } catch (error) {
    console.error('❌ Error creating fallback response:', error);
    
    // Last resort fallback
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// 🔥 NEW: Helper to convert base64 to blob
function base64ToBlob(base64, contentType = '') {
  try {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    
    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  } catch (error) {
    console.error('❌ Error converting base64 to blob:', error);
    return new Blob();
  }
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    
    const options = {
      body: data.body || data.message || 'New update available!',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      image: data.image || null,
      vibrate: data.vibrate || [100, 50, 100],
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Discovering Me',
        options
      ).catch((error) => {
        console.error('❌ Error showing notification:', error);
      })
    );
  } catch (error) {
    console.error('❌ Error in push event:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  try {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there's already a window open
          for (const client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // No window open, open new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
        .catch((error) => {
          console.error('❌ Error handling notification click:', error);
        })
    );
  } catch (error) {
    console.error('❌ Error in notificationclick event:', error);
  }
});

// 🔥 NEW: Handle service worker errors
self.addEventListener('error', (event) => {
  console.error('❌ Service worker error:', event.error);
});

// 🔥 NEW: Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection in service worker:', event.reason);
  event.preventDefault(); // Prevent default error handling
});

// 🔥 NEW: Message handler for manual cache clearing
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          console.log('✅ Cache cleared');
          event.ports[0].postMessage({ success: true });
        }).catch((error) => {
          console.error('❌ Error clearing cache:', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        })
      );
    }
  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
});

console.log('✅ Service worker loaded successfully');
