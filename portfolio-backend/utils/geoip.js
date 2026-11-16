let geoip = null;

try {
  geoip = require('geoip-lite');
} catch (err) {
  // geoip-lite is optional; country lookup will be unavailable if not installed
  console.warn('geoip-lite not installed. Country lookup will be unavailable.');
}

/**
 * Look up country code from an IP address.
 * Returns ISO 3166-1 alpha-2 country code (e.g., 'US', 'IN') or null.
 * @param {string} ip - Client IP address
 * @returns {string|null}
 */
const lookupCountry = (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.0.0.1')) {
    return null; // localhost
  }
  if (!geoip) {
    return null;
  }
  try {
    const lookup = geoip.lookup(ip);
    return lookup ? lookup.country : null;
  } catch {
    return null;
  }
};

module.exports = { lookupCountry };
