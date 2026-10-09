// Concrete Dragon PWA service worker — installable + offline-capable.
// The game ships as ONE self-contained HTML file (~58MB). Precaching it at
// install time is unreliable, so the shell is cached at RUNTIME on first
// successful online load (cache-first afterwards). Small files precache at
// install for instant availability.
// 0.1.1-c57d106 is stamped by game-3d/build.mjs at build time.
const CACHE = 'concrete-dragon-0.1.1-c57d106';
const PRECACHE = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // same-origin only
  e.respondWith(
    caches.match(req, { ignoreSearch: false }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Cache the shell (and any same-origin asset) for offline play.
        // The put is best-effort: a cache-write failure must never break the response.
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./'));
    })
  );
});
