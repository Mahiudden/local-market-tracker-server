const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  desc: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectReason: {
    type: String,
    required: false
  },
  adminFeedback: {
    type: String,
    required: false
  },
  validity: {
    type: String,
    required: false
  },
  vendorUid: {
    type: String,
    required: false
  },
  vendorEmail: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema); 