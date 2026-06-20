# Dorset Rewires - Runbook (break-glass)

Plain-English guide so a human (Pete, or a freelance developer) can keep the site
running WITHOUT the AI assistant. No passwords here - logins live in the Ops HQ
Accounts page on Pete's PC (`ops/ops-hq/accounts.html`, local only).

Golden rule: don't panic. The website code is safe on GitHub
(github.com/DorsetRewires/dorset-rewires-website). Nothing here is one-click-fatal.

## What this site is
- Hand-written static HTML/CSS/JS in `public/`. No build step, no framework.
- Hosted on **Cloudflare Pages**. Every `git push` to the `main` branch auto-deploys.
- Only the `public/` folder goes live. `ops/` is local-only and never deploys.
- The site is mostly behind a "holding" page; a few pages are carved out live (see
  `public/_redirects`).

## How to change a price
1. Prices live in ONE file: `public/data/price-list.json`. Never type a price anywhere else.
2. Edit the number there, save.
3. Run `python ops/tools/preflight.py` - it must say all checks pass.
4. `git add public/data/price-list.json` then `git commit` then `git push`.
5. Wait ~1-2 min. Hard-refresh the site to see it.

## How to roll back a bad deploy (site looks broken)
1. Go to the **Cloudflare dashboard** (dash.cloudflare.com) -> Workers & Pages ->
   `dorset-rewires-website` -> Deployments.
2. Find the last deployment that was working. Click its menu -> **Rollback to this deployment**.
3. The live site reverts in seconds. Then fix the problem in the code and push again.

## Holding mode (the "coming soon" page)
- Controlled by `public/_redirects`. The last line sends everything to `/holding`.
- To take a page LIVE: add its carve-out lines above the catch-all (see the "Runbooks"
  section in `ops/go-live-checklist.md` for the exact steps). NEVER end a redirect
  destination in `.html` - it loops forever.
- To take the WHOLE site live: change the catch-all to serve the real site.

## Accounts (where things live - details in the Ops HQ Accounts page)
- **Domain:** registered at 123-reg; DNS managed at Cloudflare (always change DNS in Cloudflare).
- **Cloudflare:** hosting (Pages), the quote-email Worker, and all DNS.
- **GitHub:** the website code + auto-deploy.
- **Zoho:** email for info@dorsetrewires.co.uk.
- **Brevo:** sends the instant-quote lead emails (via the Cloudflare Worker).
- **Google:** Search Console + Business Profile, account info@dorsetrewires.co.uk.
Turn on 2FA for all of these and keep recovery codes somewhere offline.

## Backups
- A nightly job zips the project + AI memory to Cloudflare R2 storage.
- A backup is only good if a restore works - do a test restore now and then (Ops HQ task T78).

## Break glass (hand it to a developer)
Any web developer can take this over in an afternoon. Point them at:
1. This RUNBOOK.md.
2. `CLAUDE.md` (project rules) and `naming-convention.md` / `design-system.md`.
3. The Ops HQ (`ops/ops-hq/index.html`) for accounts, tasks and how everything fits.
It is plain static HTML - no special skills needed beyond basic web + git.
