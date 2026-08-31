const Event = require('../models/Event');
const Guest = require('../models/Guest');
const CheckIn = require('../models/CheckIn');
const Wedding = require('../models/Wedding');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getEvents = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findOne();
  const events = await Event.find({ wedding: wedding._id }).sort({ date: 1 });

  const eventsWithStats = await Promise.all(
    events.map(async (ev) => {
      const assignedGuestsCount = await Guest.countDocuments({ wedding: wedding._id, events: ev._id });
      const confirmedCount = await Guest.countDocuments({ wedding: wedding._id, events: ev._id, rsvpStatus: 'Confirmed' });
      const checkInCount = await CheckIn.countDocuments({ wedding: wedding._id, event: ev._id });

      return {
        ...ev.toObject(),
        assignedGuestsCount,
        confirmedCount,
        checkInCount
      };
    })
  );

  return res.status(200).json(new ApiResponse(200, eventsWithStats, 'Events retrieved successfully'));
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const assignedGuests = await Guest.find({ events: event._id }).populate('family', 'name');
  const checkIns = await CheckIn.find({ event: event._id }).populate('guest', 'name').populate('scannedBy', 'name');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...event.toObject(),
        assignedGuests,
        checkIns
      },
      'Event details retrieved'
    )
  );
});

const createEvent = asyncHandler(async (req, res) => {
  const { name, date, startTime, endTime, venue, address, description, dressCode } = req.body;
  const wedding = await Wedding.findOne();

  if (!name || !date || !venue) {
    throw new ApiError(400, 'Name, date, and venue are required');
  }

  const event = await Event.create({
    wedding: wedding._id,
    name,
    date,
    startTime: startTime || '18:00',
    endTime: endTime || '23:00',
    venue,
    address: address || '',
    description: description || '',
    dressCode: dressCode || ''
  });

  await ActivityLog.create({
    wedding: wedding._id,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Created Event',
    entityType: 'Event',
    details: `${req.user.name} created event '${event.name}'`
  });

  return res.status(201).json(new ApiResponse(201, event, 'Event created successfully'));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { name, date, startTime, endTime, venue, address, description, dressCode } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (name) event.name = name;
  if (date) event.date = date;
  if (startTime) event.startTime = startTime;
  if (endTime) event.endTime = endTime;
  if (venue) event.venue = venue;
  if (address !== undefined) event.address = address;
  if (description !== undefined) event.description = description;
  if (dressCode !== undefined) event.dressCode = dressCode;

  await event.save();

  return res.status(200).json(new ApiResponse(200, event, 'Event updated successfully'));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await event.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, 'Event deleted successfully'));
});

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
