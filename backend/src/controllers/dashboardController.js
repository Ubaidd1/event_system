const Wedding = require('../models/Wedding');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const Invitation = require('../models/Invitation');
const Expense = require('../models/Expense');
const Vendor = require('../models/Vendor');
const CheckIn = require('../models/CheckIn');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  let wedding = await Wedding.findOne();
  if (!wedding) {
    wedding = await Wedding.create({
      coupleNames: 'Abdullah & Sarah',
      title: 'Wedding Celebration',
      weddingDate: new Date('2027-03-19T18:00:00.000Z'),
      totalBudget: 50000,
      organizer: req.user?._id
    });
  }

  // Guests RSVP counts
  const totalGuests = await Guest.countDocuments({ wedding: wedding._id });
  const confirmedRSVP = await Guest.countDocuments({ wedding: wedding._id, rsvpStatus: 'Confirmed' });
  const pendingRSVP = await Guest.countDocuments({ wedding: wedding._id, rsvpStatus: 'Pending' });
  const declinedRSVP = await Guest.countDocuments({ wedding: wedding._id, rsvpStatus: 'Declined' });

  // Invitations
  const totalInvitations = await Invitation.countDocuments({ wedding: wedding._id });

  // Check-ins total
  const totalCheckIns = await CheckIn.countDocuments({ wedding: wedding._id });

  // Financial Stats
  const expenses = await Expense.find({ wedding: wedding._id });
  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const vendors = await Vendor.find({ wedding: wedding._id });
  const pendingVendorPayments = vendors
    .filter(v => v.paymentStatus === 'Pending' || v.paymentStatus === 'Partially Paid')
    .reduce((acc, curr) => acc + (curr.contractAmount - curr.amountPaid), 0);

  const remainingBudget = wedding.totalBudget - totalSpent;

  // Upcoming events
  const upcomingEvents = await Event.find({ wedding: wedding._id })
    .sort({ date: 1 })
    .limit(4);

  // Recent Check-In activity
  const recentCheckIns = await CheckIn.find({ wedding: wedding._id })
    .populate('guest', 'name category')
    .populate('event', 'name venue')
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent activity logs
  const recentLogs = await ActivityLog.find({ wedding: wedding._id })
    .sort({ createdAt: -1 })
    .limit(6);

  // Categorized expenses for chart
  const categoryExpenses = {};
  expenses.forEach(exp => {
    categoryExpenses[exp.category] = (categoryExpenses[exp.category] || 0) + exp.amount;
  });
  const expenseChartData = Object.keys(categoryExpenses).map(cat => ({
    name: cat,
    amount: categoryExpenses[cat]
  }));

  // RSVP status breakdown chart
  const rsvpChartData = [
    { name: 'Confirmed', value: confirmedRSVP },
    { name: 'Pending', value: pendingRSVP },
    { name: 'Declined', value: declinedRSVP }
  ];

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        wedding,
        metrics: {
          totalGuests,
          confirmedRSVP,
          pendingRSVP,
          declinedRSVP,
          totalInvitations,
          totalCheckIns,
          totalBudget: wedding.totalBudget,
          totalSpent,
          remainingBudget,
          pendingVendorPayments
        },
        upcomingEvents,
        recentCheckIns,
        recentLogs,
        expenseChartData,
        rsvpChartData
      },
      'Dashboard stats retrieved successfully'
    )
  );
});

module.exports = {
  getDashboardStats
};
