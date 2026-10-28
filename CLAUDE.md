# CLAUDE.md

Static website for OLIT Technologies, served by GitHub Pages at `olittechnologies.co.in` (see `CNAME`).
Plain HTML/CSS/vanilla JS. No build step, no package manager, no framework.

## Run locally

```sh
python -m http.server 8000   # then open http://localhost:8000
```

Serve from the repo root. Pages use root-absolute paths (`/assets/...`, `/bot/...`), so they break under `file://` or a sub-path.
Deploy = push to `main`. GitHub Pages serves the repo root as-is.

## Layout

- `index.html` — home: K Vinayak Kamath's portfolio, plus a Projects section rendered from `data/projects.json`. three.js r128 (cdnjs) draws the background.
- `bot/` — OLIT Discord bot.
  - `index.html` — landing page.
  - `dashboard.html` — after login: guilds the user manages, bot stats and health.
  - `server.html?id=<guild>` — per-guild config (custom commands, automod, exempt users, welcome channel, logs).
- `callback.html` — Discord OAuth redirect target. Calls `Auth.handleCallback()`, then goes to `/bot/dashboard.html`.
- `privacy.html`, `terms.html`, `404.html` — legal pages and GitHub Pages' not-found page.
- `projects/git-pilot/` — GitPilot download page. Pulls the latest release from the GitHub API (`vinayakkam/gitpilot`) and fills in links through `data-*` hooks.
- `projects/olit-ai/` — OLIT AI chat app + login. Standalone: own inline CSS, relative paths, `API_BASE = ''`. It is meant to be served by its Flask backend, and its API calls do not work on GitHub Pages.
- `assets/css/site.css` — the design system. Tokens on `:root` (dark default, light via `prefers-color-scheme`), header/footer, buttons, cards, forms, toggle, lists, toasts, utilities.
- `assets/js/auth.js` — `window.Auth`: Discord OAuth2 implicit flow (scopes `identify guilds`), sessionStorage, `managedGuilds()` (owner or MANAGE_GUILD, BigInt).
- `assets/js/api.js` — `window.API`: bot backend client for `https://api.olittechnologies.co.in`, sends `X-API-Key`.
- `assets/js/ui.js` — `window.UI`: `escape()`, nav user badge, toasts, confirm, initials. Also fills `[data-year]`.
- `data/projects.json` — project cards: `slug`, `name`, `icon`, `tagline`, `tags`, `link` (root-absolute), `external`.
- Redirect stubs for old URLs: `dashboard.html`, `server.html` (keeps the query), `projects/index.html`, `projects/portfolio/index.html`.
- `robots.txt`, `sitemap.xml`.

## Conventions

- Every page except OLIT AI loads `/assets/css/site.css`. Page-specific CSS goes in a `<style>` block in that page.
- The header (`.site-header`) and footer (`.site-footer`) markup is copied into each page. When changing it, update all pages.
- Use the tokens (`var(--accent)`, `var(--bg-1)`, `var(--text-2)`…), never raw colors, so light mode keeps working.
- Bot pages load `auth.js`, then `ui.js`, then `api.js`. Page logic is an inline `<script>` at the bottom of the page.
- Escape any API, Discord or JSON data with `UI.escape()` before putting it in `innerHTML`. Use `data-*` attributes + `addEventListener`, never inline `onclick` with interpolated values.
- To add a project: create `projects/<slug>/index.html` and add an entry to `data/projects.json` (and `sitemap.xml`).

## Do not break

- `/callback.html` must stay at that path. `origin + '/callback.html'` is registered as the redirect URI in the Discord developer portal, for every origin used (including localhost).
- `/privacy.html` and `/terms.html` are likely linked from the Discord app listing.
- sessionStorage keys `discord_token`, `discord_user`, `discord_guilds`; OLIT AI's localStorage key `olit_nexus_auth`.
- GitPilot's `data-asset`, `data-install`, `data-rel-*` and `data-version-*` hooks are read by its release script.

## Gotchas

- Everything here is public. The `API_KEY` in `assets/js/api.js` and the Discord client ID ship to every visitor, so real authorization must happen on the backend.
- The repo has no test suite. To check a change, serve the site locally and load the pages in a browser. Mock `api.olittechnologies.co.in` rather than hitting production.
