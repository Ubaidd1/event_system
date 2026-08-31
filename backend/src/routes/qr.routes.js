const express = require('express');
const { verifyQRToken } = require('../controllers/qrController');

const router = express.Router();

// Public / Authenticated QR Verification endpoint
router.post('/verify', verifyQRToken);

module.exports = router;
