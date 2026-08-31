const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, getDashboardStats);

module.exports = router;
