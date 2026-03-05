const express = require('express');
const router = express.Router();
const simulationService = require('../services/simulationService');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');

const runFastTrackSimulation = asyncHandler(async (req, res) => {
  const topN = parseInt(req.body.topN) || 10;
  
  const simulation = await simulationService.fastTrackSimulation(topN);

  res.status(200).json({
    success: true,
    message: 'Simulation completed successfully',
    data: simulation,
  });
});

const compareScenarios = asyncHandler(async (req, res) => {
  const scenarios = req.body.scenarios || [10, 20, 50];
  
  const comparison = await simulationService.compareScenarios(scenarios);

  res.status(200).json({
    success: true,
    data: comparison,
  });
});

router.post('/fast-track', verifyToken, runFastTrackSimulation);
router.post('/compare', verifyToken, compareScenarios);

module.exports = router;
