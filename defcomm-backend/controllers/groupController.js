const { body, param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const groupService = require('../services/groupService');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private/HQ
const createGroup = asyncHandler(async (req, res) => {
    const { name, members } = req.body;

    const group = await groupService.createGroup({
        name,
        members: members || [],
        createdBy: req.user.id,
    });

    res.status(201).json(group);
});

// @desc    Get groups for current user
// @route   GET /api/groups
// @access  Private
const getGroups = asyncHandler(async (req, res) => {
    const groups = await groupService.getGroupsByUserId(req.user.id);
    res.json(groups);
});

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private (must be member)
const getGroupById = asyncHandler(async (req, res) => {
    const groupId = req.params.id;

    // Validate membership
    const memberCheck = await groupService.isMember(groupId, req.user.id);
    if (!memberCheck) {
        return res.status(403).json({ message: 'Not a member of this group' });
    }

    const group = await groupService.getGroupById(groupId);
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
});

// @desc    Add member to group
// @route   PUT /api/groups/:id/members
// @access  Private/HQ
const addMember = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const groupId = req.params.id;

    const group = await groupService.getGroupById(groupId);
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    const updatedGroup = await groupService.addMember(groupId, userId);
    res.json(updatedGroup);
});

// @desc    Update group name
// @route   PUT /api/groups/:id
// @access  Private/HQ
const updateGroup = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const groupId = req.params.id;

    const group = await groupService.updateGroup(groupId, name);
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
});

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private/HQ
const deleteGroup = asyncHandler(async (req, res) => {
    const groupId = req.params.id;

    const result = await groupService.deleteGroup(groupId);
    if (!result) {
        return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully' });
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private/HQ
const removeMember = asyncHandler(async (req, res) => {
    const { id: groupId, userId } = req.params;

    const group = await groupService.removeMember(groupId, userId);
    if (!group) {
        return res.status(404).json({ message: 'Group not found or member not in group' });
    }

    res.json(group);
});

// Validation rules
const createGroupValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Group name is required')
        .isLength({ max: 100 })
        .withMessage('Group name cannot exceed 100 characters'),
];

const updateGroupValidation = [
    param('id').isInt().withMessage('Invalid group ID'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Group name is required')
        .isLength({ max: 100 })
        .withMessage('Group name cannot exceed 100 characters'),
];

const addMemberValidation = [
    param('id').isInt().withMessage('Invalid group ID'),
    body('userId').isInt().withMessage('Invalid user ID'),
];

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    addMember,
    updateGroup,
    deleteGroup,
    removeMember,
    createGroupValidation,
    updateGroupValidation,
    addMemberValidation,
};
