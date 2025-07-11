const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('favorites').select('-password');
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('favorites').select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, dateOfBirth, gender, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                fullName,
                phone,
                dateOfBirth,
                gender,
                avatar
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add product to favorites
// @route   POST /api/users/favorites/:productId
// @access  Private
const addToFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;

        if (user.favorites.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product already in favorites'
            });
        }

        user.favorites.push(productId);
        await user.save();

        res.json({
            success: true,
            message: 'Product added to favorites'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove product from favorites
// @route   DELETE /api/users/favorites/:productId
// @access  Private
const removeFromFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;

        user.favorites = user.favorites.filter(id => id.toString() !== productId);
        await user.save();

        res.json({
            success: true,
            message: 'Product removed from favorites'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');

        res.json({
            success: true,
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    deleteUser
}; 