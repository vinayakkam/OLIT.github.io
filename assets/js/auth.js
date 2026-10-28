// auth.js — Discord OAuth2 implicit-grant login for the bot dashboard

// ─── CONFIG ────────────────────────────────────────────────────────────────
// CLIENT_ID is the Discord application client ID.
// The redirect URI must match one registered in the Discord developer portal.
const DISCORD_CLIENT_ID = '1414168461172539454';
const REDIRECT_URI = window.location.origin + '/callback.html';

const DISCORD_SCOPES = ['identify', 'guilds'].join('%20');
const DISCORD_AUTH_URL =
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=token` +
  `&scope=${DISCORD_SCOPES}`;

// Invite link for adding the bot to a server.
const BOT_INVITE_URL =
  `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
  `&permissions=8&integration_type=0&scope=applications.commands+bot`;

const MANAGE_GUILD = 0x20n;

// ─── Storage helpers ────────────────────────────────────────────────────────
function readJSON(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}

const Auth = {
  inviteUrl: BOT_INVITE_URL,

  getToken()  { return sessionStorage.getItem('discord_token'); },
  getUser()   { return readJSON('discord_user'); },
  getGuilds() { return readJSON('discord_guilds'); },

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

  isLoggedIn() { return !!this.getToken() && !!this.getUser(); },

  login() { window.location.href = DISCORD_AUTH_URL; },

  logout() {
    this.clear();
    window.location.href = '/bot/';
  },

  // Called on callback.html after the OAuth redirect. Throws with a readable message on failure.
  async handleCallback() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('error')) throw new Error(params.get('error_description') || params.get('error'));
    const token = params.get('access_token');
    if (!token) throw new Error('No access token found. Try logging in again.');

    const headers = { Authorization: `Bearer ${token}` };
    const [userRes, guildsRes] = await Promise.all([
      fetch('https://discord.com/api/v10/users/@me',        { headers }),
      fetch('https://discord.com/api/v10/users/@me/guilds', { headers }),
    ]);
    if (!userRes.ok) throw new Error('Could not load your Discord profile.');
    if (!guildsRes.ok) throw new Error('Could not load your Discord servers.');
    this.save(token, await userRes.json(), await guildsRes.json());
  },

  avatarUrl(user) {
    if (!user?.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
  },

  iconUrl(guild) {
    if (!guild?.icon) return null;
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`;
  },

  // Guilds where the user is owner or has MANAGE_GUILD. Discord sends permissions as a decimal string.
  managedGuilds() {
    return (this.getGuilds() || []).filter(g => {
      if (g.owner) return true;
      try { return (BigInt(g.permissions || '0') & MANAGE_GUILD) !== 0n; }
      catch { return false; }
    });
  }
};

window.Auth = Auth;
