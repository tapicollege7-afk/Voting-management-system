// VotePulse Progressive Web App (PWA) Service Worker v10
const CACHE_NAME = 'votepulse-pwa-v10';
const CACHE_VERSION = 10;

// Core assets to pre-cache for offline support
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.ico'
];

// =============================================
// INSTALL: Pre-cache static assets
// =============================================
self.addEventListener('install', (event) => {
  console.log(`[PWA SW v${CACHE_VERSION}] Installing...`);
  self.skipWaiting(); // Activate immediately, don't wait for old SW to die
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[PWA SW v${CACHE_VERSION}] Pre-caching static assets`);
      // Use individual catches so one failure doesn't break everything
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => {
          console.warn(`[PWA SW] Could not cache ${url}:`, err.message);
        }))
      );
    })
  );
});

// =============================================
// ACTIVATE: Purge ALL old caches
// =============================================
self.addEventListener('activate', (event) => {
  console.log(`[PWA SW v${CACHE_VERSION}] Activating...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[PWA SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log(`[PWA SW v${CACHE_VERSION}] Now controlling all pages`);
      return self.clients.claim(); // Take control of all open tabs immediately
    })
  );
});

// =============================================
// FETCH: Network-first strategy
// - Always try network first for freshness
// - Fall back to cache when offline
// - API calls bypass cache entirely
// =============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Always bypass cache for API calls (need live data)
  if (url.pathname.startsWith('/api')) {
    return; // Let browser handle normally
  }

  // 2. Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Network-first strategy for everything else
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses (200 OK, same-origin)
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log(`[PWA SW] Serving from cache: ${url.pathname}`);
            return cachedResponse;
          }
          // For navigation requests, serve the app shell
          if (event.request.mode === 'navigate') {
            console.log('[PWA SW] Offline: serving cached index.html');
            return caches.match('./index.html');
          }
          // Nothing available
          return new Response('Offline - Resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
