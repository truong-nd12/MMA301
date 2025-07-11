const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    getOrderStats,
    getOrdersByDateRange,
    getTopSellingItems
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', auth, adminAuth, getOrders);

// @route   GET /api/orders/stats
// @desc    Get order statistics (Admin only)
// @access  Private/Admin
router.get('/stats', auth, adminAuth, getOrderStats);

// @route   GET /api/orders/date-range
// @desc    Get orders by date range (Admin only)
// @access  Private/Admin
router.get('/date-range', auth, adminAuth, getOrdersByDateRange);

// @route   GET /api/orders/top-selling
// @desc    Get top selling items (Admin only)
// @access  Private/Admin
router.get('/top-selling', auth, adminAuth, getTopSellingItems);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, getOrder);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, createOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, adminAuth, updateOrderStatus);

module.exports = router; 