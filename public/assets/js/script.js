(function () {
  // ---------------------------------------------------------------------------
  // Branded confirm dialog - THE standard popup (see design-system.md).
  // Replaces window.confirm() everywhere. Returns a Promise that resolves true
  // (confirmed) or false (cancelled).
  //   showConfirmDialog({ title, message, confirmLabel, cancelLabel, danger })
  //     .then(function (confirmed) { if (confirmed) { ... } });
  // One reusable modal node is built on first use, then reused. Loaded site-wide
  // because every page includes script.js.
  // ---------------------------------------------------------------------------
  var confirmDialogNode = null;
  var confirmDialogResolve = null;
  var confirmDialogLastFocus = null;

  function closeConfirmDialog(result) {
    if (!confirmDialogNode || confirmDialogNode.hidden) return;
    confirmDialogNode.hidden = true;
    document.body.classList.remove('dr-confirm-open');
    if (confirmDialogLastFocus && confirmDialogLastFocus.focus) confirmDialogLastFocus.focus();
    var resolve = confirmDialogResolve;
    confirmDialogResolve = null;
    if (resolve) resolve(result);
  }

  function buildConfirmDialog() {
    var overlay = document.createElement('div');
    overlay.className = 'dr-confirm';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="dr-confirm-backdrop" data-confirm-cancel></div>' +
      '<div class="dr-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="drConfirmTitle" aria-describedby="drConfirmMessage">' +
        '<h2 class="dr-confirm-title" id="drConfirmTitle"></h2>' +
        '<p class="dr-confirm-message" id="drConfirmMessage"></p>' +
        '<div class="dr-confirm-actions">' +
          '<button type="button" class="dr-confirm-cancel" data-confirm-cancel></button>' +
          '<button type="button" class="dr-confirm-ok"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-confirm-cancel]').forEach(function (el) {
      el.addEventListener('click', function () { closeConfirmDialog(false); });
    });
    overlay.querySelector('.dr-confirm-ok').addEventListener('click', function () { closeConfirmDialog(true); });
    overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeConfirmDialog(false); });
    return overlay;
  }

  window.showConfirmDialog = function (options) {
    options = options || {};
    if (!confirmDialogNode) confirmDialogNode = buildConfirmDialog();
    var node = confirmDialogNode;
    node.querySelector('.dr-confirm-title').textContent = options.title || 'Are you sure?';
    node.querySelector('.dr-confirm-message').textContent = options.message || '';
    var okButton = node.querySelector('.dr-confirm-ok');
    var cancelButton = node.querySelector('.dr-confirm-cancel');
    okButton.textContent = options.confirmLabel || 'Confirm';
    cancelButton.textContent = options.cancelLabel || 'Cancel';
    okButton.className = 'dr-confirm-ok' + (options.danger ? ' is-danger' : '');
    confirmDialogLastFocus = document.activeElement;
    node.hidden = false;
    document.body.classList.add('dr-confirm-open');
    // Default focus to the safe choice (Cancel) when the action is destructive.
    (options.danger ? cancelButton : okButton).focus();
    return new Promise(function (resolve) { confirmDialogResolve = resolve; });
  };

  var menuBtn = document.getElementById('menuBtn');
  var nav = document.querySelector('.primary-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Homepage "request a callback" form. Posts to the same lead worker as the
  // instant-quote popup, branched on form_type: 'callback'. Emails Pete at
  // info@dorsetrewires.co.uk via Brevo.
  var callbackForm = document.getElementById('callbackForm');
  if (callbackForm) {
    var CALLBACK_WORKER_URL = (window.DR_CONFIG || {}).quoteWorkerUrl;  // single source: assets/js/dr-config.js
    var callbackStatus = document.getElementById('callbackStatus');
    var callbackSubmit = document.getElementById('callbackSubmit');

    function setCallbackStatus(message, kind) {
      if (!callbackStatus) return;
      callbackStatus.hidden = false;
      callbackStatus.textContent = message;
      callbackStatus.className = 'form-msg' + (kind ? ' is-' + kind : '');
    }

    callbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(callbackForm);
      var name = (fd.get('name') || '').toString().trim();
      var phone = (fd.get('phone') || '').toString().trim();
      if (!name || !phone) {
        setCallbackStatus('Please add your name and phone number.', 'error');
        return;
      }
      var payload = {
        form_type: 'callback',
        name: name,
        phone: phone,
        postcode: (fd.get('postcode') || '').toString().trim(),
        job: (fd.get('job') || '').toString().trim(),
        company: (fd.get('company') || '').toString()
      };
      if (callbackSubmit) callbackSubmit.disabled = true;
      setCallbackStatus('Sending...', null);
      fetch(CALLBACK_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      }).then(function (j) {
        if (j && j.ok) {
          setCallbackStatus('Thanks - we\'ll call you back within the hour.', 'ok');
          callbackForm.reset();
        } else {
          setCallbackStatus((j && j.error) ? j.error : 'Could not send. Please call us instead.', 'error');
        }
      }).catch(function () {
        setCallbackStatus('Could not send. Please call us instead.', 'error');
      }).then(function () {
        if (callbackSubmit) callbackSubmit.disabled = false;
      });
    });
  }

  // Referral-partner "register your interest" form (public/pages/partners.html).
  // Posts to the same lead worker as the quote/callback forms, branched on
  // form_type: 'partner'. Emails Pete at info@dorsetrewires.co.uk via Brevo.
  var partnerForm = document.getElementById('partnerForm');
  if (partnerForm) {
    var PARTNER_WORKER_URL = (window.DR_CONFIG || {}).quoteWorkerUrl;  // single source: assets/js/dr-config.js
    var partnerStatus = document.getElementById('partnerStatus');
    var partnerSubmit = document.getElementById('partnerSubmit');

    function setPartnerStatus(message, kind) {
      if (!partnerStatus) return;
      partnerStatus.hidden = false;
      partnerStatus.textContent = message;
      partnerStatus.className = 'form-msg' + (kind ? ' is-' + kind : '');
    }

    partnerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(partnerForm);
      var name = (fd.get('name') || '').toString().trim();
      var emailAddr = (fd.get('email') || '').toString().trim();
      if (!name || !emailAddr) {
        setPartnerStatus('Please fill in your name and email.', 'error');
        return;
      }
      var payload = {
        form_type: 'partner',
        name: name,
        business: (fd.get('business') || '').toString().trim(),
        profession: (fd.get('profession') || '').toString().trim(),
        email: emailAddr,
        phone: (fd.get('phone') || '').toString().trim(),
        area: (fd.get('area') || '').toString().trim(),
        message: (fd.get('message') || '').toString().trim(),
        company: (fd.get('company') || '').toString()
      };
      if (partnerSubmit) partnerSubmit.disabled = true;
      setPartnerStatus('Sending...', null);
      fetch(PARTNER_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      }).then(function (j) {
        if (j && j.ok) {
          setPartnerStatus('Thanks - we\'ve got your details. Pete will be in touch personally.', 'ok');
          partnerForm.reset();
        } else {
          setPartnerStatus((j && j.error) ? j.error : 'Could not send. Please email info@dorsetrewires.co.uk instead.', 'error');
        }
      }).catch(function () {
        setPartnerStatus('Could not send. Please email info@dorsetrewires.co.uk instead.', 'error');
      }).then(function () {
        if (partnerSubmit) partnerSubmit.disabled = false;
      });
    });
  }

  var header = document.getElementById('siteHeader');
  if (header) {
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      if (y > 8) {
        header.style.boxShadow = '0 4px 18px rgba(15,37,64,0.10)';
      } else {
        header.style.boxShadow = '0 1px 6px rgba(15,37,64,0.06)';
      }
      lastY = y;
    }, { passive: true });
  }
})();
