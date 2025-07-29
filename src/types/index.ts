import { User, Villa, Booking, BookingStatus } from '@prisma/client'

// Define Role enum manually since Prisma client is not generating properly
export enum UserRole {
  ADMIN = 'ADMIN',
  VILLA_OWNER = 'VILLA_OWNER',
  GUEST = 'GUEST'
}

// Extended User type with relations
export type UserWithVillas = User & {
  villas: Villa[]
}

// Extended Villa type with relations
export type VillaWithOwner = Villa & {
  owner: User
  bookings: Booking[]
}

export type VillaWithDetails = Villa & {
  owner: User
  bookings: Booking[]
  unavailableDates: { date: Date }[]
}

// Search and filter types
export interface VillaSearchParams {
  location: string
  checkIn: Date
  checkOut: Date
  guests: number
}

export interface VillaFilters {
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  amenities?: string[]
}

// Form types
export interface VillaRegistrationData {
  name: string
  description: string
  location: string
  address: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  pricePerNight: number
}

export interface BookingData {
  villaId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: Date
  checkOut: Date
  guests: number
  notes?: string
}

// Auth types
export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: UserRole
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Calendar types
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'unavailable'
  status?: BookingStatus
}

export interface UnavailableDate {
  date: Date
  reason?: string
}

// Common component props
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface SortOption {
  label: string
  value: string
  direction: 'asc' | 'desc'
}

// Location data
export interface Location {
  id: string
  name: string
  state?: string
  popular: boolean
}

export { BookingStatus }
