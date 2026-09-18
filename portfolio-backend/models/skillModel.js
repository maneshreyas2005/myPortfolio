const mongoose = require('mongoose');
const skillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [{ type: String, required: true }],
  accent: { type: String, default: 'text-accent-orange' }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);