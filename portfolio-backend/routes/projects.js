require('dotenv').config();
const express = require('express');
const router = express.Router();
const Project = require('../models/projectModel');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

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

// @route   POST /api/projects
// @desc    Add new project
// @access  Private
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, tech, description, sortOrder } = req.body;
    let image = req.body.image || '/images/photo3.jpeg';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
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
      image,
      sortOrder: sortOrder ? Number(sortOrder) : 0
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, tech, description, sortOrder } = req.body;
    const existing = await findProjectByIdOrSlug(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tech !== undefined) updateData.tech = parseTech(tech);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
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

    await Project.findByIdAndDelete(project._id);
    res.json({ message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;