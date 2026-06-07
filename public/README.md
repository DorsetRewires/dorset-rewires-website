# Dorset Rewires & New Builds

Customer-facing website + internal Operations HQ for Pete's NICEIC-approved electrical business in Bournemouth, Poole and Dorset.

## What's where

```
/                       Customer-facing site (live)
  index.html            Homepage
  quote.html            Instant quote calculator (iPhone PWA)
  reviews.html          Public reviews page
  reviews.json          Review data (also feeds homepage carousel)
  manifest.json         PWA manifest (locked filename per spec)
  sw.js                 Service worker for offline calculator (locked filename per spec)

/assets/                Shared client-side resources
  /css/                 Stylesheets
  /js/                  JavaScript
  /icons/               PWA icons, favicons
  /img/                 Real photographs (when added)

/pages/                 SEO holding pages (one per target search keyword)
                        Filename = URL slug = SEO target. Do not rename.

/ops-hq/                Internal operations site (port 8765 path /ops-hq/)
  index.html            Dashboard
  manifest.html         Live file manifest with View / VS Code / Folder links per file
  pricing-admin.html    Edit prices, download updated JSON (drop in /data/)
  /topics/              Numbered operations content (01-quoting, 02-measuring, ...)
  /data/                JSON data (files.json, pricing.json, files-descriptions.json)
  /assets/              Ops-HQ-only CSS/JS

/tools/                 Python utilities (build, scan, watch, capture, serve)
                        Verb-noun kebab-case filenames

/_archive/              Historical research, screenshots. Read-only.

/claude-memory-files/   Junction (Windows symlink) to memory/dorset-rewires/.
                        Edit files here to update what Claude reads in future
                        sessions. The files are not duplicates - they live in
                        Claude's memory folder; the junction just surfaces them
                        here for convenience.
```

## How to run

```
# Static dev server (terminal stays open)
cd D:/dorset-rewires-and-new-builds
python -m http.server 8765 --bind 127.0.0.1

# Live file manifest auto-updater (terminal stays open)
python tools/watch-files.py

# Public access via Cloudflare quick tunnel (terminal stays open)
cloudflared tunnel --url http://127.0.0.1:8765
```

For persistent running, see `claude-memory-files/stack.md` (NSSM decisions).

## Naming convention

Plain English, kebab-case, no abbreviations beyond industry-standard ones (EICR, NICEIC, CIS, VAT, PWA, CU).

Spec-locked names (must not be renamed): `index.html`, `manifest.json`, `sw.js`, files under `/pages/` (URL slug = SEO target).

Everything else describes what it does: `quote-calculator-logic.js`, not `quote.js`.

Rename of existing short filenames is pending Pete's review in `claude-memory-files/naming-proposal.md`.

## Add a new file

| New file type | Goes in |
|---|---|
| Customer-facing HTML page | `/` (root) or `/pages/` if it is a service or location page |
| Customer-facing CSS | `/assets/css/` |
| Customer-facing JS | `/assets/js/` |
| Customer-facing image or icon | `/assets/img/` or `/assets/icons/` |
| Internal operations doc as HTML | `/ops-hq/topics/` with a leading number |
| Internal operations data (JSON, prices) | `/ops-hq/data/` |
| Build or dev tool (Python script) | `/tools/` |
| Research output or one-off report | `/_archive/research/` |
| Captured screenshot or PDF | `/_archive/screenshots/` |

If the file watcher (`tools/watch-files.py`) is running, the new file appears in the manifest within ~2 seconds. If not, run `python tools/scan-files.py` once to refresh.

## Hard rules

1. Never put anything in the project root that is not browser-served. No Python, no markdown (except this README), no screenshots at root. Root is for the live site.
2. Every new file should have a description in `ops-hq/data/files-descriptions.json` if the auto-generated one is inaccurate.
3. No business-critical logic outside `/tools/`. Static-site behaviour goes in client-side JS; anything server-side or scheduled goes in `/tools/`.
4. `/_archive/` is never edited. Files moved there are immutable history.
5. Per-folder README files are NOT used. This single root README plus the OPS HQ manifest are the canonical "what lives where".
6. Memory files (the project's vision, rules, stack decisions) live in `claude-memory-files/`. Editing those changes what Claude knows about this project in future sessions.

## Sister documents

| File | Purpose |
|---|---|
| `claude-memory-files/index.md` | Memory branch overview, current status |
| `claude-memory-files/vision.md` | 5-year plan, valuation math, 1.6-2M revenue target |
| `claude-memory-files/project-rules.md` | Detailed folder layout + naming rules |
| `claude-memory-files/stack.md` | Tooling and process-manager decisions |
| `claude-memory-files/naming-proposal.md` | Pending rename of short filenames |
