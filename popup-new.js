// FocusBill - Modern Popup Logic (Freelancer Mode Only)
// ======================================================

// ─── State ────────────────────────────────────────────
let timerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60,
  startTime: null,
  sessionDuration: 25 * 60,
  client: '',
  task: ''
};

let appData = {
  clients: [],
  timeLogs: [],
  notes: [],
  blockedSites: [
    'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
    'youtube.com', 'reddit.com', 'tiktok.com', 'netflix.com'
  ],
  blockerEnabled: true,
  settings: {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    defaultRate: 75
  }
};

// Ring circumference (r=80): 2 * PI * 80 ≈ 502.655
const RING_CIRCUMFERENCE = 2 * Math.PI * 80;

// ─── Initialize ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.apply();
  loadData();
  setupEventListeners();
  startBackgroundSync();
  setupVisibilityListener();
});

// ─── Toast System ─────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

// ─── Data ─────────────────────────────────────────────
function loadData() {
  chrome.storage.local.get(['appData'], (result) => {
    if (result.appData) {
      appData = { ...appData, ...result.appData };
    }
    syncTimerStateFromBackground(() => updateUI());
  });
}

function saveData() {
  chrome.storage.local.set({ appData });
}

// ─── Background Sync ──────────────────────────────────
function syncTimerStateFromBackground(callback) {
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error syncing timer:', chrome.runtime.lastError);
      if (callback) callback();
      return;
    }
    if (response && response.success) {
      timerState = { ...timerState, ...response.timerState };
      if (timerState.isRunning && !timerState.isPaused) {
        resumeTimerUI();
      } else if (timerState.isRunning && timerState.isPaused) {
        showPausedUI();
      }
      updateTimerDisplay();
    }
    if (callback) callback();
  });
}

function startBackgroundSync() {
  function loop() {
    if (timerState.isRunning && !timerState.isPaused) {
      updateTimerDisplay();
    }
    requestAnimationFrame(loop);
  }
  loop();

  setInterval(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      syncTimerStateFromBackground();
    }
  }, 5000);
}

function setupVisibilityListener() {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncTimerStateFromBackground();
  });
  window.addEventListener('focus', () => syncTimerStateFromBackground());
  window.addEventListener('load', () => syncTimerStateFromBackground());
}

// ─── Event Listeners ──────────────────────────────────
function setupEventListeners() {
  document.getElementById('start-btn').addEventListener('click', startTimer);
  document.getElementById('pause-btn').addEventListener('click', pauseTimer);
  document.getElementById('stop-btn').addEventListener('click', stopTimer);

  document.getElementById('toggle-blocker').addEventListener('click', toggleBlocker);
  document.getElementById('quick-note').addEventListener('click', openNoteModal);
  document.getElementById('add-client-quick').addEventListener('click', openClientModal);
  document.getElementById('open-dashboard').addEventListener('click', openDashboard);

  document.getElementById('close-note-modal').addEventListener('click', closeNoteModal);
  document.getElementById('cancel-note').addEventListener('click', closeNoteModal);
  document.getElementById('save-note').addEventListener('click', saveNote);

  document.getElementById('close-client-modal').addEventListener('click', closeClientModal);
  document.getElementById('cancel-client').addEventListener('click', closeClientModal);
  document.getElementById('save-client').addEventListener('click', saveClient);

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      closeNoteModal();
      closeClientModal();
    });
  });
}

// ─── Timer Functions ───────────────────────────────────
function startTimer() {
  const client = document.getElementById('client-select').value;
  const task = document.getElementById('task-input').value;

  if (!client) {
    showToast('Please select a client before starting', 'warning');
    document.getElementById('client-select').focus();
    return;
  }

  chrome.runtime.sendMessage({
    action: 'startTimer',
    sessionDuration: appData.settings.workDuration * 60,
    sessionType: 'work',
    client,
    task
  }, (response) => {
    if (chrome.runtime.lastError) {
      showToast('Failed to start timer. Please reload the extension.', 'error');
      return;
    }
    if (response && response.success) {
      timerState.isRunning = true;
      timerState.isPaused = false;
      timerState.client = client;
      timerState.task = task;
      timerState.startTime = Date.now();
      timerState.currentTime = appData.settings.workDuration * 60;
      timerState.sessionDuration = appData.settings.workDuration * 60;

      document.getElementById('start-btn').classList.add('hidden');
      document.getElementById('pause-btn').classList.remove('hidden');
      document.getElementById('stop-btn').classList.remove('hidden');

      document.getElementById('timer-value').classList.add('running');
      document.getElementById('timer-label').textContent = 'Focus Mode Active';
      updateStatusBadge('running');

      const ring = document.getElementById('timer-ring-progress');
      if (ring) ring.classList.add('running');

      if (appData.blockerEnabled) {
        chrome.runtime.sendMessage({ action: 'startBlocking', sites: appData.blockedSites });
      }

      showToast('Focus session started!', 'success', 2000);
    }
  });
}

function pauseTimer() {
  chrome.runtime.sendMessage({ action: 'pauseTimer' }, (response) => {
    if (response && response.success) {
      timerState.isPaused = response.isPaused;

      const pauseBtn = document.getElementById('pause-btn');
      if (timerState.isPaused) {
        pauseBtn.innerHTML = `
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </span>Resume`;
        updateStatusBadge('paused');
        document.getElementById('timer-value').classList.remove('running');
      } else {
        pauseBtn.innerHTML = `
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </span>Pause`;
        updateStatusBadge('running');
        document.getElementById('timer-value').classList.add('running');
      }
    }
  });
}

function stopTimer() {
  chrome.runtime.sendMessage({ action: 'stopTimer' }, (response) => {
    if (response && response.success) {
      const minutes = response.elapsedMinutes;

      if (minutes > 0) {
        chrome.storage.local.get(['timeLogs'], (result) => {
          if (result.timeLogs) {
            appData.timeLogs = result.timeLogs;
            updateTodayStats();
          }
        });
        showToast(`${minutes} minute${minutes !== 1 ? 's' : ''} logged successfully!`, 'success');
      }

      timerState.isRunning = false;
      timerState.isPaused = false;
      timerState.currentTime = appData.settings.workDuration * 60;
      timerState.client = '';
      timerState.task = '';

      document.getElementById('start-btn').classList.remove('hidden');
      document.getElementById('pause-btn').classList.add('hidden');
      document.getElementById('stop-btn').classList.add('hidden');
      document.getElementById('timer-value').textContent = `${appData.settings.workDuration}:00`;
      document.getElementById('task-input').value = '';
      document.getElementById('pause-btn').innerHTML = `
        <span class="btn-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </span>Pause`;

      document.getElementById('timer-value').classList.remove('running');
      document.getElementById('timer-label').textContent = 'Focus Time';
      updateStatusBadge('idle');

      const ring = document.getElementById('timer-ring-progress');
      if (ring) {
        ring.classList.remove('running');
        ring.style.strokeDashoffset = '0';
      }

      chrome.runtime.sendMessage({ action: 'stopBlocking' });
    }
  });
}

function resumeTimerUI() {
  try {
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('pause-btn').classList.remove('hidden');
    document.getElementById('stop-btn').classList.remove('hidden');

    document.getElementById('timer-value').classList.add('running');
    document.getElementById('timer-label').textContent = 'Focus Mode Active';
    updateStatusBadge('running');

    const ring = document.getElementById('timer-ring-progress');
    if (ring) ring.classList.add('running');

    if (timerState.client) {
      const sel = document.getElementById('client-select');
      if (sel) sel.value = timerState.client;
    }
    if (timerState.task) {
      const inp = document.getElementById('task-input');
      if (inp) inp.value = timerState.task;
    }
  } catch (e) {
    console.error('resumeTimerUI:', e);
  }
}

function showPausedUI() {
  try {
    document.getElementById('start-btn').classList.add('hidden');
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.classList.remove('hidden');
    pauseBtn.innerHTML = `
      <span class="btn-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </span>Resume`;
    document.getElementById('stop-btn').classList.remove('hidden');
    updateStatusBadge('paused');

    if (timerState.client) {
      const sel = document.getElementById('client-select');
      if (sel) sel.value = timerState.client;
    }
    if (timerState.task) {
      const inp = document.getElementById('task-input');
      if (inp) inp.value = timerState.task;
    }
  } catch (e) {
    console.error('showPausedUI:', e);
  }
}

// ─── Timer Display + Ring ──────────────────────────────
function updateTimerDisplay() {
  try {
    let currentTime = timerState.currentTime;
    if (timerState.isRunning && !timerState.isPaused && timerState.startTime) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (currentTime <= 0 && timerState.isRunning) {
        chrome.runtime.sendMessage({ action: 'timerComplete' }, () => {
          syncTimerStateFromBackground();
        });
        return;
      }
    }

    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    const el = document.getElementById('timer-value');
    if (el) el.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update the SVG ring
    updateTimerRing(currentTime);
  } catch (e) {
    console.error('updateTimerDisplay:', e);
  }
}

function updateTimerRing(currentTime) {
  const ring = document.getElementById('timer-ring-progress');
  if (!ring) return;

  const total = timerState.sessionDuration || (appData.settings.workDuration * 60);
  const progress = total > 0 ? currentTime / total : 1;
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  ring.style.strokeDasharray = RING_CIRCUMFERENCE;
  ring.style.strokeDashoffset = offset;
}

// ─── Status Badge ──────────────────────────────────────
function updateStatusBadge(state) {
  const badge = document.getElementById('session-status-badge');
  if (!badge) return;
  badge.className = 'session-status';

  const labels = { idle: 'Ready', running: 'In Session', paused: 'Paused' };
  const dot = badge.querySelector('.status-dot');
  const text = badge.querySelector('.status-text');

  if (state !== 'idle') badge.classList.add(state);
  if (text) text.textContent = labels[state] || 'Ready';
  if (dot) dot.style.cssText = '';
}

// ─── Client Management ─────────────────────────────────
function openClientModal() {
  document.getElementById('client-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('client-name-input').focus(), 50);
}

function closeClientModal() {
  document.getElementById('client-modal').classList.add('hidden');
  document.getElementById('client-name-input').value = '';
  document.getElementById('client-rate-input').value = '';
}

function saveClient() {
  const name = document.getElementById('client-name-input').value.trim();
  const rate = parseFloat(document.getElementById('client-rate-input').value) || appData.settings.defaultRate;

  if (!name) {
    showToast('Please enter a client name', 'warning');
    document.getElementById('client-name-input').focus();
    return;
  }

  const client = { id: Date.now(), name, rate };
  appData.clients.push(client);
  saveData();
  updateClientsDropdown();
  document.getElementById('client-select').value = client.id;
  closeClientModal();
  showToast(`Client "${name}" added!`, 'success', 2500);
}

function updateClientsDropdown() {
  const select = document.getElementById('client-select');
  const currentValue = select.value;
  select.innerHTML = '<option value="">Select client...</option>';
  appData.clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} ($${c.rate}/hr)`;
    select.appendChild(opt);
  });
  if (currentValue) select.value = currentValue;
}

// ─── Notes ────────────────────────────────────────────
function openNoteModal() {
  document.getElementById('note-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('note-textarea').focus(), 50);
}

function closeNoteModal() {
  document.getElementById('note-modal').classList.add('hidden');
  document.getElementById('note-textarea').value = '';
}

function saveNote() {
  const content = document.getElementById('note-textarea').value.trim();
  if (content) {
    appData.notes.push({
      id: Date.now(),
      content,
      date: new Date().toISOString(),
      client: timerState.client || null
    });
    saveData();
    showToast('Note saved!', 'success', 2000);
  }
  closeNoteModal();
}

// ─── Blocker Toggle ────────────────────────────────────
function toggleBlocker() {
  appData.blockerEnabled = !appData.blockerEnabled;
  const dot = document.getElementById('blocker-toggle-dot');
  if (dot) dot.classList.toggle('active', appData.blockerEnabled);
  saveData();
  showToast(
    appData.blockerEnabled ? 'Site blocker enabled' : 'Site blocker disabled',
    appData.blockerEnabled ? 'success' : 'info',
    2000
  );
}

// ─── Today's Stats ────────────────────────────────────
function updateTodayStats() {
  const today = new Date().toDateString();
  const sessions = appData.timeLogs.filter(l => new Date(l.date).toDateString() === today);
  const totalMin = sessions.reduce((s, l) => s + l.duration, 0);

  document.getElementById('today-hours').textContent = (totalMin / 60).toFixed(1) + 'h';
  document.getElementById('today-sessions').textContent = sessions.length;

  let revenue = 0;
  sessions.forEach(log => {
    const c = appData.clients.find(c => String(c.id) === String(log.client));
    if (c) revenue += (log.duration / 60) * c.rate;
  });
  document.getElementById('today-revenue').textContent = '$' + revenue.toFixed(0);
}

// ─── Dashboard ────────────────────────────────────────
function openDashboard() {
  chrome.tabs.create({ url: 'dashboard.html' });
}

// ─── Update UI ────────────────────────────────────────
function updateUI() {
  updateClientsDropdown();
  updateTodayStats();

  const dot = document.getElementById('blocker-toggle-dot');
  if (dot) dot.classList.toggle('active', appData.blockerEnabled);

  if (!timerState.isRunning) {
    document.getElementById('timer-value').textContent = `${appData.settings.workDuration}:00`;
    updateTimerRing(timerState.sessionDuration);
  }
}
