const express = require('express');
const router = express.Router();
const { createSubmission, getMySubmissions, getSubmissions, getSubmission, gradeSubmission, bulkDownload, serveFile, deleteSubmission } = require('../controllers/submissionController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { upload } = require('../middleware/upload');

router.get('/my', verifyToken, authorizeRoles('student'), getMySubmissions);
router.get('/download/:assignmentId', verifyToken, authorizeRoles('teacher', 'admin'), bulkDownload);
router.get('/', verifyToken, authorizeRoles('teacher', 'admin'), getSubmissions);
router.get('/:id/file', serveFile);  // auth handled inside (supports query token for new-tab opens)
router.get('/:id', verifyToken, getSubmission);
router.post('/', verifyToken, authorizeRoles('student'), upload.single('pdf'), createSubmission);
router.put('/:id/grade', verifyToken, authorizeRoles('teacher', 'admin'), gradeSubmission);
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), deleteSubmission);

module.exports = router;
