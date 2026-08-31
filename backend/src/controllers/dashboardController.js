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
  const { eventId } = req.query;

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

  // All events list for dropdown
  const allEvents = await Event.find({ wedding: wedding._id }).sort({ date: 1 });

  // Guest query filtering
  const guestQuery = { wedding: wedding._id };
  if (eventId && eventId !== 'all') {
    guestQuery.events = eventId;
  }

  // Check-In query filtering
  const checkInQuery = { wedding: wedding._id };
  if (eventId && eventId !== 'all') {
    checkInQuery.event = eventId;
  }

  // Invitation query filtering
  const invitationQuery = { wedding: wedding._id };
  if (eventId && eventId !== 'all') {
    invitationQuery.event = eventId;
  }

  // Guests RSVP counts
  const totalGuests = await Guest.countDocuments(guestQuery);
  const confirmedRSVP = await Guest.countDocuments({ ...guestQuery, rsvpStatus: 'Confirmed' });
  const pendingRSVP = await Guest.countDocuments({ ...guestQuery, rsvpStatus: 'Pending' });
  const declinedRSVP = await Guest.countDocuments({ ...guestQuery, rsvpStatus: 'Declined' });

  // Invitations
  const totalInvitations = await Invitation.countDocuments(invitationQuery);

  // Check-ins total
  const totalCheckIns = await CheckIn.countDocuments(checkInQuery);

  // Financial Stats
  const expenses = await Expense.find({ wedding: wedding._id });
  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const remainingBudget = wedding.totalBudget - totalSpent;

  // Recent Check-In activity for selected filter
  const recentCheckIns = await CheckIn.find(checkInQuery)
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
        allEvents,
        selectedEventId: eventId || 'all',
        metrics: {
          totalGuests,
          confirmedRSVP,
          pendingRSVP,
          declinedRSVP,
          totalInvitations,
          totalCheckIns,
          totalBudget: wedding.totalBudget,
          totalSpent,
          remainingBudget
        },
        upcomingEvents: allEvents,
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
