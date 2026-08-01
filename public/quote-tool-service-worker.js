/* Dorset Rewires - quote tool offline service worker */
const VERSION = 'sv-17184222';
const SHELL_CACHE = 'dorset-rewires-shell-' + VERSION;
const RUNTIME_CACHE = 'dorset-rewires-runtime-' + VERSION;

const SHELL = [
  '/quote.html',
  '/assets/css/quote.css?v=17184222',
  '/assets/js/dr-config.js?v=17184222',
  '/assets/js/quote-calculator-logic.js?v=17184222',
  '/assets/css/handover-pack.css?v=17184222',
  '/assets/js/handover-pack.js?v=17184222',
  '/assets/img/quote-tool-qr-code.svg',
  '/assets/css/styles.css?v=17184222',
  '/assets/js/script.js?v=17184222',
  '/assets/js/reviews-carousel.js?v=17184222',
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

  // Never touch the local-only internal apps. This SW has origin-wide scope, so on
  // localhost it was serving STALE Ops HQ pages, nav (ops.js) and data (clients.json)
  // cache-first. They must always be fresh - let them go straight to the network.
  //
  // /drsaas/ and /eicr/ were added to this list on 2026-08-01. They are newer than
  // the /ops-hq/ exemption and inherited the very bug it was written to fix: the
  // "other static assets" rule at the bottom is CACHE-FIRST, so drsaas-page-review.js
  // was served from the SW cache on every normal page load. The Approve button ran
  // old code against new HTML, threw on a removed element, and silently did nothing.
  // A hard refresh bypasses the SW, which is why it worked only after one.
  //
  // Harmless in production: none of these paths exist on the live site (ops/ is
  // gitignored and never deploys), so this only ever affects the local dev server.
  if (url.pathname.startsWith('/ops-hq/')) return;
  if (url.pathname.startsWith('/drsaas/')) return;
  if (url.pathname.startsWith('/eicr/')) return;

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

  // JSON data (price-list, business-info): network-first so prices/facts never go
  // stale. Cache-first here once shipped a stale price list. Falls back to the last
  // cached copy only when offline.
  if (/\.json$/.test(url.pathname)) {
    event.respondWith(
      fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Other static assets (css, js, icons, images): cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((r) => {
      if (r.ok && (url.pathname.startsWith('/assets/icons/') || /\.(css|js|png|svg|woff2)$/.test(url.pathname))) {
        const copy = r.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
      }
      return r;
    }))
  );
});
