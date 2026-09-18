require('dotenv').config();
const express = require('express');
const router = express.Router();
const Community = require('../models/communityModel');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/community
// @desc    Get all community impact / gallery items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await Community.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/community
// @desc    Add a new community photo/event
// @access  Private
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, tag, date, sortOrder } = req.body;
    let image = req.body.image;
    
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!image) {
      return res.status(400).json({ error: 'An image file or image URL is required' });
    }

    const item = new Community({
      title: title || '',
      description: description || '',
      image,
      tag: tag || 'Community',
      date: date || '',
      sortOrder: sortOrder ? Number(sortOrder) : 0
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/community/:id
// @desc    Update a community item
// @access  Private
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, tag, date, sortOrder } = req.body;
    const item = await Community.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Community item not found' });
    }

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (tag !== undefined) item.tag = tag;
    if (date !== undefined) item.date = date;
    if (sortOrder !== undefined) item.sortOrder = Number(sortOrder);
    
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      item.image = req.body.image;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/community/:id
// @desc    Delete a community item
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Community.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Community item not found' });
    }
    res.json({ message: 'Community item removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
