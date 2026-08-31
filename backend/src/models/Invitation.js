const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
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
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  secureToken: {
    type: String,
    required: true,
    unique: true
  },
  templateStyle: {
    type: String,
    enum: ['Royal Gold', 'Modern Ivory', 'Velvet Rose', 'Classic Midnight'],
    default: 'Royal Gold'
  },
  title: {
    type: String,
    default: 'Wedding Celebration Invitation'
  },
  customMessage: {
    type: String,
    default: 'We request the pleasure of your company to celebrate our wedding.'
  },
  posterUrl: {
    type: String,
    default: ''
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invitation', invitationSchema);
