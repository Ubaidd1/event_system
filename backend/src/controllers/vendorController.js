const Vendor = require('../models/Vendor');
const Wedding = require('../models/Wedding');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getVendors = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findOne();
  const vendors = await Vendor.find({ wedding: wedding._id }).sort({ name: 1 });

  return res.status(200).json(new ApiResponse(200, vendors, 'Vendors retrieved successfully'));
});

const createVendor = asyncHandler(async (req, res) => {
  const { name, category, phone, email, contractAmount, amountPaid, dueDate, paymentStatus, notes } = req.body;
  const wedding = await Wedding.findOne();

  if (!name || contractAmount === undefined) {
    throw new ApiError(400, 'Vendor name and contract amount are required');
  }

  const paid = amountPaid || 0;
  const total = contractAmount || 0;
  let computedStatus = paymentStatus;
  if (!computedStatus) {
    if (paid >= total && total > 0) computedStatus = 'Paid';
    else if (paid > 0) computedStatus = 'Partially Paid';
    else computedStatus = 'Pending';
  }

  const vendor = await Vendor.create({
    wedding: wedding._id,
    name,
    category: category || 'Catering',
    phone: phone || '',
    email: email || '',
    contractAmount: total,
    amountPaid: paid,
    dueDate: dueDate || null,
    paymentStatus: computedStatus,
    notes: notes || ''
  });

  await ActivityLog.create({
    wedding: wedding._id,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Added Vendor',
    entityType: 'Vendor',
    details: `${req.user.name} added vendor '${vendor.name}' ($${vendor.contractAmount})`
  });

  return res.status(201).json(new ApiResponse(201, vendor, 'Vendor created successfully'));
});

const updateVendor = asyncHandler(async (req, res) => {
  const { name, category, phone, email, contractAmount, amountPaid, dueDate, paymentStatus, notes } = req.body;
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  if (name) vendor.name = name;
  if (category) vendor.category = category;
  if (phone !== undefined) vendor.phone = phone;
  if (email !== undefined) vendor.email = email;
  if (contractAmount !== undefined) vendor.contractAmount = contractAmount;
  if (amountPaid !== undefined) vendor.amountPaid = amountPaid;
  if (dueDate !== undefined) vendor.dueDate = dueDate;
  if (notes !== undefined) vendor.notes = notes;

  if (paymentStatus) {
    vendor.paymentStatus = paymentStatus;
  } else {
    if (vendor.amountPaid >= vendor.contractAmount && vendor.contractAmount > 0) {
      vendor.paymentStatus = 'Paid';
    } else if (vendor.amountPaid > 0) {
      vendor.paymentStatus = 'Partially Paid';
    } else {
      vendor.paymentStatus = 'Pending';
    }
  }

  await vendor.save();

  await ActivityLog.create({
    wedding: vendor.wedding,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Updated Vendor Payment',
    entityType: 'Vendor',
    details: `${req.user.name} updated vendor '${vendor.name}' payment ($${vendor.amountPaid}/$${vendor.contractAmount})`
  });

  return res.status(200).json(new ApiResponse(200, vendor, 'Vendor updated successfully'));
});

const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  await vendor.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, 'Vendor deleted successfully'));
});

module.exports = {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor
};
