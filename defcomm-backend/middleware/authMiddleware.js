const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Protect routes — validates JWT from cookies and attaches user to request.
 */
const protect = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        console.warn(`[AUTH] Missing Token for request to ${req.originalUrl} from host ${req.get('host')}`);
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

/**
 * Authorize by role — restricts access to specified roles.
 * Must be used AFTER protect middleware.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`Auth Failure: User ${req.user?.id} with role [${req.user?.role}] tried to access route needing ${roles}`);
            return res.status(403).json({
                message: 'Not authorized to access this route',
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
