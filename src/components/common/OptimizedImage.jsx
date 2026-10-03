import React, { useState } from 'react';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '../../utils/imageOptimizer';

export function OptimizedImage({
  src,
  alt = 'Product image',
  width = 360,
  height,
  priority = false,
  className = '',
  aspectRatio = 'aspect-square',
  sizes = '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px',
  fallbackText = 'Store Item',
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attemptOriginal, setAttemptOriginal] = useState(false);

  // If error occurred with transformed URL, attempt original URL once before giving up
  const activeSrc = attemptOriginal
    ? src
    : getOptimizedImageUrl(src, { width, height });

  const activeSrcSet = attemptOriginal
    ? undefined
    : getResponsiveSrcSet(src, [240, 360, 480]);

  const handleError = () => {
    if (!attemptOriginal && activeSrc !== src) {
      setAttemptOriginal(true);
    } else {
      setHasError(true);
    }
  };

  if (!src || hasError) {
    return (
      <div className={`w-full ${aspectRatio} flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center select-none`}>
        <span className="text-3xl mb-1">📦</span>
        <span className="text-xs font-medium text-stone-500">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden bg-stone-100`}>
      {/* Shimmer skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse" />
      )}

      <img
        src={activeSrc}
        srcSet={activeSrcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover object-center transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
