const CACHE_NAME = 'dreamland-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/?source=pwa',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation requests (HTML): Network First, Fallback to App Shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache with new version of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // We only need to cache index.html for navigation really, 
            // but caching the specific request is fine too.
            // However, to keep it clean for SPA, we usually rely on the shell.
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // CRITICAL FIX: Always return index.html (App Shell) for navigation
          // This allows the router to handle /dashboard, /chat, etc.
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Asset requests (JS/CSS/Images): Cache First
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
