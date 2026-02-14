const { Group, GroupMember, User } = require('../models');

/**
 * Create a new group. Only HQ should call this (enforced at route level).
 */
const createGroup = async ({ name, members, createdBy }) => {
    const group = await Group.create({ name, createdBy });

    // Add members if provided
    if (members && members.length > 0) {
        const memberRecords = members.map(userId => ({
            groupId: group.id,
            userId: userId,
        }));
        await GroupMember.bulkCreate(memberRecords);
    }

    // Add creator as member
    await GroupMember.create({
        groupId: group.id,
        userId: createdBy,
    });

    // Return mapped plain object
    return {
        ...group.get({ plain: true }),
        _id: group.id,
        members: [] // New group starts with just creator, but and members if provided above
    };
};

/**
 * Get all groups that a user is a member of.
 */
const getGroupsByUserId = async (userId) => {
    // 1. Find group IDs where user is member
    const memberships = await GroupMember.findAll({
        where: { userId },
        attributes: ['groupId'],
    });
    const groupIds = memberships.map(m => m.groupId);

    // 2. Find those groups including ALL members
    const groups = await Group.findAll({
        where: { id: groupIds },
        include: [
            {
                model: User,
                as: 'members',
                attributes: ['id', 'username', 'role'],
                through: { attributes: [] },
            },
        ],
        order: [['createdAt', 'DESC']],
    });

    // Map id to _id for frontend compatibility
    return groups.map(group => {
        const groupData = group.toJSON ? group.toJSON() : group;
        return {
            ...groupData,
            _id: groupData.id,
            members: groupData.members.map(member => {
                const memberData = member.toJSON ? member.toJSON() : member;
                return {
                    ...memberData,
                    _id: memberData.id,
                    isApproved: memberData.status === 'approved'
                };
            }),
        };
    });
};

/**
 * Get a single group by ID.
 */
const getGroupById = async (groupId) => {
    const group = await Group.findByPk(groupId, {
        include: [
            {
                model: User,
                as: 'members',
                attributes: ['id', 'username', 'role'],
                through: { attributes: [] },
            },
        ],
    });

    if (!group) return null;

    const groupData = group.toJSON ? group.toJSON() : group;
    return {
        ...groupData,
        _id: groupData.id,
        members: (groupData.members || []).map(member => {
            const memberData = member.toJSON ? member.toJSON() : member;
            return {
                ...memberData,
                _id: memberData.id,
                isApproved: memberData.status === 'approved'
            };
        }),
    };
};

/**
 * Check if a user is a member of a group.
 */
const isMember = async (groupId, userId) => {
    const membership = await GroupMember.findOne({
        where: {
            groupId,
            userId,
        },
    });
    return !!membership;
};

/**
 * Add a member to a group.
 */
const addMember = async (groupId, userId) => {
    await GroupMember.findOrCreate({
        where: {
            groupId,
            userId,
        },
    });

    return getGroupById(groupId);
};

/**
 * Update group name.
 */
const updateGroup = async (groupId, name) => {
    const group = await Group.findByPk(groupId);
    if (!group) return null;

    group.name = name;
    await group.save();
    return getGroupById(groupId);
};

/**
 * Delete a group.
 */
const deleteGroup = async (groupId) => {
    const group = await Group.findByPk(groupId);
    if (!group) return null;

    await group.destroy();
    return true;
};

/**
 * Remove a member from a group.
 */
const removeMember = async (groupId, userId) => {
    const membership = await GroupMember.findOne({
        where: { groupId, userId }
    });
    if (!membership) return null;

    await membership.destroy();
    return getGroupById(groupId);
};

module.exports = {
    createGroup,
    getGroupsByUserId,
    getGroupById,
    isMember,
    addMember,
    updateGroup,
    deleteGroup,
    removeMember,
};
