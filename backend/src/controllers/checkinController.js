const CheckIn = require('../models/CheckIn');
const Invitation = require('../models/Invitation');
const Event = require('../models/Event');
const Wedding = require('../models/Wedding');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const processCheckIn = asyncHandler(async (req, res) => {
  const { invitationId, eventId, attendeesCount, notes } = req.body;

  if (!invitationId || !eventId) {
    throw new ApiError(400, 'invitationId and eventId are required');
  }

  const invitation = await Invitation.findById(invitationId)
    .populate('guest')
    .populate('family');

  if (!invitation) {
    throw new ApiError(404, 'Invitation not found');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Double check DB to prevent duplicate check-in
  const existing = await CheckIn.findOne({
    invitation: invitation._id,
    event: event._id
  });

  if (existing) {
    throw new ApiError(409, 'Duplicate check-in detected! This invitation has already checked in for this event.');
  }

  const checkIn = await CheckIn.create({
    wedding: invitation.wedding,
    invitation: invitation._id,
    event: event._id,
    guest: invitation.guest?._id || null,
    family: invitation.family?._id || null,
    attendeesCount: attendeesCount || 1,
    scannedBy: req.user._id,
    scannedAt: new Date(),
    status: 'Verified',
    notes: notes || ''
  });

  const guestName = invitation.guest?.name || invitation.family?.name || 'Guest';

  await ActivityLog.create({
    wedding: invitation.wedding,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Checked-In Guest',
    entityType: 'CheckIn',
    details: `${req.user.name} checked in '${guestName}' (${checkIn.attendeesCount} guests) for '${event.name}'`
  });

  const populatedCheckIn = await CheckIn.findById(checkIn._id)
    .populate('guest', 'name category email')
    .populate('family', 'name')
    .populate('event', 'name venue')
    .populate('scannedBy', 'name role');

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        checkIn: populatedCheckIn,
        message: `✓ Check-In Successful! ${guestName} (${checkIn.attendeesCount} attendees)`
      },
      'Check-in recorded successfully'
    )
  );
});

const getCheckInHistory = asyncHandler(async (req, res) => {
  const { eventId, page = 1, limit = 30 } = req.query;
  const wedding = await Wedding.findOne();

  const query = { wedding: wedding._id };
  if (eventId) query.event = eventId;

  const total = await CheckIn.countDocuments(query);
  const checkIns = await CheckIn.find(query)
    .populate('guest', 'name category phone email')
    .populate('family', 'name headContact')
    .populate('event', 'name venue date')
    .populate('scannedBy', 'name role')
    .sort({ scannedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        checkIns,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      },
      'Check-in history retrieved successfully'
    )
  );
});

module.exports = {
  processCheckIn,
  getCheckInHistory
};
