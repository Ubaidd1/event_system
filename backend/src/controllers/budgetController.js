const Wedding = require('../models/Wedding');
const Expense = require('../models/Expense');
const Vendor = require('../models/Vendor');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getBudget = asyncHandler(async (req, res) => {
  let wedding = await Wedding.findOne();
  if (!wedding) {
    wedding = await Wedding.create({ totalBudget: 50000 });
  }

  const expenses = await Expense.find({ wedding: wedding._id });
  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const vendors = await Vendor.find({ wedding: wedding._id });
  const pendingVendorPayments = vendors
    .filter(v => v.paymentStatus === 'Pending' || v.paymentStatus === 'Partially Paid')
    .reduce((acc, curr) => acc + (curr.contractAmount - curr.amountPaid), 0);

  const remainingBudget = wedding.totalBudget - totalSpent;

  // Breakdown by category
  const categories = [
    'Venue', 'Catering', 'Decoration', 'Photography',
    'Videography', 'Clothing', 'Invitations', 'Transportation',
    'Makeup', 'Entertainment', 'Other'
  ];

  const categoryBreakdown = categories.map(cat => {
    const catExpenses = expenses.filter(e => e.category === cat);
    const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      category: cat,
      spent,
      count: catExpenses.length
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalBudget: wedding.totalBudget,
        totalSpent,
        remainingBudget,
        pendingVendorPayments,
        currency: wedding.currency,
        categoryBreakdown
      },
      'Budget retrieved successfully'
    )
  );
});

const updateBudget = asyncHandler(async (req, res) => {
  const { totalBudget } = req.body;
  let wedding = await Wedding.findOne();

  if (totalBudget !== undefined) {
    wedding.totalBudget = parseFloat(totalBudget);
    await wedding.save();
  }

  return res.status(200).json(new ApiResponse(200, { totalBudget: wedding.totalBudget }, 'Budget updated'));
});

module.exports = {
  getBudget,
  updateBudget
};
