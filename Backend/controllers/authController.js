const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    console.log("--- New Registration Request ---");
    console.log("1. Received data:", req.body);

    try {
        const { username, email, password, fullName, studentCode, major, year, class: className, phone, gender } = req.body;

        console.log("2. Checking for existing user...");
        const existingUser = await User.findOne({
            $or: [{ email }, { username }, { studentCode }]
        });

        if (existingUser) {
            console.log("-> Error: User already exists.");
            return res.status(400).json({
                message: 'User already exists with this email, username, or student code'
            });
        }
        console.log("-> OK: User does not exist.");

        console.log("3. Preparing to create user...");

        let userRole = 'user';
        if (email.endsWith('@admin.fpt.edu.vn')) {
            userRole = 'admin';
            console.log("-> Role assigned: ADMIN");
        }

        const user = await User.create({
            username,
            email,
            password,
            fullName,
            studentCode,
            major,
            year,
            class: className,
            phone,
            gender,
            role: userRole,
        });
        console.log("4. SUCCESS: User created in DB:", user._id);

        const token = generateToken(user._id);
        console.log("5. Token generated.");

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                studentCode: user.studentCode,
                major: user.major,
                year: user.year,
                class: user.class
            }
        });
        console.log("--- Registration process completed successfully ---");

    } catch (error) {
        console.error("!!! SEVERE ERROR DURING REGISTRATION !!!");
        console.error("Error details:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration: " + error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is deactivated'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                studentCode: user.studentCode,
                major: user.major,
                year: user.year,
                class: user.class
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
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

module.exports = {
    register,
    login,
    getMe
}; 