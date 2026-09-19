const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  id: { type: String }, // Slug or unique string ID (e.g. 'ai-interviewer')
  title: { type: String, required: true },
  tech: [{ type: String, required: true }],
  description: { type: String, required: true },
  detailedInfo: { type: String, default: '' },
  features: [{ type: String }],
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  image: { type: String, default: '/images/photo3.jpeg' },
  imagePublicId: { type: String, default: null },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);