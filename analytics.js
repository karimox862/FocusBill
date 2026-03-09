// FocusBill Pro - Advanced Analytics & Smart Features
// ===================================================

const AnalyticsEngine = {
  // Analyze work patterns and generate insights
  analyzeWorkPatterns(timeLogs, clients) {
    const insights = {
      topClients: this.getTopClients(timeLogs, clients),
      productivityTrends: this.getProductivityTrends(timeLogs),
      revenueProjection: this.projectRevenue(timeLogs, clients),
      workCategories: this.categorizeWork(timeLogs),
      suggestions: []
    };

    // Generate smart suggestions
    insights.suggestions = this.generateSuggestions(insights);

    return insights;
  },

  // Get top clients by time spent
  getTopClients(timeLogs, clients) {
    const clientTime = {};

    timeLogs.forEach(log => {
      const clientId = String(log.client);
      if (!clientTime[clientId]) {
        clientTime[clientId] = { totalMinutes: 0, sessions: 0 };
      }
      clientTime[clientId].totalMinutes += log.duration;
      clientTime[clientId].sessions += 1;
    });

    return Object.entries(clientTime)
      .map(([clientId, data]) => {
        const client = clients.find(c => String(c.id) === clientId);
        return {
          clientName: client ? client.name : 'Unknown',
          clientId: clientId,
          totalHours: (data.totalMinutes / 60).toFixed(1),
          sessions: data.sessions,
          revenue: client ? ((data.totalMinutes / 60) * client.rate).toFixed(2) : 0
        };
      })
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 5);
  },

  // Analyze productivity trends (last 30 days)
  getProductivityTrends(timeLogs) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLogs = timeLogs.filter(log => new Date(log.date) >= last30Days);

    const dailyData = {};
    recentLogs.forEach(log => {
      const day = new Date(log.date).toDateString();
      if (!dailyData[day]) {
        dailyData[day] = { minutes: 0, sessions: 0 };
      }
      dailyData[day].minutes += log.duration;
      dailyData[day].sessions += 1;
    });

    const days = Object.keys(dailyData).length;
    const totalMinutes = Object.values(dailyData).reduce((sum, d) => sum + d.minutes, 0);
    const avgHoursPerDay = days > 0 ? (totalMinutes / 60 / days).toFixed(1) : 0;

    return {
      last30Days: {
        totalHours: (totalMinutes / 60).toFixed(1),
        avgHoursPerDay: avgHoursPerDay,
        totalSessions: recentLogs.length,
        workingDays: days
      },
      trend: this.calculateTrend(dailyData)
    };
  },

  // Calculate if trending up or down
  calculateTrend(dailyData) {
    const days = Object.keys(dailyData).sort();
    if (days.length < 2) return 'stable';

    const firstHalf = days.slice(0, Math.floor(days.length / 2));
    const secondHalf = days.slice(Math.floor(days.length / 2));

    const firstAvg = firstHalf.reduce((sum, day) => sum + dailyData[day].minutes, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + dailyData[day].minutes, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  },

  // Project revenue for current month
  projectRevenue(timeLogs, clients) {
    const now = new Date();
    const thisMonth = timeLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    });

    const totalRevenue = thisMonth.reduce((sum, log) => {
      const client = clients.find(c => String(c.id) === String(log.client));
      const rate = client ? client.rate : 75;
      return sum + (log.duration / 60) * rate;
    }, 0);

    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedRevenue = (totalRevenue / dayOfMonth) * daysInMonth;

    return {
      currentMonth: totalRevenue.toFixed(2),
      projected: projectedRevenue.toFixed(2),
      daysRemaining: daysInMonth - dayOfMonth
    };
  },

  // Categorize work based on task descriptions
  categorizeWork(timeLogs) {
    const categories = {
      development: { keywords: ['code', 'dev', 'develop', 'build', 'implement', 'program', 'bug', 'fix', 'feature'], count: 0, hours: 0 },
      meeting: { keywords: ['meeting', 'call', 'discussion', 'standup', 'sync', 'review'], count: 0, hours: 0 },
      design: { keywords: ['design', 'ui', 'ux', 'mockup', 'wireframe', 'prototype'], count: 0, hours: 0 },
      research: { keywords: ['research', 'investigate', 'study', 'analyze', 'explore'], count: 0, hours: 0 },
      documentation: { keywords: ['document', 'write', 'doc', 'readme', 'guide', 'manual'], count: 0, hours: 0 },
      testing: { keywords: ['test', 'qa', 'debug', 'troubleshoot'], count: 0, hours: 0 },
      planning: { keywords: ['plan', 'strategy', 'roadmap', 'estimate', 'scope'], count: 0, hours: 0 }
    };

    timeLogs.forEach(log => {
      const task = (log.task || '').toLowerCase();
      let categorized = false;

      for (const [category, data] of Object.entries(categories)) {
        if (data.keywords.some(keyword => task.includes(keyword))) {
          categories[category].count += 1;
          categories[category].hours += log.duration / 60;
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        if (!categories.other) {
          categories.other = { count: 0, hours: 0 };
        }
        categories.other.count += 1;
        categories.other.hours += log.duration / 60;
      }
    });

    return Object.entries(categories)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        category: name.charAt(0).toUpperCase() + name.slice(1),
        sessions: data.count,
        hours: data.hours.toFixed(1),
        percentage: ((data.count / timeLogs.length) * 100).toFixed(0)
      }))
      .sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));
  },

  // Generate smart suggestions
  generateSuggestions(insights) {
    const suggestions = [];

    // Revenue suggestion
    if (insights.revenueProjection.daysRemaining > 0) {
      const dailyTarget = (parseFloat(insights.revenueProjection.projected) - parseFloat(insights.revenueProjection.currentMonth)) / insights.revenueProjection.daysRemaining;
      suggestions.push({
        type: 'revenue',
        icon: '💰',
        title: 'Revenue Target',
        message: `Work $${dailyTarget.toFixed(0)}/day to hit your projected monthly revenue of $${insights.revenueProjection.projected}`
      });
    }

    // Productivity trend suggestion
    const trend = insights.productivityTrends.trend;
    if (trend === 'increasing') {
      suggestions.push({
        type: 'success',
        icon: '📈',
        title: 'Great Progress!',
        message: 'Your work hours are trending up. Keep up the momentum!'
      });
    } else if (trend === 'decreasing') {
      suggestions.push({
        type: 'warning',
        icon: '📉',
        title: 'Productivity Dip',
        message: 'Your work hours are declining. Consider blocking more distractions or adjusting your schedule.'
      });
    }

    // Work balance suggestion
    const categories = insights.workCategories;
    if (categories.length > 0) {
      const topCategory = categories[0];
      if (parseFloat(topCategory.percentage) > 50) {
        suggestions.push({
          type: 'tip',
          icon: '⚖️',
          title: 'Work Balance',
          message: `${topCategory.category} takes up ${topCategory.percentage}% of your time. Consider diversifying your work.`
        });
      }
    }

    // Client concentration
    if (insights.topClients.length > 0) {
      const topClient = insights.topClients[0];
      const totalRevenue = insights.topClients.reduce((sum, c) => sum + parseFloat(c.revenue), 0);
      const concentration = (parseFloat(topClient.revenue) / totalRevenue) * 100;

      if (concentration > 60) {
        suggestions.push({
          type: 'warning',
          icon: '🎯',
          title: 'Client Concentration Risk',
          message: `${concentration.toFixed(0)}% of revenue from ${topClient.clientName}. Consider diversifying your client base.`
        });
      }
    }

    return suggestions;
  },

  // Generate professional invoice description
  generateProfessionalDescription(task, category = 'Professional Services') {
    if (!task || task.trim() === '') {
      return 'Professional services rendered';
    }

    // Clean up common casual language
    let professional = task
      .replace(/^(fixed|fix)/i, 'Resolved')
      .replace(/^(made|make)/i, 'Implemented')
      .replace(/^(did|do)/i, 'Completed')
      .replace(/^(worked on)/i, 'Developed')
      .replace(/bug/gi, 'issue')
      .replace(/stuff/gi, 'components');

    // Capitalize first letter
    professional = professional.charAt(0).toUpperCase() + professional.slice(1);

    // Add period if missing
    if (!professional.endsWith('.')) {
      professional += '.';
    }

    return professional;
  },

  // Generate work summary for invoice
  generateWorkSummary(logs, client) {
    if (logs.length === 0) return 'No work recorded.';

    const categories = this.categorizeWork(logs);
    const totalHours = logs.reduce((sum, log) => sum + log.duration, 0) / 60;

    let summary = `Professional services for ${client.name}:\n\n`;

    if (categories.length > 0) {
      summary += 'Work breakdown:\n';
      categories.forEach(cat => {
        summary += `• ${cat.category}: ${cat.hours} hours (${cat.sessions} sessions)\n`;
      });
    }

    summary += `\nTotal: ${totalHours.toFixed(1)} hours across ${logs.length} work sessions.`;

    return summary;
  }
};

// Export for use in popup.js and make globally accessible
if (typeof window !== 'undefined') {
  window.AnalyticsEngine = AnalyticsEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsEngine;
}
