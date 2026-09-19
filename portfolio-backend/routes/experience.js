require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Experience = require('../models/experienceModel');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

// Helper to parse points array whether JSON string, array, or newline-separated
const parsePoints = (points) => {
  if (!points) return [];
  if (Array.isArray(points)) return points;
  if (typeof points === 'string') {
    try {
      const parsed = JSON.parse(points);
      return Array.isArray(parsed) ? parsed : [points];
    } catch {
      return points.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// @route   GET /api/experience
// @desc    Get all experience entries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const experience = await Experience.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(experience);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/experience
// @desc    Add new experience entry (optional image upload)
// @access  Private
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { role, company, period, location, type, points, sortOrder } = req.body;
    
    if (!role || !company || !period) {
      return res.status(400).json({ error: 'Role, company, and period are required' });
    }

    let image = req.body.image || null;
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/experience'
      });
      image = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    const experience = new Experience({
      role,
      company,
      period,
      location: location || '',
      type: type || 'On-site',
      points: parsePoints(points),
      image,
      imagePublicId,
      sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0
    });
    
    await experience.save();
    res.status(201).json(experience);
  } catch (err) {
    console.error('Error creating experience:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/experience/:id
// @desc    Update experience entry (optional image update/removal)
// @access  Private
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const existing = await Experience.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const { role, company, period, location, type, points, sortOrder } = req.body;

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (company !== undefined) updateData.company = company;
    if (period !== undefined) updateData.period = period;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (points !== undefined) updateData.points = parsePoints(points);
    if (sortOrder !== undefined && sortOrder !== '') updateData.sortOrder = Number(sortOrder);

    // If new image file is uploaded
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/experience'
      });

      // Delete old Cloudinary asset if existed
      if (existing.imagePublicId) {
        await deleteFromCloudinary(existing.imagePublicId);
      }

      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
    } else if (req.body.image !== undefined && req.body.image !== existing.image) {
      // If image is explicitly removed or changed to URL
      if (existing.imagePublicId) {
        await deleteFromCloudinary(existing.imagePublicId);
        updateData.imagePublicId = null;
      }
      updateData.image = req.body.image || null;
    }

    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating experience:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/experience/:id
// @desc    Delete experience entry
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Delete asset from Cloudinary if it exists
    if (experience.imagePublicId) {
      await deleteFromCloudinary(experience.imagePublicId);
    }

    await Experience.findByIdAndDelete(req.params.id);
    res.json({ message: 'Experience removed' });
  } catch (err) {
    console.error('Error deleting experience:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;