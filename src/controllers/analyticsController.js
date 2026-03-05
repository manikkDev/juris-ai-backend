const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getOverview();

  res.status(200).json({
    success: true,
    data: overview,
  });
});

const getBacklogAnalysis = asyncHandler(async (req, res) => {
  const backlog = await analyticsService.getBacklogAnalysis();

  res.status(200).json({
    success: true,
    data: backlog,
  });
});

const getAdjournmentTrends = asyncHandler(async (req, res) => {
  const trends = await analyticsService.getAdjournmentTrends();

  res.status(200).json({
    success: true,
    data: trends,
  });
});

const getJudgePerformance = asyncHandler(async (req, res) => {
  const performance = await analyticsService.getJudgePerformance();

  res.status(200).json({
    success: true,
    data: performance,
  });
});

module.exports = {
  getOverview,
  getBacklogAnalysis,
  getAdjournmentTrends,
  getJudgePerformance,
};
