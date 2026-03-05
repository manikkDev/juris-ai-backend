const config = require('../config/env');
const logger = require('../utils/logger');

class MLModelClient {
  constructor() {
    this.serviceUrl = config.mlServiceUrl;
    this.isConnected = false;
  }

  async checkConnection() {
    try {
      logger.info('ML Service is not yet implemented. Using simulated predictions.');
      this.isConnected = false;
      return false;
    } catch (error) {
      logger.warn('ML Service connection failed:', { error: error.message });
      this.isConnected = false;
      return false;
    }
  }

  async predict(caseData) {
    if (!this.isConnected) {
      logger.info('Using simulated ML predictions');
      return this.simulatedPredict(caseData);
    }

    try {
      logger.info('ML prediction endpoint not yet available');
      return this.simulatedPredict(caseData);
    } catch (error) {
      logger.error('ML prediction error:', { error: error.message });
      return this.simulatedPredict(caseData);
    }
  }

  simulatedPredict(caseData) {
    const adjournmentRisk = Math.min(0.95, 0.3 + (caseData.adjournments * 0.1));
    const delayProbability = Math.min(0.95, 0.25 + (caseData.adjournments * 0.12));
    
    return {
      adjournmentRisk,
      delayProbability,
      confidence: 0.75,
      method: 'simulated',
    };
  }

  async batchPredict(casesData) {
    logger.info(`Running batch prediction for ${casesData.length} cases`);
    
    const predictions = casesData.map(caseData => ({
      caseId: caseData.caseId,
      ...this.simulatedPredict(caseData),
    }));

    return predictions;
  }
}

module.exports = new MLModelClient();
