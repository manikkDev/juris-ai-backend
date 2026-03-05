const { getFirestore } = require('../config/firebase');
const logger = require('../utils/logger');
const caseService = require('./caseService');

class AnalyticsService {
  async getOverview() {
    try {
      const cases = await caseService.getAllCases();

      const totalCases = cases.length;
      
      const delayedCases = cases.filter(c => {
        const daysPending = Math.floor(
          (new Date() - new Date(c.filedDate)) / (1000 * 60 * 60 * 24)
        );
        return daysPending > 365 || c.adjournments > 3;
      }).length;

      const highPriorityCases = cases.filter(c => c.priorityScore >= 70).length;

      const resolvedThisMonth = await this.getMonthlyResolutionRate();

      const avgAdjournments = cases.length > 0
        ? (cases.reduce((sum, c) => sum + (c.adjournments || 0), 0) / cases.length).toFixed(2)
        : 0;

      const casesByType = this.groupByField(cases, 'caseType');
      const casesByStatus = this.groupByField(cases, 'status');
      const casesByCourt = this.groupByField(cases, 'court');

      logger.info('Generated analytics overview');

      return {
        totalCases,
        delayedCases,
        highPriorityCases,
        resolvedThisMonth,
        avgAdjournments: parseFloat(avgAdjournments),
        casesByType,
        casesByStatus,
        casesByCourt,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error generating overview:', { error: error.message });
      throw error;
    }
  }

  async getBacklogAnalysis() {
    try {
      const cases = await caseService.getAllCases({ status: 'Pending' });

      const backlogByAge = {
        '0-6 months': 0,
        '6-12 months': 0,
        '1-2 years': 0,
        '2+ years': 0,
      };

      const backlogByCourt = {};
      const backlogByType = {};

      cases.forEach(c => {
        const daysPending = Math.floor(
          (new Date() - new Date(c.filedDate)) / (1000 * 60 * 60 * 24)
        );

        if (daysPending <= 180) backlogByAge['0-6 months']++;
        else if (daysPending <= 365) backlogByAge['6-12 months']++;
        else if (daysPending <= 730) backlogByAge['1-2 years']++;
        else backlogByAge['2+ years']++;

        backlogByCourt[c.court] = (backlogByCourt[c.court] || 0) + 1;
        backlogByType[c.caseType] = (backlogByType[c.caseType] || 0) + 1;
      });

      const criticalBacklog = cases.filter(c => c.priorityScore >= 80).length;

      logger.info('Generated backlog analysis');

      return {
        totalBacklog: cases.length,
        criticalBacklog,
        backlogByAge,
        backlogByCourt,
        backlogByType,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error generating backlog analysis:', { error: error.message });
      throw error;
    }
  }

  async getAdjournmentTrends() {
    try {
      const cases = await caseService.getAllCases();

      const adjournmentDistribution = {
        '0': 0,
        '1-2': 0,
        '3-5': 0,
        '6+': 0,
      };

      const avgByType = {};
      const avgByCourt = {};

      cases.forEach(c => {
        const adj = c.adjournments || 0;

        if (adj === 0) adjournmentDistribution['0']++;
        else if (adj <= 2) adjournmentDistribution['1-2']++;
        else if (adj <= 5) adjournmentDistribution['3-5']++;
        else adjournmentDistribution['6+']++;

        if (!avgByType[c.caseType]) {
          avgByType[c.caseType] = { total: 0, count: 0 };
        }
        avgByType[c.caseType].total += adj;
        avgByType[c.caseType].count++;

        if (!avgByCourt[c.court]) {
          avgByCourt[c.court] = { total: 0, count: 0 };
        }
        avgByCourt[c.court].total += adj;
        avgByCourt[c.court].count++;
      });

      Object.keys(avgByType).forEach(type => {
        avgByType[type] = (avgByType[type].total / avgByType[type].count).toFixed(2);
      });

      Object.keys(avgByCourt).forEach(court => {
        avgByCourt[court] = (avgByCourt[court].total / avgByCourt[court].count).toFixed(2);
      });

      const highAdjournmentCases = cases.filter(c => c.adjournments > 5).length;

      logger.info('Generated adjournment trends');

      return {
        adjournmentDistribution,
        avgByType,
        avgByCourt,
        highAdjournmentCases,
        totalCases: cases.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error generating adjournment trends:', { error: error.message });
      throw error;
    }
  }

  async getMonthlyResolutionRate() {
    try {
      const db = getFirestore();
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const snapshot = await db.collection('cases')
        .where('status', '==', 'Resolved')
        .where('updatedAt', '>=', firstDayOfMonth.toISOString())
        .get();

      return snapshot.size;
    } catch (error) {
      logger.error('Error calculating monthly resolution rate:', { error: error.message });
      return 0;
    }
  }

  groupByField(cases, field) {
    return cases.reduce((acc, c) => {
      const key = c[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  async getJudgePerformance() {
    try {
      const cases = await caseService.getAllCases();

      const judgeStats = {};

      cases.forEach(c => {
        if (!judgeStats[c.judge]) {
          judgeStats[c.judge] = {
            totalCases: 0,
            resolvedCases: 0,
            pendingCases: 0,
            avgAdjournments: 0,
            totalAdjournments: 0,
          };
        }

        judgeStats[c.judge].totalCases++;
        judgeStats[c.judge].totalAdjournments += c.adjournments || 0;

        if (c.status === 'Resolved') {
          judgeStats[c.judge].resolvedCases++;
        } else if (c.status === 'Pending') {
          judgeStats[c.judge].pendingCases++;
        }
      });

      Object.keys(judgeStats).forEach(judge => {
        const stats = judgeStats[judge];
        stats.avgAdjournments = (stats.totalAdjournments / stats.totalCases).toFixed(2);
        stats.resolutionRate = ((stats.resolvedCases / stats.totalCases) * 100).toFixed(2);
      });

      logger.info('Generated judge performance analytics');

      return judgeStats;
    } catch (error) {
      logger.error('Error generating judge performance:', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
