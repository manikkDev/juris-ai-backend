const { getFirestore } = require('../config/firebase');
const { generateId, getResolutionEstimate, calculateDaysBetween } = require('../utils/helpers');
const logger = require('../utils/logger');
const caseService = require('./caseService');

class PredictionService {
  constructor() {
    this.collection = 'predictions';
  }

  async generatePrediction(caseId) {
    try {
      const caseData = await caseService.getCaseById(caseId);

      const daysPending = calculateDaysBetween(caseData.filedDate, new Date());
      
      const adjournmentRisk = this.calculateAdjournmentRisk(
        caseData.adjournments,
        daysPending,
        caseData.caseType
      );

      const delayProbability = this.calculateDelayProbability(
        caseData.adjournments,
        daysPending,
        caseData.status
      );

      const resolutionEstimate = getResolutionEstimate(
        caseData.adjournments,
        daysPending
      );

      const topFactors = this.identifyTopFactors(caseData, daysPending);

      const prediction = {
        predictionId: generateId(),
        caseId,
        adjournmentRisk,
        delayProbability,
        resolutionEstimate,
        topFactors,
        confidence: this.calculateConfidence(caseData),
        generatedAt: new Date().toISOString(),
        modelVersion: '1.0.0-ecourts',
      };

      const db = getFirestore();
      await db.collection(this.collection).doc(prediction.predictionId).set(prediction);

      await logger.logActivity('PREDICTION_GENERATED', { 
        caseId, 
        predictionId: prediction.predictionId 
      });

      logger.success(`Prediction generated for case: ${caseId}`);
      return prediction;
    } catch (error) {
      logger.error('Error generating prediction:', { caseId, error: error.message });
      throw error;
    }
  }

  calculateAdjournmentRisk(adjournments, daysPending, caseType) {
    let risk = 0.3;

    if (adjournments > 5) risk += 0.4;
    else if (adjournments > 3) risk += 0.25;
    else if (adjournments > 1) risk += 0.15;

    if (daysPending > 730) risk += 0.2;
    else if (daysPending > 365) risk += 0.1;

    if (caseType === 'Civil') risk += 0.1;

    return Math.min(0.95, Math.max(0.05, risk));
  }

  calculateDelayProbability(adjournments, daysPending, status) {
    let probability = 0.25;

    if (status === 'Pending') probability += 0.15;
    
    if (adjournments > 4) probability += 0.35;
    else if (adjournments > 2) probability += 0.2;
    else if (adjournments > 0) probability += 0.1;

    if (daysPending > 730) probability += 0.25;
    else if (daysPending > 365) probability += 0.15;
    else if (daysPending > 180) probability += 0.05;

    return Math.min(0.95, Math.max(0.05, probability));
  }

  identifyTopFactors(caseData, daysPending) {
    const factors = [];

    if (caseData.adjournments > 3) {
      factors.push({
        factor: 'High Adjournment Count',
        impact: 'High',
        value: caseData.adjournments,
      });
    }

    if (daysPending > 365) {
      factors.push({
        factor: 'Case Age',
        impact: daysPending > 730 ? 'Critical' : 'High',
        value: `${Math.floor(daysPending / 30)} months`,
      });
    }

    if (caseData.caseType === 'Criminal') {
      factors.push({
        factor: 'Case Type Priority',
        impact: 'Medium',
        value: caseData.caseType,
      });
    }

    if (caseData.status === 'Pending') {
      factors.push({
        factor: 'Pending Status',
        impact: 'Medium',
        value: caseData.status,
      });
    }

    if (!caseData.lastHearingDate || 
        calculateDaysBetween(caseData.lastHearingDate, new Date()) > 90) {
      factors.push({
        factor: 'Hearing Inactivity',
        impact: 'High',
        value: 'No recent hearing',
      });
    }

    return factors.slice(0, 5);
  }

  calculateConfidence(caseData) {
    let confidence = 0.7;

    if (caseData.adjournments > 0) confidence += 0.1;
    if (caseData.lastHearingDate) confidence += 0.1;
    if (caseData.filedDate) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  async getPredictionByCaseId(caseId) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collection)
        .where('caseId', '==', caseId)
        .orderBy('generatedAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      logger.info(`Retrieved prediction for case: ${caseId}`);
      
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      logger.error('Error fetching prediction:', { caseId, error: error.message });
      throw error;
    }
  }

  async getAllPredictions() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collection)
        .orderBy('generatedAt', 'desc')
        .get();

      const predictions = [];
      snapshot.forEach(doc => {
        predictions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      logger.info(`Retrieved ${predictions.length} predictions`);
      return predictions;
    } catch (error) {
      logger.error('Error fetching predictions:', { error: error.message });
      throw error;
    }
  }
}

module.exports = new PredictionService();
