require('dotenv').config();
const express = require('express');
const router = express.Router();
const Skill = require('../models/skillModel');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/skills
// @desc    Get all skills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/skills
// @desc    Add new skill category
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { category, items, accent } = req.body;
    
    if (!category || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Category and items are required' });
    }
    
    const skill = new Skill({
      category,
      items,
      accent: accent || 'text-accent-orange'
    });
    
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/skills/:id
// @desc    Update skill category
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete skill category
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ message: 'Skill removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;