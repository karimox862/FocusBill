# FocusBill - Professional Time Tracking & Invoicing Extension

<img width="128" height="128" alt="icon128" src="https://github.com/user-attachments/assets/87f168bb-d1ed-4fa9-8c30-b4de40b75d06" />


## 🎉 Latest Updates

**Version 2.1 - Critical Bug Fixes:**
- 🐛 **Fixed: No time logs found** - Resolved client ID mismatch causing invoice generation to fail
- 🐛 **Fixed: Website blocking** - Enhanced blocking logic and added state persistence
- ✨ **Added: x.com blocking** - Twitter's new domain now included in blocked sites
- 🔧 **Better debugging** - Console logs help troubleshoot issues (see DEBUG_GUIDE.md)

**Version 2.0 - Professional PDF Invoices:**
- ✨ **Beautiful PDF Invoices** - Generate professional, designed invoices with one click
- 📄 **Print-Ready Format** - Perfect formatting for printing or saving as PDF
- 💼 **Professional Design** - Modern gradient header, organized layout, and clear typography
- 📥 **Easy Download** - Download as PDF or print directly from the invoice page
- 📋 **Text Copy Option** - Still includes plain text copy for quick emails

## 🔧 All Fixed Issues

### 1. ✅ Timer Persistence Fixed
**Problem:** Timer was resetting when you clicked outside the popup or changed tabs.

**Solution:** 
- Timer state is now saved to Chrome storage every 5 seconds
- When you reopen the popup, the timer automatically resumes from where it left off
- Works even if you close and reopen the browser!

### 2. ✅ Website Blocking Fixed
**Problem:** Blocked websites weren't actually being blocked.

**Solution:**
- Added missing `webNavigation` permission to manifest.json
- Improved blocking logic to handle various URL formats (with/without www, subdomains, etc.)
- Added better error handling and logging for debugging

### 3. ✅ Professional Invoice Generation
**Problem:** Invoices were plain text files with poor formatting.

**Solution:**
- Created beautiful HTML invoice template with professional design
- Integrated html2pdf.js for easy PDF generation
- Modern purple gradient design matching the app theme
- Clear line items, totals, and payment terms
- Print-optimized layout

## 📦 Installation Instructions

1. **Open Chrome Extensions Page:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

2. **Remove Old Version (if installed):**
   - Find "FocusBill" in your extensions list
   - Click "Remove" to uninstall the old version

3. **Load Updated Extension:**
   - Click "Load unpacked"
   - Select the folder containing these files
   - The extension should now appear in your extensions list

4. **Pin to Toolbar (Recommended):**
   - Click the puzzle piece icon in Chrome toolbar
   - Find FocusBill and click the pin icon
   - This makes it easier to access

## 🎯 How to Use

### Starting a Focus Session:
1. Open FocusBill extension
2. Select a client from the dropdown
3. Enter task description
4. Choose session type (Work, Short Break, or Long Break)
5. Check "Block distracting websites" to enable blocking
6. Click "Start Focus"

### Generating an Invoice:
1. Go to the "Invoice" tab
2. Select a client
3. Choose time period (Today, This Week, This Month)
4. Enter hourly rate
5. Review the preview
6. Click "📄 Generate Professional Invoice"
7. A new tab opens with your invoice
8. Click "Download PDF" or "Print" button

### Managing Blocked Sites:
1. Go to "Settings" tab
2. Add custom sites or use preset categories
3. Sites will be blocked during focus sessions

## 🚀 Key Features

- **⏱️ Persistent Timer** - Never lose your progress when popup closes
- **🚫 Website Blocking** - Stay focused by blocking distracting sites during work
- **📊 Time Tracking** - Track billable hours by client/project automatically
- **💰 Professional Invoices** - Generate beautiful PDF invoices with one click
- **📈 Statistics** - View your daily productivity stats and session history
- **👥 Client Management** - Add unlimited clients with custom hourly rates
- **🎨 Beautiful Design** - Modern purple gradient design throughout

## 📁 Files Included

- **manifest.json** - Extension configuration (with all permissions)
- **popup.html** - Main interface with 4 tabs (Timer, Logs, Invoice, Settings)
- **popup.css** - Modern styling with gradients and animations
- **popup.js** - Core logic with timer persistence
- **background.js** - Background worker for site blocking
- **blocked.html** - Motivational page shown when sites are blocked
- **invoice.html** - Professional invoice template (NEW!)
- **content.js** - Content script for page interactions
- **content.css** - Content styles
- **README.md** - This comprehensive guide

## 💡 Invoice Features

### What's Included:
- **Professional Header** - Purple gradient with invoice number
- **Company Details** - Your business info and client info side-by-side
- **Invoice Metadata** - Issue date, due date, and period covered
- **Detailed Line Items** - Date, description, hours, rate, and amount for each entry
- **Clear Totals** - Subtotal and total due prominently displayed
- **Payment Terms** - Standard 30-day payment terms included
- **Modern Design** - Clean, professional layout that impresses clients

### Download Options:
1. **PDF Download** - Click "Download PDF" button to save as PDF file
2. **Print** - Click "Print" button to print or save as PDF via browser
3. **Copy Text** - Use "Copy Invoice Text" in popup for plain text version

## 🎨 Customization

### Personalize Your Invoices:
1. Go to Settings tab
2. Fill in "Your Name/Business"
3. Add your email address
4. Set your default hourly rate
5. These details appear on all generated invoices

### Customize Timer Durations:
1. Go to Settings > Timer Settings
2. Adjust work duration (default: 25 min)
3. Adjust short break (default: 5 min)
4. Adjust long break (default: 15 min)

## 🐛 Troubleshooting

**Timer still resets?**
- Make sure you're using the latest files
- Check Chrome DevTools console for errors (F12)
- Try removing and reinstalling the extension

**Websites not blocking?**
- Verify "Block distracting websites" is checked before starting
- Check that the site is in your blocked list (Settings tab)
- Look for console errors in background page (chrome://extensions > Details > Inspect views)

**Invoice not generating?**
- Ensure you've selected a client
- Verify you have time logs for the selected period
- Check that you've entered your business info in Settings
- Try refreshing the extension

**PDF download not working?**
- Make sure you have internet connection (loads html2pdf.js from CDN)
- Try using Print option instead and save as PDF
- Check browser's download settings

## 🔒 Privacy & Data

- All data stored locally in Chrome storage
- No data sent to external servers
- No tracking or analytics
- Your time logs and client info stay on your device

## 📊 Statistics & Reporting

- **Today's Stats** - Quick view of hours and sessions completed today
- **Time Logs** - Detailed history with filters (Today, Week, Month, All Time)
- **Per-Client Tracking** - See all work done for each client
- **Invoice Preview** - Real-time calculation of amounts before generating

## 🎉 Tips for Success

1. **Start with Test Session** - Try a 5-minute session first to test blocking
2. **Add Your Top Distractions** - Use preset categories or add custom sites
3. **Set Realistic Goals** - Start with 2-3 focus sessions per day
4. **Review Weekly** - Check your time logs every Friday
5. **Bill Regularly** - Generate invoices at the end of each week/month
6. **Customize Settings** - Adjust timer durations to fit your workflow

## 🚀 What's Next?

Ready to boost your productivity and streamline your billing? Install FocusBill and:
1. Set up your profile in Settings
2. Add your first client
3. Start your first focus session
4. Track your time automatically
5. Generate your first professional invoice

**Focus on your work, we'll handle the rest!**

---

*FocusBill - Focus. Track. Bill. ⚡*
