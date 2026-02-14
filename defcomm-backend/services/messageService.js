const { Message, User } = require('../models');

/**
 * Create a new message. Only stores encryptedText — never plaintext.
 */
const createMessage = async ({ groupId, senderId, encryptedText }) => {
    const message = await Message.create({ groupId, senderId, encryptedText });
    return {
        ...message.get({ plain: true }),
        _id: message.id,
        timestamp: message.createdAt
    };
};

/**
 * Get messages by group ID with pagination.
 * Returns messages in chronological order (oldest first within page).
 * @param {number} groupId - The group to fetch messages for
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Messages per page
 */
const getMessagesByGroupId = async (groupId, page = 1, limit = 50) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
        where: { groupId },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username'],
            },
        ],
        order: [['createdAt', 'ASC']],
        limit,
        offset,
    });

    return {
        messages: rows.map(msg => {
            const msgData = msg.toJSON ? msg.toJSON() : msg;
            return {
                ...msgData,
                _id: msgData.id,
                sender: msgData.sender ? {
                    ...msgData.sender,
                    _id: msgData.sender.id,
                } : null,
                timestamp: msgData.createdAt, // Ensure timestamp property exists
            };
        }),
        pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit),
        },
    };
};

module.exports = {
    createMessage,
    getMessagesByGroupId,
};
