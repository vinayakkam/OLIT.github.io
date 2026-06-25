// Global configuration variables 
const API_CONFIG = {
  baseUrl: 'https://discord-bot-ftbe.onrender.com',
  apiKey: 'Olittech447443456989260909-087'
};

let currentGuildConfig = null;

// Dynamic Dashboard Tab Selection Routing Actions
function switchDashboardTab(event, tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.dashboard-panel').forEach(panel => panel.style.display = 'none');
  
  event.target.classList.add('active');
  const contextPanel = document.getElementById(tabName + 'Panel');
  if (contextPanel) contextPanel.style.display = 'block';
}

// Global Validation Messaging Utilities
function updateConnectionStatus(connected) {
  const indicator = document.getElementById('connectionStatus');
  const text = document.getElementById('connectionText');
  if(!indicator || !text) return;
  
  indicator.className = 'indicator ' + (connected ? 'connected' : 'disconnected');
  text.textContent = connected ? 'Active System Interface Handshake' : 'Endpoint Handshake Denied';
}

// Server Integration Endpoint Verification
async function testConnection() {
  try {
    updateConnectionStatus(false);
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      headers: { 'X-API-Key': API_CONFIG.apiKey, 'Accept': 'application/json' }
    });
    if (response.ok) {
      updateConnectionStatus(true);
      loadStats();
    }
  } catch (error) {
    console.error('Session Connection Failure State:', error);
  }
}

async function testBasicConnection() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/`, { method: 'GET', mode: 'cors' });
    if (response.ok) alert('Primary connectivity link verified successfully.');
  } catch (error) {
    alert('Primary connectivity link down.');
  }
}

// Statistics Data Pull Pipeline
async function loadStats() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/stats`, {
      headers: { 'X-API-Key': API_CONFIG.apiKey }
    });
    if (response.ok) {
      const data = await response.json();
      const stats = data.stats;
      if(document.getElementById('totalGuilds')) {
        document.getElementById('totalGuilds').textContent = stats.total_guilds_configured;
        document.getElementById('totalCommands').textContent = stats.total_custom_commands;
        document.getElementById('totalAutomod').textContent = stats.total_automod_words;
      }
    }
  } catch (error) {
    console.error('Metrics engine exception handling:', error);
  }
}

// Custom Rules Additions Operations
async function addCommand() {
  const guildId = document.getElementById('guildId').value.trim();
  const command = document.getElementById('commandName').value.trim();
  const response = document.getElementById('commandResponse').value.trim();
  if (!guildId || !command || !response) return alert('Input processing error values missing.');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/add_command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, command, response, description: "" })
    });
    const data = await res.json();
    if (data.success) {
      alert('Route successfully saved.');
      loadStats();
    }
  } catch (error) {
    console.error(error);
  }
}

// Automod Verification and Updates Section
async function addAutomodWord() {
  const guildId = document.getElementById('guildId').value.trim();
  const word = document.getElementById('automodWord').value.trim();
  if (!guildId || !word) return;

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/automod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, word, action: 'add' })
    });
    const data = await res.json();
    if (data.success) {
      alert('Item blocked successfully.');
      loadStats();
    }
  } catch (error) {
    console.error(error);
  }
}

async function toggleAutomod(enable) {
  const guildId = document.getElementById('guildId').value.trim();
  if (!guildId) return alert('Context context rule value required');

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/automod_enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, enabled: enable })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('automodStatusText').textContent = enable ? 'Active Filtering Rules Enabled' : 'Inactive Filtering';
    }
  } catch (error) {
    console.error(error);
  }
}

// Welcome Target Setup Handling Action
async function setWelcomeChannel() {
  const guildId = document.getElementById('guildId').value.trim();
  const channelId = document.getElementById('welcomeChannelId').value.trim();
  if (!guildId || !channelId) return;

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/welcome_channel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.apiKey },
      body: JSON.stringify({ guild_id: guildId, channel_id: channelId })
    });
    const data = await res.json();
    if (data.success) alert('Onboarding targets updated.');
  } catch (error) {
    console.error(error);
  }
}

// Modal Interaction Event Triggers
function openBugModal() {
  const targetModal = document.getElementById('bugModal');
  if(targetModal) targetModal.style.display = 'flex';
}

function closeBugModal() {
  const targetModal = document.getElementById('bugModal');
  if(targetModal) targetModal.style.display = 'none';
}

// Bug Reporting Form Submission Pipeline
const bugForm = document.getElementById('bugReportForm');
if(bugForm) {
  bugForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = {
      username: document.getElementById('username').value,
      bugType: document.getElementById('bugType').value,
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      timestamp: new Date().toISOString()
    };

    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnkCjVA5LUQKAZSMQyLzWcD45mrx4sSc_MLU1nIdtYIzTe1DUFDL28sUOlQOLCLNXj5w/exec';
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('Bug trace reported successfully.');
      closeBugModal();
    } catch (error) {
      alert('Reporting asset failed to submit details.');
    }
  });
}

// Set global footer years
document.querySelectorAll(".auto-year").forEach(el => {
  el.textContent = new Date().getFullYear();
});
