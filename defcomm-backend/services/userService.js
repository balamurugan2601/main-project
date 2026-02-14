const { User } = require('../models');

/**
 * Get all users with pending approval status.
 */
const getPendingUsers = async () => {
    return User.findAll({
        where: {
            status: 'pending',
            role: 'user',
        },
    });
};

/**
 * Approve a user by ID.
 */
const approveUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return null;

    user.status = 'approved';
    await user.save();
    return user;
};

/**
 * Reject a user by ID.
 */
const rejectUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return null;

    user.status = 'rejected';
    await user.save();
    return user;
};

/**
 * Update a user by ID.
 */
const updateUser = async (userId, userData) => {
    const user = await User.findByPk(userId);
    if (!user) return null;

    return await user.update(userData);
};

/**
 * Delete a user by ID.
 */
const deleteUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return null;

    await user.destroy();
    return true;
};

/**
 * Get all users (for HQ dashboard), excluding passwords.
 */
const getAllUsers = async () => {
    return User.findAll();
};

module.exports = {
    getPendingUsers,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    getAllUsers,
};
