(function () {
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
    var CALLBACK_WORKER_URL = 'https://dorset-rewires-quote.silent-star-0bcc.workers.dev';
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
