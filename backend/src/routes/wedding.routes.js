const express = require('express');
const { getWeddingDetails, updateWeddingDetails } = require('../controllers/weddingController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, getWeddingDetails);
router.put('/', verifyJWT, authorizeRoles('Admin', 'Manager'), updateWeddingDetails);

module.exports = router;
