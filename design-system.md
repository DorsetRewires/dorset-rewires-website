# Dorset Rewires - design system & component standards

The single source of truth for how the site looks and is built. Read this before
adding or changing any UI component, and RECORD a new standard here the moment it
is decided (a hook reminds you on every .html/.css edit). Companion to
`naming-convention.md` (code identifiers) and the ADHD-copy rules.

Rule zero: **one canonical version of every shared component, and every page
matches it.** This is a no-build static site (no templating), so the header,
footer and meta block are physically duplicated on each page. When you change a
shared component, change it on ALL pages and re-run `ops/tools/check-consistency.py`.

## Tokens (source of truth = CSS `:root` in public/assets/css/styles.css)

Do not hardcode hex values in new CSS - use the variables.

- Brand: `--c-navy #0F2540`, `--c-amber #F4A300` (the brand yellow), `--c-green #1FA45A`.
- Danger/destructive: `--c-danger #C0392B` (hover `--c-danger-2 #A93226`). Red is for destructive actions ONLY (reset, delete) - never a normal CTA. Added 2026-06-20.
- Amber tints: `--c-amber-soft #FFF8EC`, `--c-amber-line #FCE6B6`.
- Text: `--c-text #22293A`, `--c-text-soft`, `--c-text-mute`, `--c-text-faint`.
- Surfaces: `--c-bg`, `--c-bg-soft #F4F6FA`, `--c-card #fff`, `--c-border #EAECEF`.
- Radii: `--r-sm 8px`, `--r-md 12px`, `--r-lg 14px`, `--r-pill 999px`.
- Font: **Inter** (Google Fonts), stack `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`. There is no separate "font file" - the font lives only here.

## Shared components (canonical markup)

Start any new page from `ops/templates/page-template.html`, which already contains
the standard head/meta, header, footer and script include.

- **Header** (`<header class="site-header" id="siteHeader">`): logo (links Home),
  6-item `primary-nav` (Rewires, New Build, Instant Quote [`.nav-cta`], Reviews,
  FAQs, Contact), `.header-call` (icon + number, GREEN `--c-green` / hover `--c-green-2` - the "call now" CTA, matching the homepage call button; pairs with the amber Instant Quote), and the `#menuBtn` hamburger.
  Every page MUST include `#menuBtn` AND load `script.js` or the mobile menu will
  not open. Path rule: root pages link `index.html#...`; pages in `/pages/` link
  `../index.html#...` and `../quote.html`, `../reviews.html`.
- **Footer** (`<footer class="site-footer">` with `.footer-grid`): logo + Contact,
  Services, Resources, Accreditations columns + a `.footer-bottom` copyright/Privacy/
  Terms bar. Same path rule as the header.
- **Highlight** `.text-highlight` = navy bold text + 2px amber underline (decided
  2026-06-14, option C). Use it to emphasise a short phrase or a key promise. Do
  NOT use the old amber-marker style (it broke across line wraps).
- **Eyebrow** (pre-headline): `.eyebrow` is tuned for the DARK navy hero
  (translucent amber bg + pale cream text) - on a LIGHT/white page it renders
  pale-on-pale (invisible). For light pages PREFER `.eyebrow-plain` (bold near-navy
  text, NO pill, amber accent via a nested `.accent` span). A pill (`.eyebrow-solid`,
  also present) tested as "banner-blind" - a coloured badge reads as decoration and
  the eye skips it, so plain bold text works better. Eyebrows are strongest as a
  full-sentence claim (a Becker "slap"), not a short label. Added 2026-07-04.
  STANDARD ON TOWN PAGES (2026-07-13, Pete's call): every electrician-<town> page
  opens its `<article>` with the brand-promise eyebrow -
  `<p class="eyebrow-plain"><span class="accent">Quotes, not estimates.</span>
  The price we quote is the price you pay.</p>` - and the lede then says "a fixed
  price in writing that only changes if you change the job" WITHOUT repeating
  "Quotes, not estimates" (no back-to-back duplication). The page template
  (ops/templates/page-template.html) carries this by default.
- **Buttons**: `.btn-amber` (primary CTA, amber fill / navy text); `.btn-ghost-cta`
  and `.btn-ghost-dark` (secondary outlined); `.btn-call` (green call button);
  `.btn-awaiting` (disabled grey "awaiting" placeholder). Amber is reserved for the
  ONE primary action in a view.
- **Green CTA banner** `.inline-cta` (navy text on `--c-green`): a `<div>` (not a
  link) containing the pitch text + a tel-link Call button; secondary links inside
  use `.ic-text a` (white, underlined). Do not make the whole banner a single anchor.
- **Summary reset** `.summary-reset` (quote tool): a destructive action, so a permanent red outline (red border + red text + faint red wash), intensifying on hover. Stays visually SECONDARY to the green Send CTA. Updated 2026-06-20 (was a faint ghost that only reddened on hover - too easy to miss).
- **Confirm dialog (THE standard popup, 2026-06-20)** `.dr-confirm`: the ONLY way to ask "are you sure?" - never use the browser's `window.confirm/alert`. Call `window.showConfirmDialog({ title, message, confirmLabel, cancelLabel, danger })` (defined in `script.js`, loaded site-wide); it returns a Promise resolving true/false. Branded card: navy title, soft-grey Cancel + amber OK; pass `danger: true` for destructive actions (red OK button, and focus defaults to Cancel). One reusable node, built on first use. Markup/CSS live in `styles.css` (`.dr-confirm*`). Any new popup MUST use this - do not hand-roll modals or native dialogs.
- **In-content links (brand link standard, 2026-06-20)**: prose links inside `.page article` paragraphs and list items render navy + bold + a 2px amber underline (the link cousin of `.text-highlight`), so links are obvious without the old-school blue. Implemented in `page.css` via `.page article p a:not([class])` / `li a:not([class])`. Do not restyle individual prose links inline. **Exempt: the jump-list** (`.page-toc`) - it is a dense list of links, so a persistent underline on every row is too heavy. It keeps a subtle hover-only amber underline (explicit higher-specificity override in `page.css`). Any future dense link-list should be exempted the same way, not underlined.
- **Jump list** `.page-toc` (long SEO/article pages): a white "On this page" card of in-page anchor links (each H2 has an `id`). Helps the ADHD reader skip to one answer and can earn Google jump-to sitelinks. Use on any page with 5+ sections.
- **Includes / excludes lists** `ul.tick-list` (green tick) and `ul.cross-list` (grey cross) - for "what's included vs what's extra" style lists. Bold the key term in each `<li>`.
- **Reward tiers** `ul.tier-list` (+ `.tier-amount` pill + `.tier-note`) in `page.css`: the /refer "What you earn" box - an amber pill amount beside its job label, on the amber-tint tokens so it reads friendly not warning. Page-scoped to /refer; reuse if another page needs a money-tier breakdown. Added 2026-07-07.
- **Image placeholder** `figure.page-figure > .img-placeholder` (+ `figcaption`): a dashed-border box that reserves a real photo slot before a shoot, so layout is final and the photo just drops in later. The `.page-toc` "On this page" label also carries an amber underline (brand cue).
- **Figure pair (comparison, added 2026-07-10)** `.figure-pair` wrapping two `figure.page-figure`: a two-up grid that stacks to one column under 620px. Use to compare two real photos side by side (first use: RCBO board vs split-load RCD board on the cost guide). Two figures = two keyword-rich alt texts + two figcaptions, which is the SEO reason to prefer a pair over one image. Defined once in `page.css`; each inner figure drops its own `max-width`.
- **Internal linking (SEO standard, 2026-06-19):** link key terms to their page EVERY time they appear - "instant quote tool" -> ../quote.html, "EICR" -> the EICR page, "consumer unit" -> the CU page, "cost guide" -> the cost guide. Spreads ranking authority and builds topic clusters. Lean toward MORE internal links, not fewer.
- **FAQ accordion - ONE source (fixed 2026-06-19):** native `<details>/<summary>` inside `<div class="faq">`. The styling (the rotating chevron marker) lives ONCE in `styles.css` (`.faq summary::after`). Do NOT redefine `.faq` in `page.css` - that override caused a homepage-vs-SEO-page drift (the chevron got replaced by a +/-). Mirror each visible Q&A in a `FAQPage` JSON-LD block.
- **(superseded) FAQ accordion** `.faq` wrapping native `<details>/<summary>` (NO JavaScript) - amber "+" that rotates to a cross when open. Mirror each visible Q&A in a `FAQPage` JSON-LD block in the page `@graph` so it is eligible for rich results. All decided 2026-06-14 on the Cost Guide page (the pilot detailed SEO page).
- **Handover pack (print standard, added 2026-07-09)** `.handover-pack` + `.handover-page` (quote tool only, `assets/css/handover-pack.css`): the Pete-only three-page A4 print pack (cover, itemised quote, how-the-price-is-built). Hidden on screen; prints ONLY when `body.handover-print-active` is set by `handover-pack.js` (so a customer printing /quote normally still gets the web page). Print pages use the brand tokens as literal hex (print CSS) with a 3px amber rule under each page's brand strip. The rate card on page 3 is CLONED from the on-page `.rate-card` table at print time - never re-type prices into the pack. The on-screen `.handover-card` controls (amber-bordered card, navy "Pete only" pill `.handover-badge`) show only at `/quote#pete`.

## Quote-calculator section dividers (added 2026-07-25, Pete's design)

The /quote calculator serves two different visitors, so its left column is split by
labelled dividers (`.calc-section-divider` in quote.css):
1. "Quick single jobs" above the EICR + consumer-unit cards (priced in seconds, done
   while you live in).
2. "The full job: rewires and bigger work" (`.calc-section-full` - extra air, top rule,
   amber accent on the label rule) above the walk-round tip + whole-property + rooms.
Uppercase 15px label with a flex rule line after it, one-line muted sub. Uses tokens
only (--c-navy, --c-border, --c-amber-line). If the calculator gains a third audience,
add a divider rather than a new pattern.

## Page anatomy / "blog feel" (open decision)

The homepage header sits above the navy hero, so it separates cleanly. Sub-pages
and SEO pages are content/article pages ("blog feel") on white. To stop the header
blending into white content, the header has a persistent bottom divider. (If we
later decide sub-pages should get a navy title band instead, record that here.)

## Board / install photography (added 2026-07-06)

Real photos of Pete's boards. Replaces the old `.photo-stub` placeholders.

- **Files**: WebP only, in `public/assets/img/`, descriptive kebab-case names
  (`consumer-unit-surge-protection-device.webp`). Source originals stay local-only
  (gitignored) in `ops/Images/YYYYMMDD__Subject/Originals/`, with the exact shots
  that went live copied to a `web-source-originals/` subfolder named to match their
  `.webp`. Never ship the raw JPEGs. One source of truth: live images live ONLY in
  `public/assets/img/` - do not keep an "edited" mirror in ops.
- **Processing** (see the one-off `scratchpad/process_board_photos.py` recipe):
  EXIF auto-rotate, light polish, resize to 1300px wide, WebP q80, **strip all
  metadata** (no GPS/EXIF ever ships). Target under ~110 KB per image.
- **Hero image** (`.hero-img`): fills the 4/3 hero-photo box (`object-fit: cover`),
  `fetchpriority="high"`, no lazy-load (it is the LCP element).
- **Content figure** (`.board-figure` > `img` + `figcaption`): rounded, soft
  shadow, muted centered caption. Below-the-fold images get `loading="lazy"`;
  the first (near-top) image does not.
- **Every image needs** `width`/`height` attributes (stops layout shift) and
  **honest, descriptive alt text**. These are bench-built boards, so alt/captions
  describe what is shown ("wired and labelled by Dorset Rewires") - never imply a
  specific customer job. No NICEIC in shot. Keyword-relevant but not stuffed.

## OG / social preview images (the "bare Hormozi" standard, 2026-07-07)

Every shared link (WhatsApp, Facebook, X, iMessage) shows a 1200x630 card. ONE
house style, so a link to any page looks like the same brand.

- **Format**: plain navy field (`--c-navy`), a couple of BIG words, centred. One
  cream context line stacked above one amber (`--c-amber`) hero line. NO wordmark,
  NO strapline, NO trust bar, NO photo. Bold and sparse - the URL under the card
  already carries the brand name, so the picture just lands one hook. This is the
  treatment the `/refer` ("Earn / £300 / Refer us") and consumer-unit
  ("10-year / warranty") cards set; everything else now matches it.
- **What the amber hero says**: LOCATION pages lead with the town in amber
  (`Electrician in` / **`Bournemouth`**); OFFER pages lead with the hook in amber
  (`Your quote` / **`in 60 seconds`**). Amber is the one thing the eye should land on.
- **Copy rules**: a few words only, and only NON-DRIFT claims - no live prices
  (the fixed `£300` referral and `10-year` guarantee are safe; a quote price is
  not), and never "NICEIC" (application still pending - see the compliance memo).
- **Square-crop safe zone**: WhatsApp centre-crops the thumbnail to a SQUARE,
  keeping only the middle ~560px of the 1200 width. Every line MUST fit inside
  that or it clips (this ate the left edge of the old cards). The generator
  auto-shrinks a long word (Christchurch) to fit; keep hand-tuned cards short.
- **How to make/change one**: they are generated, never hand-edited -
  `python ops/tools/make-og-images.py` (Pillow, Arial Bold substituting for Inter,
  JPEG q90, overwrites `public/og-*.jpg` in place). Add a page to the `PAGES` list
  (filename, context line, hero line) and re-run. Then `check-og-images.py`
  (bundled in preflight) confirms every page's `og:image` points to a real file.
- **Homepage card** `public/og-image.jpg` = "Quotes, not / estimates." generated
  bare via `build_bare` (was a chrome-heavy Playwright render that turned to mush
  at WhatsApp thumbnail size; the old `ops/tools/_review/og-card.html` is retired).
- **Deliberate exceptions** (leave these alone): `/refer` and the consumer-unit
  card are multi-line but the same bare aesthetic, hand-tuned in `build_refer()` /
  `build_cu()`.

## DR SaaS product shell (Ops HQ v3, added 2026-07-28)

The internal product app at `/drsaas/` has its OWN design system, separate from the
customer website above. It is the approved v3 look (navy + amber clinical, softer
surfaces, bigger radii) lifted from `ops/ops-hq/today.html` / `v3-ui-mockup.html`.

- **Theme**: `ops/drsaas/assets/drsaas.css`. Tokens live in its `:root`
  (`--backdrop`, `--surface`, `--accent` etc). The accent can be overridden per
  tenant from `ops/ops-hq/data/tenant-config.json` (`branding.accent_colour`).
- **Rail**: every `/drsaas/` page has `<aside class="rail" data-drsaas-rail></aside>`
  rendered by `ops/drsaas/assets/drsaas-shell.js` from
  `ops/drsaas/config/module-registry.json`. NEVER hand-code rail markup on a page.
- **Brand motif**: ECG pulse line on the amber tile (in the shell JS), tagline
  "The cure for trade admin", SVG data-URI favicon injected by the shell.
- **Class-name lock**: the classes in drsaas.css that ops-hq-today.js / ops-crm.js
  emit from JS (`.tile`, `.chip-amber`, `.job-card` etc) must keep their names.
- The customer-website rules above (header/footer/check-consistency) do NOT apply
  inside `/drsaas/` - and this shell must not leak into `public/`.

## Prices on pages + the "bring us the fix" law (added 2026-07-28, Pete's rule)

- **New pages never state a price as bare prose.** Wrap it:
  `<span data-price-key="<price-list path>">&pound;160</span>` and load
  `assets/js/live-price-fill.js` (the page template shows the pattern). The page
  then self-updates from `/data/price-list.json` on every visit; the static text
  inside the span is the SEO/no-JS fallback and is still guard-checked, so a JS
  failure falls back to publish-verified text. JSON-LD amounts stay static
  (scripts cannot run there) - the guards + publish auto-rewriter own those.
- **"Bring us the fix" - core product law for everything we build.** When
  software finds a problem, it must bring the person the fix: name the exact
  page/field, show the offending text, and put the edit (or a one-click path to
  it) in front of them. Never "something is invalid, go hunt for it". This is
  the ADHD design ethos applied to errors: auto-scroll to the field, or open a
  modal containing just the thing to fix. Applies to the publish pipeline,
  every Settings editor, and any future DR SaaS form.

## Governance - how this stays true

1. **Reuse first**: before building a component, check this doc + `ops/templates/`.
2. **Record immediately**: when a new visual/component standard is decided, write it
   here in the same session. The `design-standards-guard` hook reminds you on every
   `.html`/`.css` edit.
3. **No drift**: after changing a shared component, run `ops/tools/check-consistency.py`
   to confirm every page still matches.
4. **Scope**: this is the Dorset Rewires standard only. DR-specific hooks must detect
   the project (by file path, or cwd/transcript_path) and no-op elsewhere - see
   `feedback_cross_project_hook_bleed`.
