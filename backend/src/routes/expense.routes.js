const express = require('express');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getExpenses);
router.post('/', authorizeRoles('Admin', 'Manager'), upload.single('receipt'), createExpense);
router.put('/:id', authorizeRoles('Admin', 'Manager'), upload.single('receipt'), updateExpense);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteExpense);

module.exports = router;
