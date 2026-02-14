const { param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

// @desc    Get all pending users
// @route   GET /api/users/pending
// @access  Private/HQ
const getPendingUsers = asyncHandler(async (req, res) => {
    const users = await userService.getPendingUsers();
    // Map id to _id for frontend compatibility
    const mappedUsers = users.map(user => ({
        ...user.toJSON(),
        _id: user.id
    }));
    res.json(mappedUsers);
});

// @desc    Approve a user
// @route   PUT /api/users/:id/approve
// @access  Private/HQ
const approveUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Prevent self-approval
    if (req.user.id.toString() === userId) {
        return res.status(400).json({ message: 'Cannot approve yourself' });
    }

    const user = await userService.approveUser(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        _id: user.id, // Mapped id to _id for frontend compatibility
        username: user.username,
        role: user.role,
        status: user.status,
        isApproved: user.status === 'approved',
    });
});

// @desc    Reject a user
// @route   PUT /api/users/:id/reject
// @access  Private/HQ
const rejectUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (req.user.id.toString() === userId) {
        return res.status(400).json({ message: 'Cannot reject yourself' });
    }

    const user = await userService.rejectUser(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        _id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        isApproved: user.status === 'approved',
    });
});

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/HQ
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { role, status } = req.body;

    const user = await userService.updateUser(userId, { role, status });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        _id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        isApproved: user.status === 'approved',
    });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/HQ
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (req.user.id.toString() === userId) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const result = await userService.deleteUser(userId);

    if (!result) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/HQ
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    // Map id to _id for frontend compatibility
    const mappedUsers = users.map(user => ({
        ...user.toJSON(),
        _id: user.id,
        isApproved: user.status === 'approved'
    }));
    res.json(mappedUsers);
});

// Validation rules
const approveUserValidation = [
    param('id').isInt().withMessage('Invalid user ID'),
];

const updateUserValidation = [
    param('id').isInt().withMessage('Invalid user ID'),
];

module.exports = {
    getPendingUsers,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    getAllUsers,
    approveUserValidation,
    updateUserValidation,
};
