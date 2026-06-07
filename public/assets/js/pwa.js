(function () {
  'use strict';

  // Register service worker for offline use
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('SW registration failed', err);
      });
    });
  }

  var banner = document.getElementById('pwaInstall');
  var instructions = document.getElementById('pwaInstructions');
  var dismiss = document.getElementById('pwaDismiss');
  if (!banner) return;

  // Already installed? Hide.
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    return;
  }

  // Dismissed within last 14 days? Hide.
  var dismissedAt = parseInt(localStorage.getItem('pwa-dismissed-at'), 10);
  if (dismissedAt && (Date.now() - dismissedAt) < 14 * 24 * 60 * 60 * 1000) {
    return;
  }

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isAndroid = /Android/.test(ua);
  var isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);

  if (isIOS && isSafari) {
    instructions.innerHTML = 'Tap <b>Share</b> <span aria-hidden="true">&#x2197;</span> then <b>Add to Home Screen</b> to use this on site without opening Safari.';
  } else if (isIOS) {
    instructions.innerHTML = 'Open this page in <b>Safari</b>, then tap <b>Share</b> &rarr; <b>Add to Home Screen</b>.';
  } else if (isAndroid) {
    instructions.innerHTML = 'Tap the menu <b>&vellip;</b> then <b>Install app</b> or <b>Add to Home Screen</b>.';
  } else {
    instructions.innerHTML = 'On your phone: open this page in the browser, then use <b>Add to Home Screen</b> (iPhone) or <b>Install app</b> (Android).';
  }

  banner.hidden = false;

  // Capture native install prompt (Chrome/Edge Android)
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    instructions.innerHTML = '';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pwa-install-btn';
    btn.textContent = 'Install Dorset Rewires Quote';
    btn.addEventListener('click', function () {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () { deferredPrompt = null; banner.hidden = true; });
    });
    instructions.appendChild(btn);
  });

  dismiss.addEventListener('click', function () {
    banner.hidden = true;
    localStorage.setItem('pwa-dismissed-at', Date.now().toString());
  });
})();
