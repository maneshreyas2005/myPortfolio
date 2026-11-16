const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: ''
  },
  issuer: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    default: null
  },
  tag: {
    type: String,
    default: 'Certificate'
  },
  date: {
    type: String,
    default: ''
  },
  credentialUrl: {
    type: String,
    trim: true,
    default: ''
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
