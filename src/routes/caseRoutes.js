const express = require('express');
const router = express.Router();
const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getHighPriorityCases,
} = require('../controllers/caseController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', getAllCases);
router.get('/priority', getHighPriorityCases);
router.get('/:id', getCaseById);
router.post('/', verifyToken, createCase);
router.put('/:id', verifyToken, updateCase);
router.delete('/:id', verifyToken, deleteCase);

module.exports = router;
