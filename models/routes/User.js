const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  name: String,
  displayName: String, // New field for display name
  phone: String, // New field for phone number
  address: String, // New field for address
  photo: String,
  role: { type: String, default: 'user' }, // user, vendor, admin
  vendorRequest: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' }, // vendor request status
  vendorRequestDate: { type: Date },
  adminRequest: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' }, // admin request status
  adminRequestDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 