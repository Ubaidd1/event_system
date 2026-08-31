const Guest = require('../models/Guest');
const Wedding = require('../models/Wedding');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getGuests = asyncHandler(async (req, res) => {
  const { search, rsvpStatus, category, family, page = 1, limit = 20 } = req.query;
  const wedding = await Wedding.findOne();

  const query = { wedding: wedding._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (rsvpStatus) query.rsvpStatus = rsvpStatus;
  if (category) query.category = category;
  if (family) query.family = family;

  const total = await Guest.countDocuments(query);
  const guests = await Guest.find(query)
    .populate('family', 'name headContact')
    .populate('events', 'name date venue')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        guests,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      },
      'Guests retrieved successfully'
    )
  );
});

const getGuestById = asyncHandler(async (req, res) => {
  const guest = await Guest.findById(req.params.id)
    .populate('family')
    .populate('events');

  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  return res.status(200).json(new ApiResponse(200, guest, 'Guest details retrieved'));
});

const createGuest = asyncHandler(async (req, res) => {
  const { name, email, phone, category, allowedPlusOnes, family, events, rsvpStatus, notes } = req.body;
  const wedding = await Wedding.findOne();

  if (!name) {
    throw new ApiError(400, 'Guest name is required');
  }

  const guest = await Guest.create({
    wedding: wedding._id,
    name,
    email: email || '',
    phone: phone || '',
    category: category || 'General',
    allowedPlusOnes: allowedPlusOnes !== undefined ? allowedPlusOnes : 1,
    family: family || null,
    events: events || [],
    rsvpStatus: rsvpStatus || 'Pending',
    notes: notes || ''
  });

  await ActivityLog.create({
    wedding: wedding._id,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Added Guest',
    entityType: 'Guest',
    details: `${req.user.name} added guest '${guest.name}' (${guest.category})`
  });

  const populatedGuest = await Guest.findById(guest._id).populate('family').populate('events');

  return res.status(201).json(new ApiResponse(201, populatedGuest, 'Guest created successfully'));
});

const updateGuest = asyncHandler(async (req, res) => {
  const { name, email, phone, category, allowedPlusOnes, family, events, rsvpStatus, notes } = req.body;

  const guest = await Guest.findById(req.params.id);
  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  if (name) guest.name = name;
  if (email !== undefined) guest.email = email;
  if (phone !== undefined) guest.phone = phone;
  if (category) guest.category = category;
  if (allowedPlusOnes !== undefined) guest.allowedPlusOnes = allowedPlusOnes;
  if (family !== undefined) guest.family = family || null;
  if (events) guest.events = events;
  if (rsvpStatus) {
    guest.rsvpStatus = rsvpStatus;
    guest.rsvpDate = new Date();
  }
  if (notes !== undefined) guest.notes = notes;

  await guest.save();

  await ActivityLog.create({
    wedding: guest.wedding,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Updated Guest',
    entityType: 'Guest',
    details: `${req.user.name} updated guest '${guest.name}'`
  });

  const updatedGuest = await Guest.findById(guest._id).populate('family').populate('events');

  return res.status(200).json(new ApiResponse(200, updatedGuest, 'Guest updated successfully'));
});

const deleteGuest = asyncHandler(async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  const guestName = guest.name;
  await guest.deleteOne();

  await ActivityLog.create({
    wedding: guest.wedding,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Deleted Guest',
    entityType: 'Guest',
    details: `${req.user.name} deleted guest '${guestName}'`
  });

  return res.status(200).json(new ApiResponse(200, {}, 'Guest deleted successfully'));
});

module.exports = {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest
};
