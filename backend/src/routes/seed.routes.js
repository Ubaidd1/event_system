const express = require('express');
const { seedDatabase } = require('../controllers/seederController');

const router = express.Router();

// Allowed for setup/testing
router.post('/', seedDatabase);

module.exports = router;
