require('dotenv').config();
const express = require('express');
const router = express.Router();
const Experience = require('../models/experienceModel');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/experience
// @desc    Get all experience entries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const experience = await Experience.find().sort({ sortOrder: 1 });
    res.json(experience);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/experience
// @desc    Add new experience entry
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { role, company, period, location, type, points } = req.body;
    
    if (!role || !company || !period) {
      return res.status(400).json({ error: 'Role, company, and period are required' });
    }
    
    const experience = new Experience({
      role,
      company,
      period,
      location,
      type,
      points: points || [],
      sortOrder: req.body.sortOrder ?? 0
    });
    
    await experience.save();
    res.status(201).json(experience);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/experience/:id
// @desc    Update experience entry
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json(experience);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/experience/:id
// @desc    Delete experience entry
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json({ message: 'Experience removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;