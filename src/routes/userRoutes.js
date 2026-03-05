const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
} = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', createUser);
router.put('/:id', verifyToken, updateUser);

module.exports = router;
