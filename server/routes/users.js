const express = require('express');
const router  = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/',    verifyToken, authorizeRoles('admin', 'teacher'), getUsers);
router.get('/:id', verifyToken, getUser);
router.post('/',   verifyToken, authorizeRoles('admin'), createUser);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateUser);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteUser);

module.exports = router;
