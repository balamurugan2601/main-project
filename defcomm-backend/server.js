const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars FIRST — before any module reads process.env
dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}

// Connect to database
connectDB();

// Load models and associations
require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// --------------- Middleware Stack (ordered) ---------------

// CORS — must be before other middleware for proper preflight handling
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:5173',
    credentials: true,
}));

// Security headers
app.use(helmet());

// Rate limiting — prevents brute-force and DDoS
const isDev = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 0 : 100, // 0 means unlimited in some versions, or just set high
    skip: () => isDev, // Completely skip in dev
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 0 : 20,
    skip: () => isDev, // Completely skip in dev
    message: { message: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// --------------- Routes ---------------

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'DefComm API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups/:groupId/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// --------------- Error Handling ---------------

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Centralized error handler (must be last)
app.use(errorHandler);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});
