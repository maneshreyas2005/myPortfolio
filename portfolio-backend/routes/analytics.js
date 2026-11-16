require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const AnalyticsEvent = require('../models/analyticsEventModel');
const AnalyticsAggregate = require('../models/analyticsAggregateModel');
const { authenticate } = require('../middleware/auth');

// Helper: get start date for range
const getStartDate = (range) => {
  const now = new Date();
  switch (range) {
    case '24h': return new Date(now - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now - 90 * 24 * 60 * 60 * 1000);
    default: return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }
};

// Helper: exclude admin traffic
const isAdminPage = (page) => page && (page.startsWith('/admin') || page === '/admin');

// Helper: classify referrer
const classifyReferrer = (referrer) => {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace('www.', '');
    if (host.includes('google') || host.includes('bing') || host.includes('duckduckgo')) return 'search';
    if (host.includes('github') || host.includes('gitlab') || host.includes('bitbucket')) return 'github';
    if (host.includes('linkedin')) return 'linkedin';
    if (host.includes('twitter') || host.includes('x.com')) return 'twitter';
    return 'referral';
  } catch {
    return 'direct';
  }
};

// ============================================================
// PUBLIC TRACKING ENDPOINTS (no auth required)
// ============================================================

// @route   POST /api/analytics/track
// @desc    Ingest a single analytics event
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const {
      sessionId,
      visitorHash,
      eventType,
      page,
      section,
      dwellTimeMs,
      scrollDepth,
      elementId,
      elementType,
      deviceType,
      country,
      referrer,
      userAgent,
      timestamp
    } = req.body;

    if (!sessionId || !visitorHash || !eventType || !page) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, visitorHash, eventType, page' });
    }

    // Exclude admin traffic from analytics
    if (isAdminPage(page)) {
      return res.status(204).send();
    }

    const event = new AnalyticsEvent({
      sessionId,
      visitorHash,
      eventType,
      page,
      section: section || null,
      dwellTimeMs: dwellTimeMs || 0,
      scrollDepth: scrollDepth || 0,
      elementId: elementId || null,
      elementType: elementType || null,
      deviceType: deviceType || null,
      country: country || null,
      referrer: referrer || classifyReferrer(req.headers.referer || null),
      userAgent: userAgent || req.headers['user-agent'] || null,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await event.save();
    res.status(201).json({ success: true, id: event._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/analytics/track/batch
// @desc    Batch ingest multiple analytics events
// @access  Public
router.post('/track/batch', async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events array is required' });
    }

    const validEvents = [];
    for (const evt of events) {
      if (!evt.sessionId || !evt.visitorHash || !evt.eventType || !evt.page) {
        continue; // skip invalid events
      }
      if (isAdminPage(evt.page)) {
        continue; // skip admin traffic
      }

      validEvents.push({
        sessionId: evt.sessionId,
        visitorHash: evt.visitorHash,
        eventType: evt.eventType,
        page: evt.page,
        section: evt.section || null,
        dwellTimeMs: evt.dwellTimeMs || 0,
        scrollDepth: evt.scrollDepth || 0,
        elementId: evt.elementId || null,
        elementType: evt.elementType || null,
        deviceType: evt.deviceType || null,
        country: evt.country || null,
        referrer: evt.referrer || classifyReferrer(null),
        userAgent: evt.userAgent || null,
        timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date()
      });
    }

    if (validEvents.length > 0) {
      await AnalyticsEvent.insertMany(validEvents, { ordered: false });
    }

    res.status(201).json({ success: true, ingested: validEvents.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PRIVATE ANALYTICS ENDPOINTS (auth required)
// ============================================================

// @route   GET /api/analytics/summary
// @desc    Dashboard summary metrics
// @access  Private
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getStartDate(range);

    const [uniqueVisitors, pageviews, dwellResult, bounceRate, realtimeVisitors, topSections] = await Promise.all([
      // Unique visitors
      AnalyticsEvent.distinct('visitorHash', {
        timestamp: { $gte: startDate },
        eventType: { $ne: 'click' }
      }).then((hashes) => hashes.length),

      // Pageviews
      AnalyticsEvent.countDocuments({
        eventType: 'pageview',
        timestamp: { $gte: startDate }
      }),

      // Avg dwell time from section_leave events
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'section_leave',
            timestamp: { $gte: startDate },
            dwellTimeMs: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            avgDwell: { $avg: '$dwellTimeMs' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Bounce rate: sessions with only 1 pageview
      AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            eventType: 'pageview'
          }
        },
        {
          $group: {
            _id: '$sessionId',
            pageviewCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            bouncedSessions: {
              $sum: { $cond: [{ $eq: ['$pageviewCount', 1] }, 1, 0] }
            }
          }
        }
      ]),

      // Realtime visitors (last 5 minutes)
      AnalyticsEvent.distinct('visitorHash', {
        timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
        eventType: { $ne: 'click' }
      }).then((hashes) => hashes.length),

      // Top sections by views
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'section_view',
            section: { $exists: true, $ne: null },
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$section',
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorHash' }
          }
        },
        {
          $project: {
            section: '$_id',
            views: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ])
    ]);

    const avgDwellMs = dwellResult.length > 0 ? dwellResult[0].avgDwell : 0;
    const bounce = bounceRate.length > 0
      ? (bounceRate[0].bouncedSessions / bounceRate[0].totalSessions) * 100
      : 0;

    res.json({
      range,
      visitors: uniqueVisitors,
      pageviews,
      avgDwellMs: Math.round(avgDwellMs),
      avgDwellSeconds: Math.round(avgDwellMs / 1000),
      bounceRate: Math.round(bounce * 100) / 100,
      realtimeVisitors,
      topSections
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/analytics/timeseries
// @desc    Time series data for charts (visitors/pageviews per day)
// @access  Private
router.get('/timeseries', authenticate, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const startDate = getStartDate(range);

    const data = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          eventType: 'pageview'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          pageviews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorHash' }
        }
      },
      {
        $project: {
          date: '$_id',
          pageviews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({ range, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/analytics/sections
// @desc    Section engagement breakdown
// @access  Private
router.get('/sections', authenticate, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getStartDate(range);

    const data = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'section_leave',
          section: { $exists: true, $ne: null },
          timestamp: { $gte: startDate },
          dwellTimeMs: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$section',
          totalDwellMs: { $sum: '$dwellTimeMs' },
          avgDwellMs: { $avg: '$dwellTimeMs' },
          maxScrollDepth: { $max: '$scrollDepth' },
          avgScrollDepth: { $avg: '$scrollDepth' },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorHash' }
        }
      },
      {
        $project: {
          section: '$_id',
          totalDwellMs: 1,
          avgDwellMs: { $round: ['$avgDwellMs', 0] },
          maxScrollDepth: { $round: ['$maxScrollDepth', 0] },
          avgScrollDepth: { $round: ['$avgScrollDepth', 0] },
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { views: -1 } }
    ]);

    res.json({ range, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/analytics/pages
// @desc    Top pages / entry / exit pages
// @access  Private
router.get('/pages', authenticate, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getStartDate(range);

    // Top pages by pageviews
    const topPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'pageview',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$page',
          pageviews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorHash' }
        }
      },
      {
        $project: {
          page: '$_id',
          pageviews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { pageviews: -1 } },
      { $limit: 20 }
    ]);

    // Entry pages (first pageview of a session)
    const entryPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'pageview',
          timestamp: { $gte: startDate }
        }
      },
      {
        $sort: { timestamp: 1 }
      },
      {
        $group: {
          _id: '$sessionId',
          firstPage: { $first: '$page' }
        }
      },
      {
        $group: {
          _id: '$firstPage',
          entries: { $sum: 1 }
        }
      },
      { $sort: { entries: -1 } },
      { $limit: 10 }
    ]);

    // Exit pages (last pageview of a session)
    const exitPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'pageview',
          timestamp: { $gte: startDate }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$sessionId',
          lastPage: { $first: '$page' }
        }
      },
      {
        $group: {
          _id: '$lastPage',
          exits: { $sum: 1 }
        }
      },
      { $sort: { exits: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      range,
      topPages,
      entryPages: entryPages.map((e) => ({ page: e._id, entries: e.entries })),
      exitPages: exitPages.map((e) => ({ page: e._id, exits: e.exits }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/analytics/visitors
// @desc    Visitor breakdown (devices, countries, referrers)
// @access  Private
router.get('/visitors', authenticate, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const startDate = getStartDate(range);

    const [deviceBreakdown, countryBreakdown, referrerBreakdown] = await Promise.all([
      // Devices
      AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            eventType: 'pageview',
            deviceType: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$deviceType',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Countries
      AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            eventType: 'pageview',
            country: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$country',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),

      // Referrers
      AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            eventType: 'pageview',
            referrer: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$referrer',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])
    ]);

    res.json({
      range,
      deviceBreakdown: deviceBreakdown.map((d) => ({ device: d._id, count: d.count })),
      countryBreakdown: countryBreakdown.map((c) => ({ country: c._id, count: c.count })),
      referrerBreakdown: referrerBreakdown.map((r) => ({ referrer: r._id, count: r.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/analytics/realtime
// @desc    Real-time active visitors (last 5 minutes)
// @access  Private
router.get('/realtime', authenticate, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeVisitors = await AnalyticsEvent.distinct('visitorHash', {
      timestamp: { $gte: fiveMinutesAgo },
      eventType: { $ne: 'click' }
    });

    const recentEvents = await AnalyticsEvent.find({
      timestamp: { $gte: fiveMinutesAgo },
      eventType: { $ne: 'click' }
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('page section timestamp deviceType referrer');

    res.json({
      activeVisitors: activeVisitors.length,
      recentEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
