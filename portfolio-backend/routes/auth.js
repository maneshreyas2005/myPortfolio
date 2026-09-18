require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Admin login - get JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    // Find admin by email
    let admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      // If admin doesn't exist and credentials match default, bootstrap admin
      if (email.toLowerCase() === 'admin@portfolio.com' && password === 'admin123') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        admin = new Admin({
          email: 'admin@portfolio.com',
          password: hashedPassword,
          role: 'admin'
        });
        await admin.save();
      } else {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    } else {
      // Verify password
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Verify current token
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;