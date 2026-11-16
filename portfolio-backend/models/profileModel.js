const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Shreyas Mane' },
  title: { type: String, default: 'Full Stack Developer' },
  summary: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  github: { type: String },
  linkedin: { type: String },
  location: { type: String },
  profileImage: { type: String, default: '/images/photo3.jpeg' },
  theme: {
    accentColors: { type: Map, of: String },
    fonts: { type: Map, of: String }
  },
  visibleSections: {
    type: [String],
    default: ['skills', 'projects', 'experience', 'certificates', 'community', 'education'],
    validate: {
      validator: function (v) {
        const valid = ['skills', 'projects', 'experience', 'certificates', 'community', 'education'];
        return v.every((s) => valid.includes(s));
      },
      message: 'Invalid section ID in visibleSections'
    }
  },
  competencyMapConfig: {
    layout: { type: String, enum: ['hierarchical', 'force'], default: 'hierarchical' },
    showEdgeLabels: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);