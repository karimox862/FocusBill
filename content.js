// FocusBill - Content Script
// ===========================

// This script runs on all pages and can be used for:
// 1. Displaying timer overlay
// 2. Showing blocking warnings
// 3. Tracking time on specific sites

let timerOverlay = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showTimerOverlay') {
    showTimerOverlay(request.time);
  } else if (request.action === 'hideTimerOverlay') {
    hideTimerOverlay();
  }
  
  return true;
});

function showTimerOverlay(timeRemaining) {
  if (timerOverlay) return;

  timerOverlay = document.createElement('div');
  timerOverlay.id = 'focusbill-timer-overlay';
  timerOverlay.innerHTML = `
    <div class="focusbill-timer-badge">
      ⚡ ${timeRemaining}
    </div>
  `;
  document.body.appendChild(timerOverlay);
}

function hideTimerOverlay() {
  if (timerOverlay) {
    timerOverlay.remove();
    timerOverlay = null;
  }
}

// Check if current site should be blocked
function checkIfBlocked() {
  const hostname = window.location.hostname.replace('www.', '');
  
  chrome.storage.local.get(['appData'], (result) => {
    if (result.appData && result.appData.blockedSites) {
      const isBlocked = result.appData.blockedSites.some(site => 
        hostname.includes(site) || site.includes(hostname)
      );
      
      // This is handled by background.js now
    }
  });
}

console.log('FocusBill content script loaded');
