# olittechnologies.co.in

Source for [olittechnologies.co.in](https://olittechnologies.co.in), the portfolio of K Vinayak Kamath and home of OLIT Technologies projects. Hosted on GitHub Pages.

| Path | What |
| --- | --- |
| `/` | Portfolio and projects |
| `/bot/` | OLIT Discord bot: landing page, dashboard and per-server settings |
| `/projects/git-pilot/` | GitPilot, a desktop Git client for Windows and Linux |
| `/projects/droplink/` | DropLink, peer-to-peer file transfer for Windows and Linux |
| `/projects/olit-ai/` | OLIT AI chat console (needs its Flask backend) |
| `https://latchverify.olittechnologies.co.in` | LatchVerify, linked from the top bar (its own site) |

## Run locally

```sh
python -m http.server 8000
```

Open http://localhost:8000. Static HTML, CSS and JavaScript. No build step.

## Structure

```
assets/css/site.css   shared design system (light and dark themes)
assets/js/            site chrome and command palette, Discord login, bot API client, UI helpers
assets/img/           logo, profile photo and SVG icon sprite
data/projects.json    project cards on the home page
data/*-release.json   fallback copies of the latest GitPilot and DropLink releases
bot/                  bot landing page and dashboard
projects/             GitPilot, DropLink and OLIT AI
tools/                asset versioning and release-data scripts
```

## Deploy

Push to `main`. GitHub Pages publishes the repo root.

Before pushing a change to anything in `assets/`, run `python3 tools/version_assets.py` so visitors don't get new pages with old CSS or JavaScript.

## After a GitPilot or DropLink release

The download pages read the latest release from the GitHub API and fall back to a copy in `data/` when it can't be reached. Refresh that copy and commit it:

```sh
python3 tools/update_gitpilot_release.py
python3 tools/update_droplink_release.py
```

## Add a project

1. Create `projects/<slug>/index.html` using `/assets/css/site.css`.
2. Add an entry to `data/projects.json`.
3. Add the URL to `sitemap.xml` and a palette entry to `COMMANDS` in `assets/js/site.js`.
4. Add it to the top bar and footer of every page (they are copied into each page), then run `python3 tools/version_assets.py` if you changed `assets/`.
