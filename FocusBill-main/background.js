// FocusBill - Background Service Worker
// ======================================
// Privacy-first, local-only. No external connections.

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

// Block sites using tabs.onUpdated — only fires when user explicitly navigates.
// No background URL monitoring; no browsing history stored.
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
  currentTime: 25 * 60,
  startTime: null,
  endTime: null,
  sessionType: 'work',
  sessionDuration: 25 * 60,
  client: '',
  project: '',
  task: ''
};

// Load timer state on startup
chrome.storage.local.get(['timerState'], (result) => {
  if (result.timerState) {
    timerState = { ...timerState, ...result.timerState };

    if (timerState.isRunning && !timerState.isPaused && timerState.startTime) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (timerState.currentTime <= 0) {
        handleTimerComplete();
      } else {
        timerState.endTime = Date.now() + (timerState.currentTime * 1000);
        saveTimerState();
      }
    }

    log('Timer state restored:', timerState);
  }
});

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

function updateExtensionIcon() {
  const minutes = Math.floor(timerState.currentTime / 60);
  const seconds = timerState.currentTime % 60;
  const badgeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#369EFF' });
  chrome.action.setTitle({
    title: `FocusBill Timer: ${badgeText}\nClient: ${timerState.client || 'None'}`
  });
}

function clearExtensionIcon() {
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setTitle({ title: 'FocusBill - Time Tracking & Invoicing' });
}

function handleTimerComplete() {
  log('Timer completed');

  if (timerState.startTime) {
    const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

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
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'FocusBill Timer Complete!',
    message: `${timerState.sessionType === 'work' ? 'Work session' : 'Break'} finished! Time logged.`,
    priority: 2
  });

  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.currentTime = timerState.sessionDuration;
  timerState.startTime = null;
  timerState.endTime = null;

  clearExtensionIcon();

  blockingEnabled = false;
  blockedSites = [];
  chrome.storage.local.set({ blockingState: { enabled: false, sites: [] } });

  saveTimerState();
}

// Timer tick — every second
chrome.alarms.create('timerTick', { periodInMinutes: 1/60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerTick') {
    if (timerState.isRunning && !timerState.isPaused) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (timerState.currentTime <= 0) {
        handleTimerComplete();
      } else {
        updateExtensionIcon();
        if (elapsed % 5 === 0) {
          saveTimerState();
        }
      }
    }
  }
});

// Handle messages from popup / dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'startBlocking') {
    blockingEnabled = true;
    blockedSites = request.sites || [];
    chrome.storage.local.set({ blockingState: { enabled: true, sites: blockedSites } });
    log('Blocking enabled for sites:', blockedSites);
    sendResponse({ success: true });
  }
  else if (request.action === 'stopBlocking') {
    blockingEnabled = false;
    blockedSites = [];
    chrome.storage.local.set({ blockingState: { enabled: false, sites: [] } });
    log('Blocking disabled');
    sendResponse({ success: true });
  }
  else if (request.action === 'ping') {
    sendResponse({ status: 'alive', blockingEnabled, blockedSites });
  }
  else if (request.action === 'startTimer') {
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
      timerState.startTime = Date.now() - ((timerState.sessionDuration - timerState.currentTime) * 1000);
      timerState.endTime = Date.now() + (timerState.currentTime * 1000);
    }

    saveTimerState();
    log(timerState.isPaused ? 'Timer paused' : 'Timer resumed');
    sendResponse({ success: true, isPaused: timerState.isPaused });
  }
  else if (request.action === 'stopTimer') {
    const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

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

    if (elapsedMinutes > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Timer Stopped',
        message: `${elapsedMinutes} minute(s) logged for ${timerState.client}`,
        priority: 1
      });
    }

    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.currentTime = timerState.sessionDuration;
    timerState.startTime = null;
    timerState.endTime = null;

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
    if (timerState.isRunning && !timerState.isPaused && timerState.startTime) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      timerState.currentTime = Math.max(0, timerState.sessionDuration - elapsed);

      if (timerState.currentTime <= 0) {
        handleTimerComplete();
      }
    }

    sendResponse({ success: true, timerState: { ...timerState } });
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

  return true;
});

log('FocusBill background service worker loaded (local-only mode)');
