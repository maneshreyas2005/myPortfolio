require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Certificate = require('../models/certificateModel');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

// @route   GET /api/certificates
// @desc    Get all certificates and achievements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await Certificate.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates
// @desc    Add a new certificate/achievement
// @access  Private
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, issuer, description, tag, date, credentialUrl, sortOrder } = req.body;
    let image = req.body.image;
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/certificates'
      });
      image = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    if (!image) {
      return res.status(400).json({ error: 'An image file or image URL is required' });
    }

    const item = new Certificate({
      title: title || '',
      issuer: issuer || '',
      description: description || '',
      image,
      imagePublicId,
      tag: tag || 'Certificate',
      date: date || '',
      credentialUrl: credentialUrl || '',
      sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding certificate item:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/certificates/:id
// @desc    Update a certificate/achievement
// @access  Private
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Certificate item not found' });
    }

    const item = await Certificate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Certificate item not found' });
    }

    const { title, issuer, description, tag, date, credentialUrl, sortOrder } = req.body;

    if (title !== undefined) item.title = title;
    if (issuer !== undefined) item.issuer = issuer;
    if (description !== undefined) item.description = description;
    if (tag !== undefined) item.tag = tag;
    if (date !== undefined) item.date = date;
    if (credentialUrl !== undefined) item.credentialUrl = credentialUrl;
    if (sortOrder !== undefined && sortOrder !== '') item.sortOrder = Number(sortOrder);

    if (req.file) {
      // Upload new image to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/certificates'
      });

      // Delete old asset from Cloudinary if it existed
      if (item.imagePublicId) {
        await deleteFromCloudinary(item.imagePublicId);
      }

      item.image = uploadResult.secure_url;
      item.imagePublicId = uploadResult.public_id;
    } else if (req.body.image && req.body.image !== item.image) {
      if (item.imagePublicId) {
        await deleteFromCloudinary(item.imagePublicId);
        item.imagePublicId = null;
      }
      item.image = req.body.image;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Error updating certificate item:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete a certificate/achievement
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Certificate item not found' });
    }

    const item = await Certificate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Certificate item not found' });
    }

    if (item.imagePublicId) {
      await deleteFromCloudinary(item.imagePublicId);
    }

    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certificate item removed successfully' });
  } catch (err) {
    console.error('Error deleting certificate item:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
