const express = require('express');
const router  = express.Router();
const { getEcoAnalytics } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/eco', verifyToken, authorizeRoles('admin', 'teacher'), getEcoAnalytics);

module.exports = router;
