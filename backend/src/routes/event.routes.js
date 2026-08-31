const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authorizeRoles('Admin', 'Manager'), createEvent);
router.put('/:id', authorizeRoles('Admin', 'Manager'), updateEvent);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteEvent);

module.exports = router;
