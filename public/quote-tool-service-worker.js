/* Dorset Rewires - quote tool offline service worker */
const VERSION = 'v19-2026-06-20';
const SHELL_CACHE = 'dorset-rewires-shell-' + VERSION;
const RUNTIME_CACHE = 'dorset-rewires-runtime-' + VERSION;

const SHELL = [
  '/quote.html',
  '/assets/css/quote.css',
  '/assets/js/quote-calculator-logic.js',
  '/assets/css/styles.css',
  '/assets/js/script.js',
  '/assets/js/reviews-carousel.js',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-180-apple.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // HTML: network-first, fall back to cache (so updates land fast)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req).then((r) => r || caches.match('/quote.html')))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((r) => {
      if (r.ok && (url.pathname.startsWith('/assets/icons/') || /\.(css|js|json|png|svg|woff2)$/.test(url.pathname))) {
        const copy = r.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
      }
      return r;
    }))
  );
});
