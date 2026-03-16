// FocusBill - Background Service Worker
// ======================================

importScripts('supabase.js', 'sync.js');

// Debug logger — only outputs in development (set to false for production builds)
const DEBUG = false;
function log(...args) { if (DEBUG) console.log('[FocusBill]', ...args); }
function logError(...args) { console.error('[FocusBill]', ...args); }

let blockingEnabled = false;
let blockedSites = [];

// Load blocking state from storage on startup
chrome.storage.local.get(['blockingState'], (result) => {
  if (result.blockingState) {
    blockingEnabled = result.blockingState.enabled || false;
    blockedSites = result.blockingState.sites || [];
    log('Restored blocking state:', { blockingEnabled, blockedSites });
  }
});

// Auto-sync alarm — create on startup if enabled
chrome.storage.local.get(['autoSyncEnabled'], (result) => {
  if (result.autoSyncEnabled !== false) {
    chrome.alarms.create('autoSync', { periodInMinutes: 10 });
    log('Auto-sync alarm created (every 10 min)');
  }
});

// Intercept navigation requests
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!blockingEnabled || details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace(/^www\./, '');

    // Check if site is blocked (exact domain or subdomain match only)
    const isBlocked = blockedSites.some(site => {
      const cleanSite = site.replace(/^www\./, '');
      return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
    });

    if (isBlocked) {
      log('Blocked navigation to:', hostname);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });
    }
  } catch (e) {
    logError('Error in onBeforeNavigate:', e);
  }
});

// Handle tab updates (for when user is already on a blocked site)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!blockingEnabled || !changeInfo.url) return;

  try {
    const url = new URL(changeInfo.url);
    const hostname = url.hostname.replace(/^www\./, '');

    const isBlocked = blockedSites.some(site => {
      const cleanSite = site.replace(/^www\./, '');
      return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
    });

    if (isBlocked) {
      log('Blocked tab update to:', hostname);
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });
    }
  } catch (e) {
    logError('Error in onUpdated:', e);
  }
});

// ======================================
// TIMER MANAGEMENT IN BACKGROUND
// ======================================

let timerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60, // seconds
  startTime: null,
  endTime: null,
  sessionType: 'work',
  sessionDuration: 25 * 60, // Total duration in seconds
  client: '',
  project: '',
  task: ''
};

// Load timer state on startup
chrome.storage.local.get(['timerState'], (result) => {
  if (result.timerState) {
    timerState = { ...timerState, ...result.timerState };

    // If timer was running, recalculate current time
    if (timerState.isRunning && !timerState.isPaused && timerState.startTime) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (timerState.currentTime <= 0) {
        // Timer finished while background was inactive
        handleTimerComplete();
      } else {
        // Update end time
        timerState.endTime = Date.now() + (timerState.currentTime * 1000);
        saveTimerState();
      }
    }

    log('Timer state restored:', timerState);
  }
});

// Save timer state to storage
function saveTimerState() {
  chrome.storage.local.set({ timerState: {
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused,
    currentTime: timerState.currentTime,
    startTime: timerState.startTime,
    endTime: timerState.endTime,
    sessionType: timerState.sessionType,
    sessionDuration: timerState.sessionDuration,
    client: timerState.client,
    project: timerState.project,
    task: timerState.task
  }});
}

// Update extension icon badge with timer
function updateExtensionIcon() {
  const minutes = Math.floor(timerState.currentTime / 60);
  const seconds = timerState.currentTime % 60;

  // Set badge text to show time
  const badgeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#369EFF' }); // Blue color

  // Optional: Set title (tooltip)
  chrome.action.setTitle({
    title: `FocusBill Timer: ${badgeText}\nClient: ${timerState.client || 'None'}`
  });
}

// Clear extension icon badge
function clearExtensionIcon() {
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setTitle({ title: 'FocusBill - Time Tracking & Invoicing' });
}

// Handle timer completion
function handleTimerComplete() {
  log('Timer completed');

  // Calculate elapsed time and save log
  if (timerState.startTime) {
    const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes > 0 && timerState.client) {
      // Save time log into appData.timeLogs (same key dashboard.js reads)
      chrome.storage.local.get(['appData'], (result) => {
        const data = result.appData || {};
        const logs = data.timeLogs || [];
        logs.push({
          id: Date.now(),
          date: new Date().toISOString(),
          client: timerState.client,
          project: timerState.project,
          task: timerState.task,
          duration: elapsedMinutes,
          sessionType: timerState.sessionType,
          updated_at: new Date().toISOString()
        });
        chrome.storage.local.set({ appData: { ...data, timeLogs: logs } });
      });
    }
  }

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'FocusBill Timer Complete!',
    message: `${timerState.sessionType === 'work' ? 'Work session' : 'Break'} finished! Time logged.`,
    priority: 2
  });

  // Reset timer
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.currentTime = timerState.sessionDuration;
  timerState.startTime = null;
  timerState.endTime = null;

  // Clear extension icon
  clearExtensionIcon();

  // Stop blocking sites
  blockingEnabled = false;
  blockedSites = [];
  chrome.storage.local.set({
    blockingState: { enabled: false, sites: [] }
  });

  saveTimerState();
}

// Check timer every second using alarms
chrome.alarms.create('timerTick', { periodInMinutes: 1/60 }); // Every second

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoSync') {
    SupabaseAuth.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        SyncEngine.fullSync().then(result => {
          log('Auto-sync result:', result.status);
        }).catch(err => {
          logError('Auto-sync error:', err.message);
        });
      }
    });
    return;
  }

  if (alarm.name === 'timerTick') {
    if (timerState.isRunning && !timerState.isPaused) {
      // Recalculate current time based on elapsed time
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (timerState.currentTime <= 0) {
        handleTimerComplete();
      } else {
        // Update extension icon with current time
        updateExtensionIcon();

        // Save state every 5 seconds
        if (elapsed % 5 === 0) {
          saveTimerState();
        }
      }
    }
  }
});

// Handle timer control messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Existing blocking messages
  if (request.action === 'startBlocking') {
    blockingEnabled = true;
    blockedSites = request.sites || [];

    chrome.storage.local.set({
      blockingState: { enabled: true, sites: blockedSites }
    });

    log('Blocking enabled for sites:', blockedSites);
    sendResponse({ success: true });
  }
  else if (request.action === 'stopBlocking') {
    blockingEnabled = false;
    blockedSites = [];

    chrome.storage.local.set({
      blockingState: { enabled: false, sites: [] }
    });

    log('Blocking disabled');
    sendResponse({ success: true });
  }
  else if (request.action === 'ping') {
    sendResponse({ status: 'alive', blockingEnabled, blockedSites });
  }

  // Timer control messages
  else if (request.action === 'startTimer') {
    // Validate inputs — fall back to 25 minutes if missing/invalid
    const raw = Number(request.sessionDuration);
    const duration = (raw > 0 && raw <= 7200) ? raw : (25 * 60);

    timerState.isRunning = true;
    timerState.isPaused = false;
    timerState.startTime = Date.now();
    timerState.currentTime = duration;
    timerState.sessionDuration = duration;
    timerState.endTime = timerState.startTime + (timerState.currentTime * 1000);
    timerState.sessionType = (request.sessionType === 'break') ? 'break' : 'work';
    timerState.client = String(request.client || '').slice(0, 200);
    timerState.project = String(request.project || '').slice(0, 200);
    timerState.task = String(request.task || '').slice(0, 500);

    updateExtensionIcon();

    saveTimerState();
    log('Timer started:', timerState);
    sendResponse({ success: true });
  }
  else if (request.action === 'pauseTimer') {
    timerState.isPaused = !timerState.isPaused;

    if (!timerState.isPaused) {
      // Resuming - recalculate start time
      timerState.startTime = Date.now() - ((timerState.sessionDuration - timerState.currentTime) * 1000);
      timerState.endTime = Date.now() + (timerState.currentTime * 1000);
    }

    saveTimerState();
    log(timerState.isPaused ? 'Timer paused' : 'Timer resumed');
    sendResponse({ success: true, isPaused: timerState.isPaused });
  }
  else if (request.action === 'stopTimer') {
    // Calculate elapsed time before stopping
    const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    // Save time log if there's time and client selected
    if (elapsedMinutes > 0 && timerState.client) {
      chrome.storage.local.get(['appData'], (result) => {
        const data = result.appData || {};
        const logs = data.timeLogs || [];
        logs.push({
          id: Date.now(),
          date: new Date().toISOString(),
          client: timerState.client,
          project: timerState.project,
          task: timerState.task,
          duration: elapsedMinutes,
          sessionType: timerState.sessionType,
          updated_at: new Date().toISOString()
        });
        chrome.storage.local.set({ appData: { ...data, timeLogs: logs } });
      });
    }

    // Show notification
    if (elapsedMinutes > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Timer Stopped',
        message: `${elapsedMinutes} minute(s) logged for ${timerState.client}`,
        priority: 1
      });
    }

    // Reset timer
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.currentTime = timerState.sessionDuration;
    timerState.startTime = null;
    timerState.endTime = null;

    // Clear extension icon
    clearExtensionIcon();

    saveTimerState();
    log('Timer stopped');
    sendResponse({ success: true, elapsedMinutes });
  }
  else if (request.action === 'timerComplete') {
    if (timerState.isRunning) {
      handleTimerComplete();
    }
    sendResponse({ success: true });
  }
  else if (request.action === 'getTimerState') {
    // Recalculate current time if running
    if (timerState.isRunning && !timerState.isPaused && timerState.startTime) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (timerState.currentTime <= 0) {
        handleTimerComplete();
      }
    }

    sendResponse({
      success: true,
      timerState: { ...timerState }
    });
  }
  else if (request.action === 'resetTimer') {
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.currentTime = timerState.sessionDuration;
    timerState.startTime = null;
    timerState.endTime = null;

    chrome.storage.local.remove(['timerState']);
    log('Timer reset');
    sendResponse({ success: true });
  }
  // ── Cloud Sync messages ──
  else if (request.action === 'enableAutoSync') {
    chrome.alarms.create('autoSync', { periodInMinutes: 10 });
    chrome.storage.local.set({ autoSyncEnabled: true });
    log('Auto-sync enabled');
    sendResponse({ success: true });
  }
  else if (request.action === 'disableAutoSync') {
    chrome.alarms.clear('autoSync');
    chrome.storage.local.set({ autoSyncEnabled: false });
    log('Auto-sync disabled');
    sendResponse({ success: true });
  }
  else if (request.action === 'triggerSync') {
    SyncEngine.fullSync().then(result => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ status: 'error', message: err.message });
    });
    return true;
  }
  else if (request.action === 'getSyncStatus') {
    SupabaseAuth.isLoggedIn().then(async (loggedIn) => {
      const lastSync = await SyncEngine.getLastSyncTimestamp();
      sendResponse({ loggedIn, lastSyncAt: lastSync, syncing: SyncEngine._syncing });
    });
    return true;
  }

  return true;
});

log('FocusBill background service worker loaded');
