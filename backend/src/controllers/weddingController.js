const Wedding = require('../models/Wedding');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getWeddingDetails = asyncHandler(async (req, res) => {
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
  return res.status(200).json(new ApiResponse(200, wedding, 'Wedding details retrieved'));
});

const updateWeddingDetails = asyncHandler(async (req, res) => {
  const { coupleNames, title, weddingDate, totalBudget, currency } = req.body;
  let wedding = await Wedding.findOne();

  if (!wedding) {
    wedding = new Wedding();
  }

  if (coupleNames) wedding.coupleNames = coupleNames;
  if (title) wedding.title = title;
  if (weddingDate) wedding.weddingDate = weddingDate;
  if (totalBudget !== undefined) wedding.totalBudget = totalBudget;
  if (currency) wedding.currency = currency;

  await wedding.save();
  return res.status(200).json(new ApiResponse(200, wedding, 'Wedding details updated successfully'));
});

module.exports = {
  getWeddingDetails,
  updateWeddingDetails
};
