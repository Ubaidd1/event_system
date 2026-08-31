const Guest = require('../models/Guest');
const Event = require('../models/Event');
const CheckIn = require('../models/CheckIn');
const Expense = require('../models/Expense');
const Vendor = require('../models/Vendor');
const Wedding = require('../models/Wedding');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getReports = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findOne();

  // Guest Analytics
  const totalGuests = await Guest.countDocuments({ wedding: wedding._id });
  const confirmed = await Guest.countDocuments({ wedding: wedding._id, rsvpStatus: 'Confirmed' });
  const pending = await Guest.countDocuments({ wedding: wedding._id, rsvpStatus: 'Pending' });
  const declined = await Guest.countDocuments({ wedding: wedding._id, rsvpStatus: 'Declined' });

  const categoryCounts = await Guest.aggregate([
    { $match: { wedding: wedding._id } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Event & Attendance Analytics
  const events = await Event.find({ wedding: wedding._id });
  const eventStats = await Promise.all(
    events.map(async (ev) => {
      const invitedCount = await Guest.countDocuments({ wedding: wedding._id, events: ev._id });
      const checkInsCount = await CheckIn.countDocuments({ wedding: wedding._id, event: ev._id });
      return {
        eventName: ev.name,
        venue: ev.venue,
        date: ev.date,
        invitedCount: invitedCount || totalGuests, // default all if none assigned
        checkInsCount,
        attendanceRate: invitedCount ? Math.round((checkInsCount / invitedCount) * 100) : 0
      };
    })
  );

  // Financial Analytics
  const expenses = await Expense.find({ wedding: wedding._id });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const vendors = await Vendor.find({ wedding: wedding._id });
  const totalVendorContract = vendors.reduce((sum, v) => sum + v.contractAmount, 0);
  const totalVendorPaid = vendors.reduce((sum, v) => sum + v.amountPaid, 0);

  const categoryExpenses = await Expense.aggregate([
    { $match: { wedding: wedding._id } },
    { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        guestAnalytics: {
          totalGuests,
          confirmed,
          pending,
          declined,
          attendanceRate: totalGuests ? Math.round((confirmed / totalGuests) * 100) : 0,
          categoryBreakdown: categoryCounts.map(c => ({ category: c._id, count: c.count }))
        },
        eventAnalytics: eventStats,
        financialAnalytics: {
          totalBudget: wedding.totalBudget,
          totalSpent,
          remainingBudget: wedding.totalBudget - totalSpent,
          totalVendorContract,
          totalVendorPaid,
          vendorPending: totalVendorContract - totalVendorPaid,
          categorySpending: categoryExpenses.map(c => ({ category: c._id, amount: c.totalAmount }))
        }
      },
      'Reports compiled successfully'
    )
  );
});

module.exports = {
  getReports
};
