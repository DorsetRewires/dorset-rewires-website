# Naming convention — D:/dorset-rewires-and-new-builds/

This file is the canonical rules for naming functions, properties (variables) and CSS classes inside this project.

**A hook fires whenever Claude touches `.js`, `.css`, `.html`, `.py` files in this project, telling Claude to read this file before continuing.** That is by design. The rule is: every name in this codebase must be readable cold by a non-developer (e.g. an ADHD-friendly buyer or franchisee inheriting the system).

## The rule, plainly

Every named thing should describe **what it is** or **what it does**, in plain English, without abbreviation. If someone has never seen the codebase before, reading the name alone should tell them what they are looking at.

## Concrete principles

1. **No 2-letter or 3-letter shorthand.** `ri`, `rr`, `cs`, `cr`, `cu`, `sw1` are forbidden. Spell it out.
2. **Use snake_case for properties and JSON keys**, `camelCase` for JS functions, `kebab-case` for CSS classes and filenames.
3. **Name a value by what it represents**, not by where it sits. `socket_price` (good) vs `price` (bad, too generic).
4. **Name a function by what it does**, including the verb. `calculateRoomSubtotal()` (good) vs `calc()` (bad).
5. **Name a CSS class by what the element is, not how it looks.** `.summary-card` (good) vs `.gold-box` (bad).
6. **Industry-standard acronyms are acceptable** when they are unambiguous in the domain: `EICR`, `NICEIC`, `RCBO`, `PWA`, `URL`, `HTML`, `JSON`, `API`.
7. **Numerics in identifiers spell out the unit.** `radial_16amp_count` (good) vs `r16` (bad).
8. **Plural for collections, singular for one thing.** `state.rooms` (good, it's an array), `room.sockets` (good, it's a count, but acceptable as plural here since we're counting them).

## Filenames (this applies to every NEW file)

Every new file MUST have a descriptive, plain-English, kebab-case name that says what it does. Same bar as identifiers: someone who has never seen the codebase should understand the file from its name alone.

- `quote-calculator-logic.js` (good) not `quote.js` or `app.js`
- `quote-tool-service-worker.js` (good) not `sw.js`
- `price-list.json` (good) not `prices.json` or `data.json`

Only TRULY platform-mandated names are exempt:

1. **`index.html`** - the default file a web server returns for a directory.
2. **`manifest.json`** - kept by convention for the PWA `<link rel="manifest">`.
3. **Files under `/pages/`** - the filename IS the public SEO URL slug, chosen for search, not for the codebase.

A service worker filename is NOT platform-mandated. Its scope comes from WHERE it is served (served from root = controls the whole site), not from being called `sw.js`. So it gets a descriptive name like everything else.

## Examples — good vs bad

| Bad | Good | Why |
|---|---|---|
| `fmt(n)` | `formatAsCurrency(n)` | "fmt" is two letters; tells you nothing |
| `r16_qty` | `radial_16amp_count` | "qty" is jargon; "16" lacks unit |
| `sw1` | `one_way_switches` | switch type unclear |
| `.cs-card` | `.summary-card` | "cs" prefix is unguessable |
| `.ri` | `.room-item` | 2-letter class name |
| `state.cu` | `state.consumer_unit_count` | "cu" is ambiguous (copper? consumer unit? cubic units?) |
| `calcAll()` | `recalculateAndUpdateDisplay()` | "calc" is jargon; what does it recalculate? what does it update? |
| `buildRoom()` | `buildRoomCardInDom()` | clarifies it builds the DOM card, not a data object |

## Where the rule applies

| File type | Apply to | Notes |
|---|---|---|
| `.js` | functions, variables, object properties | NOT browser-mandated globals like `window`, `document`, `localStorage` |
| `.css` | class names, ID names, CSS custom properties (`--var-name`) | NOT standard CSS properties like `display`, `color` |
| `.html` | `class="..."`, `id="..."`, `data-*` attributes | NOT standard HTML attributes like `href`, `src`, `alt` |
| `.py` | functions, variables, classes | NOT Python stdlib references like `os.path`, `sys.argv` |
| `.json` | object keys | NOT third-party schema keys like `@context` or `@type` (schema.org) |

## Where the rule does NOT apply (spec-locked)

| File | Why it stays |
|---|---|
| `index.html` | Default served file |
| `manifest.json` | PWA spec filename |
| Pages under `/pages/` | Filename = SEO URL slug |
| `csTotal`, `csLines` etc. HTML element IDs | Currently used by quote-calculator-logic.js — renaming requires HTML+JS sync |

(The element IDs above are short-lived spec-locks. They should be renamed too in the next polish pass.)

## When to apply

- **Adding a new function, variable or class:** name it correctly first time. Do not start with `foo` or `tmp`.
- **Editing an existing identifier:** if the name is already bad, fix it AND every reference. Do not leave bad names spreading.
- **Reading the codebase:** if any name confuses you, log it in `claude-memory-files/naming-debt.md` (create if missing) so it can be cleaned up in a batch.

## Why this matters

This project is being built as a sellable / franchisable operation manual (see `claude-memory-files/vision.md`). Every shortcut taken in naming reduces the multiple at exit. A buyer paying 5x EBITDA for a documented system needs to be able to read the code. A buyer paying 3x EBITDA inherits a black box they have to rewrite. The naming rule is therefore part of the asset, not the engineering aesthetic.

## Discipline

The hook will keep firing. That is not noise — it is the system telling you to slow down and name properly. Read this file when reminded.
