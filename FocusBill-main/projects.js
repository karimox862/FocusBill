// FocusBill - Project Management (FREE Premium Feature)
// ======================================================
// Track projects, milestones, and progress

const ProjectManager = {
  // Project statuses
  statuses: [
    { id: 'planning', name: '📝 Planning', color: '#6c757d' },
    { id: 'active', name: '🚀 Active', color: '#2484BF' },
    { id: 'on-hold', name: '⏸️ On Hold', color: '#ffc107' },
    { id: 'completed', name: '✅ Completed', color: '#28a745' },
    { id: 'cancelled', name: '❌ Cancelled', color: '#dc3545' }
  ],

  // Create a new project
  createProject(project) {
    if (!project.name || !project.client) {
      throw new Error('Project name and client are required');
    }

    return {
      id: Date.now(),
      name: project.name,
      client: project.client,
      description: project.description || '',
      status: project.status || 'planning',
      budget: parseFloat(project.budget) || 0,
      budgetType: project.budgetType || 'fixed', // fixed or hourly
      estimatedHours: parseFloat(project.estimatedHours) || 0,
      startDate: project.startDate || new Date().toISOString(),
      deadline: project.deadline || null,
      milestones: [],
      notes: project.notes || '',
      createdAt: new Date().toISOString()
    };
  },

  // Add a milestone to a project
  addMilestone(milestone) {
    if (!milestone.name) {
      throw new Error('Milestone name is required');
    }

    return {
      id: Date.now(),
      name: milestone.name,
      description: milestone.description || '',
      dueDate: milestone.dueDate || null,
      completed: false,
      completedDate: null,
      payment: parseFloat(milestone.payment) || 0
    };
  },

  // Calculate project progress
  calculateProgress(project, timeLogs) {
    const projectLogs = timeLogs.filter(log =>
      String(log.project) === String(project.id)
    );

    const totalMinutes = projectLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalHours = totalMinutes / 60;

    // Calculate milestone progress
    const completedMilestones = project.milestones.filter(m => m.completed).length;
    const milestoneProgress = project.milestones.length > 0
      ? (completedMilestones / project.milestones.length * 100)
      : 0;

    // Calculate hour progress
    const hourProgress = project.estimatedHours > 0
      ? (totalHours / project.estimatedHours * 100)
      : 0;

    return {
      totalHours: totalHours.toFixed(1),
      estimatedHours: project.estimatedHours,
      hoursRemaining: Math.max(0, project.estimatedHours - totalHours).toFixed(1),
      hourProgress: Math.min(100, hourProgress).toFixed(0),
      completedMilestones: completedMilestones,
      totalMilestones: project.milestones.length,
      milestoneProgress: milestoneProgress.toFixed(0),
      overBudget: totalHours > project.estimatedHours,
      sessionCount: projectLogs.length
    };
  },

  // Calculate project revenue
  calculateRevenue(project, timeLogs, clientRate) {
    const projectLogs = timeLogs.filter(log =>
      String(log.project) === String(project.id)
    );

    const totalMinutes = projectLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalHours = totalMinutes / 60;

    if (project.budgetType === 'fixed') {
      return {
        type: 'fixed',
        budget: project.budget,
        earned: totalHours * clientRate,
        remaining: project.budget,
        effectiveRate: project.budget > 0 && totalHours > 0
          ? (project.budget / totalHours).toFixed(2)
          : 0
      };
    } else {
      const earned = totalHours * clientRate;
      const remaining = Math.max(0, project.budget - earned);

      return {
        type: 'hourly',
        budget: project.budget,
        earned: earned.toFixed(2),
        remaining: remaining.toFixed(2),
        hourlyRate: clientRate,
        percentUsed: project.budget > 0 ? ((earned / project.budget) * 100).toFixed(0) : 0
      };
    }
  },

  // Get projects by status
  getProjectsByStatus(projects, status) {
    return projects.filter(p => p.status === status);
  },

  // Get projects by client
  getProjectsByClient(projects, clientId) {
    return projects.filter(p => String(p.client) === String(clientId));
  },

  // Get overdue milestones
  getOverdueMilestones(projects) {
    const now = new Date();
    const overdue = [];

    projects.forEach(project => {
      project.milestones.forEach(milestone => {
        if (!milestone.completed && milestone.dueDate) {
          const dueDate = new Date(milestone.dueDate);
          if (dueDate < now) {
            overdue.push({
              project: project,
              milestone: milestone,
              daysOverdue: Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
            });
          }
        }
      });
    });

    return overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
  },

  // Get upcoming deadlines
  getUpcomingDeadlines(projects, days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const upcoming = [];

    projects.forEach(project => {
      // Check project deadline
      if (project.deadline && project.status !== 'completed') {
        const deadline = new Date(project.deadline);
        if (deadline >= now && deadline <= future) {
          upcoming.push({
            type: 'project',
            project: project,
            deadline: deadline,
            daysUntil: Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
          });
        }
      }

      // Check milestone deadlines
      project.milestones.forEach(milestone => {
        if (!milestone.completed && milestone.dueDate) {
          const dueDate = new Date(milestone.dueDate);
          if (dueDate >= now && dueDate <= future) {
            upcoming.push({
              type: 'milestone',
              project: project,
              milestone: milestone,
              deadline: dueDate,
              daysUntil: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
            });
          }
        }
      });
    });

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  },

  // Generate project health report
  analyzeProjectHealth(project, timeLogs, clientRate) {
    const progress = this.calculateProgress(project, timeLogs);
    const revenue = this.calculateRevenue(project, timeLogs, clientRate);
    const issues = [];
    const warnings = [];

    // Check if over estimated hours
    if (progress.overBudget) {
      issues.push({
        type: 'hours',
        severity: 'high',
        message: `Project is ${(parseFloat(progress.totalHours) - project.estimatedHours).toFixed(1)} hours over estimate`
      });
    }

    // Check if approaching hour limit (>80%)
    if (parseFloat(progress.hourProgress) > 80 && parseFloat(progress.hourProgress) < 100) {
      warnings.push({
        type: 'hours',
        severity: 'medium',
        message: `Project has used ${progress.hourProgress}% of estimated hours`
      });
    }

    // Check for overdue milestones
    const overdueMilestones = project.milestones.filter(m => {
      if (!m.completed && m.dueDate) {
        return new Date(m.dueDate) < new Date();
      }
      return false;
    });

    if (overdueMilestones.length > 0) {
      issues.push({
        type: 'milestone',
        severity: 'high',
        message: `${overdueMilestones.length} milestone(s) overdue`
      });
    }

    // Check deadline proximity
    if (project.deadline && project.status !== 'completed') {
      const daysUntil = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) {
        issues.push({
          type: 'deadline',
          severity: 'critical',
          message: `Project is ${Math.abs(daysUntil)} days past deadline`
        });
      } else if (daysUntil <= 7 && parseFloat(progress.milestoneProgress) < 80) {
        warnings.push({
          type: 'deadline',
          severity: 'medium',
          message: `Deadline in ${daysUntil} days, only ${progress.milestoneProgress}% complete`
        });
      }
    }

    // Calculate health score (0-100)
    let healthScore = 100;
    healthScore -= issues.length * 20;
    healthScore -= warnings.length * 10;
    healthScore = Math.max(0, healthScore);

    return {
      healthScore: healthScore,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'attention' : 'critical',
      issues: issues,
      warnings: warnings,
      progress: progress,
      revenue: revenue
    };
  },

  // Get project summary statistics
  getProjectStats(projects, timeLogs, clients) {
    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');

    let totalRevenue = 0;
    let totalHours = 0;

    projects.forEach(project => {
      const client = clients.find(c => String(c.id) === String(project.client));
      if (client) {
        const projectLogs = timeLogs.filter(log => String(log.project) === String(project.id));
        const minutes = projectLogs.reduce((sum, log) => sum + log.duration, 0);
        const hours = minutes / 60;
        totalHours += hours;

        if (project.budgetType === 'fixed') {
          totalRevenue += project.budget;
        } else {
          totalRevenue += hours * client.rate;
        }
      }
    });

    return {
      total: projects.length,
      active: activeProjects.length,
      completed: completedProjects.length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      totalRevenue: totalRevenue.toFixed(2),
      totalHours: totalHours.toFixed(1),
      avgHoursPerProject: projects.length > 0 ? (totalHours / projects.length).toFixed(1) : 0,
      completionRate: projects.length > 0
        ? ((completedProjects.length / projects.length) * 100).toFixed(0)
        : 0
    };
  }
};

// Export for use and make globally accessible
if (typeof window !== 'undefined') {
  window.ProjectManager = ProjectManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectManager;
}
