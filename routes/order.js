const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const requireRole = require('../middleware/requireRole');
const Order = require('../models/Order');

// Get all orders for a user
router.get('/user/:uid', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const orders = await Order.find({ userUid: req.params.uid }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all orders (admin)
router.get('/', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get order by sessionId
router.get('/session/:sessionId', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const order = await Order.findOne({ sessionId: req.params.sessionId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new order (webhook ছাড়া)
router.post('/', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    // sessionId দিয়ে ডুপ্লিকেট চেক
    if (req.body.sessionId) {
      const existingOrder = await Order.findOne({ sessionId: req.body.sessionId });
      if (existingOrder) {
        return res.status(200).json(existingOrder);
      }
    } else {
      // fallback: আগের ডুপ্লিকেট চেক
      const existingOrder = await Order.findOne({
        userUid: req.body.userUid,
        productId: req.body.productId,
        date: req.body.date
      });
      if (existingOrder) {
        return res.status(200).json(existingOrder);
      }
    }
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Order save failed', error: err.message });
  }
});

module.exports = router; 