/**
 * Image Optimization Utilities
 * Handles responsive sizing, modern formats (WebP/AVIF), dimension capping,
 * and CDN parameter injection for Supabase Storage and Unsplash.
 */

/**
 * Generate an optimized image URL with proper width, height, format, and quality.
 * @param {string} url - Original image URL
 * @param {Object} options - { width, height, quality, format }
 * @returns {string} Optimized URL
 */
export function getOptimizedImageUrl(url, { width = 360, height, quality = 75, format = 'webp' } = {}) {
  if (!url || typeof url !== 'string') return '';

  // 1. Data URLs / Blob URLs / Local files: return as-is
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url);

    // 2. Unsplash CDN Optimization
    if (parsed.hostname.includes('unsplash.com')) {
      parsed.searchParams.set('w', width.toString());
      if (height) parsed.searchParams.set('h', height.toString());
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      return parsed.toString();
    }

    // 3. Supabase Storage Image Transformation (render endpoint)
    // Matches: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    if (parsed.hostname.includes('supabase.co') && parsed.pathname.includes('/storage/v1/object/public/')) {
      const renderPath = parsed.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
      const transformUrl = new URL(renderPath, parsed.origin);
      transformUrl.searchParams.set('width', width.toString());
      if (height) transformUrl.searchParams.set('height', height.toString());
      transformUrl.searchParams.set('quality', quality.toString());
      transformUrl.searchParams.set('resize', 'cover');
      return transformUrl.toString();
    }

    return url;
  } catch (e) {
    // If URL parsing fails, return original url safely
    return url;
  }
}

/**
 * Generate standard responsive srcset string for high-DPI (Retina) and varying mobile viewports.
 * @param {string} url
 * @param {Array<number>} widths - e.g. [240, 360, 480, 720]
 * @returns {string} srcset string
 */
export function getResponsiveSrcSet(url, widths = [240, 360, 480]) {
  if (!url || typeof url !== 'string' || url.startsWith('data:') || url.startsWith('blob:')) {
    return undefined;
  }

  // Only generate srcset for CDN-supported URLs (Unsplash / Supabase)
  if (!url.includes('unsplash.com') && !url.includes('supabase.co')) {
    return undefined;
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}
