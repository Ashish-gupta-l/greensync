const express = require('express');
const router  = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.get('/',           verifyToken, getNotifications);
router.put('/read-all',   verifyToken, markAllRead);
router.put('/:id/read',   verifyToken, markRead);

module.exports = router;
