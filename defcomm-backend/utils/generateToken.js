const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token and set it as an HTTP-only cookie.
 * @param {Object} res - Express response object
 * @param {string} userId - User's MongoDB ObjectId
 */
const generateToken = (res, userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.JWT_EXPIRE || '30d';

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn,
    });

    // Calculate maxAge from JWT_EXPIRE (default 30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000;

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-site in production
        maxAge,
        path: '/', // Ensure cookie is root-scoped
    });
};

module.exports = generateToken;
