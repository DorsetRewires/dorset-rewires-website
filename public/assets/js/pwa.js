(function () {
  'use strict';

  // Register service worker for offline use. No install banner / "Add to Home
  // Screen" prompt - removed 2026-06-13 at Pete's request.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('quote-tool-service-worker.js').catch(function (err) {
        console.warn('SW registration failed', err);
      });
    });
  }
})();
