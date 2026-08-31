const express = require('express');
const {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getVendors);
router.post('/', authorizeRoles('Admin', 'Manager'), createVendor);
router.put('/:id', authorizeRoles('Admin', 'Manager'), updateVendor);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteVendor);

module.exports = router;
