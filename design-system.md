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
- **Eyebrow** (pre-headline pill): `.eyebrow` is tuned for the DARK navy hero
  (translucent amber bg + pale cream text) - on a LIGHT/white page it renders
  pale-on-pale (invisible). On light pages use `.eyebrow-solid` (solid amber bg,
  navy text, uppercase). Added 2026-07-04 for sales-page eyebrows like /refer.
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
- **Image placeholder** `figure.page-figure > .img-placeholder` (+ `figcaption`): a dashed-border box that reserves a real photo slot before a shoot, so layout is final and the photo just drops in later. The `.page-toc` "On this page" label also carries an amber underline (brand cue).
- **Internal linking (SEO standard, 2026-06-19):** link key terms to their page EVERY time they appear - "instant quote tool" -> ../quote.html, "EICR" -> the EICR page, "consumer unit" -> the CU page, "cost guide" -> the cost guide. Spreads ranking authority and builds topic clusters. Lean toward MORE internal links, not fewer.
- **FAQ accordion - ONE source (fixed 2026-06-19):** native `<details>/<summary>` inside `<div class="faq">`. The styling (the rotating chevron marker) lives ONCE in `styles.css` (`.faq summary::after`). Do NOT redefine `.faq` in `page.css` - that override caused a homepage-vs-SEO-page drift (the chevron got replaced by a +/-). Mirror each visible Q&A in a `FAQPage` JSON-LD block.
- **(superseded) FAQ accordion** `.faq` wrapping native `<details>/<summary>` (NO JavaScript) - amber "+" that rotates to a cross when open. Mirror each visible Q&A in a `FAQPage` JSON-LD block in the page `@graph` so it is eligible for rich results. All decided 2026-06-14 on the Cost Guide page (the pilot detailed SEO page).

## Page anatomy / "blog feel" (open decision)

The homepage header sits above the navy hero, so it separates cleanly. Sub-pages
and SEO pages are content/article pages ("blog feel") on white. To stop the header
blending into white content, the header has a persistent bottom divider. (If we
later decide sub-pages should get a navy title band instead, record that here.)

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
