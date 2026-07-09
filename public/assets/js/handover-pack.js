// Handover pack - Pete-only print pack for on-site quotes.
//
// How it works:
// 1. Pete opens /quote#pete on his phone (bookmark). The hash reveals the
//    "Handover pack" card in the summary column. Customers on /quote never see it.
// 2. Pete builds the quote as normal, types the customer's name and address,
//    then taps "Print handover pack".
// 3. This script fills the hidden three-page pack (#handoverPack in quote.html)
//    with the live quote snapshot, clones the on-page rate card so prices can
//    never drift, and opens the phone's print dialog (window.print). The van
//    printer does the rest.
//
// The quote snapshot comes from window.getQuoteSnapshotForHandoverPack, a
// read-only bridge exposed by quote-calculator-logic.js.
(function () {
  'use strict';

  var HANDOVER_HASH = '#pete';
  var CLIENT_DETAILS_STORAGE_KEY = 'dorset-rewires-handover-client-v1';

  var handoverCard = document.getElementById('handoverCard');
  var clientNameInput = document.getElementById('handoverClientName');
  var propertyAddressInput = document.getElementById('handoverPropertyAddress');
  var printButton = document.getElementById('handoverPrintButton');
  var handoverPack = document.getElementById('handoverPack');
  if (!handoverCard || !handoverPack || !printButton) return;

  // ----- Pete mode on/off -----
  // The card shows only when the URL hash is #pete. Checked on load and on
  // every hash change (so typing #pete after the page loaded also works).
  function showHandoverCardIfPeteMode() {
    handoverCard.hidden = (window.location.hash !== HANDOVER_HASH);
  }
  window.addEventListener('hashchange', showHandoverCardIfPeteMode);
  showHandoverCardIfPeteMode();

  // ----- Customer details persistence -----
  // Saved locally so a page refresh in the van does not lose what Pete typed.
  // Same pattern as the quote itself (see quote-calculator-logic.js).
  function saveClientDetails() {
    try {
      localStorage.setItem(CLIENT_DETAILS_STORAGE_KEY, JSON.stringify({
        client_name: clientNameInput ? clientNameInput.value : '',
        property_address: propertyAddressInput ? propertyAddressInput.value : ''
      }));
    } catch (e) { /* storage disabled - typing still works for this visit */ }
  }
  function loadClientDetails() {
    var raw;
    try { raw = localStorage.getItem(CLIENT_DETAILS_STORAGE_KEY); } catch (e) { return; }
    if (!raw) return;
    var saved;
    try { saved = JSON.parse(raw); } catch (e) { return; }
    if (!saved) return;
    if (clientNameInput && saved.client_name) clientNameInput.value = saved.client_name;
    if (propertyAddressInput && saved.property_address) propertyAddressInput.value = saved.property_address;
  }
  if (clientNameInput) clientNameInput.addEventListener('input', saveClientDetails);
  if (propertyAddressInput) propertyAddressInput.addEventListener('input', saveClientDetails);
  loadClientDetails();

  // ----- Filling the pack -----
  function fillTextInAll(selector, text) {
    handoverPack.querySelectorAll(selector).forEach(function (element) {
      element.textContent = text;
    });
  }

  function fillHandoverPack(quoteSnapshot) {
    var clientName = clientNameInput && clientNameInput.value.trim() ? clientNameInput.value.trim() : 'you';
    var propertyAddress = propertyAddressInput ? propertyAddressInput.value.trim() : '';

    fillTextInAll('.handover-client-name-output', clientName);
    fillTextInAll('.handover-property-address-output', propertyAddress || '-');
    fillTextInAll('.handover-date-output', new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    }));
    fillTextInAll('.handover-total-output', quoteSnapshot.total_display);

    // Itemised lines table (page 2).
    var linesTableBody = document.getElementById('handoverLinesBody');
    if (linesTableBody) {
      linesTableBody.innerHTML = '';
      quoteSnapshot.lines.forEach(function (line) {
        var row = document.createElement('tr');
        var nameCell = document.createElement('td');
        nameCell.textContent = line.name;
        var valueCell = document.createElement('td');
        valueCell.textContent = line.value_display;
        row.appendChild(nameCell);
        row.appendChild(valueCell);
        linesTableBody.appendChild(row);
      });
      var totalRow = document.createElement('tr');
      totalRow.className = 'handover-lines-total';
      var totalLabelCell = document.createElement('td');
      totalLabelCell.textContent = 'Your total';
      var totalValueCell = document.createElement('td');
      totalValueCell.textContent = quoteSnapshot.total_display;
      totalRow.appendChild(totalLabelCell);
      totalRow.appendChild(totalValueCell);
      linesTableBody.appendChild(totalRow);
    }

    // Rate card (page 3): cloned from the on-page "How prices are built" table,
    // which is guarded by check-prices.py - so the printed pack inherits the
    // same no-drift guarantee and no price is re-typed here.
    var handoverRateCard = document.getElementById('handoverRateCard');
    var onPageRateCardTable = document.querySelector('.rate-card table');
    if (handoverRateCard && onPageRateCardTable) {
      handoverRateCard.innerHTML = '';
      handoverRateCard.appendChild(onPageRateCardTable.cloneNode(true));
    }
  }

  // ----- Print -----
  printButton.addEventListener('click', function () {
    var quoteSnapshot = window.getQuoteSnapshotForHandoverPack
      ? window.getQuoteSnapshotForHandoverPack()
      : { total_value: 0, total_display: '£0', lines: [] };
    if (!quoteSnapshot.total_value) {
      alert('The quote is still £0. Add the rooms and items first, then print.');
      return;
    }
    fillHandoverPack(quoteSnapshot);
    document.body.classList.add('handover-print-active');
    window.print();
  });

  // Firefox and Chrome fire afterprint when the dialog closes; Safari needs the
  // matchMedia fallback. Either way the page returns to normal.
  function endHandoverPrint() {
    document.body.classList.remove('handover-print-active');
  }
  window.addEventListener('afterprint', endHandoverPrint);
  if (window.matchMedia) {
    window.matchMedia('print').addEventListener('change', function (event) {
      if (!event.matches) endHandoverPrint();
    });
  }
})();
