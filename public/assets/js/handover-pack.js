// Handover pack - the printable quote pack on the quote tool (public).
//
// How it works:
// 1. The "Print or save this quote" card sits under the rate card for everyone.
//    Customers print or save their own quote; Pete uses the same button in the
//    van on big jobs and hands the printed pack over before he leaves.
// 2. Name and property address are optional - they go on the cover if filled in.
// 3. The print button fills the hidden three-page pack (#handoverPack in
//    quote.html) with the live quote snapshot, clones the on-page rate card so
//    prices can never drift, and opens the print dialog (window.print). Every
//    phone's print dialog includes "Save as PDF".
// 4. The share button (shown only where the browser supports sharing) sends a
//    text summary of the quote to WhatsApp / email / notes via the phone's
//    native share sheet.
//
// The quote snapshot comes from window.getQuoteSnapshotForHandoverPack, a
// read-only bridge exposed by quote-calculator-logic.js.
(function () {
  'use strict';

  var CLIENT_DETAILS_STORAGE_KEY = 'dorset-rewires-handover-client-v1';

  var clientNameInput = document.getElementById('handoverClientName');
  var propertyAddressInput = document.getElementById('handoverPropertyAddress');
  var printButton = document.getElementById('handoverPrintButton');
  var shareButton = document.getElementById('handoverShareButton');
  var handoverPack = document.getElementById('handoverPack');
  if (!handoverPack || !printButton) return;

  // ----- Customer details persistence -----
  // Saved locally so a page refresh does not lose what was typed. Same pattern
  // as the quote itself (see quote-calculator-logic.js).
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
  // Cover rows for name/address only print when they were filled in - a row
  // reading "Prepared for: -" looks worse than no row.
  function toggleCoverRow(rowClass, outputClass, value) {
    var row = handoverPack.querySelector(rowClass);
    if (row) row.hidden = !value;
    if (value) fillTextInAll(outputClass, value);
  }

  function fillHandoverPack(quoteSnapshot) {
    var clientName = clientNameInput ? clientNameInput.value.trim() : '';
    var propertyAddress = propertyAddressInput ? propertyAddressInput.value.trim() : '';

    toggleCoverRow('.handover-prepared-name-row', '.handover-client-name-output', clientName);
    toggleCoverRow('.handover-prepared-address-row', '.handover-property-address-output', propertyAddress);
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

  function currentQuoteSnapshot() {
    return window.getQuoteSnapshotForHandoverPack
      ? window.getQuoteSnapshotForHandoverPack()
      : { total_value: 0, total_display: '£0', lines: [] };
  }

  // ----- Print / save as PDF -----
  printButton.addEventListener('click', function () {
    var quoteSnapshot = currentQuoteSnapshot();
    if (!quoteSnapshot.total_value) {
      showConfirmDialog({ title: 'Nothing to print yet', message: 'The quote is still £0. Add the rooms and items first, then print.', confirmLabel: 'OK', alertOnly: true });
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

  // ----- Share via the phone's native share sheet -----
  // Only shown where the browser supports it (most phones, some desktops).
  if (shareButton && navigator.share) {
    shareButton.hidden = false;
    shareButton.addEventListener('click', function () {
      var quoteSnapshot = currentQuoteSnapshot();
      if (!quoteSnapshot.total_value) {
        showConfirmDialog({ title: 'Nothing to share yet', message: 'The quote is still £0. Add the rooms and items first, then share.', confirmLabel: 'OK', alertOnly: true });
        return;
      }
      var shareText = 'My quote from Dorset Rewires: ' + quoteSnapshot.total_display + '\n\n' +
        quoteSnapshot.lines.map(function (line) {
          return '- ' + line.name + ' = ' + line.value_display;
        }).join('\n') +
        '\n\nBuild your own at https://dorsetrewires.co.uk/quote';
      navigator.share({ text: shareText }).catch(function () { /* user closed the share sheet */ });
    });
  }
})();
