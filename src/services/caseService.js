const { getFirestore } = require('../config/firebase');
const { generateId, calculatePriorityScore, formatDate, validateCaseData } = require('../utils/helpers');
const logger = require('../utils/logger');

class CaseService {
  constructor() {
    this.collection = 'cases';
  }

  async getAllCases(filters = {}) {
    try {
      const db = getFirestore();
      let query = db.collection(this.collection);

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.court) {
        query = query.where('court', '==', filters.court);
      }

      if (filters.judge) {
        query = query.where('judge', '==', filters.judge);
      }

      if (filters.caseType) {
        query = query.where('caseType', '==', filters.caseType);
      }

      const snapshot = await query.get();
      
      const cases = [];
      snapshot.forEach(doc => {
        cases.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      logger.info(`Retrieved ${cases.length} cases`);
      return cases;
    } catch (error) {
      logger.error('Error fetching cases:', { error: error.message });
      throw error;
    }
  }

  async getCaseById(caseId) {
    try {
      const db = getFirestore();
      const doc = await db.collection(this.collection).doc(caseId).get();

      if (!doc.exists) {
        throw new Error('Case not found');
      }

      logger.info(`Retrieved case: ${caseId}`);
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      logger.error('Error fetching case:', { caseId, error: error.message });
      throw error;
    }
  }

  async createCase(caseData) {
    try {
      validateCaseData(caseData);

      const db = getFirestore();
      const caseId = generateId();

      const priorityScore = calculatePriorityScore({
        adjournments: caseData.adjournments || 0,
        filedDate: caseData.filedDate,
        caseType: caseData.caseType,
        status: caseData.status,
      });

      const newCase = {
        caseId,
        caseNumber: caseData.caseNumber || '',
        court: caseData.court,
        courtCode: caseData.courtCode || '',
        bench: caseData.bench || '',
        judge: caseData.judge,
        caseType: caseData.caseType,
        filedDate: formatDate(caseData.filedDate),
        lastHearingDate: formatDate(caseData.lastHearingDate) || null,
        nextHearingDate: caseData.nextHearingDate ? formatDate(caseData.nextHearingDate) : null,
        adjournments: caseData.adjournments || 0,
        status: caseData.status,
        petitioner: caseData.petitioner || '',
        respondent: caseData.respondent || '',
        description: caseData.description || '',
        category: caseData.category || '',
        source: caseData.source || 'eCourts/AWS Open Data',
        year: caseData.year || new Date(caseData.filedDate).getFullYear(),
        priorityScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection(this.collection).doc(caseId).set(newCase);

      await logger.logActivity('CASE_CREATED', { caseId, court: newCase.court });

      logger.success(`Case created: ${caseId}`);
      return newCase;
    } catch (error) {
      logger.error('Error creating case:', { error: error.message });
      throw error;
    }
  }

  async updateCase(caseId, updateData) {
    try {
      const db = getFirestore();
      const caseRef = db.collection(this.collection).doc(caseId);
      const doc = await caseRef.get();

      if (!doc.exists) {
        throw new Error('Case not found');
      }

      const existingData = doc.data();

      if (updateData.adjournments !== undefined || updateData.filedDate || updateData.caseType) {
        updateData.priorityScore = calculatePriorityScore({
          adjournments: updateData.adjournments ?? existingData.adjournments,
          filedDate: updateData.filedDate ?? existingData.filedDate,
          caseType: updateData.caseType ?? existingData.caseType,
          status: updateData.status ?? existingData.status,
        });
      }

      const updatedCase = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await caseRef.update(updatedCase);

      await logger.logActivity('CASE_UPDATED', { caseId });

      logger.success(`Case updated: ${caseId}`);
      return {
        id: caseId,
        ...existingData,
        ...updatedCase,
      };
    } catch (error) {
      logger.error('Error updating case:', { caseId, error: error.message });
      throw error;
    }
  }

  async deleteCase(caseId) {
    try {
      const db = getFirestore();
      const caseRef = db.collection(this.collection).doc(caseId);
      const doc = await caseRef.get();

      if (!doc.exists) {
        throw new Error('Case not found');
      }

      await caseRef.delete();

      await logger.logActivity('CASE_DELETED', { caseId });

      logger.success(`Case deleted: ${caseId}`);
      return { message: 'Case deleted successfully' };
    } catch (error) {
      logger.error('Error deleting case:', { caseId, error: error.message });
      throw error;
    }
  }

  async getCasesByPriority(minScore = 70) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collection)
        .where('priorityScore', '>=', minScore)
        .orderBy('priorityScore', 'desc')
        .get();

      const cases = [];
      snapshot.forEach(doc => {
        cases.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      logger.info(`Retrieved ${cases.length} high-priority cases`);
      return cases;
    } catch (error) {
      logger.error('Error fetching priority cases:', { error: error.message });
      throw error;
    }
  }
}

module.exports = new CaseService();
