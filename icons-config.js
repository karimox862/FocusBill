// FocusBill - Icon Configuration
// ==============================
// Edit these icons to customize the entire extension

const Icons = {
  // App Icon
  app: '⚡',

  // Main Features
  timer: '⏱️',
  clients: '👥',
  sessions: '📊',
  invoices: '📄',
  expenses: '💸',
  projects: '📋',
  notes: '📝',
  settings: '⚙️',

  // Actions
  add: '<img src="icons/add_client.png" alt="Add ClientIcon" style="width: 16px; height:auto" />',
  edit: '✏️',
  delete: '<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" />',
  export: '📥',
  refresh: '🔄',
  save: '💾',
  close: '×',

  // Status
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',

  // Timer Controls
  play: '▶',
  pause: '⏸',
  stop: '⏹',
  resume: '▶',

  // Stats
  hours: '⏱️',
  money: '💰',
  target: '🎯',
  calendar: '📅',
  chart: '📊',
  trend_up: '📈',
  trend_down: '📉',

  // Quick Actions
  block: '🚫',
  note: '📝',
  notification: '🔔',

  // Misc
  fire: '🔥',
  star: '⭐',
  heart: '❤️',
  rocket: '🚀',
  trophy: '🏆',
  medal: '🏅',
  gem: '💎',
  folder: '📂',
  link: '🔗',
  mail: '✉️',
  phone: '📞',
  location: '📍',
  user: '👤',
  team: '👥',
  briefcase: '💼',
  book: '📚',
  lightbulb: '💡',
  lightning: '⚡',
  checkmark: '✓',

  // You can add more emojis here or change existing ones
  // Just reload the extension after editing
};

// Export for use
if (typeof window !== 'undefined') {
  window.Icons = Icons;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Icons;
}
