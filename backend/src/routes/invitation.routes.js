const express = require('express');
const {
  getInvitations,
  createInvitation,
  getPublicInvitationByToken,
  submitPublicRSVP,
  deleteInvitation
} = require('../controllers/invitationController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for guests
router.get('/public/:token', getPublicInvitationByToken);
router.post('/public/:token/rsvp', submitPublicRSVP);

// Protected dashboard routes
router.get('/', verifyJWT, getInvitations);
router.post('/', verifyJWT, authorizeRoles('Admin', 'Manager'), createInvitation);
router.delete('/:id', verifyJWT, authorizeRoles('Admin', 'Manager'), deleteInvitation);

module.exports = router;
