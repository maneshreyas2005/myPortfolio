require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');
const AnalyticsEvent = require('../models/analyticsEventModel');
const AnalyticsAggregate = require('../models/analyticsAggregateModel');

/**
 * Daily aggregation job: roll up raw analytics events into daily aggregates.
 * Runs at midnight UTC every day.
 */
const runAggregation = async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  console.log(`[Analytics Aggregation] Rolling up events for ${yesterday.toISOString().split('T')[0]}...`);

  try {
    // Aggregate events from yesterday (excluding admin traffic and clicks)
    const aggregates = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: {
            $gte: yesterday,
            $lt: today
          },
          eventType: { $ne: 'click' },
          page: { $not: /^\/admin/ }
        }
      },
      {
        $group: {
          _id: {
            date: yesterday,
            page: '$page',
            section: '$section'
          },
          pageviews: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0]
            }
          },
          uniqueVisitors: { $addToSet: '$visitorHash' },
          uniqueSessions: { $addToSet: '$sessionId' },
          totalDwellTimeMs: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'section_leave'] }, '$dwellTimeMs', 0]
            }
          },
          dwellCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$eventType', 'section_leave'] }, { $gt: ['$dwellTimeMs', 0] }] },
                1, 0
              ]
            }
          },
          maxScrollDepth: { $max: '$scrollDepth' },
          scrollDepths: { $push: '$scrollDepth' },
          deviceBreakdown: {
            $push: '$deviceType'
          },
          countryBreakdown: {
            $push: '$country'
          },
          referrerBreakdown: {
            $push: '$referrer'
          },
          entries: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0]
            }
          },
          exits: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          date: '$_id.date',
          page: '$_id.page',
          section: '$_id.section',
          pageviews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          uniqueSessions: { $size: '$uniqueSessions' },
          totalDwellTimeMs: 1,
          avgDwellTimeMs: {
            $cond: {
              if: { $gt: ['$dwellCount', 0] },
              then: { $round: [{ $divide: ['$totalDwellTimeMs', '$dwellCount'] }, 0] },
              else: 0
            }
          },
          maxScrollDepth: { $round: ['$maxScrollDepth', 0] },
          avgScrollDepth: {
            $round: [{ $avg: '$scrollDepths' }, 0]
          },
          deviceBreakdown: {
            mobile: {
              $size: {
                $filter: {
                  input: '$deviceBreakdown',
                  as: 'd',
                  cond: { $eq: ['$$d', 'mobile'] }
                }
              }
            },
            tablet: {
              $size: {
                $filter: {
                  input: '$deviceBreakdown',
                  as: 'd',
                  cond: { $eq: ['$$d', 'tablet'] }
                }
              }
            },
            desktop: {
              $size: {
                $filter: {
                  input: '$deviceBreakdown',
                  as: 'd',
                  cond: { $eq: ['$$d', 'desktop'] }
                }
              }
            }
          },
          countryBreakdown: {
            $arrayToObject: {
              $reduce: {
                input: '$countryBreakdown',
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    [{ k: '$$this', v: 1 }]
                  ]
                }
              }
            }
          },
          referrerBreakdown: {
            $arrayToObject: {
              $reduce: {
                input: '$referrerBreakdown',
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    [{ k: '$$this', v: 1 }]
                  ]
                }
              }
            }
          },
          entries: 1,
          exits: 1,
          _id: 0
        }
      }
    ]);

    // Upsert aggregates
    if (aggregates.length > 0) {
      const bulkOps = aggregates.map((agg) => ({
        updateOne: {
          filter: {
            date: agg.date,
            page: agg.page,
            section: agg.section
          },
          update: { $set: agg },
          upsert: true
        }
      }));

      await AnalyticsAggregate.bulkWrite(bulkOps);
      console.log(`[Analytics Aggregation] Upserted ${aggregates.length} aggregate records for ${yesterday.toISOString().split('T')[0]}`);
    } else {
      console.log(`[Analytics Aggregation] No events to aggregate for ${yesterday.toISOString().split('T')[0]}`);
    }
  } catch (err) {
    console.error('[Analytics Aggregation] Error:', err.message);
  }
};

/**
 * Start the daily aggregation cron job (midnight UTC).
 */
const startAggregationJob = () => {
  // Run immediately on startup for any missing data, then daily at midnight
  runAggregation();

  cron.schedule('0 0 * * *', () => {
    runAggregation();
  }, {
    timezone: 'UTC'
  });

  console.log('[Analytics Aggregation] Daily aggregation job scheduled (midnight UTC)');
};

module.exports = { startAggregationJob, runAggregation };
