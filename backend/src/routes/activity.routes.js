const express = require('express');
const { getActivityLogs } = require('../controllers/activityController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, authorizeRoles('Admin', 'Manager'), getActivityLogs);

module.exports = router;
