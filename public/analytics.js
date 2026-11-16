/**
 * Portfolio Analytics Tracker
 * Privacy-first, lightweight (~2KB gzipped), no cookies, no PII.
 * 
 * Tracks:
 * - Pageviews on load
 * - Section view/leave with dwell time (IntersectionObserver)
 * - Clicks on data-analytics elements
 * - Batch sends every 5s, flushes on pagehide (beacon)
 */

(function () {
  'use strict';

  const BATCH_SIZE = 10;
  const BATCH_INTERVAL = 5000; // 5s
  const TRACK_ENDPOINT = '/api/analytics/track';
  const BATCH_ENDPOINT = '/api/analytics/track/batch';

  // Section selectors mapped to section names
  const SECTION_SELECTORS = {
    hero: '#home',
    skills: '#skills',
    projects: '#projects',
    experience: '#experience',
    certificates: '#certificates',
    community: '#community',
    education: '#education'
  };

  // Skip tracking on admin routes
  const isAdminRoute = () =>
    window.location.pathname.startsWith('/admin') ||
    window.location.pathname === '/admin';

  // Session ID (persisted in sessionStorage, regenerated per tab)
  let sessionId = sessionStorage.getItem('a_sid');
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 16);
    sessionStorage.setItem('a_sid', sessionId);
  }

  // Visitor hash (daily salted, regenerated at midnight)
  let visitorHash = null;
  let visitorDay = null;
  const getVisitorHash = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = sessionStorage.getItem('a_vhash');
    const storedDay = sessionStorage.getItem('a_vday');
    if (stored && storedDay === today) return stored;
    // Simple hash from user agent + day + salt (no PII, just a stable daily identifier)
    const ua = navigator.userAgent || '';
    const str = ua + today + 'portfolio-analytics-salt';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    visitorHash = Math.abs(hash).toString(16).slice(0, 16);
    sessionStorage.setItem('a_vhash', visitorHash);
    sessionStorage.setItem('a_vday', today);
    return visitorHash;
  };

  // Device type detection
  const getDeviceType = () => {
    const w = window.innerWidth;
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  };

  // Referrer classification
  const getReferrerType = () => {
    const ref = document.referrer;
    if (!ref) return 'direct';
    try {
      const host = new URL(ref).hostname.replace('www.', '');
      if (host.includes('google') || host.includes('bing') || host.includes('duckduckgo')) return 'search';
      if (host.includes('github') || host.includes('gitlab') || host.includes('bitbucket')) return 'github';
      if (host.includes('linkedin')) return 'linkedin';
      if (host.includes('twitter') || host.includes('x.com')) return 'twitter';
      return 'referral';
    } catch {
      return 'direct';
    }
  };

  // Event queue for batching
  const queue = [];
  let flushTimer = null;

  const flush = async () => {
    if (!queue.length) return;
    const payload = queue.splice(0, BATCH_SIZE);
    try {
      await fetch(BATCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: payload }),
        keepalive: true
      });
    } catch (e) {
      // Silently fail - analytics must never break UX
      // Re-queue remaining events (prepend to preserve order)
      queue.unshift(...payload);
    }
    if (flushTimer) clearTimeout(flushTimer);
    if (queue.length > 0) {
      flushTimer = setTimeout(flush, BATCH_INTERVAL);
    }
  };

  const enqueue = (eventType, data = {}) => {
    if (isAdminRoute()) return; // exclude admin traffic
    queue.push({
      sessionId,
      visitorHash: getVisitorHash(),
      eventType,
      page: window.location.pathname || '/',
      timestamp: new Date().toISOString(),
      deviceType: getDeviceType(),
      referrer: getReferrerType(),
      ...data
    });
    if (queue.length >= BATCH_SIZE) {
      flush();
    } else {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = setTimeout(flush, BATCH_INTERVAL);
    }
  };

  // Track pageview on load
  enqueue('pageview');

  // Section visibility tracking via IntersectionObserver
  const sectionTimers = {};
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionName = Object.keys(SECTION_SELECTORS).find(
          (key) => SECTION_SELECTORS[key] === '#' + entry.target.id
        );
        if (!sectionName) return;

        if (entry.isIntersecting) {
          // Section entered viewport
          sectionTimers[sectionName] = Date.now();
          enqueue('section_view', {
            section: sectionName,
            scrollDepth: Math.round(entry.intersectionRatio * 100)
          });
        } else {
          // Section left viewport
          const start = sectionTimers[sectionName];
          if (start) {
            const dwellTime = Date.now() - start;
            enqueue('section_leave', {
              section: sectionName,
              dwellTimeMs: dwellTime
            });
            delete sectionTimers[sectionName];
          }
        }
      });
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
  );

  // Observe all sections
  Object.values(SECTION_SELECTORS).forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) observer.observe(el);
  });

  // Click tracking on data-analytics elements (delegated)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-analytics]');
    if (target) {
      enqueue('click', {
        elementId: target.getAttribute('data-analytics-id') || target.id || '',
        elementType: target.getAttribute('data-analytics-type') || ''
      });
    }
  });

  // Flush remaining events on page hide
  window.addEventListener('pagehide', () => {
    Object.entries(sectionTimers).forEach(([section, start]) => {
      enqueue('section_leave', { section, dwellTimeMs: Date.now() - start });
    });
    flush();
  });

  // Expose manual tracking API
  window.portfolioAnalytics = { track: enqueue };
})();
