const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Wedding = require('../models/Wedding');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password].some((field) => !field || field.trim() === '')) {
    throw new ApiError(400, 'All fields (name, email, password) are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // First user registered becomes Admin by default
  const userCount = await User.countDocuments();
  const assignedRole = userCount === 0 ? 'Admin' : (role || 'Staff');

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: assignedRole
  });

  const createdUser = await User.findById(user._id).select('-password');
  if (!createdUser) {
    throw new ApiError(500, 'Failed to register user');
  }

  const token = createdUser.generateAccessToken();

  // Log activity if wedding exists
  const wedding = await Wedding.findOne();
  if (wedding) {
    await ActivityLog.create({
      wedding: wedding._id,
      user: createdUser._id,
      userName: createdUser.name,
      userRole: createdUser.role,
      action: 'Registered User',
      entityType: 'User',
      details: `${createdUser.name} registered as ${createdUser.role}`
    });
  }

  return res.status(201).json(
    new ApiResponse(201, { user: createdUser, token }, 'User registered successfully')
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = user.generateAccessToken();
  const loggedInUser = await User.findById(user._id).select('-password');

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  const wedding = await Wedding.findOne();
  if (wedding) {
    await ActivityLog.create({
      wedding: wedding._id,
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'User Login',
      entityType: 'User',
      details: `${user.name} logged in`
    });
  }

  return res
    .status(200)
    .cookie('accessToken', token, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, token },
        'User logged in successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user retrieved successfully'));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Both old and new passwords are required');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Invalid old password');
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password updated successfully'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['Admin', 'Manager', 'Staff'].includes(role)) {
    throw new ApiError(400, 'Invalid role specified');
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, user, 'User role updated successfully'));
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updatePassword,
  getAllUsers,
  updateUserRole
};
