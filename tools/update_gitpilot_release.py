"""Refresh data/gitpilot-release.json from GitHub's latest GitPilot release.

The GitPilot page uses this copy when visitors can't reach the GitHub API
(rate limits, blockers). Run it after each GitPilot release, then commit.

    python3 tools/update_gitpilot_release.py
"""
import json
import os
import urllib.request

API = "https://api.github.com/repos/vinayakkam/gitpilot/releases/latest"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "gitpilot-release.json")

req = urllib.request.Request(API, headers={"Accept": "application/vnd.github.html+json", "User-Agent": "olit-site-tools"})
with urllib.request.urlopen(req, timeout=30) as r:
    rel = json.load(r)

slim = {
    "tag_name": rel["tag_name"],
    "name": rel.get("name"),
    "published_at": rel.get("published_at"),
    "html_url": rel.get("html_url"),
    "body_html": rel.get("body_html") or "",
    "assets": [{"name": a["name"], "size": a["size"], "browser_download_url": a["browser_download_url"]} for a in rel.get("assets", [])],
}
with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    json.dump(slim, f, ensure_ascii=False, indent=1)
    f.write("\n")
print("wrote", OUT, slim["tag_name"], len(slim["assets"]), "assets")
