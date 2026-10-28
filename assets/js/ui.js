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
        <span class="text-sm truncate" style="max-width:140px;font-weight:500">${UI.escape(user.global_name || user.username)}</span>
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

  discordIcon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>',
};

window.UI = UI;

// Footer year on every page that loads ui.js.
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
