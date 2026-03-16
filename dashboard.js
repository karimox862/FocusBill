// FocusBill - Dashboard Logic (Freelancer Mode)
// ===============================================

let appData = {
  clients: [],
  timeLogs: [],
  expenses: [],
  projects: [],
  invoices: [],
  notes: [],
  blockedSites: [],
  settings: {
    userName: '',
    userEmail: '',
    userCompany: '',
    companyAddress: '',
    companyLogo: '',
    defaultRate: 75,
    paymentTerms: 'Payment is due within 30 days',
    taxRate: 0,
    stripeLink: '',
    paypalLink: ''
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Apply theme (light/dark) and mode (freelancer)
  const currentTheme = Theme.getCurrentTheme();
  const currentMode = Theme.getCurrentMode();
  Theme.loadFonts({ mode: 'local', basePath: 'assets/fonts', injectBaseCSS: true });
  Theme.apply(currentTheme);
  Theme.applyMode(currentMode);
  updateThemeToggleIcon(currentTheme);

  loadData();
  setupEventListeners();
  initSyncUI();

  const container = document.getElementById('milestones-container');
  const addBtn = document.getElementById('add-milestone-btn');
  if (!container || !addBtn) return;

  const makeMilestone = (i) => {
    const wrap = document.createElement('div');
    wrap.className = 'milestone-item';
    wrap.innerHTML = `
      <input type="text" class="field-input" placeholder="Milestone name" id="milestone-${i}-name">
      <input type="number" class="field-input" placeholder="Amount" id="milestone-${i}-amount" step="0.01">
      <input type="date" class="field-input" id="milestone-${i}-date">
      <button type="button" class="btn btn-link remove-milestone" aria-label="Remove milestone">Remove</button>
    `;
    return wrap;
  };

  addBtn.addEventListener('click', () => {
    const nextIndex = container.querySelectorAll('.milestone-item').length + 1;
    container.appendChild(makeMilestone(nextIndex));
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-milestone');
    if (btn) btn.closest('.milestone-item').remove();
  });

});



// Load data
function loadData() {
  chrome.storage.local.get(['appData', 'timeLogs'], (result) => {
    if (result.appData) {
      appData = { ...appData, ...result.appData };
    }
    // Migrate legacy timeLogs saved by background.js under separate key
    if (result.timeLogs && result.timeLogs.length > 0) {
      const existingIds = new Set(appData.timeLogs.map(l => l.id));
      const newLogs = result.timeLogs.filter(l => !existingIds.has(l.id));
      if (newLogs.length > 0) {
        appData.timeLogs = [...appData.timeLogs, ...newLogs];
        chrome.storage.local.remove('timeLogs');
        saveData();
      }
    }
    updateAllPages();
  });
}

// Save data
function saveData() {
  chrome.storage.local.set({ appData }, () => {
    debouncedSync();
  });
}

// Debounced sync — waits 5s after last save before syncing
let _syncTimeout = null;
function debouncedSync() {
  if (_syncTimeout) clearTimeout(_syncTimeout);
  _syncTimeout = setTimeout(async () => {
    if (typeof SupabaseAuth !== 'undefined' && await SupabaseAuth.isLoggedIn()) {
      SyncEngine.fullSync().catch(() => {});
    }
  }, 5000);
}

// Toast notifications (replaces alert())
function dashboardToast(message, type = 'success') {
  const container = document.getElementById('dashboard-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `d-toast d-toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('d-toast-in'));
  setTimeout(() => {
    toast.classList.remove('d-toast-in');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3200);
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      switchPage(page);
    });
  });

  // Overview export
  document.getElementById('export-data-btn')?.addEventListener('click', exportAllData);

  // Sessions filters/exports
  document.getElementById('session-filter')?.addEventListener('change', updateSessionsPage);
  document.getElementById('export-sessions-csv')?.addEventListener('click', exportSessionsCSV);
  document.getElementById('export-sessions-pdf')?.addEventListener('click', exportSessionsPDF);

  // Clients
  document.getElementById('add-client-btn')?.addEventListener('click', showAddClientModal);
  document.getElementById('add-client-empty')?.addEventListener('click', showAddClientModal);
  document.getElementById('save-client-btn')?.addEventListener('click', saveClient);
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Projects
  document.getElementById('add-project-btn')?.addEventListener('click', showCreateProjectModal);
  document.getElementById('save-project-btn')?.addEventListener('click', saveProject);

  // Invoices
  document.getElementById('create-invoice-btn')?.addEventListener('click', showCreateInvoiceModal);
  document.getElementById('save-invoice-btn')?.addEventListener('click', createInvoice);

  // Notes
  document.getElementById('add-note-btn')?.addEventListener('click', showAddNoteModal);

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Settings
  document.getElementById('focus-duration')?.addEventListener('change', saveSettings);
  document.getElementById('break-duration')?.addEventListener('change', saveSettings);
  document.getElementById('user-name')?.addEventListener('change', saveSettings);
  document.getElementById('user-email')?.addEventListener('change', saveSettings);
  document.getElementById('user-company')?.addEventListener('change', saveSettings);
  document.getElementById('company-address')?.addEventListener('change', saveSettings);
  document.getElementById('add-site-btn')?.addEventListener('click', addBlockedSite);
  document.getElementById('stripe-link')?.addEventListener('change', saveSettings);
  document.getElementById('paypal-link')?.addEventListener('change', saveSettings);
  document.getElementById('export-all-data')?.addEventListener('click', exportAllData);
  document.getElementById('clear-all-data')?.addEventListener('click', clearAllData);

  // Cloud Sync
  document.getElementById('sync-signin-btn')?.addEventListener('click', handleSignIn);
  document.getElementById('sync-signup-btn')?.addEventListener('click', handleSignUp);
  document.getElementById('sync-signout-btn')?.addEventListener('click', handleSignOut);
  document.getElementById('sync-now-btn')?.addEventListener('click', handleSyncNow);
  document.getElementById('sync-auto-toggle')?.addEventListener('change', handleAutoSyncToggle);

  // Add note modal
  document.getElementById('save-note-btn')?.addEventListener('click', saveNote);

  // Expenses
  document.getElementById('add-expense-btn')?.addEventListener('click', showAddExpenseModal);
  document.getElementById('save-expense-btn')?.addEventListener('click', saveExpense);
  document.getElementById('export-expenses-csv')?.addEventListener('click', exportExpensesCSV);
  document.getElementById('expense-period-filter')?.addEventListener('change', updateExpensesPage);
  document.getElementById('expense-category-filter')?.addEventListener('change', updateExpensesPage);

}

// Page switching
function switchPage(pageName) {
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

  // Update pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageName}-page`)?.classList.add('active');

  // Update page content
  switch (pageName) {
    case 'overview':
      updateOverviewPage();
      break;
    case 'sessions':
      updateSessionsPage();
      break;
    case 'clients':
      updateClientsPage();
      break;
    case 'projects':
      updateProjectsPage();
      break;
    case 'invoices':
      updateInvoicesPage();
      break;
    case 'expenses':
      updateExpensesPage();
      break;
    case 'notes':
      updateNotesPage();
      break;
    case 'settings':
      updateSettingsPage();
      break;
  }
}

// Update all pages
function updateAllPages() {
  updateOverviewPage();
  updateSessionsPage();
  updateClientsPage();
  updateInvoicesPage();
  updateNotesPage();
  updateSettingsPage();
}

// Overview Page
function updateOverviewPage() {
  // Calculate stats for this month
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthLogs = appData.timeLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear;
  });

  // Total hours
  const totalMinutes = thisMonthLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  document.getElementById('total-hours').textContent = `${totalHours}h`;

  // Total sessions
  document.getElementById('total-sessions').textContent = thisMonthLogs.length;

  // Total revenue
  let totalRevenue = 0;
  thisMonthLogs.forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    if (client) {
      totalRevenue += (log.duration / 60) * client.rate;
    }
  });
  document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(0)}`;

  // Active days
  const uniqueDays = new Set(thisMonthLogs.map(log => new Date(log.date).toDateString()));
  document.getElementById('active-days').textContent = uniqueDays.size;

  // Today's earnings pill
  const todayLogs = appData.timeLogs.filter(log =>
    new Date(log.date).toDateString() === now.toDateString()
  );
  let todayRevenue = 0;
  todayLogs.forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    if (client) todayRevenue += (log.duration / 60) * client.rate;
  });
  const earningsPill = document.getElementById('today-earnings-pill');
  const earningsVal = document.getElementById('today-earnings');
  if (earningsPill && earningsVal) {
    if (todayLogs.length > 0) {
      earningsVal.textContent = `$${todayRevenue.toFixed(0)}`;
      earningsPill.style.display = 'flex';
    } else {
      earningsPill.style.display = 'none';
    }
  }

  // Recent sessions table
  updateRecentSessionsTable();
}

function updateRecentSessionsTable() {
  const tbody = document.getElementById('recent-sessions-table');
  const recentLogs = [...appData.timeLogs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (recentLogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No sessions yet</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  recentLogs.forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    const clientName = client ? client.name : 'Unknown';
    const rate = client ? client.rate : 0;
    const amount = ((log.duration / 60) * rate).toFixed(2);
    const date = new Date(log.date).toLocaleDateString();

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>${clientName}</td>
      <td>${log.task || '-'}</td>
      <td>${log.duration} min</td>
      <td>$${amount}</td>
    `;
    tbody.appendChild(row);
  });
}

// Sessions Page
function updateSessionsPage() {
  const filter = document.getElementById('session-filter')?.value || 'month';
  const tbody = document.getElementById('sessions-table');

  let filteredLogs = [...appData.timeLogs];
  const now = new Date();

  // Apply filter
  if (filter === 'today') {
    filteredLogs = filteredLogs.filter(log =>
      new Date(log.date).toDateString() === now.toDateString()
    );
  } else if (filter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredLogs = filteredLogs.filter(log => new Date(log.date) >= weekAgo);
  } else if (filter === 'month') {
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    });
  }

  // Session summary stats
  const summaryEl = document.getElementById('sessions-summary');
  if (summaryEl) {
    const summaryMinutes = filteredLogs.reduce((sum, l) => sum + l.duration, 0);
    let summaryRevenue = 0;
    filteredLogs.forEach(l => {
      const c = appData.clients.find(c => String(c.id) === String(l.client));
      if (c) summaryRevenue += (l.duration / 60) * c.rate;
    });
    const uniqueClients = new Set(filteredLogs.map(l => l.client)).size;
    summaryEl.innerHTML = `
      <div class="sessions-summary-stat"><span class="sessions-summary-label">Sessions</span><span class="sessions-summary-value">${filteredLogs.length}</span></div>
      <div class="sessions-summary-stat"><span class="sessions-summary-label">Hours</span><span class="sessions-summary-value">${(summaryMinutes / 60).toFixed(1)}h</span></div>
      <div class="sessions-summary-stat"><span class="sessions-summary-label">Revenue</span><span class="sessions-summary-value">$${summaryRevenue.toFixed(0)}</span></div>
      <div class="sessions-summary-stat"><span class="sessions-summary-label">Clients</span><span class="sessions-summary-value">${uniqueClients}</span></div>
    `;
    summaryEl.style.display = filteredLogs.length > 0 ? 'flex' : 'none';
  }

  if (filteredLogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No sessions found</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    const clientName = client ? client.name : 'Unknown';
    const rate = client ? client.rate : 0;
    const amount = ((log.duration / 60) * rate).toFixed(2);
    const datetime = new Date(log.date).toLocaleString();

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${datetime}</td>
      <td>${clientName}</td>
      <td>${log.task || '-'}</td>
      <td>${log.duration} min</td>
      <td>$${rate}/hr</td>
      <td>$${amount}</td>
      <td>
        <button class="entity-action-btn" type="button" title="Delete session"
          data-action="delete-session" data-id="${log.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
      </td>

    `;
    tbody.appendChild(row);
  });
}

// Clients Page
function updateClientsPage() {
  const grid = document.getElementById('clients-grid');

  if (appData.clients.length === 0) {
    grid.innerHTML = `
  <div class="empty-state-card">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="38" height="38"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/></svg>
    </div>
    <h3>No clients yet</h3>
    <p>Add your first client to start tracking billable time</p>
    <button class="btn btn-primary" id="add-client-empty" type="button" data-action="add-client">
      <span class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg></span>
      Add Client
    </button>
  </div>
`;
    document.getElementById('add-client-empty')?.addEventListener('click', showAddClientModal);
    return;
  }

  grid.innerHTML = '';
  appData.clients.forEach(client => {
    // Calculate stats for this client
    const clientLogs = appData.timeLogs.filter(log => String(log.client) === String(client.id));
    const totalMinutes = clientLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const totalRevenue = ((totalMinutes / 60) * client.rate).toFixed(0);

    const card = document.createElement('div');
    card.className = 'entity-card';
    card.innerHTML = `
      <div class="entity-header">
        <div class="entity-icon">${getClientInitials(client.name)}</div>
        <div class="entity-actions">
          <button class="entity-action-btn" type="button" title="Edit client"
        data-action="edit-client" data-id="${client.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="entity-action-btn" type="button" title="Delete client"
        data-action="delete-client" data-id="${client.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>

        </div>
      </div>
      <div class="entity-name">${client.name}</div>
      <div class="entity-meta">$${client.rate}/hour</div>
      <div class="entity-stats">
        <div class="entity-stat">
          <div class="entity-stat-value">${totalHours}h</div>
          <div class="entity-stat-label">Tracked</div>
        </div>
        <div class="entity-stat">
          <div class="entity-stat-value">$${totalRevenue}</div>
          <div class="entity-stat-label">Revenue</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getClientInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Client Management
function showAddClientModal() {
  // If a real modal exists, open it
  const modal = document.getElementById('client-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('client-name-input')?.focus();
    return;
  }

  // Otherwise, fall back to an inline form card at the top of the grid
  const grid = document.getElementById('clients-grid');
  if (!grid) return;

  // Avoid duplicates
  grid.querySelector('#add-client-card')?.remove();

  // If empty-state is present, clear it
  if (grid.querySelector('.empty-state-card')) grid.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'entity-card';
  card.id = 'add-client-card';
  card.innerHTML = `
    <div class="entity-header">
      <div class="entity-icon">➕</div>
      <div class="entity-actions">
        <button class="entity-action-btn" type="button" data-action="cancel-add-client">✖</button>
      </div>
    </div>
    <div class="entity-name">New Client</div>
    <div class="entity-meta">Enter details below</div>
    <div class="entity-form">
      <label class="form-row">
        <span>Name</span>
        <input id="client-name-input" placeholder="Client name" />
      </label>
      <label class="form-row">
        <span>Hourly rate</span>
        <input id="client-rate-input" type="number" min="0" step="1"
               placeholder="${appData.settings?.defaultRate ?? 75}" />
      </label>
      <div class="entity-actions-row">
        <button class="btn btn-primary" type="button" data-action="save-client">Save</button>
        <button class="btn" type="button" data-action="cancel-add-client">Cancel</button>
      </div>
    </div>
  `;
  grid.prepend(card);
  card.querySelector('#client-name-input')?.focus();
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function saveClient() {
  const name = document.getElementById('client-name-input')?.value.trim();
  const email = document.getElementById('client-email-input')?.value.trim();
  const rate = parseFloat(document.getElementById('client-rate-input')?.value) || appData.settings.defaultRate;

  if (!name) {
    dashboardToast('Please enter a client name', 'error');
    return;
  }

  const saveBtn = document.getElementById('save-client-btn');
  const editId = saveBtn?.dataset.editId ? parseInt(saveBtn.dataset.editId) : null;

  if (editId) {
    const client = appData.clients.find(c => c.id === editId);
    if (client) { client.name = name; client.email = email || ''; client.rate = rate; client.updated_at = new Date().toISOString(); }
    delete saveBtn.dataset.editId;
    saveBtn.textContent = 'Save Client';
    const modal = document.getElementById('client-modal');
    if (modal) modal.querySelector('.modal-title').textContent = 'Add Client';
  } else {
    const client = { id: Date.now(), name, email: email || '', rate, updated_at: new Date().toISOString() };
    appData.clients.push(client);
  }

  saveData();
  closeAllModals();

  // Clear form
  document.getElementById('client-name-input').value = '';
  document.getElementById('client-email-input').value = '';
  document.getElementById('client-rate-input').value = '';

  updateClientsPage();
  dashboardToast(editId ? `Client updated!` : `Client "${name}" added!`, 'success');
}

window.deleteClient = function (clientId) {
  if (!confirm('Delete this client? Time logs will not be deleted.')) return;

  appData.clients = appData.clients.filter(c => c.id !== clientId);
  saveData();
  updateClientsPage();
  if (typeof SyncEngine !== 'undefined') SyncEngine.cloudDelete('clients', clientId);
};

window.editClient = function (clientId) {
  const client = appData.clients.find(c => c.id === clientId);
  if (!client) return;

  const modal = document.getElementById('client-modal');
  if (!modal) return;

  // Pre-fill form with existing client data
  document.getElementById('client-name-input').value = client.name;
  document.getElementById('client-email-input').value = client.email || '';
  document.getElementById('client-rate-input').value = client.rate || '';

  // Mark the save button so saveClient knows it's an edit
  const saveBtn = document.getElementById('save-client-btn');
  if (saveBtn) {
    saveBtn.dataset.editId = clientId;
    saveBtn.textContent = 'Update Client';
  }
  modal.querySelector('.modal-title').textContent = 'Edit Client';

  modal.classList.remove('hidden');
  document.getElementById('client-name-input')?.focus();
};


// ============================================
// PROJECTS PAGE
// ============================================

// ============================================
// PROJECTS PAGE - MODERN IMPLEMENTATION
// ============================================

let projectFilters = {
  search: '',
  status: 'all',
  sort: 'recent'
};

function updateProjectsPage() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  appData.projects = appData.projects || [];

  // Setup event listeners for filters
  setupProjectFilters();

  // Update status counts
  updateProjectStatusCounts();

  // Filter and sort projects
  let filteredProjects = filterAndSortProjects();

  // Render projects
  if (filteredProjects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-icon">📁</div>
        <h3>${appData.projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}</h3>
        <p>${appData.projects.length === 0 ? 'Create fixed-price projects with milestones' : 'Try adjusting your search or filters'}</p>
        ${appData.projects.length === 0 ? `
          <button class="btn btn-primary" id="add-project-empty" type="button" data-action="add-project">
            <span class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg></span>
            Create Project
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  filteredProjects.forEach((project, index) => {
    const card = createProjectCard(project, index);
    grid.appendChild(card);
  });
}

function setupProjectFilters() {
  // Search input
  const searchInput = document.getElementById('project-search');
  if (searchInput && !searchInput.dataset.listenerAttached) {
    searchInput.addEventListener('input', (e) => {
      projectFilters.search = e.target.value.toLowerCase();
      updateProjectsPage();
    });
    searchInput.dataset.listenerAttached = 'true';
  }

  // Status filter dropdown
  const statusFilter = document.getElementById('project-status-filter');
  if (statusFilter && !statusFilter.dataset.listenerAttached) {
    statusFilter.addEventListener('change', (e) => {
      projectFilters.status = e.target.value;
      updateProjectsPage();
    });
    statusFilter.dataset.listenerAttached = 'true';
  }

  // Sort dropdown
  const sortSelect = document.getElementById('project-sort');
  if (sortSelect && !sortSelect.dataset.listenerAttached) {
    sortSelect.addEventListener('change', (e) => {
      projectFilters.sort = e.target.value;
      updateProjectsPage();
    });
    sortSelect.dataset.listenerAttached = 'true';
  }

  // Status tabs
  const statusTabs = document.querySelectorAll('.status-tab');
  statusTabs.forEach(tab => {
    if (!tab.dataset.listenerAttached) {
      tab.addEventListener('click', () => {
        statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        projectFilters.status = tab.dataset.status;
        updateProjectsPage();
      });
      tab.dataset.listenerAttached = 'true';
    }
  });
}

function updateProjectStatusCounts() {
  const counts = {
    all: appData.projects.length,
    planning: appData.projects.filter(p => p.status === 'planning').length,
    active: appData.projects.filter(p => p.status === 'active').length,
    'on-hold': appData.projects.filter(p => p.status === 'on-hold').length,
    completed: appData.projects.filter(p => p.status === 'completed').length,
    cancelled: appData.projects.filter(p => p.status === 'cancelled').length
  };

  Object.keys(counts).forEach(status => {
    const countEl = document.getElementById(`count-${status}`);
    if (countEl) countEl.textContent = counts[status];
  });
}

function filterAndSortProjects() {
  let filtered = [...appData.projects];

  // Apply search filter
  if (projectFilters.search) {
    filtered = filtered.filter(project => {
      const client = appData.clients.find(c => c.id === project.clientId);
      const clientName = client ? client.name.toLowerCase() : '';
      return project.name.toLowerCase().includes(projectFilters.search) ||
        project.description?.toLowerCase().includes(projectFilters.search) ||
        clientName.includes(projectFilters.search);
    });
  }

  // Apply status filter
  if (projectFilters.status !== 'all') {
    filtered = filtered.filter(p => p.status === projectFilters.status);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (projectFilters.sort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'progress':
        const progressA = calculateProjectProgress(a);
        const progressB = calculateProjectProgress(b);
        return progressB - progressA;
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      default:
        return 0;
    }
  });

  return filtered;
}

function calculateProjectProgress(project) {
  if (!project.milestones || project.milestones.length === 0) return 0;
  const completed = project.milestones.filter(m => m.delivered || m.completed).length;
  return (completed / project.milestones.length) * 100;
}

function getProjectHealth(project) {
  const progress = calculateProjectProgress(project);

  if (project.deadline) {
    const daysUntil = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return 'critical';
    if (daysUntil <= 7 && progress < 80) return 'attention';
  }

  if (progress >= 80 || project.status === 'completed') return 'healthy';
  if (progress >= 50) return 'attention';
  return 'healthy';
}

function createProjectCard(project, index) {
  const client = appData.clients.find(c => c.id === project.clientId);
  const clientName = client ? client.name : 'Unknown Client';
  const progress = calculateProjectProgress(project);
  const health = getProjectHealth(project);
  const status = project.status || 'active';

  const statusLabels = {
    'planning': 'Planning',
    'active': 'Active',
    'on-hold': 'On Hold',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };

  const card = document.createElement('div');
  card.className = 'entity-card';
  card.style.animationDelay = `${index * 0.05}s`;

  card.innerHTML = `
    <div class="entity-header">
      <div class="entity-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
      </div>
      <div class="entity-actions">
        <button class="entity-action-btn" type="button" onclick="viewProjectDetails(${project.id})" title="View Details">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="entity-action-btn" type="button" data-action="delete-project" data-id="${project.id}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>
    
    <div class="entity-name">${project.name}</div>
    <div class="entity-meta">
      ${clientName} • ${project.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
    </div>
    
    <div style="margin-top:12px; display: flex; gap: 6px; align-items: center;">
      <span class="project-status-badge status-${status}">
        ${statusLabels[status] || status}
      </span>
      ${health !== 'healthy' ? `<span class="project-health ${health}">${health === 'critical' ? 'Critical' : 'Attention'}</span>` : ''}
    </div>
    
    ${project.milestones && project.milestones.length > 0 ? `
      <div class="project-progress">
        <div class="progress-label">
          <span>Progress</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    ` : ''}
    
    <div class="project-meta-grid">
      <div class="project-meta-item">
        <div class="project-meta-label">Budget</div>
        <div class="project-meta-value">${project.type === 'fixed' ? '$' + (project.amount || 0) : 'Hourly'}</div>
      </div>
      <div class="project-meta-item">
        <div class="project-meta-label">Milestones</div>
        <div class="project-meta-value">${project.milestones ? project.milestones.length : 0}</div>
      </div>
      ${project.deadline ? `
        <div class="project-meta-item">
          <div class="project-meta-label">Deadline</div>
          <div class="project-meta-value">${new Date(project.deadline).toLocaleDateString()}</div>
        </div>
      ` : ''}
    </div>
  `;

  return card;
}

function viewProjectDetails(projectId) {
  const project = appData.projects.find(p => p.id === projectId);
  if (!project) return;

  const client = appData.clients.find(c => c.id === project.clientId);
  const clientName = client ? client.name : 'Unknown Client';
  const progress = calculateProjectProgress(project);

  const modal = document.getElementById('project-details-modal');
  const titleEl = document.getElementById('project-details-title');
  const contentEl = document.getElementById('project-details-content');

  if (!modal || !titleEl || !contentEl) return;

  titleEl.textContent = project.name;

  contentEl.innerHTML = `
    <div style="display: grid; gap: var(--spacing-5);">
      <div>
        <h4 style="margin: 0 0 var(--spacing-3) 0; color: var(--color-text-primary);">Project Information</h4>
        <div style="display: grid; gap: var(--spacing-3);">
          <div><strong>Client:</strong> ${clientName}</div>
          <div><strong>Type:</strong> ${project.type === 'fixed' ? 'Fixed Price' : 'Hourly'}</div>
          <div><strong>Status:</strong> <span class="project-status-badge status-${project.status || 'active'}">${project.status || 'active'}</span></div>
          ${project.deadline ? `<div><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</div>` : ''}
          ${project.description ? `<div><strong>Description:</strong><br>${project.description}</div>` : ''}
        </div>
      </div>

      ${project.milestones && project.milestones.length > 0 ? `
        <div>
          <h4 style="margin: 0 0 var(--spacing-3) 0; color: var(--color-text-primary);">Milestones (${Math.round(progress)}% Complete)</h4>
          <div class="progress-bar-container" style="margin-bottom: var(--spacing-4);">
            <div class="progress-bar-fill" style="width: ${progress}%"></div>
          </div>
          <div style="display: grid; gap: var(--spacing-3);">
            ${project.milestones.map(m => `
              <div style="padding: var(--spacing-3); background: var(--color-backgroundAlt); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: var(--font-weight-semibold);">${m.delivered || m.completed ? '✅' : '⏳'} ${m.name}</div>
                  ${m.dueDate ? `<div style="font-size: var(--font-size-sm); color: var(--color-text-muted);">Due: ${new Date(m.dueDate).toLocaleDateString()}</div>` : ''}
                </div>
                <div style="font-weight: var(--font-weight-bold); color: var(--color-mode-primary);">$${m.amount || 0}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.remove('hidden');
}

// Make function globally accessible
window.viewProjectDetails = viewProjectDetails;

function showCreateProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  // Populate client dropdown
  const clientSelect = document.getElementById('project-client');
  clientSelect.innerHTML = '<option value="">Select client...</option>';
  appData.clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.name;
    clientSelect.appendChild(option);
  });

  // Setup project type toggle
  const typeSelect = document.getElementById('project-type');
  const fixedOptions = document.getElementById('project-fixed-options');

  typeSelect.addEventListener('change', () => {
    fixedOptions.style.display = typeSelect.value === 'fixed' ? 'block' : 'none';
  });

  modal.classList.remove('hidden');
  document.getElementById('project-name')?.focus();
}

function saveProject() {
  const name = document.getElementById('project-name')?.value.trim();
  const clientId = parseInt(document.getElementById('project-client')?.value);
  const type = document.getElementById('project-type')?.value;
  const description = document.getElementById('project-description')?.value.trim();
  const status = document.getElementById('project-status')?.value || 'active';
  const deadline = document.getElementById('project-deadline')?.value;

  if (!name) {
    dashboardToast('Please enter a project name', 'error');
    return;
  }

  if (!clientId) {
    dashboardToast('Please select a client', 'error');
    return;
  }

  const project = {
    id: Date.now(),
    name,
    clientId,
    type,
    description,
    status,
    deadline: deadline || null,
    createdAt: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (type === 'fixed') {
    project.amount = parseFloat(document.getElementById('project-amount')?.value) || 0;
    project.milestones = [];

    // Collect milestones
    const milestoneContainer = document.getElementById('milestones-container');
    const milestoneItems = milestoneContainer.querySelectorAll('.milestone-item');

    milestoneItems.forEach((item, index) => {
      const name = item.querySelector(`#milestone-${index + 1}-name`)?.value.trim();
      const amount = parseFloat(item.querySelector(`#milestone-${index + 1}-amount`)?.value) || 0;
      const date = item.querySelector(`#milestone-${index + 1}-date`)?.value;

      if (name && amount > 0) {
        project.milestones.push({
          id: Date.now() + index,
          name,
          amount,
          dueDate: date,
          delivered: false,
          completed: false
        });
      }
    });
  }

  appData.projects = appData.projects || [];
  appData.projects.push(project);
  saveData();
  closeAllModals();

  // Clear form
  document.getElementById('project-name').value = '';
  document.getElementById('project-description').value = '';
  if (document.getElementById('project-deadline')) {
    document.getElementById('project-deadline').value = '';
  }

  updateProjectsPage();
  dashboardToast(`Project "${name}" created!`, 'success');
}

window.deleteProject = function (projectId) {
  if (!confirm('Delete this project?')) return;
  appData.projects = appData.projects.filter(p => p.id !== projectId);
  saveData();
  updateProjectsPage();
  if (typeof SyncEngine !== 'undefined') SyncEngine.cloudDelete('projects', projectId);
};

// ============================================
// INVOICES PAGE - COMPREHENSIVE SYSTEM
// ============================================

let currentInvoiceFilter = 'all';

function updateInvoicesPage() {
  appData.invoices = appData.invoices || [];

  // Setup invoice tabs
  const tabs = document.querySelectorAll('.invoice-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentInvoiceFilter = tab.dataset.status;
      renderInvoicesTable();
    });
  });

  renderInvoicesTable();
}

function renderInvoicesTable() {
  const tbody = document.getElementById('invoices-table');
  if (!tbody) return;

  let invoices = [...appData.invoices];

  // Apply filter
  if (currentInvoiceFilter !== 'all') {
    invoices = invoices.filter(inv => {
      if (currentInvoiceFilter === 'overdue') {
        return inv.status === 'sent' && new Date(inv.dueDate) < new Date();
      }
      return inv.status === currentInvoiceFilter;
    });
  }

  if (invoices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No invoices found</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(invoice => {
    const client = appData.clients.find(c => c.id === invoice.clientId);
    const clientName = client ? client.name : 'Unknown';

    const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();
    const statusClass = isOverdue ? 'overdue' : invoice.status;
    const statusText = isOverdue ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${invoice.number}</strong></td>
      <td>${clientName}</td>
      <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
      <td>${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</td>
      <td><strong>$${invoice.total.toFixed(2)}</strong></td>
      <td><span class="invoice-status status-${statusClass}">${statusText}</span></td>
      <td>
        <button class="entity-action-btn" type="button" data-action="view-invoice" data-id="${invoice.id}" title="View invoice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="entity-action-btn" type="button" data-action="mark-paid" data-id="${invoice.id}" title="Mark as paid" style="color:#059669"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg></button>
        <button class="entity-action-btn" type="button" data-action="delete-invoice" data-id="${invoice.id}" title="Delete invoice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showCreateInvoiceModal() {
  const modal = document.getElementById('invoice-modal');
  if (!modal) return;

  // Populate client dropdown
  const clientSelect = document.getElementById('invoice-client');
  clientSelect.innerHTML = '<option value="">Select client...</option>';
  appData.clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.name;
    clientSelect.appendChild(option);
  });

  // Populate project dropdown
  const projectSelect = document.getElementById('invoice-project');
  projectSelect.innerHTML = '<option value="">Select project...</option>';
  (appData.projects || []).forEach(project => {
    const client = appData.clients.find(c => c.id === project.clientId);
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = `${project.name} (${client ? client.name : 'Unknown'})`;
    projectSelect.appendChild(option);
  });

  // Setup invoice type toggle
  const typeSelect = document.getElementById('invoice-type');
  const hourlyOptions = document.getElementById('hourly-options');
  const fixedOptions = document.getElementById('fixed-options');

  typeSelect.addEventListener('change', () => {
    hourlyOptions.style.display = typeSelect.value === 'hourly' ? 'block' : 'none';
    fixedOptions.style.display = typeSelect.value === 'fixed' || typeSelect.value === 'milestone' ? 'block' : 'none';
  });

  // Set default due date (30 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  document.getElementById('invoice-due-date').value = dueDate.toISOString().split('T')[0];

  modal.classList.remove('hidden');
}

function createInvoice() {
  const clientId = parseInt(document.getElementById('invoice-client')?.value);
  const type = document.getElementById('invoice-type')?.value;
  const taxRate = parseFloat(document.getElementById('invoice-tax')?.value) || 0;
  const discount = parseFloat(document.getElementById('invoice-discount')?.value) || 0;
  const notes = document.getElementById('invoice-notes')?.value.trim();
  const dueDate = document.getElementById('invoice-due-date')?.value;
  const status = document.getElementById('invoice-status')?.value;

  if (!clientId) {
    dashboardToast('Please select a client', 'error');
    return;
  }

  const client = appData.clients.find(c => c.id === clientId);
  if (!client) return;

  let subtotal = 0;
  let items = [];

  if (type === 'hourly') {
    // Get time logs for the period
    const period = document.getElementById('invoice-period')?.value;
    let logs = appData.timeLogs.filter(log => log.client === clientId);

    const now = new Date();
    if (period === 'today') {
      logs = logs.filter(log => new Date(log.date).toDateString() === now.toDateString());
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      logs = logs.filter(log => new Date(log.date) >= weekAgo);
    } else if (period === 'month') {
      logs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      });
    }

    if (logs.length === 0) {
      dashboardToast('No time logs found for this period', 'warning');
      return;
    }

    // Group logs by task/date
    logs.forEach(log => {
      const hours = log.duration / 60;
      const amount = hours * client.rate;
      subtotal += amount;
      items.push({
        description: log.task || 'Professional Services',
        quantity: hours,
        rate: client.rate,
        amount: amount,
        date: log.date
      });
    });
  } else if (type === 'fixed' || type === 'milestone') {
    const amount = parseFloat(document.getElementById('invoice-fixed-amount')?.value) || 0;
    const projectId = parseInt(document.getElementById('invoice-project')?.value);

    if (amount <= 0) {
      dashboardToast('Please enter an amount', 'error');
      return;
    }

    subtotal = amount;
    items.push({
      description: type === 'milestone' ? 'Milestone Payment' : 'Fixed Price Project',
      quantity: 1,
      rate: amount,
      amount: amount,
      projectId: projectId
    });
  }

  // Calculate totals
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const invoice = {
    id: Date.now(),
    number: `INV-${String(appData.invoices.length + 1).padStart(4, '0')}`,
    clientId: clientId,
    type: type,
    items: items,
    subtotal: subtotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    discount: discount,
    total: total,
    notes: notes,
    dueDate: dueDate,
    status: status,
    createdAt: new Date().toISOString(),
    paidAt: null,
    updated_at: new Date().toISOString()
  };

  appData.invoices = appData.invoices || [];
  appData.invoices.push(invoice);
  saveData();
  closeAllModals();

  updateInvoicesPage();
  dashboardToast(`Invoice ${invoice.number} created!`, 'success');
}

window.viewInvoice = function (invoiceId) {
  const invoice = appData.invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  const client = appData.clients.find(c => c.id === invoice.clientId);
  if (!client) return;

  // Build invoice data for the invoice.html page
  const invoiceData = {
    invoice: invoice,
    client: client,
    fromName: appData.settings.userName || 'Your Name',
    fromEmail: appData.settings.userEmail || 'your@email.com',
    fromCompany: appData.settings.userCompany || '',
    fromAddress: appData.settings.companyAddress || '',
    companyLogo: appData.settings.companyLogo || '',
    paymentTerms: appData.settings.paymentTerms,
    stripeLink: appData.settings.stripeLink || '',
    paypalLink: appData.settings.paypalLink || ''
  };

  // Open invoice in new tab
  const url = `invoice.html?data=${encodeURIComponent(JSON.stringify(invoiceData))}`;
  chrome.tabs.create({ url: url });
};

window.markInvoicePaid = function (invoiceId) {
  const invoice = appData.invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  if (invoice.status === 'paid') {
    dashboardToast('Invoice is already marked as paid', 'info');
    return;
  }

  if (confirm(`Mark invoice ${invoice.number} as paid?`)) {
    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    invoice.updated_at = new Date().toISOString();
    saveData();
    renderInvoicesTable();
    dashboardToast('Invoice marked as paid!', 'success');
  }
};

window.deleteInvoice = function (invoiceId) {
  const invoice = appData.invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  if (confirm(`Delete invoice ${invoice.number}? This cannot be undone.`)) {
    appData.invoices = appData.invoices.filter(inv => inv.id !== invoiceId);
    saveData();
    renderInvoicesTable();
    if (typeof SyncEngine !== 'undefined') SyncEngine.cloudDelete('invoices', invoiceId);
  }
};

// Check for overdue invoices on load
function checkOverdueInvoices() {
  appData.invoices = appData.invoices || [];
  const overdueInvoices = appData.invoices.filter(inv =>
    inv.status === 'sent' && new Date(inv.dueDate) < new Date()
  );

  if (overdueInvoices.length > 0) {
  }
}

// Expenses Page (placeholder)
function updateExpensesPage() {
  // HTML is already in dashboard.html, no dynamic updates needed
}

// Notes Page
function updateNotesPage() {
  const grid = document.getElementById('notes-grid');

  if (!appData.notes || appData.notes.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="38" height="38"><path d="M11 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <h3>No notes yet</h3>
        <p>Add quick notes during your work sessions</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  appData.notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div class="note-header">
        <div class="note-date">${new Date(note.date).toLocaleDateString()}</div>
        <button class="entity-action-btn" type="button" title="Delete note"
        data-action="delete-note" data-id="${note.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>

      </div>
      <div class="note-content">${note.content}</div>
    `;
    grid.appendChild(card);
  });
}

function showAddNoteModal() {
  document.getElementById('note-modal')?.classList.remove('hidden');
}

function saveNote() {
  const content = document.getElementById('note-content-input')?.value.trim();

  if (!content) {
    dashboardToast('Please enter note content', 'error');
    return;
  }

  appData.notes = appData.notes || [];
  appData.notes.push({
    id: Date.now(),
    content: content,
    date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  saveData();
  closeAllModals();

  // Clear form
  document.getElementById('note-content-input').value = '';

  updateNotesPage();
  dashboardToast('Note added!', 'success');
}

window.deleteNote = function (noteId) {
  if (!confirm('Delete this note?')) return;
  appData.notes = appData.notes.filter(n => n.id !== noteId);
  saveData();
  updateNotesPage();
  if (typeof SyncEngine !== 'undefined') SyncEngine.cloudDelete('notes', noteId);
};


// ============================================
// EXPENSES PAGE
// ============================================

function updateExpensesPage() {
  appData.expenses = appData.expenses || [];

  renderExpenseStats();
  renderCategoryBreakdown();
  renderExpensesTable();
  populateExpenseCategoryFilter();
}

function renderExpenseStats() {
  const period = document.getElementById('expense-period-filter')?.value || 'month';
  const filteredExpenses = window.ExpenseTracker
    ? window.ExpenseTracker.getExpensesByPeriod(appData.expenses, period)
    : appData.expenses;

  // Total expenses
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(0)}`;

  // Expense count
  document.getElementById('expense-count').textContent = filteredExpenses.length;

  // Tax-deductible total
  const taxDeductible = window.ExpenseTracker
    ? window.ExpenseTracker.getTaxDeductibleTotal(filteredExpenses)
    : filteredExpenses.filter(e => e.taxDeductible).reduce((sum, e) => sum + e.amount, 0);
  document.getElementById('tax-deductible-total').textContent = `$${taxDeductible.toFixed(0)}`;

  // Net income (revenue - expenses)
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const thisMonthLogs = appData.timeLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear;
  });

  let totalRevenue = 0;
  thisMonthLogs.forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    if (client) {
      totalRevenue += (log.duration / 60) * client.rate;
    }
  });

  const netIncome = totalRevenue - totalExpenses;
  const netIncomeEl = document.getElementById('net-income');
  netIncomeEl.textContent = `$${netIncome.toFixed(0)}`;
  netIncomeEl.style.color = netIncome >= 0 ? 'var(--color-success, #10b981)' : 'var(--color-danger, #ef4444)';
}

function renderCategoryBreakdown() {
  const categoryGrid = document.getElementById('category-breakdown');
  if (!categoryGrid) return;

  const period = document.getElementById('expense-period-filter')?.value || 'month';
  const filteredExpenses = window.ExpenseTracker
    ? window.ExpenseTracker.getExpensesByPeriod(appData.expenses, period)
    : appData.expenses;

  const byCategory = window.ExpenseTracker
    ? window.ExpenseTracker.getExpensesByCategory(filteredExpenses)
    : {};

  if (Object.keys(byCategory).length === 0) {
    categoryGrid.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No expenses in this period</p>';
    return;
  }

  categoryGrid.innerHTML = '';
  categoryGrid.style.display = 'grid';
  categoryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  categoryGrid.style.gap = 'var(--spacing-3)';

  const categories = window.ExpenseTracker?.categories || [];

  Object.entries(byCategory)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId);
      const categoryName = category ? category.name : categoryId;
      const icon = category ? category.icon : '📦';

      const card = document.createElement('div');
      card.style.padding = 'var(--spacing-3)';
      card.style.border = '1px solid var(--color-border)';
      card.style.borderRadius = 'var(--radius-md)';
      card.style.backgroundColor = 'var(--color-bg-secondary)';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--spacing-2); margin-bottom: var(--spacing-2);">
          <span style="font-size: 24px;">${icon}</span>
          <div style="flex: 1;">
            <div style="font-size: 14px; color: var(--color-text-secondary);">${categoryName}</div>
            <div style="font-size: 18px; font-weight: 600;">$${data.total.toFixed(2)}</div>
          </div>
        </div>
        <div style="font-size: 12px; color: var(--color-text-tertiary);">${data.count} expense${data.count !== 1 ? 's' : ''}</div>
      `;

      categoryGrid.appendChild(card);
    });
}

function renderExpensesTable() {
  const tbody = document.getElementById('expenses-table');
  if (!tbody) return;

  const period = document.getElementById('expense-period-filter')?.value || 'month';
  const categoryFilter = document.getElementById('expense-category-filter')?.value || 'all';

  let filteredExpenses = window.ExpenseTracker
    ? window.ExpenseTracker.getExpensesByPeriod(appData.expenses, period)
    : appData.expenses;

  // Apply category filter
  if (categoryFilter !== 'all') {
    filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
  }

  if (filteredExpenses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No expenses found</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  filteredExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(expense => {
      const client = appData.clients.find(c => c.id === expense.client);
      const clientName = client ? client.name : '-';
      const category = window.ExpenseTracker?.categories.find(c => c.id === expense.category);
      const categoryName = category ? category.name : expense.category;
      const date = new Date(expense.date).toLocaleDateString();

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td>${expense.description}</td>
        <td>${categoryName}</td>
        <td>${clientName}</td>
        <td><strong>$${expense.amount.toFixed(2)}</strong></td>
        <td>${expense.taxDeductible ? '✅ Yes' : '❌ No'}</td>
        <td>
          <button class="entity-action-btn" type="button" data-action="delete-expense" data-id="${expense.id}" title="Delete expense">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
}

function populateExpenseCategoryFilter() {
  const select = document.getElementById('expense-category-filter');
  if (!select || select.options.length > 1) return; // Already populated

  const categories = window.ExpenseTracker?.categories || [];
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

function showAddExpenseModal() {
  const modal = document.getElementById('expense-modal');
  if (!modal) return;

  // Populate client dropdown
  const clientSelect = document.getElementById('expense-client-input');
  clientSelect.innerHTML = '<option value="">None</option>';
  appData.clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.name;
    clientSelect.appendChild(option);
  });

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expense-date-input').value = today;

  // Reset form
  document.getElementById('expense-description-input').value = '';
  document.getElementById('expense-amount-input').value = '';
  document.getElementById('expense-category-input').value = '';
  document.getElementById('expense-tax-deductible-input').checked = true;
  document.getElementById('expense-notes-input').value = '';

  modal.classList.remove('hidden');
  document.getElementById('expense-description-input')?.focus();
}

function saveExpense() {
  const description = document.getElementById('expense-description-input')?.value.trim();
  const amount = parseFloat(document.getElementById('expense-amount-input')?.value);
  const date = document.getElementById('expense-date-input')?.value;
  const category = document.getElementById('expense-category-input')?.value;
  const clientId = document.getElementById('expense-client-input')?.value;
  const taxDeductible = document.getElementById('expense-tax-deductible-input')?.checked;
  const notes = document.getElementById('expense-notes-input')?.value.trim();

  // Validation
  if (!description) {
    dashboardToast('Please enter a description', 'error');
    return;
  }
  if (!amount || amount <= 0) {
    dashboardToast('Please enter a valid amount', 'error');
    return;
  }
  if (!category) {
    dashboardToast('Please select a category', 'error');
    return;
  }
  if (!date) {
    dashboardToast('Please select a date', 'error');
    return;
  }

  // Create expense using ExpenseTracker if available
  const expenseData = {
    description,
    amount,
    category,
    date: new Date(date).toISOString(),
    client: clientId ? parseInt(clientId) : null,
    taxDeductible,
    notes,
    updated_at: new Date().toISOString()
  };

  let newExpense;
  if (window.ExpenseTracker) {
    try {
      newExpense = window.ExpenseTracker.addExpense(expenseData);
    } catch (error) {
      dashboardToast('Error adding expense: ' + error.message, 'error');
      return;
    }
  } else {
    // Fallback if ExpenseTracker not loaded
    newExpense = {
      id: Date.now(),
      ...expenseData
    };
  }

  appData.expenses.push(newExpense);
  saveData();
  closeAllModals();
  updateExpensesPage();

  dashboardToast(`Expense added!`, 'success');
}

window.deleteExpense = function (expenseId) {
  if (!confirm('Delete this expense?')) return;
  appData.expenses = appData.expenses.filter(e => e.id !== expenseId);
  saveData();
  updateExpensesPage();
  if (typeof SyncEngine !== 'undefined') SyncEngine.cloudDelete('expenses', expenseId);
};

function exportExpensesCSV() {
  if (!window.ExpenseTracker) {
    dashboardToast('ExpenseTracker module not loaded', 'error');
    return;
  }

  const period = document.getElementById('expense-period-filter')?.value || 'month';
  const filteredExpenses = window.ExpenseTracker.getExpensesByPeriod(appData.expenses, period);

  if (filteredExpenses.length === 0) {
    dashboardToast('No expenses to export', 'info');
    return;
  }

  const csv = window.ExpenseTracker.exportToCSV(filteredExpenses);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusbill-expenses-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


// Settings Page
function updateSettingsPage() {
  // Populate profile fields
  document.getElementById('user-name').value = appData.settings.userName || '';
  document.getElementById('user-email').value = appData.settings.userEmail || '';
  document.getElementById('user-company').value = appData.settings.userCompany || '';
  document.getElementById('company-address').value = appData.settings.companyAddress || '';

  // Populate settings fields
  document.getElementById('focus-duration').value = appData.settings.workDuration || 25;
  document.getElementById('break-duration').value = appData.settings.shortBreak || 5;
  document.getElementById('stripe-link').value = appData.settings.stripeLink || '';
  document.getElementById('paypal-link').value = appData.settings.paypalLink || '';

  // Update blocked sites
  updateBlockedSitesList();
}

function saveSettings() {
  // Save profile settings
  appData.settings.userName = document.getElementById('user-name')?.value.trim() || '';
  appData.settings.userEmail = document.getElementById('user-email')?.value.trim() || '';
  appData.settings.userCompany = document.getElementById('user-company')?.value.trim() || '';
  appData.settings.companyAddress = document.getElementById('company-address')?.value.trim() || '';

  // Save other settings
  appData.settings.workDuration = parseInt(document.getElementById('focus-duration')?.value) || 25;
  appData.settings.shortBreak = parseInt(document.getElementById('break-duration')?.value) || 5;
  appData.settings.stripeLink = document.getElementById('stripe-link')?.value.trim() || '';
  appData.settings.paypalLink = document.getElementById('paypal-link')?.value.trim() || '';

  saveData();
  dashboardToast('Settings saved!', 'success');
}

function updateBlockedSitesList() {
  const list = document.getElementById('blocked-sites-list');
  if (!list) return;

  list.innerHTML = '';
  (appData.blockedSites || []).forEach(site => {
    const tag = document.createElement('div');
    tag.className = 'blocked-site-tag';
    tag.innerHTML = `
      ${site}
      <button class="remove-site-btn" type="button"
        data-action="remove-site" data-site="${site}">×</button>

    `;
    list.appendChild(tag);
  });
}

function addBlockedSite() {
  const input = document.getElementById('new-site-input');
  const site = input?.value.trim();

  if (!site) return;

  appData.blockedSites = appData.blockedSites || [];
  if (!appData.blockedSites.includes(site)) {
    appData.blockedSites.push(site);
    saveData();
    input.value = '';
    updateBlockedSitesList();
  }
}

window.removeBlockedSite = function (site) {
  appData.blockedSites = appData.blockedSites.filter(s => s !== site);
  saveData();
  updateBlockedSitesList();
};

// Utility Functions
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
}

function exportAllData() {
  const dataStr = JSON.stringify(appData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusbill-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSessionsCSV() {
  const filter = document.getElementById('session-filter')?.value || 'month';
  let logs = [...appData.timeLogs];

  // Apply same filter as sessions page
  const now = new Date();
  if (filter === 'today') {
    logs = logs.filter(log => new Date(log.date).toDateString() === now.toDateString());
  } else if (filter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    logs = logs.filter(log => new Date(log.date) >= weekAgo);
  } else if (filter === 'month') {
    logs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    });
  }

  let csv = 'Date,Time,Client,Task,Duration (min),Rate,Amount\n';
  logs.forEach(log => {
    const client = appData.clients.find(c => String(c.id) === String(log.client));
    const clientName = client ? client.name : 'Unknown';
    const rate = client ? client.rate : 0;
    const amount = ((log.duration / 60) * rate).toFixed(2);
    const date = new Date(log.date);

    csv += `${date.toLocaleDateString()},${date.toLocaleTimeString()},"${clientName}","${log.task || ''}",${log.duration},${rate},${amount}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusbill-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSessionsPDF() {
  dashboardToast('Use browser Print → Save as PDF on this page', 'info');
}

function clearAllData() {
  if (!confirm('⚠️ This will delete ALL your data! Are you absolutely sure?')) return;
  if (!confirm('Really delete everything? This cannot be undone!')) return;

  appData = {
    clients: [],
    timeLogs: [],
    expenses: [],
    projects: [],
    notes: [],
    blockedSites: [],
    settings: {
      userName: '',
      userEmail: '',
      companyAddress: '',
      defaultRate: 75,
      paymentTerms: 'Payment is due within 30 days',
      stripeLink: '',
      paypalLink: ''
    }
  };

  saveData();
  updateAllPages();
  dashboardToast('All data cleared', 'info');
}

window.deleteSession = function (sessionId) {
  if (!confirm('Delete this session?')) return;
  appData.timeLogs = appData.timeLogs.filter(log => log.id !== sessionId);
  saveData();
  updateSessionsPage();
  updateOverviewPage();
};




// ============================================
// THEME TOGGLE
// ============================================

function toggleTheme() {
  const newTheme = Theme.toggleTheme();
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// === Global event delegation (MV3/CSP-safe) ===
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  e.preventDefault();

  const id = btn.dataset.id;
  const site = btn.dataset.site;

  switch (btn.dataset.action) {
    // Clients
    case 'add-client':
      showAddClientModal();
      break;
    case 'cancel-add-client':
      document.getElementById('add-client-card')?.remove();
      if (!appData.clients?.length) updateClientsPage();
      break;
    case 'save-client':
      saveClient();
      break;
    case 'edit-client':
      editClient(Number(id));
      break;
    case 'delete-client':
      deleteClient(Number(id));
      break;

    // Projects
    case 'add-project':
      showCreateProjectModal();
      break;
    case 'delete-project':
      deleteProject(Number(id));
      break;

    // Invoices
    case 'create-invoice':
      showCreateInvoiceModal();
      break;
    case 'view-invoice':
      viewInvoice(Number(id));
      break;
    case 'mark-paid':
      markInvoicePaid(Number(id));
      break;
    case 'delete-invoice':
      deleteInvoice(Number(id));
      break;

    // Sessions
    case 'delete-session':
      deleteSession(Number(id));
      break;

    // Notes
    case 'delete-note':
      deleteNote(Number(id));
      break;

    // Expenses
    case 'delete-expense':
      deleteExpense(Number(id));
      break;

    // Settings
    case 'remove-site':
      removeBlockedSite(site);
      break;

    default:
    // no-op
  }
});

// ============================================
// CLOUD SYNC
// ============================================

async function initSyncUI() {
  if (typeof SupabaseAuth === 'undefined') return;
  try {
    const loggedIn = await SupabaseAuth.isLoggedIn();
    if (loggedIn) {
      const session = await SupabaseAuth.getSession();
      showSyncLoggedIn(session.user.email);
    } else {
      showSyncLoggedOut();
      showSyncBanner();
    }
  } catch (e) {
    showSyncLoggedOut();
    showSyncBanner();
  }

  // Banner dismiss
  document.getElementById('sync-banner-close')?.addEventListener('click', () => {
    const banner = document.getElementById('sync-banner');
    if (banner) { banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)'; setTimeout(() => banner.style.display = 'none', 300); }
    chrome.storage.local.set({ syncBannerDismissed: true });
  });

  // Banner CTA → jump to settings page account section
  document.getElementById('sync-banner-btn')?.addEventListener('click', () => {
    switchPage('settings');
    setTimeout(() => document.getElementById('sync-email')?.focus(), 200);
  });
}

function showSyncBanner() {
  chrome.storage.local.get(['syncBannerDismissed'], (result) => {
    if (result.syncBannerDismissed) return;
    // Only show if user has some data
    const hasData = appData.clients.length > 0 || appData.timeLogs.length > 0 || appData.invoices.length > 0;
    if (!hasData) return;
    const banner = document.getElementById('sync-banner');
    if (banner) banner.style.display = 'flex';
  });
}

function hideSyncBanner() {
  const banner = document.getElementById('sync-banner');
  if (banner) banner.style.display = 'none';
}

function showSyncLoggedIn(email) {
  const authSection = document.getElementById('sync-auth-section');
  const statusSection = document.getElementById('sync-status-section');
  if (authSection) authSection.style.display = 'none';
  if (statusSection) statusSection.style.display = 'block';

  // Set email
  const emailEl = document.getElementById('sync-user-email');
  if (emailEl) emailEl.textContent = email;

  // Set avatar initial
  const avatarEl = document.getElementById('sync-avatar');
  if (avatarEl) avatarEl.textContent = (email || 'U').charAt(0).toUpperCase();

  // Hide warning banner
  hideSyncBanner();

  // Load last sync time and auto-sync setting
  chrome.storage.local.get(['lastSyncAt', 'autoSyncEnabled'], (result) => {
    const el = document.getElementById('sync-last-time');
    if (el) {
      if (result.lastSyncAt) {
        const d = new Date(result.lastSyncAt);
        const now = new Date();
        const diff = now - d;
        let timeAgo;
        if (diff < 60000) timeAgo = 'Just now';
        else if (diff < 3600000) timeAgo = Math.floor(diff / 60000) + ' min ago';
        else if (diff < 86400000) timeAgo = Math.floor(diff / 3600000) + 'h ago';
        else timeAgo = d.toLocaleDateString();
        el.textContent = 'Synced ' + timeAgo;
      } else {
        el.textContent = 'Never synced';
      }
    }
    const toggle = document.getElementById('sync-auto-toggle');
    if (toggle) toggle.checked = result.autoSyncEnabled !== false;
  });
}

function showSyncLoggedOut() {
  const authSection = document.getElementById('sync-auth-section');
  const statusSection = document.getElementById('sync-status-section');
  if (authSection) authSection.style.display = 'block';
  if (statusSection) statusSection.style.display = 'none';
}

function showAuthError(msg) {
  const errorEl = document.getElementById('sync-auth-error');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}

function clearAuthError() {
  const errorEl = document.getElementById('sync-auth-error');
  if (errorEl) errorEl.style.display = 'none';
}

function setAuthLoading(loading) {
  const signinBtn = document.getElementById('sync-signin-btn');
  const signupBtn = document.getElementById('sync-signup-btn');
  if (signinBtn) { signinBtn.disabled = loading; }
  if (signupBtn) { signupBtn.disabled = loading; signupBtn.textContent = loading ? 'Creating account...' : 'Create Free Account'; }
}

async function handleSignIn() {
  const email = document.getElementById('sync-email')?.value.trim();
  const password = document.getElementById('sync-password')?.value;
  clearAuthError();

  if (!email || !password) { showAuthError('Please enter both email and password.'); return; }

  setAuthLoading(true);
  try {
    await SupabaseAuth.signIn(email, password);
    showSyncLoggedIn(email);
    dashboardToast('Welcome back! Syncing your data...', 'success');
    handleSyncNow();
    chrome.runtime.sendMessage({ action: 'enableAutoSync' });
  } catch (err) {
    showAuthError(err.message);
  } finally {
    setAuthLoading(false);
  }
}

async function handleSignUp() {
  const email = document.getElementById('sync-email')?.value.trim();
  const password = document.getElementById('sync-password')?.value;
  clearAuthError();

  if (!email || !password) { showAuthError('Please enter both email and password.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

  setAuthLoading(true);
  try {
    const data = await SupabaseAuth.signUp(email, password);
    if (data.access_token) {
      showSyncLoggedIn(email);
      dashboardToast('Account created! Backing up all your data...', 'success');
      handleSyncNow();
      chrome.runtime.sendMessage({ action: 'enableAutoSync' });
    } else {
      dashboardToast('Check your email to confirm your account, then sign in.', 'info');
    }
  } catch (err) {
    showAuthError(err.message);
  } finally {
    setAuthLoading(false);
  }
}

async function handleSignOut() {
  if (!confirm('Sign out? Your data stays on this device, but it won\'t be backed up until you sign in again.')) return;
  await SupabaseAuth.signOut();
  showSyncLoggedOut();
  showSyncBanner();
  chrome.runtime.sendMessage({ action: 'disableAutoSync' });
  // Reset dismissed state so banner shows again
  chrome.storage.local.set({ syncBannerDismissed: false });
  dashboardToast('Signed out. Your local data is still here.', 'info');
}

async function handleSyncNow() {
  const spinner = document.getElementById('sync-spinner');
  const btn = document.getElementById('sync-now-btn');
  const dotEl = document.getElementById('sync-dot-indicator');
  if (spinner) spinner.style.display = 'inline';
  if (btn) btn.disabled = true;
  if (dotEl) dotEl.className = 'sync-dot syncing';

  try {
    const result = await SyncEngine.fullSync();
    if (result.status === 'success') {
      dashboardToast('All data backed up!', 'success');
      if (dotEl) dotEl.className = 'sync-dot synced';
      const timeEl = document.getElementById('sync-last-time');
      if (timeEl) timeEl.textContent = 'Synced just now';
      loadData();
    } else if (result.status === 'not_logged_in') {
      dashboardToast('Please sign in first.', 'warning');
    } else {
      dashboardToast('Sync failed: ' + (result.message || 'Unknown error'), 'error');
      if (dotEl) dotEl.className = 'sync-dot error';
    }
  } catch (err) {
    dashboardToast('Sync error: ' + err.message, 'error');
    if (dotEl) dotEl.className = 'sync-dot error';
  } finally {
    if (spinner) spinner.style.display = 'none';
    if (btn) btn.disabled = false;
  }
}

function handleAutoSyncToggle() {
  const enabled = document.getElementById('sync-auto-toggle')?.checked;
  chrome.runtime.sendMessage({ action: enabled ? 'enableAutoSync' : 'disableAutoSync' });
  chrome.storage.local.set({ autoSyncEnabled: enabled });
}
