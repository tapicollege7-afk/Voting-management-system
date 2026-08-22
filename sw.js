// VotePulse Progressive Web App (PWA) Service Worker
const CACHE_NAME = 'votepulse-pwa-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⚡ [PWA SW] Pre-caching core PWA static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('[PWA SW] Pre-cache partial warning:', err));
    })
  );
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 [PWA SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor with Dynamic Caching & API Bypass
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for backend API requests to ensure live vote counts are real-time
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // Network-First with Cache Fallback for static assets
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Serve from cache if offline
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
        })
    );
  }
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'VotePulse Election Alert';
  const options = {
    body: data,
    icon: 'https://cdn-icons-png.flaticon.com/512/927/927295.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/927/927295.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };
  event.waitUntil(
    self.registration.showNotification('🗳️ VotePulse Alert', options)
  );
});
