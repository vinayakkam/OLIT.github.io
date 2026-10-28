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

- `index.html` — home: K Vinayak Kamath's portfolio. Hero and key facts, Selected work (from `data/projects.json`), Open source (live from the GitHub API, cached in sessionStorage for an hour), Education, Contact (with copy-email).
- `bot/` — OLIT Discord bot.
  - `index.html` — landing page with live API status and usage stats, features, how it works, team and FAQ.
  - `dashboard.html` — after login: guilds the user manages (sorted, `/` focuses search), bot stats and health.
  - `server.html?id=<guild>#<panel>` — per-guild config (custom commands with search, automod, exempt users, welcome channel, logs, JSON export). The URL hash keeps the open panel.
- `callback.html` — Discord OAuth redirect target. Calls `Auth.handleCallback()`, then goes to `/bot/dashboard.html`.
- `privacy.html`, `terms.html`, `404.html` — legal pages and GitHub Pages' not-found page.
- `projects/git-pilot/` — GitPilot download page. Pulls the latest release from the GitHub API (`vinayakkam/gitpilot`) and fills in links through `data-*` hooks. A second script highlights the download for the visitor's OS.
- `projects/olit-ai/` — OLIT AI chat app + login. Standalone: own inline CSS, relative paths, `API_BASE = ''`. It is meant to be served by its Flask backend, and its API calls do not work on GitHub Pages.
- `assets/css/site.css` — the design system. Tokens on `:root` (light default; dark from the OS or `[data-theme="dark"]`), header/footer, command palette, buttons, cards, rule grids, forms, toggle, lists, toasts, utilities.
- `assets/js/site.js` — loaded on every page: theme toggle (saved in localStorage `theme`), mobile menu, footer year, command palette (Ctrl/Cmd+K and the header search button; edit `COMMANDS` to add entries).
- `assets/js/auth.js` — `window.Auth`: Discord OAuth2 implicit flow (scopes `identify guilds`), sessionStorage, `managedGuilds()` (owner or MANAGE_GUILD, BigInt).
- `assets/js/api.js` — `window.API`: bot backend client for `https://api.olittechnologies.co.in`, sends `X-API-Key`.
- `assets/js/ui.js` — `window.UI`: `escape()`, nav user badge, toasts, confirm, initials.
- `assets/img/icons.svg` — SVG sprite. Use `<svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg#name"/></svg>`.
- `data/projects.json` — work list: `slug`, `name`, `icon` (sprite id), `status`, `tagline`, `tags`, `link` (root-absolute), `external`.
- Redirect stubs for old URLs: `dashboard.html`, `server.html` (keeps the query), `projects/index.html`, `projects/portfolio/index.html`.
- `robots.txt`, `sitemap.xml`.

## Design rules

- Editorial and restrained: Geist / Geist Mono, ink-on-paper neutrals, one orange accent, 1px rules. No gradients, glows, emoji icons or decorative backgrounds.
- Primary buttons are ink (`.btn-primary`). The accent is for small markers (section numbers, active states, focus ring), not large fills.
- Use the tokens (`var(--text-1)`, `var(--bg-1)`, `var(--border)`…), never raw colors, so both themes keep working.
- Sections use `.section` + `.section-grid` with a numbered `.section-label`.

## Conventions

- Every page except OLIT AI loads `/assets/css/site.css` and `/assets/js/site.js`, and sets `data-theme` in a tiny inline `<head>` script before paint. Page-specific CSS goes in a `<style>` block in that page.
- Header (`.site-header`) and footer (`.site-footer`) markup is copied into each page. When changing it, update all pages.
- Bot pages load `auth.js`, then `ui.js`, then `api.js`. Page logic is an inline `<script>` at the bottom of the page.
- Escape any API, Discord, GitHub or JSON data with `UI.escape()` (or the page's `esc()`) before putting it in `innerHTML`. Use `data-*` attributes + `addEventListener`, never inline `onclick` with interpolated values.
- To add a project: create `projects/<slug>/index.html`, add an entry to `data/projects.json`, `sitemap.xml` and the palette `COMMANDS` in `site.js`.

## Do not break

- `/callback.html` must stay at that path. `origin + '/callback.html'` is registered as the redirect URI in the Discord developer portal, for every origin used (including localhost).
- `/privacy.html` and `/terms.html` are likely linked from the Discord app listing.
- sessionStorage keys `discord_token`, `discord_user`, `discord_guilds`; OLIT AI's localStorage key `olit_nexus_auth`.
- GitPilot's `data-asset`, `data-install`, `data-rel-*` and `data-version-*` hooks are read by its release script.

## Gotchas

- Everything here is public. The `API_KEY` in `assets/js/api.js` and the Discord client ID ship to every visitor, so real authorization must happen on the backend.
- The repo has no test suite. To check a change, serve the site locally and load the pages in a browser. Mock `api.olittechnologies.co.in` and `api.github.com` rather than hitting them.
