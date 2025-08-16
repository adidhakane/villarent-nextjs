// Transform villa data for API responses
export function transformVillaForAPI(villa: Record<string, unknown>) {
  return {
    ...villa,
    amenities: transformJSONField(villa.amenities),
    images: transformJSONField(villa.images)
  }
}

// Helper function to transform JSON fields (handles both PostgreSQL JSON and SQLite JSON strings)
function transformJSONField(field: unknown): unknown[] {
  // If it's already an array (PostgreSQL JSON), return it
  if (Array.isArray(field)) {
    return field
  }
  
  // If it's a string (SQLite JSON string), parse it
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn('Failed to parse JSON field:', field)
      return []
    }
  }
  
  // If it's null or undefined, return empty array
  if (field === null || field === undefined) {
    return []
  }
  
  // For any other type, try to convert to array
  return Array.isArray(field) ? field : []
}

// Transform array of villas for API responses
export function transformVillasForAPI(villas: Record<string, unknown>[]) {
  return villas.map(villa => transformVillaForAPI(villa))
}
