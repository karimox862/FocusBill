// FocusBill - Background Service Worker
// ======================================

let blockingEnabled = false;
let blockedSites = [];

// Load blocking state from storage on startup
chrome.storage.local.get(['blockingState'], (result) => {
  if (result.blockingState) {
    blockingEnabled = result.blockingState.enabled || false;
    blockedSites = result.blockingState.sites || [];
    console.log('Restored blocking state:', { blockingEnabled, blockedSites });
  }
});

// Intercept navigation requests
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!blockingEnabled || details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace(/^www\./, '');

    // Check if site is blocked
    const isBlocked = blockedSites.some(site => {
      const cleanSite = site.replace(/^www\./, '');
      // Check exact match, subdomain match, or partial match
      return hostname === cleanSite || 
             hostname.endsWith('.' + cleanSite) || 
             cleanSite.endsWith('.' + hostname) ||
             hostname.includes(cleanSite) ||
             cleanSite.includes(hostname);
    });

    if (isBlocked) {
      console.log('🚫 BLOCKED navigation to:', hostname, 'from:', details.url);
      // Redirect to blocking page
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });
    } else {
      console.log('✅ Allowed:', hostname);
    }
  } catch (e) {
    console.error('❌ Error in onBeforeNavigate:', e);
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
      return hostname === cleanSite || 
             hostname.endsWith('.' + cleanSite) || 
             cleanSite.endsWith('.' + hostname) ||
             hostname.includes(cleanSite) ||
             cleanSite.includes(hostname);
    });

    if (isBlocked) {
      console.log('🚫 BLOCKED tab update to:', hostname);
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });
    }
  } catch (e) {
    // Invalid URL, ignore
    console.error('❌ Error in onUpdated:', e);
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

    console.log('Timer state restored:', timerState);
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
  console.log('⏰ Timer completed!');

  // Calculate elapsed time and save log
  if (timerState.startTime) {
    const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes > 0 && timerState.client) {
      // Save time log
      chrome.storage.local.get(['timeLogs'], (result) => {
        const logs = result.timeLogs || [];
        logs.push({
          id: Date.now(),
          date: new Date().toISOString(),
          client: timerState.client,
          project: timerState.project,
          task: timerState.task,
          duration: elapsedMinutes,
          sessionType: timerState.sessionType
        });
        chrome.storage.local.set({ timeLogs: logs });
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

    console.log('🚫 Blocking enabled for sites:', blockedSites);
    sendResponse({ success: true });
  }
  else if (request.action === 'stopBlocking') {
    blockingEnabled = false;
    blockedSites = [];

    chrome.storage.local.set({
      blockingState: { enabled: false, sites: [] }
    });

    console.log('✅ Blocking disabled');
    sendResponse({ success: true });
  }
  else if (request.action === 'ping') {
    sendResponse({ status: 'alive', blockingEnabled, blockedSites });
  }

  // Timer control messages
  else if (request.action === 'startTimer') {
    timerState.isRunning = true;
    timerState.isPaused = false;
    timerState.startTime = Date.now();
    timerState.currentTime = request.sessionDuration || (25 * 60);
    timerState.sessionDuration = request.sessionDuration || (25 * 60);
    timerState.endTime = timerState.startTime + (timerState.currentTime * 1000);
    timerState.sessionType = request.sessionType || 'work';
    timerState.client = request.client || '';
    timerState.project = request.project || '';
    timerState.task = request.task || '';

    // Update icon immediately
    updateExtensionIcon();

    saveTimerState();
    console.log('▶️ Timer started:', timerState);
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
    console.log(timerState.isPaused ? '⏸️ Timer paused' : '▶️ Timer resumed');
    sendResponse({ success: true, isPaused: timerState.isPaused });
  }
  else if (request.action === 'stopTimer') {
    // Calculate elapsed time before stopping
    const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    // Save time log if there's time and client selected
    if (elapsedMinutes > 0 && timerState.client) {
      chrome.storage.local.get(['timeLogs'], (result) => {
        const logs = result.timeLogs || [];
        logs.push({
          id: Date.now(),
          date: new Date().toISOString(),
          client: timerState.client,
          project: timerState.project,
          task: timerState.task,
          duration: elapsedMinutes,
          sessionType: timerState.sessionType
        });
        chrome.storage.local.set({ timeLogs: logs });
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
    console.log('⏹️ Timer stopped');
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
    console.log('🔄 Timer reset');
    sendResponse({ success: true });
  }

  return true;
});

// Keep service worker alive
setInterval(() => {
  console.log('Service worker heartbeat');
}, 20000);

console.log('FocusBill background service worker loaded');
