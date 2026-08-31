const express = require('express');
const { getBudget, updateBudget } = require('../controllers/budgetController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getBudget);
router.put('/', authorizeRoles('Admin', 'Manager'), updateBudget);

module.exports = router;
