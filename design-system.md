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
  FAQs, Contact), `.header-call` (icon + number), and the `#menuBtn` hamburger.
  Every page MUST include `#menuBtn` AND load `script.js` or the mobile menu will
  not open. Path rule: root pages link `index.html#...`; pages in `/pages/` link
  `../index.html#...` and `../quote.html`, `../reviews.html`.
- **Footer** (`<footer class="site-footer">` with `.footer-grid`): logo + Contact,
  Services, Resources, Accreditations columns + a `.footer-bottom` copyright/Privacy/
  Terms bar. Same path rule as the header.
- **Highlight** `.text-highlight` = navy bold text + 2px amber underline (decided
  2026-06-14, option C). Use it to emphasise a short phrase or a key promise. Do
  NOT use the old amber-marker style (it broke across line wraps).
- **Buttons**: `.btn-amber` (primary CTA, amber fill / navy text); `.btn-ghost-cta`
  and `.btn-ghost-dark` (secondary outlined); `.btn-call` (green call button);
  `.btn-awaiting` (disabled grey "awaiting" placeholder). Amber is reserved for the
  ONE primary action in a view.
- **Green CTA banner** `.inline-cta` (navy text on `--c-green`): a `<div>` (not a
  link) containing the pitch text + a tel-link Call button; secondary links inside
  use `.ic-text a` (white, underlined). Do not make the whole banner a single anchor.
- **Summary reset** `.summary-reset` (quote tool): outlined button, red on hover.

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
