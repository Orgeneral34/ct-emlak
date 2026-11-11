// Altın Emlak Service Worker - Live Network-First Strategy
const CACHE_NAME = 'altin-emlak-v2';

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for old tabs/windows to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eski önbellek siliniyor:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. API and dynamic uploads: always go directly to network
  if (url.includes('/api/') || url.includes('/uploads/') || url.includes('altinemlak.apk')) {
    return;
  }

  // 2. HTML navigation requests (app opening/reloading):
  // ALWAYS Network-First! Guarantees the user sees the latest deployed build upon opening.
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.endsWith('/') ||
    url.includes('index.html')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to offline cache if network completely unreachable
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 3. Static hashed assets (JS/CSS with Vite cache-busting hash):
  // Cache first, fallback to network and update cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    })
  );
});
