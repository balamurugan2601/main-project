const { User } = require('../models');

/**
 * Find a user by username (with password for authentication).
 */
const findUserByUsername = async (username) => {
    return User.scope('withPassword').findOne({ where: { username } });
};

/**
 * Create a new user. Role is always 'user' by default (enforced at model level).
 */
const createUser = async ({ username, password, role }) => {
    return User.create({ username, password, role: role || 'user' });
};

/**
 * Find a user by ID, excluding password field.
 */
const findUserById = async (id) => {
    return User.findByPk(id);
};

module.exports = {
    findUserByUsername,
    createUser,
    findUserById,
};
