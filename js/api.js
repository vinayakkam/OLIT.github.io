// api.js — OLIT Bot API client

const API_BASE = 'https://api.olittechnologies.co.in:5023';
const API_KEY  = 'Olittech447443456989260909-087';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...(options.headers || {})
  };
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (e) {
    throw e;
  }
}

const API = {
  health: () => apiFetch('/health'),
  stats:  () => apiFetch('/api/stats'),
  logs:   (limit = 50) => apiFetch(`/api/logs?limit=${limit}`),

  config: (guildId) => apiFetch(`/api/config/${guildId}`),

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
