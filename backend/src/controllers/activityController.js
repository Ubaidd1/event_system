const ActivityLog = require('../models/ActivityLog');
const Wedding = require('../models/Wedding');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const wedding = await Wedding.findOne();

  const total = await ActivityLog.countDocuments({ wedding: wedding._id });
  const logs = await ActivityLog.find({ wedding: wedding._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      },
      'Activity logs retrieved successfully'
    )
  );
});

module.exports = {
  getActivityLogs
};
