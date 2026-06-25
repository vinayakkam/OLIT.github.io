// ui.js — shared UI helpers

const UI = {
  // ── Nav user badge ──────────────────────────────────────────────────────
  renderNav(containerSel = '#nav-user') {
    const el = document.querySelector(containerSel);
    if (!el) return;
    const user = Auth.getUser();
    if (!user) {
      el.innerHTML = `<button class="btn btn-discord btn-sm" onclick="Auth.login()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
        Login with Discord
      </button>`;
    } else {
      el.innerHTML = `
        <div class="flex gap-sm" style="align-items:center">
          <img src="${Auth.avatarUrl(user)}" alt="" style="width:28px;height:28px;border-radius:50%;">
          <span class="text-sm" style="color:var(--text-1);font-weight:500">${user.username}</span>
          <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Logout</button>
        </div>`;
    }
  },

  // ── Toast ────────────────────────────────────────────────────────────────
  toast(msg, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:9999;
        display:flex;flex-direction:column;gap:8px;max-width:320px;`;
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
    t.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:12px 16px;
      background:var(--bg-3);border:1px solid var(--border-strong);
      border-radius:10px;font-size:0.875rem;
      box-shadow:0 4px 20px rgba(0,0,0,0.5);
      animation:slideUp 0.2s ease;`;
    t.innerHTML = `
      <span style="color:${type==='success'?'var(--success)':type==='error'?'var(--danger)':type==='warn'?'var(--warn)':'var(--accent)'};font-weight:700">${icons[type]||'•'}</span>
      <span style="color:var(--text-1);flex:1">${msg}</span>`;
    const style = document.createElement('style');
    style.textContent = `@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;
    if (!document.getElementById('toast-style')) { style.id='toast-style'; document.head.appendChild(style); }
    container.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, duration);
  },

  // ── Inline alert ─────────────────────────────────────────────────────────
  alert(containerSel, msg, type = 'info') {
    const el = document.querySelector(containerSel);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    if (type !== 'error') setTimeout(() => el.innerHTML = '', 5000);
  },

  // ── Confirm dialog ───────────────────────────────────────────────────────
  async confirm(msg) {
    return window.confirm(msg);
  },

  // ── Loading spinner ──────────────────────────────────────────────────────
  spinner(text = 'Loading…') {
    return `<div style="display:flex;align-items:center;gap:10px;color:var(--text-2);padding:24px">
      <div style="width:16px;height:16px;border:2px solid var(--border-strong);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite"></div>
      <span class="text-sm">${text}</span>
    </div>`;
  },

  // ── Server initials ──────────────────────────────────────────────────────
  serverInitials(name) {
    return name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?';
  },
};

window.UI = UI;
// Global spin keyframe
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin{to{transform:rotate(360deg)}}`;
document.head.appendChild(spinStyle);
