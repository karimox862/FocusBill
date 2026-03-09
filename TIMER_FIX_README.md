# Timer Persistence Fix

## Problem
The timer at the top right was stopping after changing tabs or leaving the extension popup.

## Solution
Moved timer logic from the popup to the **background service worker**, which runs continuously even when the popup is closed. The popup now communicates with the background worker via message passing.

## Changes Made

### 1. [background.js](background.js)
- Added complete timer management system that runs independently
- Timer updates every second using `chrome.alarms` API
- Handles timer start, pause, resume, stop, and completion
- Automatically saves time logs when timer completes or is stopped
- Persists timer state to Chrome storage for recovery after browser restarts

### 2. [popup-new.js](popup-new.js)
- Removed local `setInterval` timer logic
- Added `syncTimerStateFromBackground()` function to poll timer state from background
- Updated `startTimer()`, `pauseTimer()`, and `stopTimer()` to send messages to background worker
- Added `startBackgroundSync()` to continuously sync timer display (every 1 second)
- UI now reflects the actual timer state from the background worker

## How It Works

```
┌─────────────────┐         Messages          ┌──────────────────────┐
│   Popup UI      │◄──────────────────────────►│  Background Worker   │
│  (popup-new.js) │                            │   (background.js)    │
│                 │  - startTimer              │                      │
│  - Display      │  - pauseTimer              │  - Runs timer        │
│  - Controls     │  - stopTimer               │  - Saves logs        │
│  - Sync state   │  - getTimerState           │  - Persists state    │
└─────────────────┘                            └──────────────────────┘
                                                        │
                                                        ▼
                                                 Chrome Storage
                                                 - timerState
                                                 - timeLogs
```

## Testing Instructions

### Test 1: Timer Continues When Popup Closes
1. Open the FocusBill extension
2. Select a client
3. Click "Start Focus"
4. Note the current time (e.g., 24:55)
5. **Close the popup** or switch to another tab
6. Wait 10-15 seconds
7. Reopen the extension popup
8. ✅ **Expected:** Timer should show ~10-15 seconds less (e.g., 24:40)

### Test 2: Timer Continues When Changing Browser Tabs
1. Start the timer with a client selected
2. Open a new browser tab (e.g., visit google.com)
3. Wait 30 seconds
4. Return to the extension popup
5. ✅ **Expected:** Timer should have decreased by ~30 seconds

### Test 3: Pause/Resume Works Across Sessions
1. Start the timer
2. Click "Pause"
3. Close the extension popup
4. Wait 20 seconds
5. Reopen the popup
6. ✅ **Expected:** Timer should still be paused at the same time
7. Click "Resume"
8. Close and reopen popup
9. ✅ **Expected:** Timer should be counting down

### Test 4: Timer Completes in Background
1. Start a timer with a short duration (e.g., 1 minute)
2. Immediately close the popup
3. Wait for the duration to complete
4. Open the popup
5. ✅ **Expected:** Timer should be stopped, time log should be saved, notification should appear

### Test 5: Browser Restart Recovery
1. Start the timer
2. Note the time remaining
3. Close the browser completely
4. Wait 10 seconds
5. Reopen browser and open extension
6. ✅ **Expected:** Timer should resume with adjusted time

## Technical Details

### Background Service Worker
- Uses `chrome.alarms.create('timerTick', { periodInMinutes: 1/60 })` for second-by-second updates
- Stores timer state including:
  - `isRunning`, `isPaused`, `currentTime`
  - `startTime` (timestamp) for calculating elapsed time
  - `sessionDuration` (total duration in seconds)
  - Client, project, and task info

### Message Passing API
The popup sends these messages to the background:
- `startTimer` - Starts the timer with session data
- `pauseTimer` - Toggles pause state
- `stopTimer` - Stops timer and saves log
- `getTimerState` - Gets current timer state
- `resetTimer` - Resets timer to default

### State Synchronization
- Background updates timer every second via alarms
- Popup polls background every second when timer is running
- State is persisted to `chrome.storage.local` every 5 seconds
- On popup open, immediately syncs with background worker

## Troubleshooting

### Timer still stops
1. Check browser console for errors
2. Verify background service worker is running:
   - Go to `chrome://extensions`
   - Find FocusBill
   - Click "service worker" link to see background console
3. Check if messages are being sent/received

### Timer out of sync
1. The popup syncs every second when running
2. If out of sync, close and reopen popup
3. Background worker is the source of truth

### Notifications not appearing
1. Check browser notification permissions
2. Verify `notifications` permission in manifest.json
3. Check browser notification settings

## Future Improvements
- Add visual indicator in extension icon showing timer is running
- Add badge text showing remaining time on extension icon
- Implement Web Workers for more precise timing
- Add offline support with IndexedDB backup
