const Expense = require('../models/Expense');
const Vendor = require('../models/Vendor');
const Wedding = require('../models/Wedding');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getExpenses = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findOne();
  const expenses = await Expense.find({ wedding: wedding._id })
    .populate('vendor', 'name category phone')
    .sort({ paymentDate: -1 });

  return res.status(200).json(new ApiResponse(200, expenses, 'Expenses retrieved successfully'));
});

const createExpense = asyncHandler(async (req, res) => {
  const { title, category, vendor, amount, paymentStatus, paymentDate, dueDate, notes } = req.body;
  const wedding = await Wedding.findOne();

  if (!title || !amount) {
    throw new ApiError(400, 'Title and amount are required');
  }

  let receiptUrl = '';
  if (req.file) {
    receiptUrl = `/uploads/${req.file.filename}`;
  }

  const expense = await Expense.create({
    wedding: wedding._id,
    title,
    category: category || 'Other',
    vendor: vendor || null,
    amount: parseFloat(amount),
    paymentStatus: paymentStatus || 'Paid',
    paymentDate: paymentDate || new Date(),
    dueDate: dueDate || null,
    receiptUrl,
    notes: notes || ''
  });

  // If linked to vendor, update vendor amountPaid
  if (vendor) {
    const vendorDoc = await Vendor.findById(vendor);
    if (vendorDoc) {
      vendorDoc.amountPaid += parseFloat(amount);
      if (vendorDoc.amountPaid >= vendorDoc.contractAmount && vendorDoc.contractAmount > 0) {
        vendorDoc.paymentStatus = 'Paid';
      } else if (vendorDoc.amountPaid > 0) {
        vendorDoc.paymentStatus = 'Partially Paid';
      }
      await vendorDoc.save();
    }
  }

  await ActivityLog.create({
    wedding: wedding._id,
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'Created Expense',
    entityType: 'Expense',
    details: `${req.user.name} added expense '${expense.title}' ($${expense.amount})`
  });

  const populated = await Expense.findById(expense._id).populate('vendor', 'name');

  return res.status(201).json(new ApiResponse(201, populated, 'Expense created successfully'));
});

const updateExpense = asyncHandler(async (req, res) => {
  const { title, category, vendor, amount, paymentStatus, paymentDate, dueDate, notes } = req.body;
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (title) expense.title = title;
  if (category) expense.category = category;
  if (vendor !== undefined) expense.vendor = vendor || null;
  if (amount !== undefined) expense.amount = parseFloat(amount);
  if (paymentStatus) expense.paymentStatus = paymentStatus;
  if (paymentDate) expense.paymentDate = paymentDate;
  if (dueDate !== undefined) expense.dueDate = dueDate;
  if (notes !== undefined) expense.notes = notes;

  if (req.file) {
    expense.receiptUrl = `/uploads/${req.file.filename}`;
  }

  await expense.save();

  const populated = await Expense.findById(expense._id).populate('vendor', 'name');

  return res.status(200).json(new ApiResponse(200, populated, 'Expense updated successfully'));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  await expense.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, 'Expense deleted successfully'));
});

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
