# Extension Icon Badge Update Fix

## Problem
The extension icon (badge) at the top right of Chrome was not updating with the timer countdown until you clicked on the extension popup.

## Root Cause
The icon badge was being updated from the **popup** ([popup-new.js](popup-new.js)), but the popup is not always running. When the popup is closed, the badge cannot be updated. The badge must be updated from the **background service worker** which runs continuously.

## Solution

### Changes to [background.js](background.js)

#### 1. Added Icon Update Functions (Lines 166-187)

```javascript
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
```

#### 2. Update Badge Every Second (Line 233)

Added badge update to the alarm tick handler:

```javascript
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerTick') {
    if (timerState.isRunning && !timerState.isPaused) {
      // ... calculate current time ...

      // Update extension icon with current time
      updateExtensionIcon();  // ← NEW!

      // ... save state ...
    }
  }
});
```

#### 3. Update Badge on Timer Start (Line 313)

```javascript
else if (request.action === 'startTimer') {
  // ... set timer state ...

  // Update icon immediately
  updateExtensionIcon();  // ← NEW!

  saveTimerState();
}
```

#### 4. Clear Badge on Timer Stop (Lines 233, 373)

```javascript
function handleTimerComplete() {
  // ... handle completion ...

  // Clear extension icon
  clearExtensionIcon();  // ← NEW!
}

else if (request.action === 'stopTimer') {
  // ... stop timer ...

  // Clear extension icon
  clearExtensionIcon();  // ← NEW!
}
```

## How It Works Now

```
┌─────────────────────────────────────────────────────────┐
│  BACKGROUND SERVICE WORKER (Always Running)             │
│                                                          │
│  Timer Alarm Tick (every second)                        │
│  ↓                                                       │
│  Calculate current time                                 │
│  ↓                                                       │
│  updateExtensionIcon()                                  │
│  ↓                                                       │
│  chrome.action.setBadgeText()  ←  Updates the icon!    │
└─────────────────────────────────────────────────────────┘
                         ↓
                    Chrome UI
                         ↓
┌─────────────────────────────────────────────────────────┐
│  🔵 24:47  ← Extension icon shows timer in real-time    │
│                                                          │
│  Updates every second even when:                        │
│  ✅ Popup is closed                                     │
│  ✅ Browsing other tabs                                 │
│  ✅ Using other applications                            │
│  ✅ Chrome is minimized                                 │
└─────────────────────────────────────────────────────────┘
```

## Visual Example

### Before Fix:
```
Extension Icon:  🔴 FocusBill  (no badge)
User starts timer...
Extension Icon:  🔴 FocusBill  (no badge - frozen!)
User switches tab...
Extension Icon:  🔴 FocusBill  (no badge - still frozen)
User clicks extension...
Extension Icon:  🔵 24:47  (badge appears only after click)
```

### After Fix:
```
Extension Icon:  🔴 FocusBill  (no badge)
User starts timer...
Extension Icon:  🔵 24:59  (badge appears immediately!)
User switches tab...
Extension Icon:  🔵 24:58  (badge keeps updating!)
               🔵 24:57
               🔵 24:56
User clicks extension or not...
Extension Icon:  🔵 24:55  (continues counting in real-time)
```

## Features

### 1. **Real-time Badge Updates**
The badge shows the timer countdown in MM:SS format and updates every second, even when the popup is closed.

### 2. **Color Indication**
- **Blue badge** (`#369EFF`): Timer is running
- **No badge**: Timer is stopped

### 3. **Hover Tooltip**
Hover over the extension icon to see:
```
FocusBill Timer: 24:47
Client: Acme Corp
```

### 4. **Always Visible**
The timer is visible at all times in the Chrome toolbar, so you can see your progress without opening the popup.

## Testing

### Test 1: Badge Appears on Start
1. Open FocusBill extension
2. Select a client
3. Click "Start Focus"
4. ✅ Badge should appear on extension icon immediately showing "25:00"

### Test 2: Badge Updates When Popup Closed
1. Start timer
2. Close the popup (click away)
3. Watch the extension icon badge
4. ✅ Badge should count down every second: "24:59", "24:58", "24:57"...

### Test 3: Badge Updates While Browsing
1. Start timer
2. Browse to different websites
3. Check extension icon periodically
4. ✅ Badge should always show correct elapsed time

### Test 4: Badge Clears on Stop
1. Start timer
2. Stop timer (or let it complete)
3. ✅ Badge should disappear

### Test 5: Badge Updates Across Browser Windows
1. Start timer in one window
2. Open a new Chrome window
3. Check extension icon in both windows
4. ✅ Badge should show same time in all windows

## Browser Compatibility

| Feature | API | Chromium Support |
|---------|-----|------------------|
| Badge Text | `chrome.action.setBadgeText()` | ✅ Chrome 88+ |
| Badge Color | `chrome.action.setBadgeBackgroundColor()` | ✅ Chrome 88+ |
| Icon Title | `chrome.action.setTitle()` | ✅ Chrome 88+ |
| Background Alarms | `chrome.alarms` | ✅ Chrome 88+ |

## Performance Impact

- **CPU Usage:** Negligible (simple text update every second)
- **Memory:** No additional memory usage
- **Battery:** Minimal impact (alarm already running for timer)
- **Network:** None (all local operations)

## Limitations

### Badge Text Length
Chrome limits badge text to ~4 characters. Our format `MM:SS` fits perfectly:
- `25:00` ✅ (5 chars - displays fine)
- `9:30` ✅ (4 chars)
- `0:05` ✅ (4 chars)

For longer timers (>99 minutes), the badge might truncate. Consider switching to minutes-only display:
```javascript
// For timers > 99 minutes
if (minutes > 99) {
  badgeText = `${minutes}m`;
}
```

### Badge Visibility
- Badge is small - best for glanceable info
- Text might be hard to read on some displays
- Users can hover for full tooltip

## Additional Enhancements (Optional)

### 1. Color Changes Based on Time Remaining
```javascript
function updateExtensionIcon() {
  // ... calculate time ...

  let color = '#369EFF'; // Blue (plenty of time)

  if (timerState.currentTime < 300) { // < 5 minutes
    color = '#FF9500'; // Orange (warning)
  }
  if (timerState.currentTime < 60) { // < 1 minute
    color = '#FF3B30'; // Red (urgent)
  }

  chrome.action.setBadgeBackgroundColor({ color });
}
```

### 2. Different Badge for Paused State
```javascript
function updateExtensionIcon() {
  if (timerState.isPaused) {
    chrome.action.setBadgeText({ text: '⏸' });
    chrome.action.setBadgeBackgroundColor({ color: '#8E8E93' }); // Gray
    return;
  }
  // ... normal update ...
}
```

### 3. Minutes-Only Display for Long Timers
```javascript
function updateExtensionIcon() {
  const minutes = Math.floor(timerState.currentTime / 60);

  let badgeText;
  if (minutes < 10) {
    // Show MM:SS for < 10 minutes
    const seconds = timerState.currentTime % 60;
    badgeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // Show minutes only for >= 10 minutes
    badgeText = `${minutes}m`;
  }

  chrome.action.setBadgeText({ text: badgeText });
}
```

## Troubleshooting

### Badge Not Appearing
1. **Check Extension Permissions:**
   - Badge API requires no special permissions
   - Verify extension is enabled in `chrome://extensions/`

2. **Check Background Worker:**
   - Go to `chrome://extensions/`
   - Click "service worker" under FocusBill
   - Check console for errors

3. **Force Update:**
   ```javascript
   // In background console
   updateExtensionIcon();
   ```

### Badge Shows Wrong Time
1. **Sync Issue:** Background and popup out of sync
   - Reload extension
   - Clear storage: `chrome.storage.local.clear()`

2. **Clock Drift:** System time changed
   - Restart browser
   - Restart timer

### Badge Not Clearing
1. **Check Stop Logic:**
   ```javascript
   // In background console
   clearExtensionIcon();
   ```

2. **Manual Clear:**
   ```javascript
   chrome.action.setBadgeText({ text: '' });
   ```

## Related Files

- [background.js](background.js:166-187) - Badge update functions
- [popup-new.js](popup-new.js) - Popup display (separate from badge)
- [DISPLAY_FIX.md](DISPLAY_FIX.md) - Popup display fix
- [TIMER_FIX_README.md](TIMER_FIX_README.md) - Background timer implementation

## Success Criteria

✅ Badge appears immediately when timer starts
✅ Badge updates every second with correct time
✅ Badge continues updating when popup is closed
✅ Badge continues updating when browsing other tabs
✅ Badge clears when timer stops or completes
✅ Badge visible in all Chrome windows
✅ Tooltip shows full timer info on hover
