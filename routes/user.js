const express = require('express');
const User = require('../models/routes/User');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const requireRole = require('../middleware/requireRole');
const { sanitizeInput, validateProfileUpdate, validatePasswordChange } = require('../middleware/validateInput');
const admin = require('firebase-admin');

// Sync user from Firebase
router.post('/sync', verifyFirebaseToken, async (req, res) => {
  try {
    console.log('SYNC REQ BODY:', req.body);
    const { uid, email, name, photo } = req.body;
    if (!uid || !email) return res.status(400).json({ message: 'uid and email required' });

    let user = await User.findOne({ uid });
    if (user) {
      // আগের ইউজার থাকলে role অপরিবর্তিত রাখুন
      user.email = email;
      user.name = name;
      user.photo = photo;
      await user.save();
    } else {
      // Check if this is the first user, make them admin
      const totalUsers = await User.countDocuments();
      const role = totalUsers === 0 ? 'admin' : 'user';
      user = await User.create({ uid, email, name, photo, role });
    }
    res.json(user);
  } catch (err) {
    console.error('SYNC ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by uid
router.get('/uid/:uid', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all users
router.get('/', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user (role change)
router.put('/:id', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Update user profile (for the user themselves) - temporarily without validation for debugging
router.put('/profile/update', verifyFirebaseToken, sanitizeInput, async (req, res) => {
  try {
    console.log('Profile update request body:', req.body);
    const { uid } = req.user; // From verifyFirebaseToken middleware
    const { displayName, phone, address } = req.body;
    
    if (!uid) return res.status(400).json({ message: 'User not authenticated' });
    
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update profile fields
    if (displayName !== undefined) user.displayName = displayName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        photo: user.photo
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
});

// User requests to become vendor
router.post('/request-vendor', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'uid required' });
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { vendorRequest: 'pending', vendorRequestDate: new Date() } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Vendor request sent', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: get all pending vendor requests
router.get('/vendor-requests', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const requests = await User.find({ vendorRequest: 'pending' });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: accept/reject vendor request
router.post('/vendor-requests/:id', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    if (!['accept', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (action === 'accept') {
      user.role = 'vendor';
      user.vendorRequest = 'accepted';
    } else {
      user.vendorRequest = 'rejected';
    }
    await user.save();
    res.json({ message: `Vendor request ${action}ed`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User requests to become admin
router.post('/request-admin', verifyFirebaseToken, requireRole('user'), async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'uid required' });
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { adminRequest: 'pending', adminRequestDate: new Date() } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Admin request sent', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: get all pending admin requests
router.get('/admin-requests', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const requests = await User.find({ adminRequest: 'pending' });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: accept/reject admin request
router.post('/admin-requests/:id', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    if (!['accept', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (action === 'accept') {
      user.role = 'admin';
      user.adminRequest = 'accepted';
    } else {
      user.adminRequest = 'rejected';
    }
    await user.save();
    res.json({ message: `Admin request ${action}ed`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change user password - temporarily without validation for debugging
router.post('/change-password', verifyFirebaseToken, sanitizeInput, async (req, res) => {
  try {
    console.log('Password change request body:', req.body);
    const { uid } = req.user;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

// Promote user to admin (SECURE - requires admin authentication)
router.post('/promote-to-admin/:uid', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ message: 'Promotion failed', error: err.message });
  }
});

module.exports = router; 