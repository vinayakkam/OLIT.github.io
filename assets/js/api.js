// api.js — OLIT Bot API client
//
// This file ships to every visitor, so it holds no secret. It used to carry a
// shared API_KEY, which meant anyone who viewed source had full access to every
// server's configuration — a static site cannot keep a secret, so authorization
// has to be proved per visitor instead.
//
// Each request now carries the signed-in user's own Discord token (see auth.js).
// The backend asks Discord which servers that person actually administers before
// it answers, so a token only ever unlocks that person's own servers.

const API_BASE = 'https://api.olittechnologies.co.in';

/** Thrown when the backend rejects the Discord token, so callers can send the
 *  user back through the login instead of showing a generic error. */
class AuthError extends Error {}

async function apiFetch(path, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const headers = { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) };

  if (auth) {
    const token = Auth.getToken();
    if (!token) throw new AuthError('Sign in with Discord to manage your servers.');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  // Error pages from a proxy may not be JSON; fall back to the status code.
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    // The token is expired or was revoked. Drop it so the UI stops pretending
    // to be logged in.
    Auth.clear();
    throw new AuthError(data.error || 'Your Discord login has expired.');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const API = {
  // ── Public: no credentials, aggregate figures only ──────────────────────
  health:       () => apiFetch('/health', { auth: false }),
  publicStatus: () => apiFetch('/api/public/status', { auth: false }),

  // ── Per-server: requires Manage Server on that guild ────────────────────
  config: (guildId) => apiFetch(`/api/config/${guildId}`),
  guilds: () => apiFetch('/api/guilds'),

  // Logs are scoped to one server and carry no IPs or request bodies.
  logs: (guildId, limit = 50) =>
    apiFetch(`/api/logs?guild_id=${encodeURIComponent(guildId)}&limit=${limit}`),

  addCommand:    (guildId, cmd, response, description) =>
    apiFetch('/api/add_command', { method: 'POST', body: JSON.stringify({ guild_id: guildId, command: cmd, response, description }) }),
  removeCommand: (guildId, cmd) =>
    apiFetch('/api/remove_command', { method: 'POST', body: JSON.stringify({ guild_id: guildId, command: cmd }) }),

  addAutomodWord:    (guildId, word) =>
    apiFetch('/api/automod', { method: 'POST', body: JSON.stringify({ guild_id: guildId, word, action: 'add' }) }),
  removeAutomodWord: (guildId, word) =>
    apiFetch('/api/automod', { method: 'POST', body: JSON.stringify({ guild_id: guildId, word, action: 'remove' }) }),
  setAutomod:        (guildId, enabled) =>
    apiFetch('/api/automod_enable', { method: 'POST', body: JSON.stringify({ guild_id: guildId, enabled }) }),

  addAllowedUser:    (guildId, userId) =>
    apiFetch('/api/allowed_users', { method: 'POST', body: JSON.stringify({ guild_id: guildId, user_id: userId, action: 'add' }) }),
  removeAllowedUser: (guildId, userId) =>
    apiFetch('/api/allowed_users', { method: 'POST', body: JSON.stringify({ guild_id: guildId, user_id: userId, action: 'remove' }) }),

  setWelcomeChannel: (guildId, channelId) =>
    apiFetch('/api/welcome_channel', { method: 'POST', body: JSON.stringify({ guild_id: guildId, channel_id: channelId }) }),

  // Fetch text channels for a guild via the bot (bot must be in the server)
  getChannels: (guildId) => apiFetch(`/api/channels/${guildId}`),
};

window.API = API;
window.AuthError = AuthError;
