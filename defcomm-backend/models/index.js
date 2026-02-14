const User = require('./User');
const Group = require('./Group');
const Message = require('./Message');
const GroupMember = require('./GroupMember');

// Define associations

// User <-> Group (many-to-many through GroupMember)
User.belongsToMany(Group, {
    through: GroupMember,
    foreignKey: 'userId',
    otherKey: 'groupId',
    as: 'groups',
});

Group.belongsToMany(User, {
    through: GroupMember,
    foreignKey: 'groupId',
    otherKey: 'userId',
    as: 'members',
});

// Group -> User (createdBy)
Group.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
});

// Message -> Group
Message.belongsTo(Group, {
    foreignKey: 'groupId',
    as: 'group',
});

// Message -> User (sender)
Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender',
});

module.exports = {
    User,
    Group,
    Message,
    GroupMember,
};
