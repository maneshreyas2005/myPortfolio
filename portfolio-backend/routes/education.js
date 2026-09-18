require('dotenv').config();
const express = require('express');
const router = express.Router();
const Education = require('../models/educationModel');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/education
// @desc    Get all education entries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const education = await Education.find().sort({ sortOrder: 1 });
    res.json(education);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/education
// @desc    Add new education entry
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { degree, institution, period, grade } = req.body;
    
    if (!degree || !institution || !period) {
      return res.status(400).json({ error: 'Degree, institution, and period are required' });
    }
    
    const education = new Education({
      degree,
      institution,
      period,
      grade: grade || '',
      sortOrder: req.body.sortOrder ?? 0
    });
    
    await education.save();
    res.status(201).json(education);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/education/:id
// @desc    Update education entry
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!education) {
      return res.status(404).json({ error: 'Education not found' });
    }
    
    res.json(education);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/education/:id
// @desc    Delete education entry
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    
    if (!education) {
      return res.status(404).json({ error: 'Education not found' });
    }
    
    res.json({ message: 'Education entry removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;