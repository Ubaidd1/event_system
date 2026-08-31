const express = require('express');
const { verifyQRToken } = require('../controllers/qrController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.post('/verify', verifyQRToken);

module.exports = router;
