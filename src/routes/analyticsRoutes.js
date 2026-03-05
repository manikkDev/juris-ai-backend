const express = require('express');
const router = express.Router();
const {
  getOverview,
  getBacklogAnalysis,
  getAdjournmentTrends,
  getJudgePerformance,
} = require('../controllers/analyticsController');

router.get('/overview', getOverview);
router.get('/backlog', getBacklogAnalysis);
router.get('/adjournment-trends', getAdjournmentTrends);
router.get('/judge-performance', getJudgePerformance);

module.exports = router;
