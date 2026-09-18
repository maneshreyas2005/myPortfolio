const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  title: {
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
  tag: {
    type: String,
    default: 'Community'
  },
  date: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
