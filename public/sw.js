// VotePulse Progressive Web App (PWA) Service Worker (Cache Buster v9)
const CACHE_NAME = 'votepulse-pwa-v99';

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
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('[PWA SW] Pre-cache warning:', err));
    })
  );
});

// Purge ALL old caches immediately on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('🧹 [PWA SW] Purging old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor with Network-First Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for backend API requests
  if (url.pathname.startsWith('/api')) {
    return;
  }

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
