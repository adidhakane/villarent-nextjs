// Transform villa data for API responses
export function transformVillaForAPI(villa: Record<string, unknown>) {
  return {
    ...villa,
    amenities: Array.isArray(villa.amenities) 
      ? villa.amenities 
      : villa.amenities 
        ? JSON.parse(villa.amenities as string) 
        : [],
    images: Array.isArray(villa.images) 
      ? villa.images 
      : villa.images 
        ? JSON.parse(villa.images as string) 
        : []
  }
}

// Transform array of villas for API responses
export function transformVillasForAPI(villas: Record<string, unknown>[]) {
  return villas.map(villa => transformVillaForAPI(villa))
}
