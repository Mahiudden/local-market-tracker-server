const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userUid: { type: String, required: false },
  productId: { type: String, required: true },
  productName: String,
  marketName: String,
  price: Number,
  date: String,
  status: { type: String, default: 'completed' },
  paymentStatus: String,
  stripeSessionId: String,
  sessionId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema); 