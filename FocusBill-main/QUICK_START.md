# Quick Start Guide - FocusBill

## 🚀 Installation (5 minutes)

### Step 1: Download Files
Make sure you have all these files in one folder:
- manifest.json
- popup.html
- popup.css
- popup.js
- background.js
- blocked.html
- invoice.html ⭐ (NEW!)
- content.js
- content.css

### Step 2: Install in Chrome
1. Open Chrome and go to: `chrome://extensions/`
2. Turn ON "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select your FocusBill folder
5. Done! The extension is now installed

### Step 3: Pin to Toolbar
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "FocusBill - Time Tracking & Invoicing"
3. Click the pin icon (📌) next to it
4. Now you can access it easily!

---

## ⚡ Quick Setup (2 minutes)

### 1. Add Your Info
1. Click FocusBill icon
2. Go to "Settings" tab
3. Fill in:
   - Your Name/Business: "John Doe Design"
   - Email: "john@example.com"
   - Default Rate: $75
4. Click "💾 Save All Settings"

### 2. Add Your First Client
1. Still in Settings tab
2. Scroll to "📊 Clients" section
3. Enter client name: "Acme Corp"
4. Enter rate: $100
5. Click "Add Client"

### 3. Set Up Blocking (Optional)
1. In Settings, scroll to "🚫 Blocked Websites"
2. Click "+ Social Media" to add all social sites
3. Or add custom sites like "news.com"

---

## 🎯 Daily Workflow

### Morning: Start Your Day
1. Click FocusBill icon
2. Select your client
3. Add task: "Website redesign"
4. Check "Block distracting websites"
5. Click "Start Focus"

### During Work:
- ✅ Timer runs in background even if you close popup
- ✅ Blocked sites show motivational message
- ✅ Time tracked automatically

### End of Day:
1. Go to "Time Logs" tab
2. View today's stats
3. See all sessions completed

### End of Week/Month:
1. Go to "Invoice" tab
2. Select client
3. Choose period: "This Month"
4. Click "📄 Generate Professional Invoice"
5. New tab opens with beautiful invoice
6. Click "Download PDF" or "Print"

---

## 📄 Invoice Features

### What You Get:
```
┌─────────────────────────────────────┐
│   🎨 INVOICE                        │
│   Purple gradient header            │
│   #INV-123456                       │
├─────────────────────────────────────┤
│   FROM:              BILL TO:       │
│   Your Business      Client Name    │
│   your@email.com     client@email   │
├─────────────────────────────────────┤
│   Invoice Date: Jan 15, 2025        │
│   Due Date: Feb 14, 2025            │
│   Period: This Month                │
├─────────────────────────────────────┤
│   Date  Description  Hours  Amount  │
│   Jan 1  Web Design  2.5    $187.50 │
│   Jan 2  Consulting  1.0    $75.00  │
│   Jan 3  Development 3.5    $262.50 │
├─────────────────────────────────────┤
│   Subtotal:              $525.00    │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│   TOTAL DUE:             $525.00    │
├─────────────────────────────────────┤
│   Payment Terms                     │
│   Payment due within 30 days        │
└─────────────────────────────────────┘
```

### Professional Features:
- ✨ Modern purple gradient design
- 📋 All work items listed with details
- 💰 Clear totals and payment terms
- 📥 Download as PDF with one click
- 🖨️ Print-optimized layout
- 📱 Responsive on all devices

---

## 💡 Pro Tips

### 1. Pomodoro Technique
- Keep default 25-min work sessions
- Take 5-min breaks
- After 4 sessions, take 15-min break

### 2. Blocking Strategy
- Add sites you check compulsively
- Include news sites during focus time
- Use preset categories for quick setup

### 3. Billing Tips
- Generate invoices weekly for regular clients
- Send invoices same day each week
- Use "Copy Invoice Text" for quick emails

### 4. Client Management
- Set different rates per client
- Use task descriptions for detailed tracking
- Review time logs before invoicing

### 5. Productivity Tracking
- Check "Today's Progress" daily
- Set a target (e.g., 4 sessions/day)
- Review weekly trends in Time Logs

---

## 🎯 Example Day

**9:00 AM** - Start day, click FocusBill
- Select "Acme Corp"
- Task: "Homepage redesign"
- Start 25-min focus session

**9:25 AM** - Session complete!
- Take 5-min break
- Stats update automatically

**9:30 AM** - Start session #2
- Same client, new task: "Mobile layout"
- Another 25 minutes

**12:00 PM** - Check progress
- Go to "Time Logs" tab
- See: 4 sessions, 1.67 billable hours
- Today's earnings: $125

**5:00 PM** - End of day
- 8 completed sessions
- 3.33 billable hours
- Ready to bill $250

**Friday 5:00 PM** - Invoice time!
- Go to "Invoice" tab
- Select "Acme Corp"
- Choose "This Week"
- Generate invoice
- Download PDF
- Email to client

---

## 🔥 Keyboard Shortcuts

While using FocusBill:
- **Ctrl+P** (on invoice page) = Print invoice
- **Ctrl+S** (on invoice page) = Save as PDF

---

## 📊 Understanding Your Stats

### Today's Progress Card:
- **Billable Time**: Work sessions only (breaks excluded)
- **Sessions**: Number of completed focus sessions
- Updates in real-time

### Time Logs:
- **Filter by period**: Today, Week, Month, All Time
- **Per-client view**: See work for each client
- **Duration**: Shown in minutes (converted to hours in invoice)

### Invoice Preview:
- **Total Hours**: Decimal format (2.5 hrs = 2h 30m)
- **Real-time calculation**: Updates as you change rate
- **Pre-bill check**: Verify amounts before generating

---

## ❓ Common Questions

**Q: Does the timer keep running if I close Chrome?**
A: No, closing Chrome stops the timer. But it saves progress when you close the popup!

**Q: Can I edit time logs after creation?**
A: Currently, you can only delete logs. Edit feature coming soon!

**Q: Can I customize invoice design?**
A: The invoice uses your business name/email from Settings. Full customization coming in future update!

**Q: Do clients receive invoices automatically?**
A: No, you download the PDF and send it yourself via email.

**Q: Where is my data stored?**
A: All data is stored locally in Chrome storage on your computer. Nothing is sent to servers.

**Q: Can I export all my time data?**
A: Not yet, but this feature is planned for a future update!

---

## 🆘 Need Help?

**Extension Not Working?**
1. Check all files are in same folder
2. Go to chrome://extensions/
3. Click "Reload" button under FocusBill
4. Check for error messages

**Timer Resetting?**
1. Make sure you're using latest version
2. Check manifest.json has "storage" permission
3. Try reinstalling extension

**Sites Not Blocking?**
1. Verify checkbox is checked before starting
2. Sites need to be in blocked list
3. Try clearing browser cache

**Invoice Not Generating?**
1. Must have time logs for selected period
2. Must select a client
3. Check internet connection (loads PDF library)

---

## 🎉 You're Ready!

Now you know everything about FocusBill! Start your first focus session and enjoy:

✅ Automatic time tracking
✅ Distraction-free work
✅ Professional invoices
✅ Better productivity

**Happy focusing! ⚡**

---

*Questions? Check README.md for full documentation*
