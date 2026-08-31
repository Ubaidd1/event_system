const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'System'
  },
  userRole: {
    type: String,
    default: 'Staff'
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    default: 'General' // Guest, Invitation, Event, Expense, Vendor, CheckIn
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
