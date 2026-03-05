const caseService = require('../services/caseService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getAllCases = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    court: req.query.court,
    judge: req.query.judge,
    caseType: req.query.caseType,
  };

  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });

  const cases = await caseService.getAllCases(filters);

  res.status(200).json({
    success: true,
    count: cases.length,
    data: cases,
  });
});

const getCaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const caseData = await caseService.getCaseById(id);

  res.status(200).json({
    success: true,
    data: caseData,
  });
});

const createCase = asyncHandler(async (req, res) => {
  const caseData = await caseService.createCase(req.body);

  res.status(201).json({
    success: true,
    message: 'Case created successfully',
    data: caseData,
  });
});

const updateCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCase = await caseService.updateCase(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Case updated successfully',
    data: updatedCase,
  });
});

const deleteCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await caseService.deleteCase(id);

  res.status(200).json({
    success: true,
    message: 'Case deleted successfully',
  });
});

const getHighPriorityCases = asyncHandler(async (req, res) => {
  const minScore = parseInt(req.query.minScore) || 70;
  const cases = await caseService.getCasesByPriority(minScore);

  res.status(200).json({
    success: true,
    count: cases.length,
    data: cases,
  });
});

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getHighPriorityCases,
};
