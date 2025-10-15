/**
 * Utility function to get the correct image URL for villa images
 * Handles different image storage formats:
 * - Base64 data URLs (production with PostgreSQL)
 * - Absolute paths starting with '/'
 * - Relative filenames (development with local storage)
 */
export function getVillaImageUrl(imageData: string): string {
  if (!imageData) {
    return '/placeholder-villa.svg'
  }

  // If it's already a data URL (base64), return as-is
  if (imageData.startsWith('data:')) {
    return imageData
  }

  // If it's an absolute path, return as-is
  if (imageData.startsWith('/')) {
    return imageData
  }

  // If it's a filename, prepend the uploads path
  return `/uploads/villas/${imageData}`
}

/**
 * Get image URL with fallback to placeholder
 */
export function getVillaImageUrlWithFallback(images: string[]): string {
  if (!images || images.length === 0) {
    return '/placeholder-villa.svg'
  }

  return getVillaImageUrl(images[0])
}
