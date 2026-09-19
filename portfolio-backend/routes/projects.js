require('dotenv').config();
const express = require('express');
const router = express.Router();
const Project = require('../models/projectModel');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

// Helper to parse tech field which can be JSON string or array
const parseTech = (tech) => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech;
  if (typeof tech === 'string') {
    try {
      const parsed = JSON.parse(tech);
      return Array.isArray(parsed) ? parsed : [tech];
    } catch {
      return tech.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// Helper to find project by id slug or MongoDB _id
const findProjectByIdOrSlug = async (param) => {
  let project = null;
  // Try finding by custom id slug
  project = await Project.findOne({ id: param });
  if (!project && param.match(/^[0-9a-fA-F]{24}$/)) {
    // If not found by slug and param is a valid ObjectId, try _id
    project = await Project.findById(param);
  }
  return project;
};

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by slug or _id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to parse features array
const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [features];
    } catch {
      return features.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// @route   POST /api/projects
// @desc    Add new project
// @access  Private
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, tech, description, detailedInfo, features, liveUrl, githubUrl, sortOrder } = req.body;
    let image = req.body.image || '/images/photo3.jpeg';
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/projects'
      });
      image = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const slug = req.body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const project = new Project({
      id: slug,
      title,
      tech: parseTech(tech),
      description,
      detailedInfo: detailedInfo || '',
      features: parseFeatures(features),
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      image,
      imagePublicId,
      sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, tech, description, detailedInfo, features, liveUrl, githubUrl, sortOrder } = req.body;
    const existing = await findProjectByIdOrSlug(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (detailedInfo !== undefined) updateData.detailedInfo = detailedInfo;
    if (features !== undefined) updateData.features = parseFeatures(features);
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (tech !== undefined) updateData.tech = parseTech(tech);
    if (sortOrder !== undefined && sortOrder !== '') updateData.sortOrder = Number(sortOrder);
    
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'portfolio/projects'
      });
      
      // Delete old asset from Cloudinary if existed
      if (existing.imagePublicId) {
        await deleteFromCloudinary(existing.imagePublicId);
      }

      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
    } else if (req.body.image && req.body.image !== existing.image) {
      if (existing.imagePublicId) {
        await deleteFromCloudinary(existing.imagePublicId);
        updateData.imagePublicId = null;
      }
      updateData.image = req.body.image;
    }

    if (req.body.id) {
      updateData.id = req.body.id;
    }

    const updated = await Project.findByIdAndUpdate(
      existing._id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete asset from Cloudinary if it exists
    if (project.imagePublicId) {
      await deleteFromCloudinary(project.imagePublicId);
    }

    await Project.findByIdAndDelete(project._id);
    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;