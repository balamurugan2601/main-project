const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    sendMessage,
    getMessages,
    sendMessageValidation,
    getMessagesValidation,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// All message routes require authentication
router.use(protect);

router.route('/')
    .get(getMessagesValidation, validate, getMessages)
    .post(sendMessageValidation, validate, sendMessage);

module.exports = router;
