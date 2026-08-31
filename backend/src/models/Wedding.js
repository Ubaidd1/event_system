const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema({
  coupleNames: {
    type: String,
    required: true,
    default: 'Abdullah & Sarah'
  },
  title: {
    type: String,
    default: 'Wedding Celebration'
  },
  weddingDate: {
    type: Date,
    default: new Date('2027-03-19T18:00:00.000Z')
  },
  coverImage: {
    type: String,
    default: ''
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  totalBudget: {
    type: Number,
    default: 50000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wedding', weddingSchema);
