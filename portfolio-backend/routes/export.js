require('dotenv').config();
const express = require('express');
const router = express.Router();
const Profile = require('../models/profileModel');
const Skill = require('../models/skillModel');
const Experience = require('../models/experienceModel');
const Project = require('../models/projectModel');
const Education = require('../models/educationModel');
const Community = require('../models/communityModel');
const Certificate = require('../models/certificateModel');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/export
// @desc    Export all portfolio data as JSON
// @access  Private
router.get('/export', authenticate, async (req, res) => {
  try {
    const [profile, skills, experience, projects, education, community, certificates] = await Promise.all([
      Profile.find(),
      Skill.find(),
      Experience.find(),
      Project.find(),
      Education.find(),
      Community.find(),
      Certificate.find()
    ]);

    const exportData = {
      profile,
      skills,
      experience,
      projects,
      education,
      community,
      certificates,
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio-backup-${Date.now()}.json`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/import
// @desc    Import portfolio data from JSON
// @access  Private
router.post('/import', authenticate, async (req, res) => {
  try {
    const { profile, skills, experience, projects, education, community, certificates } = req.body;
    
    if (!profile || !skills || !experience || !projects || !education) {
      return res.status(400).json({ error: 'Invalid import data - missing required collections' });
    }

    // Create backup before importing
    const backup = await Promise.all([
      Profile.find(),
      Skill.find(),
      Experience.find(),
      Project.find(),
      Education.find(),
      Community.find(),
      Certificate.find()
    ]);
    
    const backupData = {
      profile: backup[0],
      skills: backup[1],
      experience: backup[2],
      projects: backup[3],
      education: backup[4],
      community: backup[5],
      certificates: backup[6],
      backedUpAt: new Date().toISOString()
    };

    // Clear collections
    await Promise.all([
      Profile.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Project.deleteMany({}),
      Education.deleteMany({}),
      Community.deleteMany({}),
      Certificate.deleteMany({})
    ]);

    // Import new data
    const importPromises = [
      Profile.insertMany(profile),
      Skill.insertMany(skills),
      Experience.insertMany(experience),
      Project.insertMany(projects),
      Education.insertMany(education)
    ];

    if (community && Array.isArray(community) && community.length > 0) {
      importPromises.push(Community.insertMany(community));
    }
    if (certificates && Array.isArray(certificates) && certificates.length > 0) {
      importPromises.push(Certificate.insertMany(certificates));
    }

    await Promise.all(importPromises);

    res.json({ 
      message: 'Data imported successfully',
      backup: backupData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;