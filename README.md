# olittechnologies.co.in

Source for [olittechnologies.co.in](https://olittechnologies.co.in), the portfolio of K Vinayak Kamath and home of OLIT Technologies projects. Hosted on GitHub Pages.

| Path | What |
| --- | --- |
| `/` | Portfolio and projects |
| `/bot/` | OLIT Discord bot: landing page, dashboard and per-server settings |
| `/projects/git-pilot/` | GitPilot, a desktop Git client for Windows and Linux |
| `/projects/olit-ai/` | OLIT AI chat console (needs its Flask backend) |

## Run locally

```sh
python -m http.server 8000
```

Open http://localhost:8000. Static HTML, CSS and JavaScript. No build step.

## Structure

```
assets/css/site.css   shared design system
assets/js/            Discord login, bot API client, UI helpers
assets/img/           logo and profile photo
data/projects.json    project cards on the home page
bot/                  bot landing page and dashboard
projects/             GitPilot and OLIT AI
```

## Deploy

Push to `main`. GitHub Pages publishes the repo root.

## Add a project

1. Create `projects/<slug>/index.html` using `/assets/css/site.css`.
2. Add an entry to `data/projects.json`.
3. Add the URL to `sitemap.xml`.
