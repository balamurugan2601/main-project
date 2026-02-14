const { body, param, query } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const messageService = require('../services/messageService');
const groupService = require('../services/groupService');

// @desc    Send a message to a group
// @route   POST /api/groups/:groupId/messages
// @access  Private (must be group member)
const sendMessage = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { encryptedText } = req.body;

    // Validate group membership
    const isMember = await groupService.isMember(groupId, req.user.id);
    if (!isMember) {
        return res.status(403).json({ message: 'Not a member of this group' });
    }

    console.log(`Sending message from user: ${req.user.username} (ID: ${req.user.id}) in group: ${groupId}`);

    const message = await messageService.createMessage({
        groupId,
        senderId: req.user.id,
        encryptedText,
    });

    // Return in the shape the frontend expects
    res.status(201).json({
        id: message.id,
        _id: message.id,
        groupId: message.groupId,
        senderId: req.user.id,
        sender: {
            id: req.user.id,
            _id: req.user.id,
            username: req.user.username
        },
        encryptedText: message.encryptedText,
        timestamp: message.timestamp || message.createdAt,
    });
});

// @desc    Get messages for a group (paginated)
// @route   GET /api/groups/:groupId/messages
// @access  Private (must be group member)
const getMessages = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    // Validate group membership
    const isMember = await groupService.isMember(groupId, req.user.id);
    if (!isMember) {
        return res.status(403).json({ message: 'Not a member of this group' });
    }

    const result = await messageService.getMessagesByGroupId(groupId, page, limit);

    res.json(result);
});

// Validation rules
const sendMessageValidation = [
    param('groupId').isInt().withMessage('Invalid group ID'),
    body('encryptedText')
        .notEmpty()
        .withMessage('Encrypted message text is required')
        .isString()
        .withMessage('Encrypted text must be a string'),
];

const getMessagesValidation = [
    param('groupId').isInt().withMessage('Invalid group ID'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
    sendMessage,
    getMessages,
    sendMessageValidation,
    getMessagesValidation,
};
