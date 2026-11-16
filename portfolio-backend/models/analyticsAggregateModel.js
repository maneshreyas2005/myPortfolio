const mongoose = require('mongoose');

const analyticsAggregateSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true }, // midnight UTC
  page: { type: String, required: true },
  section: { type: String },

  // Counts
  pageviews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  uniqueSessions: { type: Number, default: 0 },

  // Engagement
  totalDwellTimeMs: { type: Number, default: 0 },
  avgDwellTimeMs: { type: Number, default: 0 },
  maxScrollDepth: { type: Number, default: 0 },
  avgScrollDepth: { type: Number, default: 0 },

  // Dimensions
  deviceBreakdown: {
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 }
  },
  countryBreakdown: { type: Map, of: Number }, // { 'US': 45, 'IN': 32, ... }
  referrerBreakdown: { type: Map, of: Number }, // { 'direct': 50, 'google': 30, ... }

  // Entry/Exit
  entries: { type: Number, default: 0 },
  exits: { type: Number, default: 0 }
}, { timestamps: true });

analyticsAggregateSchema.index({ date: -1, page: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('AnalyticsAggregate', analyticsAggregateSchema);
