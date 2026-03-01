const express = require('express');
const router  = express.Router();
const { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/',    verifyToken, getAssignments);
router.get('/:id', verifyToken, getAssignment);
router.post('/',   verifyToken, authorizeRoles('teacher', 'admin'), createAssignment);
router.put('/:id', verifyToken, authorizeRoles('teacher', 'admin'), updateAssignment);
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), deleteAssignment);

module.exports = router;
