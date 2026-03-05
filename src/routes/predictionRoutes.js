const express = require('express');
const router = express.Router();
const {
  generatePrediction,
  getPredictionByCaseId,
  getAllPredictions,
} = require('../controllers/predictionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/:caseId', verifyToken, generatePrediction);
router.get('/:caseId', getPredictionByCaseId);
router.get('/', getAllPredictions);

module.exports = router;
