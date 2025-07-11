const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    deleteUser
} = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth, adminAuth, getUsers);

// @route   GET /api/users/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', auth, getFavorites);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   POST /api/users/favorites/:productId
// @desc    Add product to favorites
// @access  Private
router.post('/favorites/:productId', auth, addToFavorites);

// @route   DELETE /api/users/favorites/:productId
// @desc    Remove product from favorites
// @access  Private
router.delete('/favorites/:productId', auth, removeFromFavorites);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', auth, getUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, deleteUser);

module.exports = router; 