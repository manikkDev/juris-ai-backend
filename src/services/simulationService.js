const logger = require('../utils/logger');
const caseService = require('./caseService');

class SimulationService {
  async fastTrackSimulation(topN = 10) {
    try {
      const allCases = await caseService.getAllCases({ status: 'Pending' });

      const sortedCases = allCases
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, topN);

      const currentBacklog = allCases.length;
      const projectedBacklog = currentBacklog - sortedCases.length;
      const backlogReduction = ((sortedCases.length / currentBacklog) * 100).toFixed(2);

      const avgDaysPerCase = 45;
      const timeSavedDays = sortedCases.length * avgDaysPerCase;
      const timeSavedMonths = (timeSavedDays / 30).toFixed(1);

      const resolutionTimeline = this.generateResolutionTimeline(sortedCases);

      const impactMetrics = this.calculateImpactMetrics(sortedCases, allCases);

      const simulation = {
        simulationId: `sim-${Date.now()}`,
        topNCases: topN,
        selectedCases: sortedCases.map(c => ({
          caseId: c.caseId,
          court: c.court,
          priorityScore: c.priorityScore,
          adjournments: c.adjournments,
        })),
        currentBacklog,
        projectedBacklog,
        backlogReduction: parseFloat(backlogReduction),
        timeSaved: {
          days: timeSavedDays,
          months: parseFloat(timeSavedMonths),
        },
        resolutionTimeline,
        impactMetrics,
        simulatedAt: new Date().toISOString(),
      };

      await logger.logActivity('SIMULATION_RUN', {
        topN,
        backlogReduction: simulation.backlogReduction,
      });

      logger.success(`Fast-track simulation completed for top ${topN} cases`);
      return simulation;
    } catch (error) {
      logger.error('Error running simulation:', { error: error.message });
      throw error;
    }
  }

  generateResolutionTimeline(cases) {
    const timeline = [];
    const baselineDate = new Date();

    cases.forEach((caseItem, index) => {
      const weeksToResolve = Math.ceil((index + 1) / 2);
      const resolutionDate = new Date(baselineDate);
      resolutionDate.setDate(resolutionDate.getDate() + (weeksToResolve * 7));

      timeline.push({
        caseId: caseItem.caseId,
        estimatedResolution: resolutionDate.toISOString().split('T')[0],
        weeksFromNow: weeksToResolve,
        priorityScore: caseItem.priorityScore,
      });
    });

    return timeline;
  }

  calculateImpactMetrics(selectedCases, allCases) {
    const avgPriorityScore = (
      selectedCases.reduce((sum, c) => sum + c.priorityScore, 0) / selectedCases.length
    ).toFixed(2);

    const totalAdjournments = selectedCases.reduce((sum, c) => sum + (c.adjournments || 0), 0);

    const affectedCourts = [...new Set(selectedCases.map(c => c.court))];

    const caseTypeDistribution = selectedCases.reduce((acc, c) => {
      acc[c.caseType] = (acc[c.caseType] || 0) + 1;
      return acc;
    }, {});

    const estimatedCostSavings = selectedCases.length * 15000;

    return {
      avgPriorityScore: parseFloat(avgPriorityScore),
      totalAdjournmentsSaved: totalAdjournments,
      affectedCourts: affectedCourts.length,
      courtsList: affectedCourts,
      caseTypeDistribution,
      estimatedCostSavings,
      citizensBenefited: selectedCases.length * 3,
    };
  }

  async compareScenarios(scenarios = [10, 20, 50]) {
    try {
      const comparisons = [];

      for (const topN of scenarios) {
        const simulation = await this.fastTrackSimulation(topN);
        comparisons.push({
          scenario: `Top ${topN}`,
          backlogReduction: simulation.backlogReduction,
          timeSavedMonths: simulation.timeSaved.months,
          costSavings: simulation.impactMetrics.estimatedCostSavings,
        });
      }

      logger.info('Scenario comparison completed');
      return {
        comparisons,
        recommendation: this.getRecommendation(comparisons),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error comparing scenarios:', { error: error.message });
      throw error;
    }
  }

  getRecommendation(comparisons) {
    const optimal = comparisons.reduce((best, current) => {
      const currentEfficiency = current.backlogReduction / parseInt(current.scenario.split(' ')[1]);
      const bestEfficiency = best.backlogReduction / parseInt(best.scenario.split(' ')[1]);
      return currentEfficiency > bestEfficiency ? current : best;
    });

    return {
      optimalScenario: optimal.scenario,
      reasoning: `This scenario provides the best balance of backlog reduction (${optimal.backlogReduction}%) and resource efficiency.`,
    };
  }
}

module.exports = new SimulationService();
