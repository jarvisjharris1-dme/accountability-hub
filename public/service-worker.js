// unregister-service-worker.ts
// Add this temporarily to your main.tsx or App.tsx to clear service workers

/**
 * 🔧 SERVICE WORKER CLEANUP SCRIPT
 * 
 * This script unregisters all service workers and clears cache.
 * Use this if you're getting service worker errors.
 * 
 * HOW TO USE:
 * 1. Add this code to the TOP of your main.tsx or App.tsx
 * 2. Save and reload the page
 * 3. Check console for "✅ Service workers cleared"
 * 4. Remove this code after it runs once
 * 5. Hard refresh (Ctrl+Shift+R)
 */

// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      console.log(`🔧 Found ${registrations.length} service worker(s). Unregistering...`);
      
      registrations.forEach((registration, index) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log(`✅ Service worker ${index + 1} unregistered successfully`);
          } else {
            console.log(`❌ Failed to unregister service worker ${index + 1}`);
          }
        });
      });
      
      console.log('✅ All service workers cleared!');
      console.log('👉 Now remove this script from your code');
      console.log('👉 Then hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
    } else {
      console.log('✅ No service workers found');
    }
  }).catch((error) => {
    console.error('❌ Error checking service workers:', error);
  });
  
  // Also clear caches if they exist
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      if (cacheNames.length > 0) {
        console.log(`🔧 Found ${cacheNames.length} cache(s). Clearing...`);
        
        Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName).then(() => {
              console.log(`✅ Cache "${cacheName}" cleared`);
            });
          })
        ).then(() => {
          console.log('✅ All caches cleared!');
        });
      } else {
        console.log('✅ No caches found');
      }
    }).catch((error) => {
      console.error('❌ Error clearing caches:', error);
    });
  }
}

/**
 * ALTERNATIVE: Disable service worker registration
 * 
 * If you're using vite-plugin-pwa or similar, find and comment out:
 * 
 * // OLD (in main.tsx or vite.config.ts):
 * import { registerSW } from 'virtual:pwa-register';
 * registerSW(); // ← Comment this out
 * 
 * // Or:
 * if ('serviceWorker' in navigator) {
 *   navigator.serviceWorker.register('/service-worker.js'); // ← Comment out
 * }
 */

/**
 * BEST PRACTICE: Add error handling to service worker
 * 
 * If you want to keep service workers but fix errors:
 * 
 * In your service-worker.js file, wrap fetch handlers:
 * 
 * self.addEventListener('fetch', (event) => {
 *   event.respondWith(
 *     caches.match(event.request)
 *       .then((response) => response || fetch(event.request))
 *       .catch((error) => {
 *         console.error('Fetch failed:', error);
 *         // Return fallback response
 *         return new Response('Network error', {
 *           status: 408,
 *           headers: { 'Content-Type': 'text/plain' }
 *         });
 *       })
 *   );
 * });
 */

export {};
