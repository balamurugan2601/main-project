const { User, Group, Message } = require('../models');

/**
 * Get system statistics for HQ dashboard.
 * Returns counts of users, groups, and messages.
 */
const getSystemStats = async () => {
    const [totalUsers, approvedUsers, pendingUsers, totalGroups, totalMessages] = await Promise.all([
        User.count(),
        User.count({ where: { status: 'approved' } }),
        User.count({ where: { status: 'pending' } }),
        Group.count(),
        Message.count(),
    ]);

    return {
        totalUsers,
        approvedUsers,
        pendingUsers,
        totalGroups,
        totalMessages,
    };
};

/**
 * Get recent message metadata (NO decrypted content).
 * Returns only metadata: senderId, groupId, timestamp.
 * @param {number} limit - Number of recent messages to fetch
 */
const getRecentMessages = async (limit = 10) => {
    const messages = await Message.findAll({
        limit,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'createdAt', 'senderId', 'groupId'],
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username'],
            },
            {
                model: Group,
                as: 'group',
                attributes: ['id', 'name'],
            },
        ],
    });

    return messages.map((msg) => ({
        senderId: msg.sender.id,
        senderName: msg.sender.username,
        groupId: msg.group.id,
        groupName: msg.group.name,
        timestamp: msg.createdAt,
    }));
};

module.exports = {
    getSystemStats,
    getRecentMessages,
};
