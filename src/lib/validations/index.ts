import { z } from 'zod'

// Villa registration schema
export const villaRegistrationSchema = z.object({
  name: z.string().min(1, 'Villa name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(10, 'Full address is required'),
  maxGuests: z.number().min(1, 'Must accommodate at least 1 guest').max(50, 'Too many guests'),
  bedrooms: z.number().min(1, 'Must have at least 1 bedroom').max(20, 'Too many bedrooms'),
  bathrooms: z.number().min(1, 'Must have at least 1 bathroom').max(20, 'Too many bathrooms'),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  pricePerNight: z.number().min(100, 'Price must be at least ₹100').max(100000, 'Price too high'),
})

// Villa search schema
export const villaSearchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  checkIn: z.date({ message: 'Check-in date is required' }),
  checkOut: z.date({ message: 'Check-out date is required' }),
  guests: z.number().min(1, 'At least 1 guest is required').max(50, 'Too many guests'),
}).refine(
  (data) => data.checkOut > data.checkIn,
  {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  }
)

// Booking schema
export const bookingSchema = z.object({
  villaId: z.string().cuid('Invalid villa ID'),
  guestName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  checkIn: z.date({ message: 'Check-in date is required' }),
  checkOut: z.date({ message: 'Check-out date is required' }),
  guests: z.number().min(1, 'At least 1 guest is required'),
  notes: z.string().optional(),
}).refine(
  (data) => data.checkOut > data.checkIn,
  {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  }
)

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

// Unavailable date schema
export const unavailableDateSchema = z.object({
  villaId: z.string().cuid('Invalid villa ID'),
  date: z.date({ message: 'Date is required' }),
  reason: z.string().optional(),
})

// Villa filter schema
export const villaFilterSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bedrooms: z.number().min(1).optional(),
  bathrooms: z.number().min(1).optional(),
  maxGuests: z.number().min(1).optional(),
  amenities: z.array(z.string()).optional(),
})

// Common amenities for validation
export const VILLA_AMENITIES = [
  'Swimming Pool',
  'Air Conditioning',
  'WiFi',
  'Kitchen',
  'Parking',
  'Garden',
  'Balcony',
  'TV',
  'Washing Machine',
  'BBQ Area',
  'Gym',
  'Hot Tub',
  'Fireplace',
  'Pet Friendly',
  'Beach Access',
  'Mountain View',
] as const

// Common locations
export const POPULAR_LOCATIONS = [
  'Lonavala',
  'Mahabaleshwar',
  'Panchgani',
  'Alibaug',
  'Matheran',
  'Karjat',
  'Igatpuri',
  'Khandala',
  'Mulshi',
  'Pawna Lake',
] as const

export type VillaRegistrationInput = z.infer<typeof villaRegistrationSchema>
export type VillaSearchInput = z.infer<typeof villaSearchSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UnavailableDateInput = z.infer<typeof unavailableDateSchema>
export type VillaFilterInput = z.infer<typeof villaFilterSchema>
