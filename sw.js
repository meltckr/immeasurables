const CACHE_NAME = 'immeasurables-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './assets/blender/lotus-soft.png',
  './assets/blender/orb-light.png',
  './assets/blender/gold-dust.png',
  './assets/blender/wash-saffron.png',
  './assets/blender/wash-teal.png',
  './assets/blender/wash-jade.png',
  './assets/blender/wash-indigo.png',
  './assets/blender/bloom-gold-thread.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const networked = fetch(event.request)
          .then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                if(event.request.url.startsWith('http')) {
                  cache.put(event.request, clone);
                }
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback if needed
          });

        return cached || networked;
      })
  );
});
