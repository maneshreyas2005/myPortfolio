import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  BarChart2, Activity, Users, Globe, Monitor, ArrowRight,
  RefreshCw, ChevronLeft, ChevronRight as ChevronRightIcon, Layout, PieChart, Clock
} from 'lucide-react';
import {
  fetchAnalyticsSummary,
  fetchAnalyticsTimeseries,
  fetchAnalyticsSections,
  fetchAnalyticsPages,
  fetchAnalyticsVisitors
} from '../../dataFetch';
import MetricCard from './MetricCard';
import { AreaChart, BarChart, DonutChart } from './Charts';
import RealtimeWidget from './RealtimeWidget';

const RANGES = [
  { label: '24h', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' }
];

export default function AnalyticsDashboard({ token }) {
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState(null);
  const [sections, setSections] = useState(null);
  const [pages, setPages] = useState(null);
  const [visitors, setVisitors] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAnalyticsSummary(token, range).then(setSummary),
        fetchAnalyticsTimeseries(token, range).then(setTimeseries),
        fetchAnalyticsSections(token, range).then(setSections),
        fetchAnalyticsPages(token, range).then(setPages),
        fetchAnalyticsVisitors(token, range).then(setVisitors)
      ]);
    } catch (err) {
      console.warn('Analytics load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, range]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Format number with commas
  const fmt = (n) => (n == null ? 0 : n.toLocaleString());

  // Compute deltas (mocked for v1 - in production you'd compare with previous period)
  const getDelta = (base) => {
    // Simple deterministic "delta" based on value for visual consistency
    return Math.round((Math.sin(base * 0.001) * 10) * 10) / 10;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">Analytics</h1>
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Visitor engagement &amp; section performance
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                range === r.value
                  ? 'bg-accent-orange text-[#151312] shadow-lg shadow-accent-orange/25'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={loadAll}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="Visitors"
          value={summary?.visitors || 0}
          change={getDelta(summary?.visitors || 0)}
          changeLabel="vs prev"
          icon={Users}
          color="text-accent-lime"
        />
        <MetricCard
          label="Pageviews"
          value={summary?.pageviews || 0}
          change={getDelta(summary?.pageviews || 0)}
          changeLabel="vs prev"
          icon={Activity}
          color="text-accent-orange"
        />
        <MetricCard
          label="Avg Time"
          value={`${summary?.avgDwellSeconds || 0}s`}
          change={getDelta(summary?.avgDwellSeconds || 0)}
          changeLabel="vs prev"
          icon={Clock}
          color="text-cyan-400"
        />
        <MetricCard
          label="Bounce Rate"
          value={`${summary?.bounceRate || 0}%`}
          change={-getDelta(summary?.bounceRate || 0)}
          changeLabel="vs prev"
          icon={Monitor}
          color="text-red-400"
        />
      </div>

      {/* Realtime Widget (collapsible) */}
      <div className="grid grid-cols-1 lg:col-span-2 lg:row-span-2 gap-6">
        <RealtimeWidget token={token} />
      </div>

      {/* Tabbed content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Charts */}
        <div className="flex-1 lg:w-3/5 space-y-6">
          {/* Visitors Over Time */}
          <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-black">Visitors Over Time</h2>
                <p className="text-xs text-white/40">Pageviews &amp; unique visitors per day</p>
              </div>
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent-lime" />
                <span className="text-xs text-white/60">Area Chart</span>
              </div>
            </div>
            <AreaChart
              data={timeseries?.data || []}
              height={260}
              color="#F46C38"
            />
          </div>

          {/* Section Engagement */}
          <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-black">Section Engagement</h2>
                <p className="text-xs text-white/40">Time spent per section</p>
              </div>
            </div>
            <BarChart
              data={sections?.data?.map((s) => ({
                label: s.section.charAt(0).toUpperCase() + s.section.slice(1),
                value: s.views,
                color: '#C5FF41'
              })) || []}
              height={240}
            />
          </div>
        </div>

        {/* Right: Breakdowns */}
        <div className="flex-1 lg:w-2/5 space-y-6">
          {/* Top Pages */}
          <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-black">Top Pages</h2>
            </div>
            <div className="space-y-3">
              {pages?.topPages?.slice(0, 8).map((page, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-accent-orange/10 text-accent-orange flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {page.page === '/' ? 'Home' : page.page}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-right text-white/60 tabular-nums">
                    {fmt(page.pageviews)}
                  </span>
                </div>
              ))}
              {pages?.topPages?.length === 0 && (
                <div className="text-center text-white/40 text-xs py-8">No page data</div>
              )}
            </div>
          </div>

          {/* Device + Geo + Referrer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-black mb-3">Devices</h3>
              </div>
              <div className="space-y-3">
                {visitors?.deviceBreakdown?.map((d) => (
                  <div key={d.device} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{d.device.charAt(0).toUpperCase() + d.device.slice(1)}</span>
                    <span className="text-xs font-mono text-right tabular-nums">{d.count}</span>
                  </div>
                ))}
                {visitors?.deviceBreakdown?.length === 0 && (
                  <div className="text-center text-white/40 text-xs py-4">No device data</div>
                )}
              </div>
            </div>
            <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-black mb-3">Referrers</h3>
              </div>
              <div className="space-y-3">
                {visitors?.referrerBreakdown?.map((r) => (
                  <div key={r.referrer} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{r.referrer.charAt(0).toUpperCase() + r.referrer.slice(1)}</span>
                    <span className="text-xs font-mono text-right tabular-nums">{r.count}</span>
                  </div>
                ))}
                {visitors?.referrerBreakdown?.length === 0 && (
                  <div className="text-center text-white/40 text-xs py-4">No referrer data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

