# 🐛 Debug Instructions

## Steps to Debug:

### 1. Reload Extension
```
1. chrome://extensions/
2. Find FocusBill
3. Click RELOAD button
4. Close all dashboard tabs
5. Open fresh dashboard
```

### 2. Open Browser Console
```
1. With dashboard open, press F12
2. Click "Console" tab
3. Look for these messages:
```

Expected console output:
```
🚀 FocusBill Dashboard Initializing...
✅ Dashboard Ready!
✅ All event listeners set up
✅ window.deleteClient and window.editClient defined
✅ window.deleteNote defined
✅ window.deleteSession defined
```

### 3. Test Each Feature and Check Console:

#### Test Delete Session:
1. Go to Time Logs page
2. Click delete button (<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" />)
3. **Look in console** - should see: `<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" /> Delete session called: [id]`
4. If you DON'T see this message, the button isn't calling the function

#### Test Edit/Delete Client:
1. Go to Clients page
2. Click edit button (✏️)
3. **Look in console** - should see: `✏️ Edit client called: [id]`
4. Click delete button (<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" />)
5. **Look in console** - should see: `<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" /> Delete client called: [id]`

#### Test Expenses Button:
1. Go to Expenses page
2. **Look in console** - should see: `Expense button found: [HTMLButtonElement]`
3. Click "+ Add Expense"
4. **Look in console** - should see: `💸 Expense button clicked!`
5. Should see alert popup

#### Test Notes:
1. Go to Notes page
2. Click "+ New Note"
3. Modal should open
4. Type something and click "Save Note"
5. Should see alert "Note added successfully!"

#### Test Invoice with Payment Links:
1. Go to Settings
2. Scroll to "Payment Integration"
3. Enter:
   - Stripe: `https://buy.stripe.com/test123`
   - PayPal: `https://paypal.me/testuser`
4. Go to Invoices
5. Select a client
6. Click "Generate Invoice"
7. New tab should open
8. **Scroll to bottom of invoice**
9. Should see purple "Pay with Card (Stripe)" button
10. Should see blue "Pay with PayPal" button

---

## 📋 Send Me This Info:

After following steps above, tell me:

### What appears in console?
Copy and paste the console output

### Which buttons work / don't work?
- [ ] Delete session button - YES/NO
- [ ] Edit client button - YES/NO
- [ ] Delete client button - YES/NO
- [ ] Expenses button - YES/NO
- [ ] Notes add/delete - YES/NO
- [ ] Invoice payment buttons appear - YES/NO

### Any errors in console?
Red error messages?

---

This will help me understand EXACTLY what's broken!
