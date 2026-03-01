const express = require('express');
const router  = express.Router();
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, assignTeacher, enrollStudent, unenrollStudent } = require('../controllers/subjectController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/',    verifyToken, getSubjects);
router.get('/:id', verifyToken, getSubject);
router.post('/',   verifyToken, authorizeRoles('admin'), createSubject);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateSubject);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteSubject);
router.put('/:id/assign-teacher', verifyToken, authorizeRoles('admin'), assignTeacher);
router.put('/:id/enroll',   verifyToken, authorizeRoles('admin'), enrollStudent);
router.put('/:id/unenroll', verifyToken, authorizeRoles('admin'), unenrollStudent);

module.exports = router;
