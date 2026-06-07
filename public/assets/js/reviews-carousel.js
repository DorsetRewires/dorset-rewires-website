(function () {
  'use strict';
  var mount = document.getElementById('reviewCarousel');
  var gridMount = document.getElementById('reviewsGrid');
  var pageMeta = document.getElementById('reviewsPageMeta');
  if (!mount && !gridMount) return;

  fetch('reviews.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .catch(function () { return { aggregate: { rating: 0, count: 0, source: 'Google' }, reviews: [] }; })
    .then(function (data) { render(data); });

  function stars(n) {
    var out = '';
    for (var i = 0; i < 5; i++) out += i < n ? '★' : '☆';
    return out;
  }

  function render(data) {
    var revs = (data.reviews || []).filter(function (r) { return r.stars >= 5; });
    var agg = data.aggregate || {};

    // Page meta (reviews.html aggregate strip)
    if (pageMeta) {
      pageMeta.innerHTML =
        '<div class="reviews-meta" style="display:inline-flex;">' +
          '<div class="rm-stars" aria-hidden="true">' + stars(Math.round(agg.rating || 0)) + '</div>' +
          '<div class="rm-text"><strong>' + (agg.rating || '?') + ' from ' + (agg.count || '?') + ' ' + (agg.source || 'Google') + ' reviews</strong><br>Live feed &mdash; updated when new reviews land</div>' +
        '</div>';
    }

    // Full grid (reviews.html)
    if (gridMount) {
      if ((data.reviews || []).length === 0) {
        gridMount.innerHTML = '<p class="rc-empty">No reviews yet.</p>';
      } else {
        gridMount.innerHTML = (data.reviews || []).map(function (r) {
          return '<article class="review-card">' +
            '<div class="rev-stars" aria-hidden="true">' + stars(r.stars) + '</div>' +
            '<blockquote>' + escapeHtml(r.body) + '</blockquote>' +
            '<footer><strong>' + escapeHtml(r.author) + '</strong> &middot; ' + escapeHtml(r.location) + ' &middot; ' + escapeHtml(r.date) + '<span class="rev-source"> &middot; via ' + escapeHtml(r.source || 'Google') + '</span></footer>' +
          '</article>';
        }).join('');
      }
    }

    // Carousel (homepage)
    if (!mount) return;
    if (revs.length === 0) {
      mount.innerHTML = '<p class="rc-empty">No reviews yet.</p>';
      return;
    }
    mount.innerHTML =
      '<div class="rc-head">' +
        '<div class="rc-agg">' +
          '<span class="rc-agg-stars" aria-hidden="true">' + stars(Math.round(agg.rating || 0)) + '</span>' +
          '<span class="rc-agg-text"><strong>' + (agg.rating || '?') + '</strong> from ' + (agg.count || '?') + ' ' + (agg.source || 'Google') + ' reviews</span>' +
        '</div>' +
        '<a class="rc-viewall" href="reviews.html">See all reviews &rarr;</a>' +
      '</div>' +
      '<div class="rc-stage">' +
        '<button class="rc-arrow rc-prev" type="button" aria-label="Previous review">&lsaquo;</button>' +
        '<div class="rc-track" id="rcTrack" tabindex="0" aria-live="polite">' +
          revs.map(function (r, i) {
            return '<article class="rc-card" data-idx="' + i + '" aria-hidden="' + (i === 0 ? 'false' : 'true') + '">' +
              '<div class="rc-stars" aria-hidden="true">' + stars(r.stars) + '</div>' +
              '<blockquote>' + escapeHtml(r.body) + '</blockquote>' +
              '<footer>' +
                '<strong>' + escapeHtml(r.author) + '</strong>' +
                '<span> &middot; ' + escapeHtml(r.location) + ' &middot; ' + escapeHtml(r.date) + '</span>' +
                '<span class="rc-source">via ' + escapeHtml(r.source || 'Google') + '</span>' +
              '</footer>' +
            '</article>';
          }).join('') +
        '</div>' +
        '<button class="rc-arrow rc-next" type="button" aria-label="Next review">&rsaquo;</button>' +
      '</div>' +
      '<div class="rc-dots" role="tablist">' +
        revs.map(function (_, i) { return '<button class="rc-dot' + (i === 0 ? ' is-active' : '') + '" data-idx="' + i + '" role="tab" aria-selected="' + (i === 0) + '" aria-label="Review ' + (i + 1) + '"></button>'; }).join('') +
      '</div>';

    var idx = 0;
    var total = revs.length;
    var cards = mount.querySelectorAll('.rc-card');
    var dots = mount.querySelectorAll('.rc-dot');
    var track = mount.querySelector('#rcTrack');
    var timer = null;

    function show(n) {
      idx = (n + total) % total;
      cards.forEach(function (c, i) {
        c.classList.toggle('is-active', i === idx);
        c.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
    }

    function next() { show(idx + 1); }
    function prev() { show(idx - 1); }
    function startTimer() { stopTimer(); timer = setInterval(next, 6000); }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    mount.querySelector('.rc-next').addEventListener('click', function () { next(); startTimer(); });
    mount.querySelector('.rc-prev').addEventListener('click', function () { prev(); startTimer(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(parseInt(d.getAttribute('data-idx'), 10)); startTimer(); });
    });
    mount.addEventListener('mouseenter', stopTimer);
    mount.addEventListener('mouseleave', startTimer);
    mount.addEventListener('focusin', stopTimer);
    mount.addEventListener('focusout', startTimer);

    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; stopTimer(); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
      startTimer();
    }, { passive: true });

    show(0);
    startTimer();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
