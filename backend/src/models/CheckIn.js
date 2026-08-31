const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  invitation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    default: null
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null
  },
  attendeesCount: {
    type: Number,
    required: true,
    default: 1
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Verified', 'Flagged'],
    default: 'Verified'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound unique index to strictly prevent duplicate check-ins for the same invitation at the same event!
checkInSchema.index({ invitation: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
