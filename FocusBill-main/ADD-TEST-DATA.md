# Add Test Data to FocusBill

## Quick Test Data Setup:

### 1. Open Dashboard Console (F12)

### 2. Copy and Paste This Code:

```javascript
// Add test clients
const testClients = [
  { id: 1734000001, name: 'Acme Corp', rate: 75 },
  { id: 1734000002, name: 'Tech Solutions', rate: 100 },
  { id: 1734000003, name: 'Startup Inc', rate: 50 }
];

// Add test time logs
const testTimeLogs = [
  { id: 1734000101, client: 1734000001, task: 'Website redesign', duration: 120, date: new Date().toISOString() },
  { id: 1734000102, client: 1734000002, task: 'API development', duration: 180, date: new Date(Date.now() - 86400000).toISOString() },
  { id: 1734000103, client: 1734000003, task: 'Bug fixes', duration: 60, date: new Date(Date.now() - 172800000).toISOString() },
  { id: 1734000104, client: 1734000001, task: 'Client meeting', duration: 90, date: new Date().toISOString() }
];

// Add test notes
const testNotes = [
  { id: 1734000201, content: 'Remember to follow up with Acme Corp about the project timeline', date: new Date().toISOString() },
  { id: 1734000202, content: 'Tech Solutions wants weekly progress reports', date: new Date().toISOString() }
];

// Save to storage
chrome.storage.local.get(['appData'], (result) => {
  const appData = result.appData || {};
  appData.clients = testClients;
  appData.timeLogs = testTimeLogs;
  appData.notes = testNotes;

  chrome.storage.local.set({ appData }, () => {
    console.log('✅ Test data added!');
    console.log('🔄 Refresh the page to see the data');
  });
});
```

### 3. Press Enter

### 4. Refresh Dashboard (F5)

You should now see:
- ✅ 3 clients in Clients page
- ✅ 4 sessions in Time Logs
- ✅ 2 notes in Notes page
- ✅ Stats showing in Overview

---

## Now Test Everything:

1. **Overview** - Should show stats
2. **Time Logs** - Click delete button on a session
3. **Clients** - Click edit/delete buttons
4. **Invoices** - Select "Acme Corp" and generate
5. **Notes** - Click delete on a note
