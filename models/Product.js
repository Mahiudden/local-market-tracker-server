const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  userName: String,
  userUid: String,
  email: String, // মন্তব্যকারীর ইমেইল
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: undefined } // আপডেট হলে ডেট
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  marketName: { type: String, required: true },
  vendorUid: { type: String, required: true },
  vendorName: String,
  date: { type: String, required: true },
  marketDesc: String,
  imageUrl: String, // Only URL, no file upload
  pricePerUnit: { type: Number, required: true },
  prices: [priceSchema],
  reviews: [reviewSchema],
  itemDesc: String,
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  feedback: String, // রিজেক্ট করার ফিডব্যাক
  reason: String, // রিজেক্টের কারণ
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema); 