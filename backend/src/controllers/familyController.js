const Family = require('../models/Family');
const Guest = require('../models/Guest');
const Wedding = require('../models/Wedding');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getFamilies = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findOne();
  const families = await Family.find({ wedding: wedding._id }).sort({ name: 1 });

  // Attach members count to each family
  const familiesWithMembers = await Promise.all(
    families.map(async (family) => {
      const members = await Guest.find({ family: family._id }).select('name email phone rsvpStatus category');
      return {
        ...family.toObject(),
        members,
        memberCount: members.length
      };
    })
  );

  return res.status(200).json(new ApiResponse(200, familiesWithMembers, 'Families retrieved successfully'));
});

const createFamily = asyncHandler(async (req, res) => {
  const { name, headContact, email, phone, notes } = req.body;
  const wedding = await Wedding.findOne();

  if (!name) {
    throw new ApiError(400, 'Family name is required');
  }

  const family = await Family.create({
    wedding: wedding._id,
    name,
    headContact: headContact || '',
    email: email || '',
    phone: phone || '',
    notes: notes || ''
  });

  await ActivityLog.create({
    wedding: wedding._id,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Created Family',
    entityType: 'Family',
    details: `${req.user.name} created family '${family.name}'`
  });

  return res.status(201).json(new ApiResponse(201, family, 'Family created successfully'));
});

const updateFamily = asyncHandler(async (req, res) => {
  const { name, headContact, email, phone, notes } = req.body;
  const family = await Family.findById(req.params.id);

  if (!family) {
    throw new ApiError(404, 'Family not found');
  }

  if (name) family.name = name;
  if (headContact !== undefined) family.headContact = headContact;
  if (email !== undefined) family.email = email;
  if (phone !== undefined) family.phone = phone;
  if (notes !== undefined) family.notes = notes;

  await family.save();

  return res.status(200).json(new ApiResponse(200, family, 'Family updated successfully'));
});

const deleteFamily = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);
  if (!family) {
    throw new ApiError(404, 'Family not found');
  }

  // Unassign family from associated guests
  await Guest.updateMany({ family: family._id }, { family: null });
  await family.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, 'Family deleted successfully'));
});

module.exports = {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily
};
