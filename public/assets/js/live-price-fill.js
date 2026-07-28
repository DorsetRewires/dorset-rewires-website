/* Live price fill (added 2026-07-28).
 *
 * New pages write prices ONCE as normal text, wrapped in a marker:
 *
 *   <span data-price-key="eicr_by_circuit_count.0.price">&pound;160</span>
 *   <span data-price-key="rewire_size_ranges.4 bed.0">&pound;6,500</span>
 *   <span data-price-key="small_job_minimum_gbp" data-price-format="words">150 pounds</span>
 *
 * On load, this script fetches the canonical /data/price-list.json and
 * replaces each marked value, so a price change updates the page the moment
 * it deploys - no rewrite needed. The static text INSIDE the span stays in
 * the HTML for search engines and no-JS visitors, and the preflight guards
 * still check it - so if this script ever fails, the fallback text is
 * already correct as of the last publish. Belt, braces, and a guard.
 */
(function () {
  'use strict';

  var priceElements = document.querySelectorAll('[data-price-key]');
  if (!priceElements.length) return;

  function resolvePath(data, path) {
    var parts = path.split('.');
    var node = data;
    for (var index = 0; index < parts.length; index++) {
      if (node == null) return null;
      node = node[parts[index]];
    }
    return typeof node === 'number' ? node : null;
  }

  function formatPrice(value, format) {
    var withCommas = value.toLocaleString('en-GB');
    if (format === 'words') return withCommas + ' pounds';
    if (format === 'plain') return withCommas;
    return '£' + withCommas;
  }

  fetch('/data/price-list.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('price list unavailable');
      return response.json();
    })
    .then(function (priceList) {
      priceElements.forEach(function (element) {
        var value = resolvePath(priceList, element.getAttribute('data-price-key'));
        if (value == null) return; /* unknown key - keep the static fallback */
        element.textContent = formatPrice(value, element.getAttribute('data-price-format'));
      });
    })
    .catch(function () { /* fallback text stays - it is guard-checked at publish */ });
})();
