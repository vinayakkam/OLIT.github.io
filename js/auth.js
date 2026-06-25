// auth.js — Discord OAuth2 PKCE flow

// ─── CONFIG ────────────────────────────────────────────────────────────────
// Replace CLIENT_ID with your Discord application client ID
// Redirect URI must match what's registered in the Discord developer portal
const DISCORD_CLIENT_ID = '1414168461172539454';
const REDIRECT_URI      = (() => {
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  return `${base}/callback.html`;
})();

const DISCORD_SCOPES = ['identify', 'guilds'].join('%20');
const DISCORD_AUTH_URL =
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=token` +
  `&scope=${DISCORD_SCOPES}`;

// ─── Storage helpers ────────────────────────────────────────────────────────
const Auth = {
  getToken()  { return sessionStorage.getItem('discord_token'); },
  getUser()   { const u = sessionStorage.getItem('discord_user');  return u ? JSON.parse(u) : null; },
  getGuilds() { const g = sessionStorage.getItem('discord_guilds'); return g ? JSON.parse(g) : null; },

  save(token, user, guilds) {
    sessionStorage.setItem('discord_token', token);
    sessionStorage.setItem('discord_user',  JSON.stringify(user));
    sessionStorage.setItem('discord_guilds', JSON.stringify(guilds));
  },

  clear() {
    sessionStorage.removeItem('discord_token');
    sessionStorage.removeItem('discord_user');
    sessionStorage.removeItem('discord_guilds');
  },

  isLoggedIn() { return !!this.getToken(); },

  login() { window.location.href = DISCORD_AUTH_URL; },

  logout() {
    this.clear();
    window.location.href = 'index.html';
  },

  // Called on callback.html after OAuth redirect
  async handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (!token) return false;

    try {
      const [userRes, guildsRes] = await Promise.all([
        fetch('https://discord.com/api/v10/users/@me',         { headers: { Authorization: `Bearer ${token}` } }),
        fetch('https://discord.com/api/v10/users/@me/guilds',  { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const user   = await userRes.json();
      const guilds = await guildsRes.json();
      this.save(token, user, guilds);
      return true;
    } catch {
      return false;
    }
  },

  avatarUrl(user) {
    if (!user?.avatar) return `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 6n}.png`;
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
  },

  iconUrl(guild) {
    if (!guild?.icon) return null;
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`;
  },

  // Filter guilds where user has MANAGE_GUILD (0x20)
  managedGuilds() {
    return (this.getGuilds() || []).filter(g => (g.permissions & 0x20) === 0x20 || g.owner);
  }
};

window.Auth = Auth;
