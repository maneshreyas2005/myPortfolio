const mongoose = require('mongoose');
const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, required: true },
  location: { type: String },
  type: { type: String },
  points: [{ type: String, required: true }],
  image: { type: String, default: null },
  imagePublicId: { type: String, default: null },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);