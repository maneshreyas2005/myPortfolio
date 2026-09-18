require('dotenv').config();
const express = require('express');
const router = express.Router();
const Profile = require('../models/profileModel');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/profile
// @desc    Get profile data
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/profile
// @desc    Update profile data
// @access  Private
router.put('/', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      {}, 
      { $set: req.body }, 
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;