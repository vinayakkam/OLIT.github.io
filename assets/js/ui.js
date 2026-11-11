// ui.js — shared UI helpers

const UI = {
  // ── Escape text for use inside innerHTML templates ───────────────────────
  escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  },

  // ── Nav user badge ──────────────────────────────────────────────────────
  renderNav(containerSel = '#nav-user') {
    const el = document.querySelector(containerSel);
    if (!el) return;
    const user = Auth.getUser();
    if (!user) {
      el.innerHTML = `<button type="button" class="btn btn-discord btn-sm" data-action="login">${UI.discordIcon} Log in</button>`;
      el.querySelector('[data-action="login"]').addEventListener('click', () => Auth.login());
      return;
    }
    el.innerHTML = `
      <div class="flex items-center gap-sm">
        <img src="${UI.escape(Auth.avatarUrl(user))}" alt="" width="28" height="28" style="border-radius:50%">
        <span class="text-sm truncate hide-mobile" style="max-width:140px;font-weight:500">${UI.escape(user.global_name || user.username)}</span>
        <button type="button" class="btn btn-ghost btn-sm" data-action="logout">Log out</button>
      </div>`;
    el.querySelector('[data-action="logout"]').addEventListener('click', () => Auth.logout());
  },

  // ── Toast ────────────────────────────────────────────────────────────────
  toast(msg, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[type] || '•'}</span><span>${UI.escape(msg)}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, duration);
  },

  // ── Confirm dialog ───────────────────────────────────────────────────────
  async confirm(msg) {
    return window.confirm(msg);
  },

  // ── Server initials ──────────────────────────────────────────────────────
  serverInitials(name) {
    return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  },

  discordIcon: '<svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg?v=ac69379e93#discord"/></svg>',
};

window.UI = UI;
