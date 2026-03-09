// FocusBill - Recurring Invoices & Retainer Management (FREE Premium Feature)
// =============================================================================
// Track retainers, generate recurring invoices, and manage subscription billing

const RecurringManager = {
  // Recurring frequencies
  frequencies: [
    { id: 'weekly', name: 'Weekly', days: 7 },
    { id: 'biweekly', name: 'Bi-weekly', days: 14 },
    { id: 'monthly', name: 'Monthly', days: 30 },
    { id: 'quarterly', name: 'Quarterly', days: 90 },
    { id: 'yearly', name: 'Yearly', days: 365 }
  ],

  // Create a recurring invoice
  createRecurring(recurring) {
    if (!recurring.clientId || !recurring.amount || !recurring.frequency) {
      throw new Error('Client, amount, and frequency are required');
    }

    return {
      id: Date.now(),
      clientId: String(recurring.clientId),
      name: recurring.name || 'Recurring Invoice',
      description: recurring.description || '',
      amount: parseFloat(recurring.amount),
      frequency: recurring.frequency, // weekly, monthly, etc.
      startDate: recurring.startDate || new Date().toISOString(),
      endDate: recurring.endDate || null, // null = indefinite
      lastInvoiced: null,
      nextInvoiceDate: recurring.startDate || new Date().toISOString(),
      status: recurring.status || 'active', // active, paused, completed
      invoicesSent: 0,
      totalBilled: 0,
      autoSend: recurring.autoSend || false,
      createdAt: new Date().toISOString()
    };
  },

  // Create a retainer agreement
  createRetainer(retainer) {
    if (!retainer.clientId || !retainer.monthlyAmount || !retainer.hoursIncluded) {
      throw new Error('Client, monthly amount, and hours included are required');
    }

    return {
      id: Date.now(),
      clientId: String(retainer.clientId),
      name: retainer.name || 'Retainer Agreement',
      monthlyAmount: parseFloat(retainer.monthlyAmount),
      hoursIncluded: parseFloat(retainer.hoursIncluded),
      rolloverHours: retainer.rolloverHours || false, // Can unused hours carry over?
      rolloverLimit: parseFloat(retainer.rolloverLimit) || 0, // Max hours that can rollover
      startDate: retainer.startDate || new Date().toISOString(),
      endDate: retainer.endDate || null,
      status: retainer.status || 'active', // active, paused, completed
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: this.getNextMonthDate(new Date()).toISOString(),
      hoursUsed: 0,
      hoursRollover: 0,
      overageRate: parseFloat(retainer.overageRate) || 0, // Rate for hours beyond included
      invoiceDay: parseInt(retainer.invoiceDay) || 1, // Day of month to invoice (1-28)
      createdAt: new Date().toISOString()
    };
  },

  // Calculate retainer status
  calculateRetainerStatus(retainer, timeLogs) {
    const now = new Date();
    const periodStart = new Date(retainer.currentPeriodStart);
    const periodEnd = new Date(retainer.currentPeriodEnd);

    // Get time logs for current period
    const periodLogs = timeLogs.filter(log => {
      const logDate = new Date(log.date);
      return String(log.client) === String(retainer.clientId) &&
        logDate >= periodStart &&
        logDate <= periodEnd;
    });

    const hoursUsed = periodLogs.reduce((sum, log) => sum + (log.duration / 60), 0);
    const hoursAvailable = retainer.hoursIncluded + retainer.hoursRollover;
    const hoursRemaining = Math.max(0, hoursAvailable - hoursUsed);
    const overageHours = Math.max(0, hoursUsed - hoursAvailable);
    const overageCharges = overageHours * retainer.overageRate;
    const percentageUsed = hoursAvailable > 0 ? (hoursUsed / hoursAvailable * 100) : 0;

    // Check if period needs to be rolled over
    const needsRollover = now > periodEnd;

    return {
      hoursUsed: hoursUsed.toFixed(1),
      hoursRemaining: hoursRemaining.toFixed(1),
      hoursAvailable: hoursAvailable.toFixed(1),
      overageHours: overageHours.toFixed(1),
      overageCharges: overageCharges.toFixed(2),
      percentageUsed: percentageUsed.toFixed(0),
      periodStart: periodStart,
      periodEnd: periodEnd,
      needsRollover: needsRollover,
      daysUntilRenewal: Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))),
      status: percentageUsed >= 100 ? 'over-limit' : percentageUsed >= 80 ? 'warning' : 'healthy'
    };
  },

  // Roll over retainer period
  rolloverRetainer(retainer, timeLogs) {
    const status = this.calculateRetainerStatus(retainer, timeLogs);

    if (!status.needsRollover) {
      return retainer; // No rollover needed
    }

    // Calculate rollover hours
    let newRollover = 0;
    if (retainer.rolloverHours && status.hoursRemaining > 0) {
      newRollover = Math.min(
        parseFloat(status.hoursRemaining),
        retainer.rolloverLimit
      );
    }

    // Update retainer period
    const newPeriodStart = new Date(retainer.currentPeriodEnd);
    const newPeriodEnd = this.getNextMonthDate(newPeriodStart);

    return {
      ...retainer,
      currentPeriodStart: newPeriodStart.toISOString(),
      currentPeriodEnd: newPeriodEnd.toISOString(),
      hoursUsed: 0,
      hoursRollover: newRollover
    };
  },

  // Get invoices that need to be sent
  getInvoicesDue(recurring, currentDate = new Date()) {
    const due = [];

    recurring.forEach(item => {
      if (item.status !== 'active') return;

      const nextDate = new Date(item.nextInvoiceDate);

      if (currentDate >= nextDate) {
        const frequency = this.frequencies.find(f => f.id === item.frequency);
        due.push({
          recurring: item,
          dueDate: nextDate,
          daysOverdue: Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24)),
          frequency: frequency ? frequency.name : item.frequency
        });
      }
    });

    return due.sort((a, b) => a.dueDate - b.dueDate);
  },

  // Mark invoice as sent and schedule next
  markInvoiceSent(recurring) {
    const frequency = this.frequencies.find(f => f.id === recurring.frequency);
    const daysToAdd = frequency ? frequency.days : 30;

    const nextDate = new Date(recurring.nextInvoiceDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    return {
      ...recurring,
      lastInvoiced: new Date().toISOString(),
      nextInvoiceDate: nextDate.toISOString(),
      invoicesSent: recurring.invoicesSent + 1,
      totalBilled: recurring.totalBilled + recurring.amount
    };
  },

  // Get next month date
  getNextMonthDate(date) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return next;
  },

  // Calculate MRR (Monthly Recurring Revenue)
  calculateMRR(recurring) {
    let monthlyRevenue = 0;

    recurring.forEach(item => {
      if (item.status !== 'active') return;

      const frequency = this.frequencies.find(f => f.id === item.frequency);
      const daysPerYear = 365;
      const monthsPerYear = 12;

      // Convert to monthly
      if (item.frequency === 'weekly') {
        monthlyRevenue += (item.amount * 52) / 12; // 52 weeks / 12 months
      } else if (item.frequency === 'biweekly') {
        monthlyRevenue += (item.amount * 26) / 12; // 26 biweekly periods / 12 months
      } else if (item.frequency === 'monthly') {
        monthlyRevenue += item.amount;
      } else if (item.frequency === 'quarterly') {
        monthlyRevenue += item.amount / 3;
      } else if (item.frequency === 'yearly') {
        monthlyRevenue += item.amount / 12;
      }
    });

    return monthlyRevenue;
  },

  // Calculate ARR (Annual Recurring Revenue)
  calculateARR(recurring) {
    return this.calculateMRR(recurring) * 12;
  },

  // Get recurring revenue forecast
  getForecast(recurring, months = 12) {
    const forecast = [];
    const mrr = this.calculateMRR(recurring);

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      forecast.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        projected: mrr.toFixed(2),
        actual: i === 0 ? mrr.toFixed(2) : null // Only current month has actual
      });
    }

    return forecast;
  },

  // Analyze retainer health
  analyzeRetainerHealth(retainers, timeLogs) {
    const analysis = {
      total: retainers.length,
      active: retainers.filter(r => r.status === 'active').length,
      totalMRR: retainers.filter(r => r.status === 'active')
        .reduce((sum, r) => sum + r.monthlyAmount, 0),
      atRisk: [],
      underutilized: [],
      overages: []
    };

    retainers.forEach(retainer => {
      if (retainer.status !== 'active') return;

      const status = this.calculateRetainerStatus(retainer, timeLogs);
      const usage = parseFloat(status.percentageUsed);

      // At risk (over 100% usage)
      if (usage > 100) {
        analysis.atRisk.push({
          retainer: retainer,
          usage: usage,
          overageHours: status.overageHours
        });
      }

      // Underutilized (less than 30% usage)
      if (usage < 30 && status.daysUntilRenewal < 7) {
        analysis.underutilized.push({
          retainer: retainer,
          usage: usage,
          hoursRemaining: status.hoursRemaining
        });
      }

      // Overages
      if (parseFloat(status.overageHours) > 0) {
        analysis.overages.push({
          retainer: retainer,
          overageHours: status.overageHours,
          overageCharges: status.overageCharges
        });
      }
    });

    return analysis;
  }
};

// Export for use and make globally accessible
if (typeof window !== 'undefined') {
  window.RecurringManager = RecurringManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecurringManager;
}
