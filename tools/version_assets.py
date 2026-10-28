"""Stamp shared asset URLs with a content hash (?v=...) so browsers fetch new files after each deploy.

The site is served with a long cache lifetime, so without this a visitor can get new HTML with an old
stylesheet. Run from the repo root after changing anything in assets/:  python3 tools/version_assets.py
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSET = re.compile(r'/assets/(css/site\.css|js/[a-z]+\.js|img/icons\.svg)(\?v=[0-9a-f]+)?')

def digest(rel):
    return hashlib.sha256((ROOT / 'assets' / rel).read_bytes()).hexdigest()[:10]

def stamp(path):
    text = path.read_text(encoding='utf-8')
    new = ASSET.sub(lambda m: f'/assets/{m.group(1)}?v={digest(m.group(1))}', text)
    if new != text:
        path.write_text(new, encoding='utf-8')
        print('stamped', path.relative_to(ROOT))

# JS files reference icons.svg, so stamp them before hashing them for the HTML.
for js in sorted((ROOT / 'assets/js').glob('*.js')):
    stamp(js)
for html in sorted(ROOT.rglob('*.html')):
    if '.git' not in html.parts:
        stamp(html)
