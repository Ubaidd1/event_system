const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['Groom Family', 'Bride Family', 'Groom Friend', 'Bride Friend', 'VIP', 'General'],
    default: 'General'
  },
  allowedPlusOnes: {
    type: Number,
    default: 1
  },
  plusOnesAssigned: {
    type: Number,
    default: 0
  },
  rsvpStatus: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Declined'],
    default: 'Pending'
  },
  rsvpDate: {
    type: Date,
    default: null
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Guest', guestSchema);
