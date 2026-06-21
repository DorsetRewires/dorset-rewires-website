// Shared front-end config - the single source for values used by more than one script.
// Loaded BEFORE script.js / quote-calculator-logic.js on the pages that POST leads (the
// homepage callback form and the quote tool), so the Worker URL lives in exactly one place.
window.DR_CONFIG = {
  // Cloudflare Worker that emails quote + callback leads via Brevo (source: D:/SAAS/tools/dr-quote-worker).
  quoteWorkerUrl: 'https://dorset-rewires-quote.silent-star-0bcc.workers.dev'
};
