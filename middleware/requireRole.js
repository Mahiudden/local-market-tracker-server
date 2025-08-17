const User = require('../models/routes/User');

// role: 'admin', 'vendor', 'user' অথবা ['admin', 'vendor'] ইত্যাদি
const requireRole = (roles) => async (req, res, next) => {
  try {
    const uid = req.user && req.user.uid;
    if (!uid) return res.status(401).json({ message: 'No user UID found' });
    const user = await User.findOne({ uid });
    if (!user) return res.status(403).json({ message: 'User not found' });
    // একাধিক রোল সাপোর্ট
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    req.userDb = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Role check failed', error: err.message });
  }
};

module.exports = requireRole; 