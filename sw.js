// Service Worker offline cache para MAGNATEST
const CACHE_NAME = 'magnatest-cache-v3';
const OFFLINE_URLS = [
  './',
  './index.html',
  './sw.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// instalar y cachear
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// activar y limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// estrategia cache-first
self.addEventListener('fetch', event => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cachedRes => {
      if (cachedRes) return cachedRes;
      return fetch(req).then(networkRes => {
        // opcional: guardar en cache dinámico
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, networkRes.clone());
          return networkRes;
        });
      }).catch(() => {
        // si falla offline y no está en caché, podríamos devolver fallback
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
