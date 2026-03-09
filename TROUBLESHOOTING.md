# Timer Fix Troubleshooting Guide

## Quick Fix Steps

If the timer is not working, follow these steps:

### Step 1: Reload the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Find "FocusBill - Time Tracking & Invoicing"
3. Click the **reload icon** (circular arrow) on the extension card
4. Close and reopen the extension popup

### Step 2: Check Background Service Worker
1. In `chrome://extensions/`, find FocusBill
2. Click the blue **"service worker"** link (under "Inspect views")
3. This opens the background console
4. You should see: `"FocusBill background service worker loaded"`
5. Keep this console open while testing

### Step 3: Test Timer
1. Open the extension popup
2. Select a client from the dropdown
3. Click "Start Focus"
4. In the popup console (F12 > Console), you should see:
   - `🚀 Starting timer for client: [client name]`
   - `✅ Timer started in background`
   - `✅ Timer UI updated`
5. In the background console, you should see:
   - `▶️ Timer started: {isRunning: true, ...}`

### Step 4: Test Persistence
1. With timer running, close the popup
2. Wait 10 seconds
3. Reopen the popup
4. Timer should continue counting down

## Common Issues & Solutions

### Issue 1: Timer Starts But Immediately Stops
**Symptoms:** Timer counts down for 1-2 seconds then stops

**Solutions:**
- Check background console for errors
- Make sure only ONE timer is running
- Clear extension storage:
  ```javascript
  // In popup console (F12)
  chrome.storage.local.clear(() => console.log('Storage cleared'));
  ```
- Reload extension and try again

### Issue 2: Timer Doesn't Start At All
**Symptoms:** Clicking "Start Focus" does nothing

**Solutions:**
- Check if client is selected
- Open popup console (F12) and look for errors
- Check background worker is running (`chrome://extensions/`)
- Try reloading the extension

### Issue 3: Timer Resets When Popup Closes
**Symptoms:** Timer goes back to 25:00 when reopening popup

**Cause:** Background worker not running or message passing failing

**Solutions:**
1. Check background service worker status:
   - Go to `chrome://extensions/`
   - Find FocusBill
   - Look for "service worker" link (should say "inactive" or show blue link)
   - If inactive, click it to wake it up

2. Check for Chrome errors:
   - In background console, look for red error messages
   - Common error: "Extension context invalidated" - means extension was reloaded mid-operation

3. Clear and restart:
   ```javascript
   // In background console
   chrome.storage.local.remove(['timerState'], () => {
     console.log('Timer state cleared');
   });
   ```

### Issue 4: Timer Syncs But Doesn't Update Display
**Symptoms:** Timer is running in background but popup shows static time

**Solutions:**
- Check popup console for errors in `updateTimerDisplay()`
- Make sure `timer-value` element exists in HTML
- Try closing and reopening popup

### Issue 5: Multiple Timers Running
**Symptoms:** Timer jumps around or counts down too fast

**Cause:** Multiple alarm listeners or old intervals still running

**Solutions:**
1. Stop all timers:
   ```javascript
   // In background console
   chrome.alarms.clearAll(() => {
     console.log('All alarms cleared');
   });
   ```

2. Reload extension completely

3. Restart browser if issue persists

## Debugging Commands

### Check Timer State (Background Console)
```javascript
chrome.storage.local.get(['timerState'], (result) => {
  console.log('Current timer state:', result.timerState);
});
```

### Check All Alarms (Background Console)
```javascript
chrome.alarms.getAll((alarms) => {
  console.log('Active alarms:', alarms);
});
```

### Check Time Logs (Popup Console)
```javascript
chrome.storage.local.get(['timeLogs'], (result) => {
  console.log('Time logs:', result.timeLogs);
});
```

### Clear Everything (Nuclear Option)
```javascript
// In either console
chrome.storage.local.clear(() => {
  chrome.alarms.clearAll(() => {
    console.log('Everything cleared - reload extension');
  });
});
```

## Expected Console Output

### When Starting Timer

**Popup Console:**
```
🚀 Starting timer for client: Client Name
✅ Timer started in background: {success: true}
✅ Timer UI updated
```

**Background Console:**
```
▶️ Timer started: {
  isRunning: true,
  isPaused: false,
  currentTime: 1500,
  startTime: 1234567890123,
  client: "Client Name",
  ...
}
```

### When Timer Is Running

**Background Console (every second):**
```
Service worker heartbeat
```

**Background Console (every 5 seconds):**
```
Timer state saved (implicit - no console log)
```

### When Popup Reopens

**Popup Console:**
```
Timer state restored: {isRunning: true, currentTime: 1485, ...}
```

## Still Not Working?

If none of these solutions work:

1. **Check Chrome Version:**
   - Go to `chrome://version/`
   - Extension requires Chrome 88+ for Manifest V3

2. **Check Extension Permissions:**
   - Go to `chrome://extensions/`
   - Click "Details" on FocusBill
   - Ensure these permissions are granted:
     - Storage
     - Notifications
     - Alarms

3. **Try Incognito Mode:**
   - Go to `chrome://extensions/`
   - Enable "Allow in incognito" for FocusBill
   - Test in incognito window

4. **Fresh Install:**
   - Remove extension completely
   - Clear browser cache
   - Reinstall extension from folder

5. **Check Browser Console:**
   - Press F12 anywhere in Chrome
   - Look for red errors related to FocusBill

## Advanced: Manual Timer Test

To test the background timer directly:

1. Open background console (`chrome://extensions/` > service worker)

2. Manually start timer:
```javascript
// Send start message
chrome.runtime.sendMessage({
  action: 'startTimer',
  sessionDuration: 60, // 1 minute
  sessionType: 'work',
  client: 'Test Client',
  task: 'Testing'
}, (response) => {
  console.log('Response:', response);
});
```

3. Check timer state:
```javascript
chrome.runtime.sendMessage({
  action: 'getTimerState'
}, (response) => {
  console.log('Timer state:', response.timerState);
});
```

4. Watch it count down (check every 5 seconds)

5. Stop timer:
```javascript
chrome.runtime.sendMessage({
  action: 'stopTimer'
}, (response) => {
  console.log('Timer stopped:', response);
});
```

## Contact & Reporting

If you're still experiencing issues:

1. Open background console
2. Open popup console
3. Try to start timer
4. Copy all console output (both consoles)
5. Report the issue with:
   - Console output
   - Chrome version
   - Steps to reproduce
   - Expected vs actual behavior
