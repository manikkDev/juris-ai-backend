const predictionService = require('../services/predictionService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const generatePrediction = asyncHandler(async (req, res) => {
  const { caseId } = req.params;
  
  const prediction = await predictionService.generatePrediction(caseId);

  res.status(201).json({
    success: true,
    message: 'Prediction generated successfully',
    data: prediction,
  });
});

const getPredictionByCaseId = asyncHandler(async (req, res) => {
  const { caseId } = req.params;
  
  const prediction = await predictionService.getPredictionByCaseId(caseId);

  if (!prediction) {
    return res.status(404).json({
      success: false,
      error: 'No prediction found for this case',
    });
  }

  res.status(200).json({
    success: true,
    data: prediction,
  });
});

const getAllPredictions = asyncHandler(async (req, res) => {
  const predictions = await predictionService.getAllPredictions();

  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions,
  });
});

module.exports = {
  generatePrediction,
  getPredictionByCaseId,
  getAllPredictions,
};
