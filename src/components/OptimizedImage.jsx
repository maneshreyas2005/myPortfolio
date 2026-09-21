import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

/**
 * OptimizedImage Component
 * 
 * - Delivers modern WebP/AVIF via Cloudinary & local WebP
 * - Prevents Cumulative Layout Shift (CLS)
 * - Renders a sleek shimmer skeleton while loading
 * - Supports priority loading for LCP hero elements
 * - Native lazy loading and async decoding for offscreen cards
 */
export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  width,
  height,
  crop,
  priority = false,
  avatar = false,
  fallback = '/images/photo3-avatar.webp',
  style = {},
  onClick,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = hasError
    ? fallback
    : getOptimizedImageUrl(src, { width, height, crop, avatar, fallback });

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
    >
      {/* Shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-white/5 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}

      {/* Image */}
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'auto' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) setHasError(true);
        }}
        className={`w-full h-full transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        {...props}
      />
    </div>
  );
}
