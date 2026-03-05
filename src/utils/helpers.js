const { v4: uuidv4 } = require('uuid');

const generateId = () => {
  return uuidv4();
};

const calculatePriorityScore = (caseData) => {
  let score = 50;

  if (caseData.adjournments > 5) score += 20;
  else if (caseData.adjournments > 3) score += 10;

  const daysSinceFiled = Math.floor(
    (new Date() - new Date(caseData.filedDate)) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceFiled > 730) score += 30;
  else if (daysSinceFiled > 365) score += 20;
  else if (daysSinceFiled > 180) score += 10;

  if (caseData.caseType === 'Criminal') score += 15;
  else if (caseData.caseType === 'Constitutional') score += 10;

  if (caseData.status === 'Pending') score += 5;

  return Math.min(100, Math.max(0, score));
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getResolutionEstimate = (adjournments, daysPending) => {
  if (adjournments > 5 || daysPending > 730) {
    return '12-18 months';
  } else if (adjournments > 3 || daysPending > 365) {
    return '6-12 months';
  } else if (adjournments > 1 || daysPending > 180) {
    return '3-6 months';
  } else {
    return '1-3 months';
  }
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
    },
  };
};

const validateCaseData = (caseData) => {
  const required = ['court', 'judge', 'caseType', 'filedDate', 'status'];
  const missing = required.filter(field => !caseData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
};

module.exports = {
  generateId,
  calculatePriorityScore,
  formatDate,
  calculateDaysBetween,
  getResolutionEstimate,
  sanitizeInput,
  paginate,
  validateCaseData,
};
