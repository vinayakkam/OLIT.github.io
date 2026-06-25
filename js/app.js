const API_CONFIG = {
  baseUrl: 'https://discord-bot-ftbe.onrender.com',
  apiKey: 'Olittech447443456989260909-087'
};

let currentGuildConfig = null;

// Tab Routing Actions Functionality Restoration
function switchTab(event, tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
  
  event.target.classList.add('active');
  const destination = document.getElementById(tabName + 'Panel');
  if (destination) destination.style.display = 'block';
}

// Alert Message Dispatcher
function displayPanelAlert(elementId, type, message) {
  const alertEl = document.getElementById(elementId);
  if (!alertEl) return;
  alertEl.className = `alert alert-${type}`;
  alertEl.textContent = message;
  alertEl.style.display = 'block';
  setTimeout(() => alertEl.style.display = 'none', 5000);
}

function updateConnectionStatus(connected) {
  const indicator = document.getElementById('connectionStatus');
  const text = document.getElementById('connectionText');
  if (!indicator || !text) return;
  indicator.className = 'indicator-dot ' + (connected ? 'connected' : 'disconnected');
  text.textContent = connected ? 'Active System Node Connected' : 'System Node Link Refused';
}

// Verification Handshakes 
async function testConnection() {
  try {
    displayPanelAlert('connectionAlert', 'success', 'Requesting API status trace...');
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      headers: { 'X-API-Key': API_CONFIG.apiKey, 'Accept': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      displayPanelAlert('connectionAlert', 'success', `✅ Active System Authenticated! Cluster state: ${data.status}`);
      updateConnectionStatus(true);
      refreshDashboardStats();
    } else {
      const txt = await response.text();
      displayPanelAlert('connectionAlert', 'error', `❌ Auth verification failed: ${response.status} - ${txt}`);
      updateConnectionStatus(false);
    }
  } catch (error) {
    displayPanelAlert('connectionAlert', 'error', `❌ API endpoint unreachable: ${error.message}`);
    updateConnectionStatus(false);
  }
}

async function testBasicConnection() {
  try {
    displayPanelAlert('connectionAlert', 'success', 'Sending raw ping payload...');
    const response = await fetch(`${API_CONFIG.baseUrl}/`, { method: 'GET', mode: 'cors' });
    if (response.ok) {
      displayPanelAlert('connectionAlert', 'success', '✅ Operational target link established safely. Run full verification.');
    } else {
      displayPanelAlert('connectionAlert', 'error', `⚠️ Destination responded with error code status: ${response.status}`);
    }
  } catch (error) {
    displayPanelAlert('connectionAlert', 'error', `❌ Trace failed: ${error.message}`);
  }
}

// Master Metric Refresh Routines
async function refreshDashboardStats() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/stats`, {
      headers: { 'X-API-Key': API_CONFIG.apiKey }
    });
    if (response.ok) {
      const res = await response.json();
      const stats = res.stats;
      if (document.getElementById('totalGuilds')) {
        document.getElementById('totalGuilds').textContent = stats.total_guilds_configured;
        document.getElementById('totalCommands').textContent = stats.total_custom_commands;
        document.getElementById('totalAutomod').textContent = stats.total_automod_words;
        document.getElementById('totalUsers').textContent = stats.total_allowed_users;
        document.getElementById('totalAutomodEnabled').textContent = stats.automod_enabled_guilds;
        document.getElementById('totalWelcome').textContent = stats.welcome_channels_configured;
      }
    }
  } catch (err) {
    console.error('System Metrics Collection Fault:', err);
  }
}

// Global Core Guild Layout Configuration Loading
async function loadGuildConfig() {
  const guildId = document.getElementById('guildId').value.trim();
  if (!guildId) return alert('Target context identification snowflake parameter required.');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/config/${guildId}`, {
      headers: { 'X-API-Key': API_CONFIG.apiKey }
    });
    const data = await res.json();
    if (data.success) {
      currentGuildConfig = data.config;
      renderCustomCommands(data.config.commands);
      renderAutomodWords(data.config.automod_words);
      renderAllowedUsers(data.config.allowed_users);
      renderWelcomeState(data.config.welcome_channel);
      
      const statusText = document.getElementById('automodStatusText');
      if (statusText) {
        statusText.textContent = data.config.automod_enabled ? 'Enabled' : 'Disabled';
        statusText.style.color = data.config.automod_enabled ? 'var(--accent-cyan)' : 'var(--accent-pink)';
      }
    }
  } catch (error) {
    console.error('Data pull compilation fault tracking:', error);
  }
}

// RESTORED RENDERING LOOPS FOR REMOVED SECTIONS
function renderCustomCommands(commands) {
  const list = document.getElementById('commandsList');
  if (!list) return;
  if (Object.keys(commands).length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">No commands active inside selected cluster context.</p>';
    return;
  }
  list.innerHTML = Object.entries(commands).map(([cmd, item]) => `
    <div class="list-item">
      <div class="list-content">
        <h4>!${cmd}</h4>
        <p>${item.response}</p>
        ${item.description ? `<small>${item.description}</small>` : ''}
      </div>
      <button class="btn btn-danger" onclick="removeCommand('${cmd}')">Remove</button>
    </div>
  `).join('');
}

function renderAutomodWords(words) {
  const list = document.getElementById('automodList');
  if (!list) return;
  if (words.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">No terms logged.</p>';
    return;
  }
  list.innerHTML = words.map(w => `
    <div class="list-item">
      <div class="list-content"><h4 style="color: var(--accent-pink)">${w}</h4></div>
      <button class="btn btn-danger" onclick="removeAutomodWord('${w}')">Remove</button>
    </div>
  `).join('');
}

function renderAllowedUsers(users) {
  const list = document.getElementById('usersList');
  if (!list) return;
  if (users.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">No authorization records saved.</p>';
    return;
  }
  list.innerHTML = users.map(u => `
    <div class="list-item">
      <div class="list-content"><p>User SnowFlake ID: <strong>${u}</strong></p></div>
      <button class="btn btn-danger" onclick="removeAllowedUser('${u}')">Revoke Access</button>
    </div>
  `).join('');
}

function renderWelcomeState(channelId) {
  const display = document.getElementById('welcomeCurrentChannel');
  const inp = document.getElementById('welcomeChannelId');
  if (!display) return;
  if (channelId) {
    if (inp) inp.value = channelId;
    display.innerHTML = `<div class="list-item"><div class="list-content"><p>Target Channel Context Reference Key: <strong>${channelId}</strong></p></div></div>`;
  } else {
    if (inp) inp.value = '';
    display.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">No onboard context mapping exists.</p>';
  }
}

// Interactive API Updates Pipeline Elements
async function addCommand() {
  const guildId = document.getElementById('guildId').value.trim();
  const command = document.getElementById('commandName').value.trim();
  const response = document.getElementById('commandResponse').value.trim();
  const description = document.getElementById('commandDescription').value.trim();
  if (!guildId || !command || !response) return displayPanelAlert('commandAlert', 'error', 'Required variables are unpopulated.');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/add_command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, command, response, description })
    });
    const d = await res.json();
    if (d.success) {
      displayPanelAlert('commandAlert', 'success', d.message);
      document.getElementById('commandName').value = '';
      document.getElementById('commandResponse').value = '';
      document.getElementById('commandDescription').value = '';
      loadGuildConfig();
      refreshDashboardStats();
    }
  } catch (err) { displayPanelAlert('commandAlert', 'error', err.message); }
}

async function removeCommand(command) {
  const guildId = document.getElementById('guildId').value.trim();
  if (!confirm(`Confirm action processing termination on route: "${command}"?`)) return;
  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/remove_command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, command })
    });
    if (res.ok) { loadGuildConfig(); refreshDashboardStats(); }
  } catch (e) { console.error(e); }
}

async function addAutomodWord() {
  const guildId = document.getElementById('guildId').value.trim();
  const word = document.getElementById('automodWord').value.trim();
  if (!guildId || !word) return displayPanelAlert('automodAlert', 'error', 'Missing inputs.');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/automod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, word, action: 'add' })
    });
    if (res.ok) {
      document.getElementById('automodWord').value = '';
      loadGuildConfig();
      refreshDashboardStats();
    }
  } catch (e) { console.error(e); }
}

async function removeAutomodWord(word) {
  const guildId = document.getElementById('guildId').value.trim();
  try {
    await fetch(`${API_CONFIG.baseUrl}/api/automod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, word, action: 'remove' })
    });
    loadGuildConfig();
    refreshDashboardStats();
  } catch (e) { console.error(e); }
}

async function toggleAutomod(enable) {
  const guildId = document.getElementById('guildId').value.trim();
  if (!guildId) return displayPanelAlert('automodAlert', 'error', 'No context ID.');
  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/automod_enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, enabled: enable })
    });
    if (res.ok) { loadGuildConfig(); refreshDashboardStats(); }
  } catch (e) { console.error(e); }
}

async function addAllowedUser() {
  const guildId = document.getElementById('guildId').value.trim();
  const userId = document.getElementById('userId').value.trim();
  if (!guildId || !userId) return displayPanelAlert('usersAlert', 'error', 'Missing properties.');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/allowed_users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, user_id: userId, action: 'add' })
    });
    if (res.ok) {
      document.getElementById('userId').value = '';
      loadGuildConfig();
      refreshDashboardStats();
    }
  } catch (e) { console.error(e); }
}

async function removeAllowedUser(userId) {
  const guildId = document.getElementById('guildId').value.trim();
  try {
    await fetch(`${API_CONFIG.baseUrl}/api/allowed_users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, user_id: userId, action: 'remove' })
    });
    loadGuildConfig();
    refreshDashboardStats();
  } catch (e) { console.error(e); }
}

async function setWelcomeChannel() {
  const guildId = document.getElementById('guildId').value.trim();
  const channelId = document.getElementById('welcomeChannelId').value.trim();
  if (!guildId || !channelId) return displayPanelAlert('welcomeAlert', 'error', 'Parameters missing.');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/welcome_channel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, channel_id: channelId })
    });
    if (res.ok) { loadGuildConfig(); refreshDashboardStats(); }
  } catch (e) { console.error(e); }
}

// RESTORED SYSTEM ROUTE LOG ANALYSIS
async function loadLogs() {
  const list = document.getElementById('logsList');
  if(!list) return;
  try {
    list.innerHTML = '<p style="color: var(--text-muted)">Requesting node trace stream metrics...</p>';
    const res = await fetch(`${API_CONFIG.baseUrl}/api/logs?limit=20`, {
      headers: { 'X-API-Key': API_CONFIG.apiKey }
    });
    const data = await res.json();
    if (data.success) {
      if (data.logs.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted)">Log registers clear.</p>';
        return;
      }
      list.innerHTML = data.logs.reverse().map(l => `
        <div class="list-item" style="font-family: monospace; font-size: 0.85rem;">
          <div>
            <span style="color: var(--accent-cyan); font-weight:700;">${l.method}</span> 
            <span style="color: #fff">${l.endpoint}</span>
            <div style="color: var(--text-muted); font-size: 0.75rem; margin-top:0.25rem;">${l.timestamp} | IP: ${l.ip}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) { list.innerHTML = `<p style="color: var(--accent-pink)">Log failure: ${err.message}</p>`; }
}

// Modals Setup Actions
function openBugModal() { const m = document.getElementById('bugModal'); if (m) m.style.display = 'flex'; }
function closeBugModal() { const m = document.getElementById('bugModal'); if (m) m.style.display = 'none'; }

const bForm = document.getElementById('bugReportForm');
if (bForm) {
  bForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const payload = {
      username: document.getElementById('username').value,
      bugType: document.getElementById('bugType').value,
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      timestamp: new Date().toISOString()
    };
    try {
      await fetch('https://script.google.com/macros/s/AKfycbwnkCjVA5LUQKAZSMQyLzWcD45mrx4sSc_MLU1nIdtYIzTe1DUFDL28sUOlQOLCLNXj5w/exec', {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      alert('Bug data transmitted.');
      closeBugModal();
    } catch (err) { alert('Transmission failure.'); }
  });
}

// Copyright Date Automation Hook
document.querySelectorAll(".auto-year").forEach(el => {
  el.textContent = new Date().getFullYear();
});
