// FocusBill - Smart Reminders & Auto-Tracking
// ============================================
// FREE Premium Feature: Intelligent work pattern detection and reminders

const SmartReminders = {
  // Analyze work patterns to suggest optimal break times
  analyzeBreakPatterns(timeLogs) {
    if (timeLogs.length < 5) {
      return null; // Not enough data
    }

    // Get last 7 days of work
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = timeLogs.filter(log => new Date(log.date) >= weekAgo);

    if (recentLogs.length === 0) return null;

    // Calculate average session length
    const avgMinutes = recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length;

    // Calculate most productive hours
    const hourlyData = {};
    recentLogs.forEach(log => {
      const hour = new Date(log.date).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, totalMinutes: 0 };
      }
      hourlyData[hour].count++;
      hourlyData[hour].totalMinutes += log.duration;
    });

    const productiveHours = Object.entries(hourlyData)
      .sort((a, b) => b[1].totalMinutes - a[1].totalMinutes)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      avgSessionMinutes: Math.round(avgMinutes),
      productiveHours: productiveHours,
      weeklyTotal: recentLogs.reduce((sum, log) => sum + log.duration, 0)
    };
  },

  // Generate smart reminder message based on current time
  getSmartReminder(patterns, currentHour) {
    if (!patterns) {
      return {
        title: '⏰ Time to Start Tracking',
        message: 'Ready to log some billable hours? Start a focus session now!',
        type: 'start'
      };
    }

    const isProductiveHour = patterns.productiveHours.includes(currentHour);

    if (isProductiveHour) {
      return {
        title: '🚀 Peak Performance Time!',
        message: `You're usually most productive at ${currentHour}:00. Perfect time to tackle that important task!`,
        type: 'peak'
      };
    }

    const suggestedDuration = Math.min(patterns.avgSessionMinutes, 45);

    return {
      title: '💡 Smart Suggestion',
      message: `Based on your patterns, a ${suggestedDuration}-minute session would be ideal right now.`,
      type: 'suggestion'
    };
  },

  // Check if user should take a break
  shouldSuggestBreak(lastSessionEnd, currentTime) {
    if (!lastSessionEnd) return false;

    const timeSinceBreak = currentTime - new Date(lastSessionEnd).getTime();
    const minutesSinceBreak = timeSinceBreak / (1000 * 60);

    // Suggest break after 2 hours of continuous work
    return minutesSinceBreak > 120;
  },

  // Generate weekly summary
  generateWeeklySummary(timeLogs, clients) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekLogs = timeLogs.filter(log => new Date(log.date) >= weekAgo);

    if (weekLogs.length === 0) {
      return null;
    }

    const totalMinutes = weekLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate revenue
    let totalRevenue = 0;
    weekLogs.forEach(log => {
      const client = clients.find(c => String(c.id) === String(log.client));
      if (client) {
        totalRevenue += (log.duration / 60) * client.rate;
      }
    });

    // Find top client
    const clientStats = {};
    weekLogs.forEach(log => {
      const clientId = String(log.client);
      if (!clientStats[clientId]) {
        clientStats[clientId] = 0;
      }
      clientStats[clientId] += log.duration;
    });

    const topClientId = Object.entries(clientStats)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const topClient = clients.find(c => String(c.id) === topClientId);

    return {
      totalHours: totalHours,
      totalSessions: weekLogs.length,
      totalRevenue: totalRevenue.toFixed(2),
      topClient: topClient ? topClient.name : 'Unknown',
      avgSessionMinutes: Math.round(totalMinutes / weekLogs.length)
    };
  },

  // Get motivational message based on progress
  getMotivationalMessage(todayMinutes, weeklyGoal = 2400) { // Default: 40 hours/week
    const percentage = (todayMinutes / (weeklyGoal / 5)) * 100; // Daily goal

    if (percentage >= 100) {
      return {
        emoji: '🎉',
        message: 'Incredible! You\'ve crushed today\'s goal!',
        type: 'success'
      };
    } else if (percentage >= 75) {
      return {
        emoji: '💪',
        message: 'Almost there! You\'re doing great!',
        type: 'progress'
      };
    } else if (percentage >= 50) {
      return {
        emoji: '👍',
        message: 'Halfway there! Keep the momentum going!',
        type: 'progress'
      };
    } else if (percentage >= 25) {
      return {
        emoji: '🌟',
        message: 'Good start! Let\'s keep building on this!',
        type: 'start'
      };
    } else {
      return {
        emoji: '⚡',
        message: 'Time to get started! Every session counts!',
        type: 'start'
      };
    }
  },

  // Detect idle time and suggest resuming work
  detectIdlePattern(timeLogs) {
    if (timeLogs.length === 0) return null;

    const lastLog = timeLogs[timeLogs.length - 1];
    const lastSessionTime = new Date(lastLog.date).getTime();
    const now = Date.now();
    const hoursSinceLastSession = (now - lastSessionTime) / (1000 * 60 * 60);

    // If more than 4 hours since last session during work hours
    const currentHour = new Date().getHours();
    const isWorkHours = currentHour >= 9 && currentHour <= 18;

    if (hoursSinceLastSession > 4 && isWorkHours) {
      return {
        title: '👋 Haven\'t seen you in a while!',
        message: `It's been ${Math.round(hoursSinceLastSession)} hours since your last session. Ready to track some more work?`,
        shouldNotify: true
      };
    }

    return null;
  }
};

// Export for use and make globally accessible
if (typeof window !== 'undefined') {
  window.SmartReminders = SmartReminders;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartReminders;
}
