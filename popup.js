// FocusBill - Main Popup Logic
// =========================

// State Management
let timerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60, // seconds
  startTime: null,
  sessionType: 'work',
  client: '',
  project: '',
  task: '',
  timerInterval: null
};

let appData = {
  clients: [],
  timeLogs: [],
  expenses: [],
  projects: [],
  blockedSites: [
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'youtube.com',
    'reddit.com',
    'tiktok.com'
  ],
  settings: {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    userName: '',
    userEmail: '',
    defaultRate: 75,
    blockSitesEnabled: true,
    companyAddress: '',
    paymentTerms: 'Payment is due within 30 days of invoice date. Please include the invoice number with your payment.'
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initializeUI();
  setupEventListeners();
  updateUI();
  startBackgroundSync();
});

// Data Management
// ===============

function loadData() {
  chrome.storage.local.get(['appData'], (result) => {
    if (result.appData) {
      appData = { ...appData, ...result.appData };
    }
    updateUI();
    loadTimerState(); // Load timer state after app data
  });
}

function saveData() {
  chrome.storage.local.set({ appData }, () => {
  });
}

function saveTimerState() {
  chrome.storage.local.set({ timerState: {
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused,
    currentTime: timerState.currentTime,
    startTime: timerState.startTime,
    sessionType: timerState.sessionType,
    client: timerState.client,
    project: timerState.project,
    task: timerState.task
  }}, () => {
  });
}

function loadTimerState() {
  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState) {
      timerState = { ...timerState, ...result.timerState };
      
      // If timer was running, resume it
      if (timerState.isRunning && !timerState.isPaused) {
        // Recalculate time based on elapsed time
        if (timerState.startTime) {
          const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
          const sessionDuration = getSessionDuration() * 60;
          timerState.currentTime = Math.max(0, sessionDuration - elapsed);
          
          if (timerState.currentTime > 0) {
            // Resume timer UI
            document.getElementById('start-btn').classList.add('hidden');
            document.getElementById('pause-btn').classList.remove('hidden');
            document.getElementById('stop-btn').classList.remove('hidden');
            document.getElementById('pause-btn').textContent = 'Pause';
            
            // Start interval
            timerState.timerInterval = setInterval(updateTimerDisplay, 1000);
            
            // Restore session info
            document.getElementById('client-select').value = timerState.client;
            document.getElementById('task-description').value = timerState.task;
            document.getElementById('session-type').value = timerState.sessionType;
          } else {
            // Timer expired while popup was closed
            stopTimer();
          }
        }
      } else if (timerState.isRunning && timerState.isPaused) {
        // Show paused state
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('pause-btn').classList.remove('hidden');
        document.getElementById('stop-btn').classList.remove('hidden');
        document.getElementById('pause-btn').textContent = 'Resume';
        
        // Restore session info
        document.getElementById('client-select').value = timerState.client;
        document.getElementById('task-description').value = timerState.task;
        document.getElementById('session-type').value = timerState.sessionType;
      }
      
      updateTimerDisplayText();
    }
  });
}

function getSessionDuration() {
  const type = timerState.sessionType;
  if (type === 'work') {
    return appData.settings.workDuration;
  } else if (type === 'short-break') {
    return appData.settings.shortBreak;
  } else {
    return appData.settings.longBreak;
  }
}

// UI Initialization
// =================

function initializeUI() {
  // Set up tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Populate session type durations
  updateSessionDurations();
  
  // Populate clients dropdowns
  updateClientsUI();
  
  // Populate settings
  updateSettingsUI();
  
  // Populate blocked sites
  updateBlockedSitesUI();
  
  // Update today's stats
  updateTodayStats();
  
  // Update time logs
  updateTimeLogsUI();
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Refresh UI based on tab
  if (tabName === 'tracking') {
    updateTimeLogsUI();
  } else if (tabName === 'invoice') {
    updateInvoiceUI();
  } else if (tabName === 'expenses') {
    updateExpensesUI();
  } else if (tabName === 'projects') {
    updateProjectsUI();
  }
}

// Timer Functions
// ===============

function setupEventListeners() {
  // Timer controls
  document.getElementById('start-btn').addEventListener('click', startTimer);
  document.getElementById('pause-btn').addEventListener('click', pauseTimer);
  document.getElementById('stop-btn').addEventListener('click', stopTimer);

  // Session type change
  document.getElementById('session-type').addEventListener('change', (e) => {
    if (!timerState.isRunning) {
      timerState.sessionType = e.target.value;
      resetTimerDisplay();
    }
  });

  // Client management
  document.getElementById('add-client-btn').addEventListener('click', showClientModal);
  document.getElementById('modal-save-client').addEventListener('click', saveNewClient);
  document.getElementById('modal-cancel').addEventListener('click', hideClientModal);
  document.getElementById('save-client-btn').addEventListener('click', addClientFromSettings);
  document.getElementById('client-select').addEventListener('change', updateProjectDropdown);

  // Blocked sites
  document.getElementById('add-blocked-site-btn').addEventListener('click', addBlockedSite);
  document.getElementById('add-social-media').addEventListener('click', () => addPresetSites('social'));
  document.getElementById('add-news').addEventListener('click', () => addPresetSites('news'));
  document.getElementById('add-entertainment').addEventListener('click', () => addPresetSites('entertainment'));

  // Settings
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('test-invoice-data-btn').addEventListener('click', testInvoiceData);
  document.getElementById('clear-data-btn').addEventListener('click', clearAllData);

  // Invoice
  document.getElementById('generate-invoice-btn').addEventListener('click', generateInvoice);
  document.getElementById('copy-invoice-btn').addEventListener('click', copyInvoiceText);
  document.getElementById('invoice-client-select').addEventListener('change', updateInvoicePreview);
  document.getElementById('invoice-period').addEventListener('change', updateInvoicePreview);
  document.getElementById('hourly-rate').addEventListener('input', updateInvoicePreview);

  // Time filter
  document.getElementById('time-filter').addEventListener('change', updateTimeLogsUI);

  // Expenses
  document.getElementById('add-expense-btn').addEventListener('click', addExpense);
  document.getElementById('export-expenses-btn').addEventListener('click', exportExpenses);

  // Projects
  document.getElementById('create-project-btn').addEventListener('click', createProject);
  document.getElementById('projects-filter').addEventListener('change', updateProjectsUI);
}

function startTimer() {
  const client = document.getElementById('client-select').value;
  const project = document.getElementById('project-select').value;
  const task = document.getElementById('task-description').value;

  if (!client) {
    alert('Please select a client before starting the timer');
    return;
  }

  timerState.isRunning = true;
  timerState.isPaused = false;
  timerState.client = client;
  timerState.project = project || '';
  timerState.task = task;
  timerState.startTime = Date.now();

  // Update blocked sites if enabled
  const blockSites = document.getElementById('block-sites-toggle').checked;
  if (blockSites) {
    chrome.runtime.sendMessage({ 
      action: 'startBlocking',
      sites: appData.blockedSites 
    }, (response) => {
    });
  } else {
  }

  // Update UI
  document.getElementById('start-btn').classList.add('hidden');
  document.getElementById('pause-btn').classList.remove('hidden');
  document.getElementById('stop-btn').classList.remove('hidden');

  // Start countdown
  timerState.timerInterval = setInterval(updateTimerDisplay, 1000);
  
  // Save timer state
  saveTimerState();

  // Notify user
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Focus Session Started',
    message: `Working on: ${task || 'Task'} for ${client}`
  });
}

function pauseTimer() {
  if (timerState.isPaused) {
    // Resume
    timerState.isPaused = false;
    document.getElementById('pause-btn').textContent = 'Pause';
    timerState.timerInterval = setInterval(updateTimerDisplay, 1000);
  } else {
    // Pause
    timerState.isPaused = true;
    document.getElementById('pause-btn').textContent = 'Resume';
    clearInterval(timerState.timerInterval);
  }
  saveTimerState();
}

function stopTimer() {
  const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);

  // Save time log
  if (minutes > 0 && timerState.sessionType === 'work') {
    const log = {
      id: Date.now(),
      clientId: String(timerState.client), // Changed from 'client' to 'clientId' for clarity
      client: String(timerState.client), // Keep both for backward compatibility
      project: timerState.project ? String(timerState.project) : null,
      task: timerState.task,
      duration: minutes,
      date: new Date().toISOString(),
      type: 'billable'
    };

    appData.timeLogs.push(log);
    saveData();

  } else if (minutes === 0) {
    alert('Session was too short (less than 1 minute). Time not logged.');
  }

  // Reset timer
  resetTimer();

  // Stop blocking sites
  chrome.runtime.sendMessage({ action: 'stopBlocking' });

  // Update UI
  updateTodayStats();
  updateTimeLogsUI();

  // Notify
  if (minutes > 0) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Focus Session Completed',
      message: `Great work! You completed ${minutes} minutes.`
    });
  }
}

function resetTimer() {
  clearInterval(timerState.timerInterval);
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.timerInterval = null;
  
  // Clear stored timer state
  chrome.storage.local.remove(['timerState']);

  // Reset display
  document.getElementById('start-btn').classList.remove('hidden');
  document.getElementById('pause-btn').classList.add('hidden');
  document.getElementById('stop-btn').classList.add('hidden');
  
  resetTimerDisplay();
}

function resetTimerDisplay() {
  const type = document.getElementById('session-type').value;
  let duration;
  
  if (type === 'work') {
    duration = appData.settings.workDuration * 60;
  } else if (type === 'short-break') {
    duration = appData.settings.shortBreak * 60;
  } else {
    duration = appData.settings.longBreak * 60;
  }
  
  timerState.currentTime = duration;
  updateTimerDisplayText();
}

function updateTimerDisplay() {
  if (timerState.currentTime > 0) {
    timerState.currentTime--;
    updateTimerDisplayText();
    // Save state every 5 seconds to avoid too many writes
    if (timerState.currentTime % 5 === 0) {
      saveTimerState();
    }
  } else {
    // Timer finished
    stopTimer();
  }
}

function updateTimerDisplayText() {
  const minutes = Math.floor(timerState.currentTime / 60);
  const seconds = timerState.currentTime % 60;
  document.getElementById('timer-display').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateSessionDurations() {
  const select = document.getElementById('session-type');
  select.innerHTML = `
    <option value="work">🎯 Work (${appData.settings.workDuration} min)</option>
    <option value="short-break">☕ Short Break (${appData.settings.shortBreak} min)</option>
    <option value="long-break">🌴 Long Break (${appData.settings.longBreak} min)</option>
  `;
}

// Client Management
// =================

function updateClientsUI() {
  const clientSelect = document.getElementById('client-select');
  const invoiceClientSelect = document.getElementById('invoice-client-select');

  // Clear existing options
  clientSelect.innerHTML = '<option value="">Select client...</option>';
  invoiceClientSelect.innerHTML = '<option value="">Choose a client...</option>';

  // Add clients
  appData.clients.forEach(client => {
    const option = `<option value="${client.id}">${client.name}</option>`;
    clientSelect.innerHTML += option;
    invoiceClientSelect.innerHTML += option;
  });

  // Update project dropdown based on selected client
  updateProjectDropdown();

  // Update clients list in settings
  const clientsList = document.getElementById('clients-list');
  clientsList.innerHTML = '';

  appData.clients.forEach(client => {
    const item = document.createElement('div');
    item.className = 'client-item';
    item.innerHTML = `
      <div class="client-info">
        <div class="client-name">${client.name}</div>
        <div class="client-rate">$${client.rate}/hr</div>
      </div>
      <button onclick="deleteClient(${client.id})">Delete</button>
    `;
    clientsList.appendChild(item);
  });
}

function updateProjectDropdown() {
  const clientSelect = document.getElementById('client-select');
  const projectSelect = document.getElementById('project-select');
  const selectedClient = clientSelect.value;

  projectSelect.innerHTML = '<option value="">No project</option>';

  if (selectedClient) {
    const clientProjects = appData.projects.filter(p =>
      String(p.client) === String(selectedClient) &&
      (p.status === 'active' || p.status === 'planning')
    );

    clientProjects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      projectSelect.appendChild(option);
    });
  }
}

function showClientModal() {
  document.getElementById('client-modal').classList.remove('hidden');
}

function hideClientModal() {
  document.getElementById('client-modal').classList.add('hidden');
  document.getElementById('modal-client-name').value = '';
  document.getElementById('modal-client-rate').value = '';
  document.getElementById('modal-client-email').value = '';
}

function saveNewClient() {
  const name = document.getElementById('modal-client-name').value.trim();
  const rate = parseInt(document.getElementById('modal-client-rate').value) || appData.settings.defaultRate;
  const email = document.getElementById('modal-client-email').value.trim();

  if (!name) {
    alert('Please enter a client name');
    return;
  }

  const client = {
    id: Date.now(),
    name,
    rate,
    email
  };

  appData.clients.push(client);
  saveData();
  updateClientsUI();
  hideClientModal();
}

function addClientFromSettings() {
  const name = document.getElementById('new-client-name').value.trim();
  const rate = parseInt(document.getElementById('new-client-rate').value) || appData.settings.defaultRate;

  if (!name) {
    alert('Please enter a client name');
    return;
  }

  const client = {
    id: Date.now(),
    name,
    rate,
    email: ''
  };

  appData.clients.push(client);
  saveData();
  updateClientsUI();

  // Clear inputs
  document.getElementById('new-client-name').value = '';
  document.getElementById('new-client-rate').value = '';
}

function deleteClient(clientId) {
  if (confirm('Delete this client? This won\'t affect existing time logs.')) {
    appData.clients = appData.clients.filter(c => c.id !== clientId);
    saveData();
    updateClientsUI();
  }
}

// Time Logs
// =========

function updateTodayStats() {
  const today = new Date().toDateString();
  const todayLogs = appData.timeLogs.filter(log => 
    new Date(log.date).toDateString() === today
  );

  const totalMinutes = todayLogs.reduce((sum, log) => sum + log.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  document.getElementById('today-hours').textContent = `${hours}h ${minutes}m`;
  document.getElementById('today-sessions').textContent = todayLogs.length;
}

function updateTimeLogsUI() {
  const filter = document.getElementById('time-filter').value;
  const logsList = document.getElementById('logs-list');
  
  let filteredLogs = filterLogsByPeriod(appData.timeLogs, filter);
  
  if (filteredLogs.length === 0) {
    logsList.innerHTML = '<div class="empty-state"><p>📊 No time logs for this period.</p></div>';
    document.getElementById('total-time').textContent = '0h 0m';
    document.getElementById('billable-time').textContent = '0h 0m';
    return;
  }

  // Sort by date (newest first)
  filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  logsList.innerHTML = '';
  filteredLogs.forEach(log => {
    const client = appData.clients.find(c => c.id == log.client);
    const clientName = client ? client.name : 'Unknown Client';
    const hours = Math.floor(log.duration / 60);
    const minutes = log.duration % 60;
    const dateStr = new Date(log.date).toLocaleString();

    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `
      <div class="log-header">
        <span class="log-client">${clientName}</span>
        <span class="log-duration">${hours}h ${minutes}m</span>
      </div>
      <div class="log-task">${log.task || 'No description'}</div>
      <div class="log-date">${dateStr}</div>
      <div class="log-actions">
        <button class="btn-small" onclick="deleteLog(${log.id})">Delete</button>
      </div>
    `;
    logsList.appendChild(item);
  });

  // Update summary
  const totalMinutes = filteredLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  document.getElementById('total-time').textContent = `${totalHours}h ${totalMins}m`;
  document.getElementById('billable-time').textContent = `${totalHours}h ${totalMins}m`;
}

function filterLogsByPeriod(logs, period) {
  const now = new Date();
  
  if (period === 'today') {
    return logs.filter(log => 
      new Date(log.date).toDateString() === now.toDateString()
    );
  } else if (period === 'week') {
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    return logs.filter(log => new Date(log.date) >= weekAgo);
  } else if (period === 'month') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return logs.filter(log => new Date(log.date) >= monthAgo);
  }
  
  return logs; // 'all'
}

function deleteLog(logId) {
  if (confirm('Delete this time log?')) {
    appData.timeLogs = appData.timeLogs.filter(log => log.id !== logId);
    saveData();
    updateTimeLogsUI();
    updateTodayStats();
  }
}

// Invoice Functions
// ==================

function updateInvoiceUI() {
  updateInvoicePreview();
}

function updateInvoicePreview() {
  const clientId = document.getElementById('invoice-client-select').value;
  const period = document.getElementById('invoice-period').value;
  const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;

  if (!clientId) {
    document.getElementById('preview-hours').textContent = '0.0 hrs';
    document.getElementById('preview-rate').textContent = `$0/hr`;
    document.getElementById('preview-total').textContent = '$0.00';
    return;
  }

  const logs = filterLogsByPeriod(
    appData.timeLogs.filter(log => String(log.client) === String(clientId)),
    period
  );

  const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
  const hours = (totalMinutes / 60).toFixed(1);
  const total = (hours * rate).toFixed(2);

  document.getElementById('preview-hours').textContent = `${hours} hrs`;
  document.getElementById('preview-rate').textContent = `$${rate}/hr`;
  document.getElementById('preview-total').textContent = `$${total}`;
}

function generateInvoice() {
  const clientId = document.getElementById('invoice-client-select').value;
  const period = document.getElementById('invoice-period').value;
  const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;


  if (!clientId) {
    alert('Please select a client');
    return;
  }

  const client = appData.clients.find(c => String(c.id) === String(clientId));

  if (!client) {
    alert('Client not found');
    return;
  }

  // Debug: Show all log client IDs
    logId: log.id,
    clientId: log.client,
    clientIdType: typeof log.client
  })));

  // Filter logs by client with explicit string comparison
  const clientLogs = appData.timeLogs.filter(log => String(log.client) === String(clientId));

  const logs = filterLogsByPeriod(clientLogs, period);

  if (logs.length === 0) {
    alert(`No time logs found for this client in the selected period.\n\n🔍 Debug Info:\nClient ID: ${clientId}\nPeriod: ${period}\nTotal logs in system: ${appData.timeLogs.length}\nLogs for this client: ${clientLogs.length}\n\nCheck browser console (F12) for detailed debug info.`);
    return;
  }

  // Prepare invoice data
  const invoiceData = {
    invoiceNumber: Date.now().toString().slice(-6),
    invoiceDate: new Date().toISOString(),
    fromName: appData.settings.userName || 'Your Business',
    fromEmail: appData.settings.userEmail || 'your@email.com',
    fromAddress: appData.settings.companyAddress || '',
    paymentTerms: appData.settings.paymentTerms || 'Payment is due within 30 days of invoice date. Please include the invoice number with your payment.',
    client: client,
    logs: logs,
    rate: rate,
    period: getPeriodLabel(period)
  };

  // Open invoice in new tab
  const dataStr = encodeURIComponent(JSON.stringify(invoiceData));
  const invoiceUrl = chrome.runtime.getURL(`invoice.html?data=${dataStr}`);
  chrome.tabs.create({ url: invoiceUrl });
}

function getPeriodLabel(period) {
  const labels = {
    'today': 'Today',
    'week': 'This Week',
    'month': 'This Month',
    'custom': 'Custom Period'
  };
  return labels[period] || 'All Time';
}

function generateInvoiceText(client, logs, rate) {
  const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
  const hours = (totalMinutes / 60).toFixed(2);
  const total = (hours * rate).toFixed(2);
  const invoiceDate = new Date().toLocaleDateString();

  let invoice = `
═══════════════════════════════════════════
                  INVOICE
═══════════════════════════════════════════

FROM:
${appData.settings.userName || 'Your Name'}
${appData.settings.userEmail || 'your@email.com'}

TO:
${client.name}
${client.email || ''}

DATE: ${invoiceDate}
INVOICE #: ${Date.now()}

───────────────────────────────────────────
TIME ENTRIES
───────────────────────────────────────────

`;

  logs.forEach(log => {
    const date = new Date(log.date).toLocaleDateString();
    const duration = (log.duration / 60).toFixed(2);
    const lineTotal = (duration * rate).toFixed(2);
    
    invoice += `${date}  |  ${log.task || 'Work'}
Duration: ${duration} hrs @ $${rate}/hr = $${lineTotal}

`;
  });

  invoice += `
───────────────────────────────────────────
SUMMARY
───────────────────────────────────────────

Total Hours:        ${hours} hrs
Hourly Rate:        $${rate}/hr
───────────────────────────────────────────
TOTAL DUE:          $${total}
═══════════════════════════════════════════

Payment is due within 30 days.
Thank you for your business!
`;

  return invoice;
}

function copyInvoiceText() {
  const clientId = document.getElementById('invoice-client-select').value;
  const period = document.getElementById('invoice-period').value;
  const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;

  if (!clientId) {
    alert('Please select a client');
    return;
  }

  const client = appData.clients.find(c => c.id == clientId);
  const logs = filterLogsByPeriod(
    appData.timeLogs.filter(log => log.client == clientId),
    period
  );

  if (logs.length === 0) {
    alert('No time logs found for this period');
    return;
  }

  const invoiceText = generateInvoiceText(client, logs, rate);

  navigator.clipboard.writeText(invoiceText).then(() => {
    alert('Invoice copied to clipboard!');
  }).catch(err => {
    alert('Failed to copy invoice');
  });
}

// Settings Functions
// ==================

function updateSettingsUI() {
  document.getElementById('work-duration').value = appData.settings.workDuration;
  document.getElementById('short-break').value = appData.settings.shortBreak;
  document.getElementById('long-break').value = appData.settings.longBreak;
  document.getElementById('user-name').value = appData.settings.userName || '';
  document.getElementById('user-email').value = appData.settings.userEmail || '';
  document.getElementById('company-address').value = appData.settings.companyAddress || '';
  document.getElementById('default-rate').value = appData.settings.defaultRate;
  document.getElementById('payment-terms').value = appData.settings.paymentTerms || 'Payment is due within 30 days of invoice date. Please include the invoice number with your payment.';
}

function saveSettings() {
  appData.settings.workDuration = parseInt(document.getElementById('work-duration').value) || 25;
  appData.settings.shortBreak = parseInt(document.getElementById('short-break').value) || 5;
  appData.settings.longBreak = parseInt(document.getElementById('long-break').value) || 15;
  appData.settings.userName = document.getElementById('user-name').value.trim();
  appData.settings.userEmail = document.getElementById('user-email').value.trim();
  appData.settings.companyAddress = document.getElementById('company-address').value.trim();
  appData.settings.defaultRate = parseInt(document.getElementById('default-rate').value) || 75;
  appData.settings.paymentTerms = document.getElementById('payment-terms').value.trim();

  saveData();
  updateSessionDurations();
  resetTimerDisplay();

  alert('Settings saved successfully!');
}

function testInvoiceData() {

  const summary = `
📊 Invoice Data Test Results:

✅ User Name: ${appData.settings.userName || '❌ EMPTY'}
✅ User Email: ${appData.settings.userEmail || '❌ EMPTY'}
✅ Company Address: ${appData.settings.companyAddress || '❌ EMPTY (Optional)'}
✅ Payment Terms: ${appData.settings.paymentTerms || '❌ EMPTY'}

Total Clients: ${appData.clients.length}
Total Time Logs: ${appData.timeLogs.length}

Check the browser console (F12) for detailed information.
  `.trim();

  alert(summary);
}

// Blocked Sites Functions
// ========================

function updateBlockedSitesUI() {
  const list = document.getElementById('blocked-sites-list');
  list.innerHTML = '';

  appData.blockedSites.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'blocked-site-item';
    item.innerHTML = `
      <span>${site}</span>
      <button onclick="removeBlockedSite(${index})">Remove</button>
    `;
    list.appendChild(item);
  });
}

function addBlockedSite() {
  const input = document.getElementById('new-blocked-site');
  const site = input.value.trim().toLowerCase();

  if (!site) return;

  // Clean up the URL (remove protocol, www, etc.)
  const cleanSite = site
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

  if (appData.blockedSites.includes(cleanSite)) {
    alert('This site is already blocked');
    return;
  }

  appData.blockedSites.push(cleanSite);
  saveData();
  updateBlockedSitesUI();
  input.value = '';
}

function removeBlockedSite(index) {
  appData.blockedSites.splice(index, 1);
  saveData();
  updateBlockedSitesUI();
}

function addPresetSites(category) {
  const presets = {
    social: [
      'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 
      'tiktok.com', 'snapchat.com', 'linkedin.com',
      'pinterest.com', 'reddit.com'
    ],
    news: [
      'cnn.com', 'bbc.com', 'nytimes.com',
      'theguardian.com', 'reuters.com', 'foxnews.com'
    ],
    entertainment: [
      'youtube.com', 'netflix.com', 'twitch.tv',
      'hulu.com', 'disneyplus.com', 'spotify.com'
    ]
  };

  const sites = presets[category] || [];
  let added = 0;

  sites.forEach(site => {
    if (!appData.blockedSites.includes(site)) {
      appData.blockedSites.push(site);
      added++;
    }
  });

  if (added > 0) {
    saveData();
    updateBlockedSitesUI();
    alert(`Added ${added} sites to your block list`);
  } else {
    alert('All these sites are already in your block list');
  }
}

// Data Management
// ===============

function clearAllData() {
  if (confirm('⚠️ This will delete ALL your data including time logs, clients, and settings. This cannot be undone!\n\nAre you absolutely sure?')) {
    if (confirm('Last chance! Delete everything?')) {
      chrome.storage.local.clear(() => {
        appData = {
          clients: [],
          timeLogs: [],
          blockedSites: ['facebook.com', 'twitter.com', 'instagram.com'],
          settings: {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            userName: '',
            userEmail: '',
            defaultRate: 75,
            blockSitesEnabled: true
          }
        };
        updateUI();
        alert('All data cleared');
      });
    }
  }
}

// Background Sync
// ===============

function startBackgroundSync() {
  // Sync with background script every 5 seconds
  setInterval(() => {
    chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
      // Keep background script alive
    });
  }, 5000);
}

// Update all UI elements
function updateUI() {
  updateClientsUI();
  updateSettingsUI();
  updateBlockedSitesUI();
  updateTodayStats();
  updateTimeLogsUI();
  resetTimerDisplay();
}

// Expenses UI (FREE Premium Feature)
// ===================================

function addExpense() {
  const description = document.getElementById('expense-description').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  const client = document.getElementById('expense-client').value;
  const taxDeductible = document.getElementById('expense-tax-deductible').checked;

  if (!description || !amount || amount <= 0) {
    alert('Please enter a valid description and amount');
    return;
  }

  try {
    const expense = ExpenseTracker.addExpense({
      description,
      amount,
      category,
      client: client || null,
      taxDeductible
    });

    appData.expenses.push(expense);
    saveData();

    // Clear form
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-tax-deductible').checked = true;

    updateExpensesUI();
    alert(`Expense "${description}" added successfully!`);
  } catch (error) {
    console.error('Error adding expense:', error);
    alert('Error adding expense: ' + error.message);
  }
}

function updateExpensesUI() {

  // Populate client dropdown for expenses
  const expenseClientSelect = document.getElementById('expense-client');
  expenseClientSelect.innerHTML = '<option value="">General Business Expense</option>';
  appData.clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.name;
    expenseClientSelect.appendChild(option);
  });

  // Calculate this month's expenses
  const thisMonthExpenses = ExpenseTracker.getExpensesByPeriod(appData.expenses, 'month');
  const totalExpenses = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate revenue for this month
  const now = new Date();
  const thisMonthLogs = appData.timeLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  });

  let totalRevenue = 0;
  thisMonthLogs.forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    if (client) {
      totalRevenue += (log.duration / 60) * client.rate;
    }
  });

  // Update summary
  const netIncome = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0;

  document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById('net-income').textContent = `$${netIncome.toFixed(2)}`;
  document.getElementById('profit-margin').textContent = `${margin}%`;

  // Update expense breakdown by category
  const byCategory = ExpenseTracker.getExpensesByCategory(thisMonthExpenses);
  const breakdownContainer = document.getElementById('expense-breakdown');

  if (Object.keys(byCategory).length === 0) {
    breakdownContainer.innerHTML = '<p class="empty-text">No expenses recorded yet</p>';
  } else {
    breakdownContainer.innerHTML = '';
    Object.entries(byCategory)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([categoryId, data]) => {
        const categoryInfo = ExpenseTracker.categories.find(c => c.id === categoryId);
        const percentage = totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(0) : 0;

        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
          <div>
            <div class="category-name">${categoryInfo ? categoryInfo.name : categoryId}</div>
            <div class="category-stats">${data.count} expenses • ${percentage}%</div>
          </div>
          <div class="category-hours">$${data.total.toFixed(2)}</div>
        `;
        breakdownContainer.appendChild(item);
      });
  }

  // Update recent expenses list
  const expensesList = document.getElementById('expenses-list');
  const recentExpenses = [...appData.expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (recentExpenses.length === 0) {
    expensesList.innerHTML = '<p class="empty-text">No expenses yet</p>';
  } else {
    expensesList.innerHTML = '';
    recentExpenses.forEach(expense => {
      const categoryInfo = ExpenseTracker.categories.find(c => c.id === expense.category);
      const client = expense.client ? appData.clients.find(c => String(c.id) === String(expense.client)) : null;

      const item = document.createElement('div');
      item.className = 'expense-item';
      item.innerHTML = `
        <div class="expense-details">
          <div class="expense-description">
            ${categoryInfo ? categoryInfo.icon : '📦'} ${expense.description}
            ${expense.taxDeductible ? '<span class="tax-badge">Tax Deductible</span>' : ''}
          </div>
          <div class="expense-meta">
            ${new Date(expense.date).toLocaleDateString()}
            ${client ? `• ${client.name}` : ''}
          </div>
        </div>
        <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
      `;
      expensesList.appendChild(item);
    });
  }

  // Generate smart suggestions
  const suggestions = ExpenseTracker.suggestOptimizations(appData.expenses);
  const suggestionsContainer = document.getElementById('expense-suggestions');

  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = '<p class="empty-text">Add more expenses to get optimization tips!</p>';
  } else {
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.className = `suggestion-item ${suggestion.type}`;
      item.innerHTML = `<p>${suggestion.message}</p>`;
      suggestionsContainer.appendChild(item);
    });
  }
}

function exportExpenses() {
  if (appData.expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const csv = ExpenseTracker.exportToCSV(appData.expenses);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusbill-expenses-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  alert('Expenses exported successfully!');
}

// Projects UI (FREE Premium Feature)
// ===================================

function createProject() {
  const name = document.getElementById('project-name').value.trim();
  const client = document.getElementById('project-client').value;
  const description = document.getElementById('project-description').value.trim();
  const budgetType = document.getElementById('project-budget-type').value;
  const budget = parseFloat(document.getElementById('project-budget').value) || 0;
  const estimatedHours = parseFloat(document.getElementById('project-estimated-hours').value) || 0;
  const deadline = document.getElementById('project-deadline').value;
  const status = document.getElementById('project-status').value;

  if (!name || !client) {
    alert('Please enter a project name and select a client');
    return;
  }

  try {
    const project = ProjectManager.createProject({
      name,
      client,
      description,
      budgetType,
      budget,
      estimatedHours,
      deadline: deadline || null,
      status
    });

    appData.projects.push(project);
    saveData();

    // Clear form
    document.getElementById('project-name').value = '';
    document.getElementById('project-description').value = '';
    document.getElementById('project-budget').value = '';
    document.getElementById('project-estimated-hours').value = '';
    document.getElementById('project-deadline').value = '';
    document.getElementById('project-status').value = 'active';

    updateProjectsUI();
    alert(`Project "${name}" created successfully!`);
  } catch (error) {
    console.error('Error creating project:', error);
    alert('Error creating project: ' + error.message);
  }
}

function updateProjectsUI() {

  // Populate client dropdown
  const projectClientSelect = document.getElementById('project-client');
  projectClientSelect.innerHTML = '<option value="">Select client...</option>';
  appData.clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.name;
    projectClientSelect.appendChild(option);
  });

  // Get filter
  const filter = document.getElementById('projects-filter').value;

  // Filter projects
  let filteredProjects = appData.projects;
  if (filter !== 'all') {
    filteredProjects = appData.projects.filter(p => p.status === filter);
  }

  // Update projects list
  const projectsList = document.getElementById('projects-list');

  if (filteredProjects.length === 0) {
    projectsList.innerHTML = '<p class="empty-text">No projects match this filter</p>';
  } else {
    projectsList.innerHTML = '';
    filteredProjects.forEach(project => {
      const client = appData.clients.find(c => String(c.id) === String(project.client));
      const progress = ProjectManager.calculateProgress(project, appData.timeLogs);
      const statusInfo = ProjectManager.statuses.find(s => s.id === project.status);

      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.innerHTML = `
        <div class="project-header">
          <div>
            <div class="project-name">${project.name}</div>
            <div class="project-client">${client ? client.name : 'Unknown Client'}</div>
          </div>
          <div class="project-status" style="background: ${statusInfo ? statusInfo.color : '#6c757d'}">
            ${statusInfo ? statusInfo.name : project.status}
          </div>
        </div>
        <div class="project-progress">
          <div class="progress-label">
            ${progress.totalHours}h / ${progress.estimatedHours}h tracked
            ${progress.overBudget ? '<span style="color: #dc3545;">(Over Budget!)</span>' : ''}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100, progress.hourProgress)}%; background: ${progress.overBudget ? '#dc3545' : '#2484BF'}"></div>
          </div>
          <div class="progress-percentage">${progress.hourProgress}%</div>
        </div>
        ${project.deadline ? `
          <div class="project-deadline">
            📅 Deadline: ${new Date(project.deadline).toLocaleDateString()}
          </div>
        ` : ''}
        <div class="project-footer">
          <div class="project-budget">
            ${project.budgetType === 'fixed' ? `💰 Fixed: $${project.budget}` : `⏱️ Hourly Budget: $${project.budget}`}
          </div>
          <div class="project-sessions">${progress.sessionCount} sessions</div>
        </div>
      `;
      projectsList.appendChild(projectCard);
    });
  }

  // Update stats
  const stats = ProjectManager.getProjectStats(appData.projects, appData.timeLogs, appData.clients);
  document.getElementById('total-projects').textContent = stats.total;
  document.getElementById('active-projects').textContent = stats.active;
  document.getElementById('projects-revenue').textContent = `$${stats.totalRevenue}`;
}

// Make functions globally accessible
window.deleteClient = deleteClient;
window.deleteLog = deleteLog;
window.removeBlockedSite = removeBlockedSite;
