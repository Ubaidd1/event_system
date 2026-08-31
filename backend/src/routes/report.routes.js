const express = require('express');
const { getReports } = require('../controllers/reportController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, authorizeRoles('Admin', 'Manager'), getReports);

module.exports = router;
