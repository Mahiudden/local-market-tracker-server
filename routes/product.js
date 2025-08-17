const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const requireRole = require('../middleware/requireRole');

const priceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  price: { type: Number, required: true }
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
  itemDesc: String,
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  createdAt: { type: Date, default: Date.now }
});

// Get price history for a product
router.get('/:id/prices', verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.prices || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all products for a vendor
router.get('/vendor/:uid', verifyFirebaseToken, async (req, res) => {
  try {
    const products = await Product.find({ vendorUid: req.params.uid }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all approved products
router.get('/approved', async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new product
router.post('/', verifyFirebaseToken, requireRole('vendor'), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

// Update a product by ID
router.put('/:id', verifyFirebaseToken, requireRole(['admin', 'vendor']), async (req, res) => {
  try {
    // স্ট্যাটাস পরিবর্তন শুধু admin পারবে
    if (req.body.status) {
      if (!req.userDb || req.userDb.role !== 'admin') {
        delete req.body.status;
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Delete a product by ID
router.delete('/:id', verifyFirebaseToken, requireRole('vendor'), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// Get all reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Add a review to a product
router.post('/:id/reviews', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const { userName, userUid, email, rating, comment } = req.body;
    if (!rating || !userName || !userUid || !email) return res.status(400).json({ message: 'Missing fields' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const review = { userName, userUid, email, rating, comment, createdAt: new Date() };
    product.reviews.push(review);
    await product.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add review', error: err.message });
  }
});

// Update a review (only by the owner)
router.put('/:id/reviews/:reviewIdx', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const { userUid, comment, rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const idx = parseInt(req.params.reviewIdx);
    if (isNaN(idx) || !product.reviews[idx]) return res.status(404).json({ message: 'Review not found' });
    if (product.reviews[idx].userUid !== userUid) return res.status(403).json({ message: 'Permission denied' });
    if (comment !== undefined) product.reviews[idx].comment = comment;
    if (rating !== undefined) product.reviews[idx].rating = rating;
    product.reviews[idx].updatedAt = new Date();
    await product.save();
    res.json(product.reviews[idx]);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update review', error: err.message });
  }
});

// Delete a review (only by the owner)
router.delete('/:id/reviews/:reviewIdx', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const { userUid } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const idx = parseInt(req.params.reviewIdx);
    if (isNaN(idx) || !product.reviews[idx]) return res.status(404).json({ message: 'Review not found' });
    if (product.reviews[idx].userUid !== userUid) return res.status(403).json({ message: 'Permission denied' });
    product.reviews.splice(idx, 1);
    await product.save();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete review', error: err.message });
  }
});

module.exports = router; 