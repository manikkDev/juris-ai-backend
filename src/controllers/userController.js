const { getFirestore } = require('../config/firebase');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

const getAllUsers = asyncHandler(async (req, res) => {
  const db = getFirestore();
  const snapshot = await db.collection('users').get();

  const users = [];
  snapshot.forEach(doc => {
    users.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  logger.info(`Retrieved ${users.length} users`);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getFirestore();
  
  const doc = await db.collection('users').doc(id).get();

  if (!doc.exists) {
    res.status(404);
    throw new Error('User not found');
  }

  logger.info(`Retrieved user: ${id}`);

  res.status(200).json({
    success: true,
    data: {
      id: doc.id,
      ...doc.data(),
    },
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { uid, email, displayName, role } = req.body;

  if (!uid || !email) {
    res.status(400);
    throw new Error('UID and email are required');
  }

  const db = getFirestore();
  const userData = {
    uid,
    email,
    displayName: displayName || '',
    role: role || 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('users').doc(uid).set(userData);

  logger.success(`User created: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: userData,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getFirestore();
  
  const userRef = db.collection('users').doc(id);
  const doc = await userRef.get();

  if (!doc.exists) {
    res.status(404);
    throw new Error('User not found');
  }

  const updateData = {
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  await userRef.update(updateData);

  logger.success(`User updated: ${id}`);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      id,
      ...doc.data(),
      ...updateData,
    },
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
};
