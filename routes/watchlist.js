const express = require('express');
const Watchlist = require('../models/Watchlist');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const requireRole = require('../middleware/requireRole');
const Product = require('../models/Product');

// Get all watchlist entries
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const items = await Watchlist.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get watchlist entry by id
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const item = await Watchlist.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Watchlist entry not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create watchlist entry
router.post('/', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const item = new Watchlist(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

// Delete watchlist entry
router.delete('/:id', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const item = await Watchlist.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Watchlist entry not found' });
    res.json({ message: 'Watchlist entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all watchlist entries for a user
router.get('/user/:uid', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const items = await Watchlist.find({ userUid: req.params.uid }).sort({ createdAt: -1 });
    // প্রতিটি আইটেমের সাথে প্রোডাক্টের imageUrl যোগ করব
    const itemsWithImage = await Promise.all(items.map(async (item) => {
      let imageUrl = '';
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product && product.imageUrl) imageUrl = product.imageUrl;
      }
      return { ...item.toObject(), imageUrl };
    }));
    res.json(itemsWithImage);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 