const express = require('express');
const {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest
} = require('../controllers/guestController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getGuests);
router.get('/:id', getGuestById);
router.post('/', authorizeRoles('Admin', 'Manager'), createGuest);
router.put('/:id', authorizeRoles('Admin', 'Manager'), updateGuest);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteGuest);

module.exports = router;
