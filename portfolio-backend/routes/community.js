require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Community = require('../models/communityModel');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

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
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/community'
      });
      image = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    if (!image) {
      return res.status(400).json({ error: 'An image file or image URL is required' });
    }

    const item = new Community({
      title: title || '',
      description: description || '',
      image,
      imagePublicId,
      tag: tag || 'Community',
      date: date || '',
      sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding community item:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/community/:id
// @desc    Update a community item
// @access  Private
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Community item not found' });
    }

    const item = await Community.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Community item not found' });
    }

    const { title, description, tag, date, sortOrder } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (tag !== undefined) item.tag = tag;
    if (date !== undefined) item.date = date;
    if (sortOrder !== undefined && sortOrder !== '') item.sortOrder = Number(sortOrder);

    if (req.file) {
      // Upload new image to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/community'
      });

      // Delete old asset from Cloudinary if it existed
      if (item.imagePublicId) {
        await deleteFromCloudinary(item.imagePublicId);
      }

      item.image = uploadResult.secure_url;
      item.imagePublicId = uploadResult.public_id;
    } else if (req.body.image && req.body.image !== item.image) {
      // If manually updated to an external URL, remove old Cloudinary asset
      if (item.imagePublicId) {
        await deleteFromCloudinary(item.imagePublicId);
        item.imagePublicId = null;
      }
      item.image = req.body.image;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Error updating community item:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/community/:id
// @desc    Delete a community item
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Community item not found' });
    }

    const item = await Community.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Community item not found' });
    }

    // Delete asset from Cloudinary if it exists
    if (item.imagePublicId) {
      await deleteFromCloudinary(item.imagePublicId);
    }

    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: 'Community item removed successfully' });
  } catch (err) {
    console.error('Error deleting community item:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
