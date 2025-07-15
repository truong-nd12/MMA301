const express = require('express');
const router = express.Router();
const {
    getCategories,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsByCategory
} = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products (Public)
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', getFeaturedProducts);

// @route   GET /api/categories/
// @desc    Get categories
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
router.get('/category/:categoryId', getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', getProduct);

// @route   POST /api/products
// @desc    Create product (Admin only)
// @access  Private/Admin
router.post('/', auth, adminAuth, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminAuth, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, deleteProduct);

module.exports = router; 