const express = require('express');
const Advertisement = require('../models/Advertisement');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// Get all advertisements
router.get('/', async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get advertisement by id
router.get('/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create advertisement
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const ad = new Advertisement(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

// Update advertisement
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    res.json(ad);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

// Delete advertisement
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    res.json({ message: 'Advertisement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all approved advertisements
router.get('/approved', async (req, res) => {
  try {
    const ads = await Advertisement.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 