const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  name: {
    type: String,
    required: true, // e.g., Mehndi, Baraat, Walima, Nikkah
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: '18:00'
  },
  endTime: {
    type: String,
    default: '23:00'
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  dressCode: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
