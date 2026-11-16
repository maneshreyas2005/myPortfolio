const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  // Session identification (privacy-first: hash of IP + UA, rotated daily)
  sessionId: { type: String, required: true, index: true },
  visitorHash: { type: String, required: true, index: true }, // daily salted hash

  // Event classification
  eventType: {
    type: String,
    enum: ['pageview', 'section_view', 'section_leave', 'click', 'scroll'],
    required: true,
    index: true
  },

  // Page/section context
  page: { type: String, required: true, index: true }, // '/' (home)
  section: { type: String, index: true }, // 'hero', 'skills', 'projects', etc.

  // Engagement metrics
  dwellTimeMs: { type: Number, default: 0 }, // time spent in section
  scrollDepth: { type: Number, default: 0 }, // 0-100 percentage

  // Click tracking (optional)
  elementId: { type: String }, // e.g., 'project-card-ai-interviewer', 'contact-email'
  elementType: { type: String }, // 'project_card', 'contact_link', 'github', 'linkedin'

  // Visitor context (no PII)
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
  country: { type: String, maxlength: 2 }, // ISO 3166-1 alpha-2
  referrer: { type: String }, // 'direct', 'google', 'github.com', 'linkedin.com', etc.
  userAgent: { type: String }, // for parsing only, not stored long-term

  // Timestamps
  timestamp: { type: Date, default: Date.now, index: true },
  receivedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  // TTL index: auto-delete raw events after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60
});

// Compound indexes for common queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ page: 1, section: 1, timestamp: -1 });
analyticsEventSchema.index({ visitorHash: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
