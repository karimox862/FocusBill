// FocusBill - Expense Tracking (FREE Premium Feature)
// ===================================================
// Track business expenses and deduct from billable income

const ExpenseTracker = {
  // Expense categories
  categories: [
    { id: 'software', name: '💻 Software & Tools', icon: '💻' },
    { id: 'hardware', name: '🖥️ Hardware & Equipment', icon: '🖥️' },
    { id: 'marketing', name: '📢 Marketing & Advertising', icon: '📢' },
    { id: 'office', name: '🏢 Office Supplies', icon: '🏢' },
    { id: 'travel', name: '✈️ Travel & Transport', icon: '✈️' },
    { id: 'education', name: '📚 Education & Training', icon: '📚' },
    { id: 'subscriptions', name: '🔄 Subscriptions', icon: '🔄' },
    { id: 'utilities', name: '⚡ Utilities & Internet', icon: '⚡' },
    { id: 'other', name: '📦 Other', icon: '📦' }
  ],

  // Add a new expense
  addExpense(expense) {
    if (!expense.description || !expense.amount || !expense.category) {
      throw new Error('Missing required expense fields');
    }

    const newExpense = {
      id: Date.now(),
      description: expense.description,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date || new Date().toISOString(),
      client: expense.client || null, // Optional: assign to specific client
      receipt: expense.receipt || null, // Optional: receipt image/file
      taxDeductible: expense.taxDeductible !== false, // Default true
      notes: expense.notes || ''
    };

    return newExpense;
  },

  // Get expenses for a time period
  getExpensesByPeriod(expenses, period = 'month') {
    const now = new Date();
    let startDate;

    switch(period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    return expenses.filter(exp => new Date(exp.date) >= startDate);
  },

  // Calculate total expenses by category
  getExpensesByCategory(expenses) {
    const byCategory = {};

    expenses.forEach(expense => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = {
          total: 0,
          count: 0,
          items: []
        };
      }
      byCategory[expense.category].total += expense.amount;
      byCategory[expense.category].count++;
      byCategory[expense.category].items.push(expense);
    });

    return byCategory;
  },

  // Calculate tax-deductible expenses
  getTaxDeductibleTotal(expenses) {
    return expenses
      .filter(exp => exp.taxDeductible)
      .reduce((sum, exp) => sum + exp.amount, 0);
  },

  // Get expenses by client
  getClientExpenses(expenses, clientId) {
    return expenses.filter(exp => String(exp.client) === String(clientId));
  },

  // Calculate net income (revenue - expenses)
  calculateNetIncome(revenue, expenses) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      revenue: revenue,
      expenses: totalExpenses,
      netIncome: revenue - totalExpenses,
      margin: revenue > 0 ? ((revenue - totalExpenses) / revenue * 100).toFixed(1) : 0
    };
  },

  // Generate expense report
  generateReport(expenses, timeLogs, clients) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = this.getExpensesByCategory(expenses);
    const taxDeductible = this.getTaxDeductibleTotal(expenses);

    // Calculate total revenue
    let totalRevenue = 0;
    timeLogs.forEach(log => {
      const client = clients.find(c => String(c.id) === String(log.client));
      if (client) {
        totalRevenue += (log.duration / 60) * client.rate;
      }
    });

    const netIncome = this.calculateNetIncome(totalRevenue, expenses);

    return {
      totalExpenses: totalExpenses,
      taxDeductible: taxDeductible,
      expenseCount: expenses.length,
      byCategory: byCategory,
      topCategory: Object.entries(byCategory)
        .sort((a, b) => b[1].total - a[1].total)[0],
      netIncome: netIncome,
      avgExpensePerDay: (totalExpenses / 30).toFixed(2)
    };
  },

  // Suggest expense optimizations
  suggestOptimizations(expenses) {
    const byCategory = this.getExpensesByCategory(expenses);
    const suggestions = [];

    Object.entries(byCategory).forEach(([category, data]) => {
      const categoryInfo = this.categories.find(c => c.id === category);

      // High subscription costs
      if (category === 'subscriptions' && data.total > 200) {
        suggestions.push({
          type: 'warning',
          category: category,
          message: `${categoryInfo.icon} Subscriptions are high ($${data.total.toFixed(2)}). Review for unused services.`,
          savings: (data.total * 0.3).toFixed(2)
        });
      }

      // Too many small expenses
      if (data.count > 20 && data.total / data.count < 10) {
        suggestions.push({
          type: 'info',
          category: category,
          message: `${categoryInfo.icon} Many small ${categoryInfo.name} expenses. Consider bulk purchases.`,
          savings: (data.total * 0.15).toFixed(2)
        });
      }
    });

    // Check for missing tax deductions
    const nonDeductible = expenses.filter(exp => !exp.taxDeductible);
    if (nonDeductible.length > 0) {
      const potentialSavings = nonDeductible.reduce((sum, exp) => sum + exp.amount, 0) * 0.25; // Assume 25% tax
      suggestions.push({
        type: 'tip',
        category: 'tax',
        message: `💰 ${nonDeductible.length} expenses not marked tax-deductible. Potential savings: $${potentialSavings.toFixed(2)}`,
        savings: potentialSavings.toFixed(2)
      });
    }

    return suggestions;
  },

  // Export expenses to CSV
  exportToCSV(expenses) {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Client', 'Tax Deductible', 'Notes'];
    const rows = expenses.map(exp => {
      const category = this.categories.find(c => c.id === exp.category);
      return [
        new Date(exp.date).toLocaleDateString(),
        exp.description,
        category ? category.name : exp.category,
        `$${exp.amount.toFixed(2)}`,
        exp.client || 'N/A',
        exp.taxDeductible ? 'Yes' : 'No',
        exp.notes || ''
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  },

  // Get recurring expense patterns
  detectRecurringExpenses(expenses) {
    const patterns = {};

    expenses.forEach(expense => {
      const key = `${expense.description}_${expense.amount}`;
      if (!patterns[key]) {
        patterns[key] = {
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          occurrences: [],
          isRecurring: false
        };
      }
      patterns[key].occurrences.push(new Date(expense.date));
    });

    // Detect recurring (appears 3+ times with ~30 day intervals)
    Object.values(patterns).forEach(pattern => {
      if (pattern.occurrences.length >= 3) {
        const sortedDates = pattern.occurrences.sort((a, b) => a - b);
        const intervals = [];

        for (let i = 1; i < sortedDates.length; i++) {
          const days = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
          intervals.push(days);
        }

        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

        // If average interval is ~30 days (monthly) or ~365 days (yearly)
        if ((avgInterval >= 25 && avgInterval <= 35) || (avgInterval >= 350 && avgInterval <= 380)) {
          pattern.isRecurring = true;
          pattern.interval = avgInterval >= 350 ? 'yearly' : 'monthly';
          pattern.nextDue = new Date(sortedDates[sortedDates.length - 1].getTime() + avgInterval * 24 * 60 * 60 * 1000);
        }
      }
    });

    return Object.values(patterns).filter(p => p.isRecurring);
  }
};

// Export for use and make globally accessible
if (typeof window !== 'undefined') {
  window.ExpenseTracker = ExpenseTracker;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpenseTracker;
}
