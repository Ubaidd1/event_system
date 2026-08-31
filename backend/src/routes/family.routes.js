const express = require('express');
const {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily
} = require('../controllers/familyController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getFamilies);
router.post('/', authorizeRoles('Admin', 'Manager'), createFamily);
router.put('/:id', authorizeRoles('Admin', 'Manager'), updateFamily);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteFamily);

module.exports = router;
