const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    logoutUser,
    checkAuth,
    loginValidation,
    registerValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, authUser);
router.post('/logout', logoutUser);
router.get('/check', protect, checkAuth);

module.exports = router;
