# 🎨 Icon Customization Guide

## How to Change ANY Icon in FocusBill

All icons in the extension are centrally managed in **`icons-config.js`**. You can change any icon by editing this single file!

---

## 📍 Quick Start

1. **Open** `icons-config.js`
2. **Find** the icon you want to change
3. **Replace** with any emoji
4. **Reload** the extension
5. **Done!** ✨

---

## 🎯 Examples

### Change the App Icon
```javascript
// In icons-config.js
app: '⚡',  // Change to whatever you want!
app: '🚀',  // Rocket
app: '💼',  // Briefcase
app: '⭐',  // Star
```

### Change Timer Controls
```javascript
play: '▶',    // Default play
play: '🎬',   // Movie clapper
play: '🟢',   // Green circle

stop: '⏹',    // Default stop
stop: '🔴',   // Red circle
stop: '🛑',   // Stop sign
```

### Change Feature Icons
```javascript
clients: '👥',   // Default
clients: '🤝',   // Handshake
clients: '💼',   // Briefcase
clients: '🏢',   // Office building

invoices: '📄',  // Default
invoices: '🧾',  // Receipt
invoices: '💵',  // Dollar bill
invoices: '📜',  // Scroll
```

---

## 🔍 Where Icons Are Used

### **Popup (popup-new.html)**
- App icon in header
- Timer controls (play, pause, stop)
- Quick actions (block, note)
- Summary stats (hours, money, target)

### **Dashboard (dashboard.html)**
- Sidebar navigation icons
- Action buttons (add, edit, delete)
- Stats cards
- Status indicators

---

## 📚 Full Icon List

Here are all the icons you can customize:

### Main Features
- `app` - Main app icon (⚡)
- `timer` - Timer (⏱️)
- `clients` - Clients (👥)
- `sessions` - Sessions (📊)
- `invoices` - Invoices (📄)
- `expenses` - Expenses (💸)
- `projects` - Projects (📋)
- `notes` - Notes (📝)
- `settings` - Settings (⚙️)

### Actions
- `add` - Add new (<img src="icons/add_client.png" alt="Add ClientIcon" style="width: 16px; height:auto" />)
- `edit` - Edit (✏️)
- `delete` - Delete (<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" />)
- `export` - Export (📥)
- `refresh` - Refresh (🔄)
- `save` - Save (💾)
- `close` - Close (×)

### Timer Controls
- `play` - Play/Start (▶)
- `pause` - Pause (⏸)
- `stop` - Stop (⏹)
- `resume` - Resume (▶)

### Stats
- `hours` - Hours tracked (⏱️)
- `money` - Revenue (💰)
- `target` - Goals (🎯)
- `calendar` - Calendar (📅)
- `chart` - Charts (📊)

### Status
- `success` - Success (✅)
- `warning` - Warning (⚠️)
- `error` - Error (❌)
- `info` - Information (ℹ️)

---

## 🎨 Finding Emojis

### Best Emoji Resources:
1. **Emojipedia**: https://emojipedia.org/
2. **GetEmoji**: https://getemoji.com/
3. **Emoji Copy**: https://www.emojicopy.com/
4. **Windows Emoji Picker**: `Win + .` (Windows 10/11)
5. **Mac Emoji Picker**: `Cmd + Control + Space`

### Recommended Emoji Sets:

**Professional Business:**
- 💼 📊 📈 💰 🏢 📄 🧾 ✅ 🤝

**Modern Tech:**
- 🚀 ⚡ 💡 🔥 ⭐ 🎯 💎 🏆

**Minimalist:**
- ● ○ ■ □ ▲ ▼ → ← ✓ ✗

**Colorful Fun:**
- 🌈 🎨 🎉 🎊 🌟 ✨ 💫 🔮

---

## 💡 Tips

1. **Keep it consistent** - Use similar style emojis throughout
2. **Test visibility** - Some emojis are hard to see at small sizes
3. **Consider meaning** - Choose emojis that match the function
4. **Cross-platform** - Test on Windows, Mac, Linux if possible
5. **Backup first** - Save your original `icons-config.js` before major changes

---

## 🔄 Advanced: Dynamic Icons

Want different icons for different themes? Add this to `icons-config.js`:

```javascript
themes: {
  default: {
    app: '⚡',
    timer: '⏱️',
    money: '💰'
  },
  minimal: {
    app: '●',
    timer: '○',
    money: '$'
  },
  fun: {
    app: '🚀',
    timer: '⏰',
    money: '💸'
  }
}
```

Then in your code, switch themes:
```javascript
const currentTheme = Icons.themes.minimal;
```

---

## ❓ Need Help?

Can't find the right emoji? Want custom SVG icons instead? Let me know!

**Remember**: After changing `icons-config.js`, always **reload the extension** in Chrome to see your changes!

---

## 🎯 Pro Tip

Create your own icon theme and share it! Just copy `icons-config.js`, rename it to `icons-config-mytheme.js`, and share with other freelancers.

Happy customizing! 🎨✨
