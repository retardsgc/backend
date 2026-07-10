const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  login,
  getMe,
  createAdmin,
  listAdmins,
  deactivateAdmin,
  logout
} = require('../controllers/adminAuthController');
const { protectAdmin, requireSuperAdmin } = require('../middleware/adminAuth');

// Public routes
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    const adminsCollection = mongoose.connection?.db?.collection('admins');
    if (!adminsCollection) {
      return res.status(500).json({
        success: false,
        message: 'Admin database is not ready'
      });
    }

    const admin = await adminsCollection.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    const passwordOk = await bcrypt.compare(password, admin.password || '');
    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await adminsCollection.updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    // FIX-BE-AUTH: H-1 Added expiresIn: '24h'
    // FIX-BE-AUTH: H-2 Use ADMIN_JWT_SECRET with JWT_SECRET fallback
    // FIX-BE-AUTH: L-4 Include tokenVersion for logout invalidation
    const token = jwt.sign({ id: String(admin._id), tokenVersion: admin.tokenVersion || 0 }, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        priority: admin.priority,
        lastLogin: admin.lastLogin || null
      }
    });
  } catch (error) {
    console.error('Admin login route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Protected routes (all admins)
router.get('/me', protectAdmin, getMe);
router.post('/logout', protectAdmin, logout);

// Super admin only routes
router.post('/create', protectAdmin, requireSuperAdmin, createAdmin);
router.get('/list', protectAdmin, requireSuperAdmin, listAdmins);
router.put('/:id/deactivate', protectAdmin, requireSuperAdmin, deactivateAdmin);

module.exports = router;
