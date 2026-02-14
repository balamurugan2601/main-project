const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await authService.findUserByUsername(username);

    if (user && (await user.matchPassword(password))) {
        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Your account has been rejected by HQ. Access denied.' });
        }
        generateToken(res, user.id);

        res.json({
            _id: user.id,
            username: user.username,
            role: user.role,
            status: user.status,
            isApproved: user.status === 'approved',
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;

    const userExists = await authService.findUserByUsername(username);

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Role defaults to 'user' if not provided
    const user = await authService.createUser({ username, password, role });

    if (user) {
        generateToken(res, user.id);

        res.status(201).json({
            _id: user.id,
            username: user.username,
            role: user.role,
            status: user.status,
            isApproved: user.status === 'approved',
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Check auth status
// @route   GET /api/auth/check
// @access  Private
const checkAuth = asyncHandler(async (req, res) => {
    const user = await authService.findUserById(req.user.id);
    if (user) {
        res.json({
            _id: user.id,
            username: user.username,
            role: user.role,
            status: user.status,
            isApproved: user.status === 'approved',
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Validation rules
const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const registerValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['user', 'hq'])
        .withMessage('Role must be either user or hq'),
];

module.exports = {
    authUser,
    registerUser,
    logoutUser,
    checkAuth,
    loginValidation,
    registerValidation,
};
