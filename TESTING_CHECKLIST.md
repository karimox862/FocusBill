# Testing Checklist - FocusBill v2.1

Use this checklist to verify all features work correctly after installation.

## ✅ Installation Tests

### Basic Installation
- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Extension icon appears in toolbar
- [ ] Clicking icon opens popup (400x500px window)
- [ ] All 4 tabs visible: Timer, Time Logs, Invoice, Settings
- [ ] No console errors in popup (right-click icon > Inspect)
- [ ] No errors in background script (Inspect views: service worker)

## ✅ Settings Tests

### Personal Information
- [ ] Can enter "Your Name/Business"
- [ ] Can enter email address
- [ ] Can set default hourly rate
- [ ] Settings save successfully (click "💾 Save All Settings")
- [ ] Settings persist after closing/reopening popup

### Client Management
- [ ] Can add new client with name and rate
- [ ] Client appears in clients list
- [ ] Client appears in Timer tab dropdown
- [ ] Client appears in Invoice tab dropdown
- [ ] Can delete client (asks for confirmation)
- [ ] Deleted client removed from dropdowns

### Blocked Sites
- [ ] Default sites present: facebook.com, twitter.com, x.com, etc.
- [ ] Can add custom site (e.g., "news.com")
- [ ] Added site appears in list
- [ ] Can remove site from list
- [ ] "Add Social Media" button adds multiple sites
- [ ] "Add News Sites" button works
- [ ] "Add Entertainment" button works
- [ ] Sites persist after closing popup

### Timer Settings
- [ ] Can change work duration (default 25 min)
- [ ] Can change short break (default 5 min)
- [ ] Can change long break (default 15 min)
- [ ] Changes reflect in Timer tab after saving
- [ ] Timer display updates with new durations

## ✅ Timer Tests

### Basic Timer Function
- [ ] Timer displays default time (25:00)
- [ ] Session type dropdown has 3 options (Work, Short Break, Long Break)
- [ ] Changing session type updates timer display
- [ ] Client dropdown shows all added clients
- [ ] Can enter task description
- [ ] "Block distracting websites" checkbox is checked by default

### Starting Timer
- [ ] Cannot start without selecting client (shows alert)
- [ ] Clicking "Start Focus" changes to Pause/Stop buttons
- [ ] Timer counts down (25:00 → 24:59 → 24:58...)
- [ ] Notification appears: "Focus Session Started"
- [ ] Today's Progress card shows session started

### Timer Persistence ⭐ CRITICAL
- [ ] Start timer, let it run for 10 seconds
- [ ] Close popup (click outside or switch tabs)
- [ ] Wait 5 seconds
- [ ] Reopen popup
- [ ] Timer still running with correct time
- [ ] Pause/Stop buttons still visible
- [ ] Session info (client, task) still there

### Pause/Resume
- [ ] Click "Pause" - timer stops counting
- [ ] Button changes to "Resume"
- [ ] Click "Resume" - timer continues from where it paused
- [ ] Button changes back to "Pause"
- [ ] Persistence works while paused (close/reopen popup)

### Stopping Timer
- [ ] Let timer run for at least 1 minute
- [ ] Click "Stop & Save"
- [ ] Notification: "Focus Session Completed"
- [ ] Timer resets to 25:00
- [ ] Start button visible again
- [ ] Today's stats update (billable time increases)

### Session Types
- [ ] Work session logs time
- [ ] Short break (5 min) does NOT log billable time
- [ ] Long break (15 min) does NOT log billable time
- [ ] Each session type has correct duration

## ✅ Website Blocking Tests ⭐ CRITICAL

### Setup
- [ ] Open background console: `chrome://extensions/` > Inspect views: service worker
- [ ] Keep this console open during tests

### Basic Blocking
- [ ] Add "facebook.com" to blocked sites (if not already there)
- [ ] Select a client
- [ ] Check "Block distracting websites" is enabled ✅
- [ ] Click "Start Focus"
- [ ] Background console shows: "🚫 Blocking enabled for sites: [...]"
- [ ] Open new tab and go to facebook.com
- [ ] Background console shows: "🚫 BLOCKED navigation to: facebook.com"
- [ ] Should redirect to blocked.html page (purple gradient, motivational message)

### Testing x.com (Twitter)
- [ ] "x.com" in blocked sites list
- [ ] With timer running, try to visit x.com
- [ ] Should be blocked (redirects to blocked.html)

### Testing Different URL Formats
All these should be blocked if "facebook.com" is in list:
- [ ] facebook.com
- [ ] www.facebook.com
- [ ] https://facebook.com
- [ ] http://facebook.com
- [ ] m.facebook.com
- [ ] business.facebook.com/page

### Testing Non-Blocked Sites
- [ ] With timer running, visit google.com
- [ ] Background console shows: "✅ Allowed: google.com"
- [ ] Page loads normally (not blocked)

### Blocking Persistence
- [ ] Start timer with blocking enabled
- [ ] Close popup
- [ ] Try to visit blocked site
- [ ] Should still be blocked (background script remembers)

### Stop Blocking
- [ ] Click "Stop & Save" on timer
- [ ] Try to visit previously blocked site
- [ ] Should now be allowed (blocking disabled)
- [ ] Background console shows: "✅ Blocking disabled"

## ✅ Time Logs Tests

### Viewing Logs
- [ ] Go to "Time Logs" tab
- [ ] Completed sessions appear in list
- [ ] Each log shows: client name, task, duration, date
- [ ] Logs sorted by date (newest first)
- [ ] Filter dropdown has: Today, This Week, This Month, All Time

### Log Filtering
- [ ] "Today" shows only today's logs
- [ ] "This Week" shows this week's logs
- [ ] "This Month" shows this month's logs
- [ ] "All Time" shows everything

### Log Details
- [ ] Client name displayed correctly
- [ ] Task description shown (or "Work" if blank)
- [ ] Duration shown in minutes
- [ ] Date/time formatted nicely

### Summary Stats
- [ ] "Total Time" shows sum of all filtered logs
- [ ] "Billable Time" shows only work sessions (excludes breaks)
- [ ] Stats update when changing filter

### Delete Logs
- [ ] Can delete individual logs
- [ ] Confirmation dialog appears
- [ ] Log removed from list after confirmation
- [ ] Stats update after deletion

## ✅ Invoice Tests ⭐ CRITICAL

### Setup
- [ ] Complete at least 1 work session (1+ minutes)
- [ ] Go to "Invoice" tab

### Preview
- [ ] Select client from dropdown
- [ ] Preview shows "Total Hours" (e.g., 0.4 hrs for 25 min)
- [ ] Preview shows hourly rate
- [ ] Preview shows total amount (hours × rate)
- [ ] Changing rate updates total in real-time
- [ ] Changing period updates preview

### Generating Invoice ⭐ CRITICAL TEST
- [ ] Select client who has logged time
- [ ] Choose period (e.g., "Today")
- [ ] Verify preview shows correct hours
- [ ] Click "📄 Generate Professional Invoice"
- [ ] New tab opens with invoice.html
- [ ] Invoice displays with purple gradient header
- [ ] "From" section shows your business name/email
- [ ] "Bill To" shows client name/email
- [ ] Invoice date is today
- [ ] Due date is 30 days from today
- [ ] Line items table shows all sessions
- [ ] Each row has: date, description, hours, rate, amount
- [ ] Subtotal matches sum of line items
- [ ] Total matches subtotal (since no tax)
- [ ] Payment terms shown in footer

### Invoice Actions
- [ ] Click "Download PDF" button
- [ ] PDF downloads to computer (check Downloads folder)
- [ ] PDF filename includes client name and date
- [ ] PDF has all invoice content
- [ ] Click "Print" button
- [ ] Browser print dialog opens
- [ ] Print preview looks good
- [ ] Can save as PDF from print dialog

### Copy Invoice Text
- [ ] Go back to popup Invoice tab
- [ ] Click "📋 Copy Invoice Text"
- [ ] Paste into text editor
- [ ] Plain text invoice with all details
- [ ] Formatted for email readability

### No Logs Scenario
- [ ] Select client with NO logged time
- [ ] Try to generate invoice
- [ ] Alert shows: "No time logs found for this client in the selected period"
- [ ] Alert includes helpful debug info

## ✅ Today's Progress Tests

### Stats Display
- [ ] "Billable Time" shows total work hours today
- [ ] "Sessions" shows number of completed focus sessions
- [ ] Stats show "0h 0m" and "0" when starting fresh

### Real-time Updates
- [ ] Complete a work session
- [ ] Stats immediately update
- [ ] Hours increase correctly (25 min → 0h 25m)
- [ ] Session count increases by 1

### Multiple Sessions
- [ ] Complete multiple work sessions
- [ ] Hours accumulate (25+25 = 50 min → 0h 50m)
- [ ] Session count increases each time
- [ ] Stats persist across popup close/open

## ✅ Data Persistence Tests

### Close/Reopen Tests
- [ ] Add clients, close popup, reopen → clients still there
- [ ] Add blocked sites, close popup, reopen → sites still there
- [ ] Change settings, close popup, reopen → settings saved
- [ ] Complete sessions, close popup, reopen → logs still there
- [ ] All stats persist correctly

### Browser Restart Test
- [ ] Close Chrome completely
- [ ] Reopen Chrome
- [ ] Open FocusBill
- [ ] All data still present (clients, logs, settings, blocked sites)

### Timer Running During Browser Close ⚠️
- [ ] Start timer
- [ ] Close Chrome completely (note the time left)
- [ ] Reopen Chrome
- [ ] Open FocusBill
- [ ] Timer resets (this is expected - timer doesn't run when browser closed)
- [ ] Can start new session

## ✅ Edge Cases & Error Handling

### Empty States
- [ ] No clients: dropdown shows "Select client..."
- [ ] No logs: shows empty state message with emoji
- [ ] No blocked sites: list is empty but can add sites

### Validation
- [ ] Cannot start timer without client (alert shown)
- [ ] Cannot generate invoice without client (alert shown)
- [ ] Cannot generate invoice without logs (alert shown)
- [ ] Short sessions (<1 min) show warning

### Special Characters
- [ ] Client name with special chars (e.g., "O'Brien & Associates")
- [ ] Task with emojis (e.g., "🎨 Design work")
- [ ] Site with port (e.g., "example.com:8080") - may not work perfectly

### Large Numbers
- [ ] Work session of 60+ minutes logs correctly
- [ ] Multiple sessions (10+) display correctly
- [ ] Large hourly rate ($500+) calculates correctly
- [ ] Many clients (20+) all show in dropdown

## ✅ Performance Tests

### Speed
- [ ] Popup opens instantly (<500ms)
- [ ] Switching tabs is smooth (<100ms)
- [ ] Timer updates are smooth (no lag)
- [ ] Invoice generation is fast (<2 seconds)
- [ ] PDF download completes within 5 seconds

### Memory
- [ ] Extension uses <20 MB memory (check Task Manager)
- [ ] No memory leaks during extended use
- [ ] Browser remains responsive

## ✅ Console Check

### No Errors
- [ ] Popup console: no red error messages
- [ ] Background console: no red error messages
- [ ] Only info/log messages (blue/gray)

### Expected Messages
- [ ] Starting timer: "🚫 Sending blocking request..."
- [ ] Blocking enabled: "🚫 Blocking enabled for sites:..."
- [ ] Navigation blocked: "🚫 BLOCKED navigation to:..."
- [ ] Timer stopped: "Time log saved:..."
- [ ] Service worker: "Service worker heartbeat" every 20 seconds

## 🐛 Known Limitations

Current limitations to be aware of:
- [ ] Timer stops if browser closes (doesn't run in background)
- [ ] Blocking may not work on some system pages (chrome://, about:)
- [ ] Service worker may sleep after inactivity (click icon to wake)
- [ ] Very short sessions (<1 min) are not logged

## 📊 Test Results Summary

Total tests: ~120
Passed: ___
Failed: ___
Skipped: ___

### Critical Features (Must Work):
- [ ] Timer persistence (close/reopen popup)
- [ ] Website blocking during focus sessions
- [ ] Time logging after completing session
- [ ] Invoice generation with correct data
- [ ] Client ID matching (no "no logs found" error)

### Priority Fixes Needed:
1. _______________________________________
2. _______________________________________
3. _______________________________________

---

## 🎯 Quick Smoke Test (5 minutes)

Don't have time for full test? Run this quick check:

1. [ ] Install extension
2. [ ] Add a client named "Test Client" with rate $100
3. [ ] Add "facebook.com" to blocked sites
4. [ ] Start 25-min work session for "Test Client"
5. [ ] Try to visit facebook.com → should be blocked
6. [ ] Close popup, wait 10 seconds, reopen → timer still running
7. [ ] Let 1+ minute pass, click "Stop & Save"
8. [ ] Go to Time Logs → see 1 entry
9. [ ] Go to Invoice → select "Test Client" → preview shows hours
10. [ ] Click "Generate Professional Invoice" → new tab opens with PDF

If all 10 steps work ✅, extension is working correctly!

---

**Testing Date:** _______________
**Tested By:** _______________
**Chrome Version:** _______________
**OS:** _______________

**Overall Status:** 
- [ ] All Critical Features Working
- [ ] Some Issues (see notes)
- [ ] Major Issues (see DEBUG_GUIDE.md)
