# Debugging Guide - FocusBill

## 🔍 How to Debug Website Blocking Issues

If websites aren't being blocked during focus sessions, follow these steps:

### Step 1: Check Console Logs

#### Open Background Script Console:
1. Go to `chrome://extensions/`
2. Find "FocusBill"
3. Click "Inspect views: service worker" (or "background page")
4. A DevTools window opens - this is your background script console

#### What to Look For:
When you start a focus session, you should see:
```
🚫 Blocking enabled for sites: ['facebook.com', 'twitter.com', 'x.com', ...]
```

When you try to visit a blocked site, you should see:
```
🚫 BLOCKED navigation to: facebook.com
```

Or if allowed:
```
✅ Allowed: google.com
```

### Step 2: Check Popup Console

#### Open Popup Console:
1. Right-click the FocusBill extension icon
2. Select "Inspect"
3. Go to Console tab

#### What to Look For:
When starting timer:
```
🚫 Sending blocking request with sites: [array of sites]
Blocking response: {success: true}
```

When timer stops:
```
Time log saved: {client: "123", task: "...", duration: 25, ...}
```

### Step 3: Verify Extension Permissions

Check manifest.json has these permissions:
```json
"permissions": [
  "storage",
  "tabs",
  "notifications",
  "alarms",
  "webNavigation"
],
"host_permissions": [
  "<all_urls>"
]
```

### Step 4: Test Blocking Step-by-Step

1. **Open background console** (see Step 1)
2. **Click FocusBill icon**
3. **Select a client** (must be selected!)
4. **Make sure "Block distracting websites" is checked** ✅
5. **Click "Start Focus"**
6. **Check background console** - should show "Blocking enabled"
7. **Try to visit facebook.com**
8. **Check background console** - should show "BLOCKED navigation"
9. **Should redirect to blocked.html page**

### Step 5: Common Issues & Solutions

#### Issue: "Blocking enabled" but sites not blocked

**Possible Causes:**
- Extension permissions not granted
- Service worker crashed/stopped
- Site not in blocked list
- Different URL format

**Solutions:**
1. Reload extension: `chrome://extensions/` > click reload button
2. Check blocked sites list in Settings tab
3. Try adding the exact domain you're testing
4. Check if you're using https:// or http:// (both should be blocked)

#### Issue: No console messages at all

**Possible Causes:**
- Service worker not running
- Extension not properly installed

**Solutions:**
1. Go to `chrome://extensions/`
2. Click "Reload" under FocusBill
3. Click "Inspect views: service worker" to wake it up
4. Try starting focus session again

#### Issue: Time log not saving

**Check Console For:**
```javascript
Time log saved: {...}
All time logs: [...]
```

**If you see "Session was too short":**
- Timer must run for at least 1 minute to log time
- Only "Work" sessions are logged (not breaks)

**If no message appears:**
- Check if session type is "Work" (not "Short Break" or "Long Break")
- Check if client was selected before starting

#### Issue: Invoice shows "No time logs found"

**Debug Steps:**
1. Open popup console (right-click icon > Inspect)
2. Go to Invoice tab
3. Select client and click Generate
4. Look for console messages:
```
Filtering logs for client: [client ID]
Client logs found: [array]
Logs after period filter: [array]
```

**If "Client logs found: []" (empty array):**
- Client ID mismatch - this update should fix it
- Check if you completed a work session for this client
- Check if session was at least 1 minute

### Step 6: Manual Testing

#### Test Blocking Manually:

1. Open background console
2. Paste this code:
```javascript
blockingEnabled = true;
blockedSites = ['facebook.com', 'twitter.com'];
console.log('Manual blocking enabled:', blockedSites);
```
3. Try to visit facebook.com
4. Should be blocked

#### Test Time Log Manually:

1. Open popup console
2. Go to Time Logs tab
3. Paste this code:
```javascript
console.log('All time logs:', appData.timeLogs);
console.log('All clients:', appData.clients);
```
4. Check the output - logs should have matching client IDs

### Step 7: Complete Reset (Last Resort)

If nothing works:

1. **Export your data** (go to Settings and note your clients/settings)
2. Go to Settings > Danger Zone
3. Click "Clear All Data"
4. Go to `chrome://extensions/`
5. Remove FocusBill
6. Reload the page
7. Click "Load unpacked" again
8. Select FocusBill folder
9. Set up from scratch

### Debug Checklist

Before reporting an issue, verify:

- [ ] Extension is installed and enabled
- [ ] "Block distracting websites" checkbox is checked
- [ ] Client is selected before starting timer
- [ ] Background service worker is running (inspect views)
- [ ] No console errors in background script
- [ ] No console errors in popup
- [ ] Blocked sites list has sites you're testing
- [ ] Testing with exact domain (e.g., facebook.com not fb.com)
- [ ] Session type is "Work" (not break)
- [ ] Timer ran for at least 1 minute

### Understanding the Blocking System

#### How It Works:

1. **Start Timer** → Popup sends message to background script
2. **Background Script** → Stores blocked sites list
3. **You Navigate** → Background script intercepts navigation
4. **Check URL** → Compares with blocked list
5. **Block/Allow** → Redirects to blocked.html or allows navigation

#### Blocking Methods Used:

- `webNavigation.onBeforeNavigate` - Catches new page loads
- `tabs.onUpdated` - Catches URL changes in existing tabs

#### URL Matching Logic:

```javascript
// All these will match "facebook.com":
- facebook.com
- www.facebook.com
- m.facebook.com
- business.facebook.com
- https://facebook.com/page
- http://facebook.com
```

### Getting More Help

**Still having issues?**

1. **Gather Debug Info:**
   - Background console screenshot
   - Popup console screenshot
   - Your blocked sites list
   - Steps to reproduce the issue

2. **Check Console for Errors:**
   - Red error messages
   - Failed requests
   - Permission denials

3. **Try Incognito Mode:**
   - Sometimes other extensions interfere
   - Enable FocusBill in incognito: `chrome://extensions/` > Details > "Allow in incognito"

### Version Information

**Current Version:** 2.1
**Last Updated:** Oct 30, 2025

**Recent Fixes:**
- ✅ Added x.com to blocked sites
- ✅ Fixed client ID string/number mismatch
- ✅ Improved blocking detection logic
- ✅ Added blocking state persistence
- ✅ Enhanced console logging for debugging
- ✅ Better error messages

### Technical Details

**Blocking State Persistence:**
The extension now saves blocking state to Chrome storage, so if the service worker restarts, blocking continues.

**Client ID Handling:**
All client IDs are now explicitly converted to strings for comparison, fixing the "no time logs found" issue.

**Enhanced Matching:**
Blocking now checks:
- Exact domain match
- Subdomain match
- Partial string match (both directions)

This catches more variations like:
- facebook.com
- www.facebook.com  
- m.facebook.com
- any.subdomain.facebook.com

---

## 🎯 Quick Test Script

Run this in background console to verify blocking works:

```javascript
// Test blocking system
console.log('=== BLOCKING TEST ===');
console.log('Enabled:', blockingEnabled);
console.log('Sites:', blockedSites);

// Manually enable
blockingEnabled = true;
blockedSites = ['facebook.com', 'youtube.com'];

// Test URL matching
const testUrls = [
  'https://www.facebook.com/home',
  'https://youtube.com/watch?v=123',
  'https://google.com'
];

testUrls.forEach(url => {
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  const blocked = blockedSites.some(site => 
    hostname.includes(site) || site.includes(hostname)
  );
  console.log(`${blocked ? '🚫' : '✅'} ${url} - ${hostname}`);
});
```

Expected output:
```
🚫 https://www.facebook.com/home - facebook.com
🚫 https://youtube.com/watch?v=123 - youtube.com
✅ https://google.com - google.com
```

---

**Happy debugging! If you find other issues, check CHANGELOG.md for updates.**
