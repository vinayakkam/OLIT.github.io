// site.js — page chrome shared by every page: theme toggle, mobile menu, footer year.
// The <head> of each page sets data-theme from localStorage before paint; this file handles changes.

(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.dataset.theme || (media.matches ? 'dark' : 'light');
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: theme lasts for this page only */ }
    });
  });

  // Mobile menu
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.nav-toggle');
  if (toggle) {
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    header.querySelectorAll('.site-nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ── Command palette (Ctrl/Cmd + K) ───────────────────────────────────────
  var COMMANDS = [
    { label: 'Home', hint: 'Portfolio', href: '/' },
    { label: 'Selected work', hint: 'Projects', href: '/#work', keywords: 'projects' },
    { label: 'Open source', hint: 'GitHub repositories', href: '/#open-source', keywords: 'github repos code' },
    { label: 'Contact', hint: 'Email, LinkedIn, GitHub', href: '/#contact', keywords: 'email hire' },
    { label: 'OLIT Bot', hint: 'Discord bot', href: '/bot/', keywords: 'discord' },
    { label: 'Bot dashboard', hint: 'Manage your servers', href: '/bot/dashboard.html', keywords: 'discord login servers settings' },
    { label: 'GitPilot', hint: 'Desktop Git client', href: '/projects/git-pilot/', keywords: 'git' },
    { label: 'Download GitPilot', hint: 'Windows & Linux', href: '/projects/git-pilot/#download', keywords: 'install exe deb appimage' },
    { label: 'OLIT AI', hint: 'AI console', href: '/projects/olit-ai/', keywords: 'chat nexus' },
    { label: 'Privacy Policy', hint: 'Legal', href: '/privacy.html' },
    { label: 'Terms & Conditions', hint: 'Legal', href: '/terms.html' },
    { label: 'Send an email', hint: 'vinayakkamath2006@gmail.com', href: 'mailto:vinayakkamath2006@gmail.com', keywords: 'contact mail' },
    { label: 'GitHub profile', hint: 'github.com/vinayakkam', href: 'https://github.com/vinayakkam', external: true },
    { label: 'Toggle dark mode', hint: 'Theme', action: 'theme', keywords: 'light dark theme' },
  ];

  var palette, input, list, items = [], active = 0, lastFocus = null;

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function build() {
    palette = document.createElement('div');
    palette.className = 'cmdk';
    palette.hidden = true;
    palette.innerHTML =
      '<div class="cmdk-backdrop" data-cmdk-close></div>' +
      '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Search the site">' +
        '<div class="cmdk-search"><svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg?v=ac69379e93#search"/></svg>' +
        '<input type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Search pages and actions…">' +
        '<kbd>Esc</kbd></div>' +
        '<ul class="cmdk-list" id="cmdk-list" role="listbox" aria-label="Results"></ul>' +
      '</div>';
    document.body.appendChild(palette);
    input = palette.querySelector('input');
    list = palette.querySelector('ul');

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); run(items[active]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); } // keep focus inside the dialog
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('[data-index]');
      if (li) run(items[+li.dataset.index]);
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('[data-index]');
      if (li && +li.dataset.index !== active) { active = +li.dataset.index; highlight(); }
    });
    palette.querySelector('[data-cmdk-close]').addEventListener('click', close);
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    items = COMMANDS.filter(function (c) {
      return !q || (c.label + ' ' + c.hint + ' ' + (c.keywords || '')).toLowerCase().indexOf(q) !== -1;
    });
    active = 0;
    list.innerHTML = items.length
      ? items.map(function (c, i) {
          return '<li id="cmdk-' + i + '" role="option" data-index="' + i + '"><span>' + esc(c.label) + '</span><small>' + esc(c.hint) + '</small></li>';
        }).join('')
      : '<li class="cmdk-empty" role="presentation">No results</li>';
    highlight();
  }

  function highlight() {
    list.querySelectorAll('[role="option"]').forEach(function (li) {
      li.setAttribute('aria-selected', String(+li.dataset.index === active));
    });
    var cur = document.getElementById('cmdk-' + active);
    if (cur) { input.setAttribute('aria-activedescendant', cur.id); cur.scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }

  function move(d) {
    if (!items.length) return;
    active = (active + d + items.length) % items.length;
    highlight();
  }

  function run(c) {
    if (!c) return;
    close();
    if (c.action === 'theme') {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
    } else if (c.external) {
      window.open(c.href, '_blank', 'noopener');
    } else {
      window.location.href = c.href;
    }
  }

  function open() {
    if (!palette) build();
    lastFocus = document.activeElement;
    input.value = '';
    render();
    palette.hidden = false;
    document.body.style.overflow = 'hidden';
    input.focus();
  }

  function close() {
    if (!palette || palette.hidden) return;
    palette.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette && !palette.hidden) close(); else open();
    }
  });

  // Search button in the header, next to the theme toggle.
  var actions = document.querySelector('.site-actions');
  var themeBtn = actions && actions.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.setAttribute('aria-label', 'Search the site (Ctrl+K)');
    btn.title = 'Search (Ctrl+K)';
    btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg?v=ac69379e93#search"/></svg>';
    btn.addEventListener('click', open);
    actions.insertBefore(btn, themeBtn);
  }
})();
