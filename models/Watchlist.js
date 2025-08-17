const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userUid: { type: String, required: true },
  userName: String,
  productId: { type: String, required: true },
  productName: String,
  marketName: String,
  vendorUid: String,
  vendorName: String,
  date: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', watchlistSchema); 