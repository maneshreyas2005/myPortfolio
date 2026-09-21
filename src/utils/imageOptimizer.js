/**
 * Image URL Optimization Utility
 * 
 * Automatically applies:
 * 1. Cloudinary on-the-fly transformations (f_auto, q_auto, responsive width limits)
 * 2. Modern WebP asset routing for local static files
 * 3. Base URL resolution for backend /uploads
 */

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5000';

export function getOptimizedImageUrl(url, options = {}) {
  if (!url) {
    return options.fallback || '/images/photo3-avatar.webp';
  }

  // 1. Cloudinary Optimization
  if (typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Check if transformations already exist
    const [baseUrl, path] = url.split('/upload/');
    if (path) {
      const parts = [];
      // Auto format (WebP / AVIF) and auto quality compression
      parts.push('f_auto');
      parts.push('q_auto');

      if (options.width) {
        parts.push(`w_${options.width}`);
        parts.push(options.crop || 'c_limit');
      }
      if (options.height) {
        parts.push(`h_${options.height}`);
      }

      const transformStr = parts.join(',');

      // If already has transformation parameters right after /upload/, don't duplicate
      if (/^(f_|q_|w_|c_|h_|r_|e_)/.test(path)) {
        return url;
      }

      return `${baseUrl}/upload/${transformStr}/${path}`;
    }
    return url;
  }

  // 2. Local Static Asset Optimization (prefer .webp)
  if (typeof url === 'string') {
    if (url === '/images/photo3.jpeg' || url.endsWith('/photo3.jpeg')) {
      return options.avatar ? '/images/photo3-avatar.webp' : '/images/photo3.webp';
    }
    if (url === '/images/articles/featured-judge.jpg' || url.endsWith('/featured-judge.jpg')) {
      return '/images/articles/featured-judge.webp';
    }
  }

  // 3. Backend Uploads (/uploads/...)
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    return `${SERVER_BASE}${url}`;
  }

  return url;
}
