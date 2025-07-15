const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Tag = require('../models/Tag');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            category,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 10,
            minPrice,
            maxPrice,
            featured
        } = req.query;

        // Build filter object
        let filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (featured === 'true') {
            filter.isFeatured = true;
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('brand', 'name')
            .populate('tags', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('brand', 'name')
            .populate('tags', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name')
            .populate('brand', 'name')
            .limit(10)
            .sort('-rating');

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({
            category: req.params.categoryId,
            isActive: true
        })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    getCategories,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsByCategory
}; 