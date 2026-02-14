const express = require('express');
const router = express.Router();
const {
    getPendingUsers,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    getAllUsers,
    approveUserValidation,
    updateUserValidation,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// All user management routes require authentication + HQ role
router.use(protect, authorize('hq'));

router.get('/', getAllUsers);
router.get('/pending', getPendingUsers);
router.put('/:id/approve', approveUserValidation, validate, approveUser);
router.put('/:id/reject', approveUserValidation, validate, rejectUser);
router.route('/:id')
    .put(updateUserValidation, validate, updateUser)
    .delete(deleteUser);

module.exports = router;
