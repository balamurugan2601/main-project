const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// All group routes require authentication
router.use(protect);

router.route('/')
    .get(getGroups)
    .post(authorize('hq'), createGroupValidation, validate, createGroup);

router.route('/:id')
    .get(getGroupById)
    .put(authorize('hq'), updateGroupValidation, validate, updateGroup)
    .delete(authorize('hq'), deleteGroup);

router.route('/:id/members')
    .put(authorize('hq'), addMemberValidation, validate, addMember);

router.delete('/:id/members/:userId', authorize('hq'), removeMember);

module.exports = router;
