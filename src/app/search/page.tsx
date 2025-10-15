'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, Users, Bed, Bath, MapPin, Phone, MessageCircle, DollarSign, 
  Filter, X, Check, Star, Wifi, Car, Utensils, Waves, Home, 
  TrendingUp, Calendar, ChevronDown, ChevronUp, Heart, Share2, 
  Eye, Sparkles, Award, Shield, Clock, Image as ImageIcon, ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { getVillaImageUrlWithFallback } from '@/lib/utils/image-utils'

interface Villa {
  id: string
  name: string
  description: string
  location: string
  address: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  // Owner pricing (not displayed to users)
  weekdayPrice?: number
  fridayPrice?: number
  saturdayPrice?: number
  sundayPrice?: number
  // Admin pricing (displayed to users)
  adminWeekdayPrice?: number
  adminSaturdayPrice?: number
  adminSundayPrice?: number
  amenities: string[]
  images: string[]
  googleDriveLink?: string
  owner: {
    name: string
    email: string
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [villas, setVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVillas, setSelectedVillas] = useState<string[]>([])
  const [expandedVilla, setExpandedVilla] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'guests' | 'recommended'>('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [favoriteVillas, setFavoriteVillas] = useState<string[]>([])
  const [filters, setFilters] = useState({
    bhk: [] as string[], // 3BHK, 4BHK filter
    priceRange: 'all' as string,
    amenities: [] as string[],
    minPrice: 0,
    maxPrice: 50000
  })

  const location = searchParams.get('location')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')

  // Function to get the appropriate price based on check-in date
  const getPriceForDate = (villa: Villa, dateString: string) => {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Priority: Admin prices > Owner prices > Base price
    if (dayOfWeek === 5) { // Friday
      return villa.adminSaturdayPrice || villa.fridayPrice || villa.pricePerNight
    } else if (dayOfWeek === 6) { // Saturday  
      return villa.adminSaturdayPrice || villa.saturdayPrice || villa.pricePerNight
    } else if (dayOfWeek === 0) { // Sunday
      return villa.adminSundayPrice || villa.sundayPrice || villa.pricePerNight
    } else { // Monday to Thursday (weekdays)
      return villa.adminWeekdayPrice || villa.weekdayPrice || villa.pricePerNight
    }
  }

  // Function to check if admin pricing is being used
  const isAdminPricing = (villa: Villa, dateString: string) => {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      return !!villa.adminSaturdayPrice
    } else if (dayOfWeek === 0) { // Sunday
      return !!villa.adminSundayPrice
    } else { // Monday to Thursday (weekdays)
      return !!villa.adminWeekdayPrice
    }
  }

  // Function to get day name from date string
  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  useEffect(() => {
    if (location && checkIn && checkOut && guests) {
      searchVillas()
    }
  }, [location, checkIn, checkOut, guests])

  const searchVillas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        location: location!,
        checkIn: checkIn!,
        checkOut: checkOut!,
        guests: guests!
      })

      console.log('Searching villas with params:', params.toString())

      const response = await fetch(`/api/villas/search?${params}`)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', response.status, errorData)
        throw new Error(`Failed to search villas (${response.status})`)
      }

      const data = await response.json()
      console.log('Search response:', data)
      
      if (data.success) {
        setVillas(data.villas || [])
      } else {
        console.error('Search failed:', data.error)
        setError(data.error || 'Search failed')
        setVillas([])
      }
    } catch (error) {
      console.error('Failed to search villas:', error)
      setError(error instanceof Error ? error.message : 'Failed to search villas')
      setVillas([])
    } finally {
      setLoading(false)
    }
  }

  const toggleVillaSelection = (villaId: string) => {
    setSelectedVillas(prev => 
      prev.includes(villaId) 
        ? prev.filter(id => id !== villaId)
        : [...prev, villaId]
    )
  }

  const toggleBHKFilter = (bhk: string) => {
    setFilters(prev => ({
      ...prev,
      bhk: prev.bhk.includes(bhk) 
        ? prev.bhk.filter(b => b !== bhk)
        : [...prev.bhk, bhk]
    }))
  }

  const toggleFavorite = (villaId: string) => {
    setFavoriteVillas(prev => 
      prev.includes(villaId) 
        ? prev.filter(id => id !== villaId)
        : [...prev, villaId]
    )
  }

  // Enhanced filtering and sorting
  const filteredAndSortedVillas = villas
    .filter(villa => {
      // BHK filter
      if (filters.bhk.length > 0) {
        const villasBHK = `${villa.bedrooms}BHK`
        if (!filters.bhk.includes(villasBHK)) return false
      }

      // Price filter
      const villaPrice = checkIn ? getPriceForDate(villa, checkIn) : villa.pricePerNight
      if (villaPrice < filters.minPrice || villaPrice > filters.maxPrice) {
        return false
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          villa.amenities?.includes(amenity)
        )
        if (!hasAllAmenities) return false
      }

      return true
    })
    .sort((a, b) => {
      const priceA = checkIn ? getPriceForDate(a, checkIn) : a.pricePerNight
      const priceB = checkIn ? getPriceForDate(b, checkIn) : b.pricePerNight

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB
        case 'price-high':
          return priceB - priceA
        case 'guests':
          return b.maxGuests - a.maxGuests
        case 'recommended':
        default:
          return 0
      }
    })

  // Get all unique amenities from villas
  const allAmenities = Array.from(new Set(villas.flatMap(villa => villa.amenities || [])))
  
  const filteredVillas = filteredAndSortedVillas

  const generateWhatsAppMessage = () => {
    const selectedVillaDetails = filteredVillas.filter(villa => selectedVillas.includes(villa.id))
    
    if (selectedVillaDetails.length === 0) {
      alert('Please select at least one villa')
      return
    }

    const message = `Hi! I'm interested in booking the following villa(s) for ${format(new Date(checkIn!), 'MMM dd, yyyy')} to ${format(new Date(checkOut!), 'MMM dd, yyyy')} for ${guests} guest(s):\n\n${selectedVillaDetails.map(villa => `🏡 ${villa.name}\n📍 ${villa.location}\n💰 ₹${getPriceForDate(villa, checkIn!).toLocaleString()}/night (${getDayName(checkIn!)})${villa.googleDriveLink ? `\n📸 More photos: ${villa.googleDriveLink}` : ''}\n`).join('\n')}\n\nPlease share availability and booking details. Thank you!`

    // Open WhatsApp with message but allow user to select contact
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleBookNow = () => {
    const selectedVillaDetails = filteredVillas.filter(villa => selectedVillas.includes(villa.id))
    
    if (selectedVillaDetails.length === 0) {
      alert('Please select at least one villa')
      return
    }

    // Create the same detailed message as WhatsApp
    const message = `Hi! I'm interested in booking the following villa(s) for ${format(new Date(checkIn!), 'MMM dd, yyyy')} to ${format(new Date(checkOut!), 'MMM dd, yyyy')} for ${guests} guest(s):\n\n${selectedVillaDetails.map(villa => `🏡 ${villa.name}\n📍 ${villa.location}\n💰 ₹${getPriceForDate(villa, checkIn!).toLocaleString()}/night (${getDayName(checkIn!)})\n`).join('\n')}\n\nPlease share availability and booking details. Thank you!`

    // Send message directly to your WhatsApp number (same as Book via WhatsApp)
    const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for villas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => searchVillas()} className="mr-4">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f2fe 50%, #bae6fd 100%)' }}>
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Back to Search</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold" style={{
                background: 'linear-gradient(to right, #2673a5, #1e5a8a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>VillaRent</h1>
            </div>
            
            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1.5 font-medium">
                <Sparkles className="w-4 h-4 mr-1" style={{ color: '#2673a5' }} />
                {filteredVillas.length} villa(s) found
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {filters.bhk.length + filters.amenities.length > 0 && `(${filters.bhk.length + filters.amenities.length})`}
              </Button>
            </div>

            {/* Mobile filter button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Search Summary Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="px-3 py-1.5 text-base" style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}>
                <MapPin className="w-4 h-4 mr-2" />
                {location}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(checkIn!), 'MMM dd')} - {format(new Date(checkOut!), 'MMM dd')}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5">
                <Users className="w-4 h-4 mr-2" />
                {guests} guest(s)
              </Badge>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="guests">Max Guests</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center">
                  <Filter className="w-5 h-5 mr-2" style={{ color: '#2673a5' }} />
                  Filters
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFilters({ bhk: [], priceRange: 'all', amenities: [], minPrice: 0, maxPrice: 50000 })}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>

              {/* Active Filters Count */}
              {(filters.bhk.length + filters.amenities.length) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium" style={{ color: '#2673a5' }}>
                    {filters.bhk.length + filters.amenities.length} filter(s) active
                  </p>
                </div>
              )}
              
              {/* BHK Filter */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Room Type
                </h4>
                <div className="space-y-2">
                  {['3BHK', '4BHK', '5BHK'].map(bhk => (
                    <label key={bhk} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <Checkbox 
                        checked={filters.bhk.includes(bhk)}
                        onCheckedChange={() => toggleBHKFilter(bhk)}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium">{bhk}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({villas.filter(v => `${v.bedrooms}BHK` === bhk).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">₹{filters.minPrice.toLocaleString()}</span>
                    <span className="text-gray-500">to</span>
                    <span className="font-medium">₹{filters.maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      accentColor: '#2673a5'
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 50000 }))}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Popular Amenities Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Popular Amenities
                </h4>
                <div className="space-y-2">
                  {['Swimming Pool', 'WiFi', 'Parking', 'Kitchen', 'AC'].map(amenity => (
                    <label key={amenity} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <Checkbox 
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={() => {
                          setFilters(prev => ({
                            ...prev,
                            amenities: prev.amenities.includes(amenity)
                              ? prev.amenities.filter(a => a !== amenity)
                              : [...prev.amenities, amenity]
                          }))
                        }}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center text-sm mb-2">
                  <TrendingUp className="w-4 h-4 mr-2" style={{ color: '#2673a5' }} />
                  <span className="font-semibold">Quick Stats</span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• Avg price: ₹{Math.round(villas.reduce((acc, v) => acc + v.pricePerNight, 0) / villas.length).toLocaleString()}/night</p>
                  <p>• Max capacity: {Math.max(...villas.map(v => v.maxGuests))} guests</p>
                  <p>• Total available: {villas.length} villas</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {filteredVillas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-gray-300 text-8xl mb-6">🏡</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No villas found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any villas matching your criteria. Try adjusting your filters or search parameters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setFilters({ bhk: [], priceRange: 'all', amenities: [], minPrice: 0, maxPrice: 50000 })} style={{
                    background: 'linear-gradient(to right, #2673a5, #1e5a8a)'
                  }} className="text-white">
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    New Search
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {filteredVillas.length} {filteredVillas.length === 1 ? 'Villa' : 'Villas'} Available
                      </h2>
                      <p className="text-sm text-gray-600">
                        Perfect matches for your search in {location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated live
                      </Badge>
                      {selectedVillas.length > 0 && (
                        <Badge className="bg-blue-600">
                          {selectedVillas.length} selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Villa Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {filteredVillas.map((villa) => (
                    <Card 
                      key={villa.id} 
                      className={`group overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 ${
                        selectedVillas.includes(villa.id) 
                          ? 'ring-4 ring-blue-400 border-blue-500 shadow-xl' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Villa Image with Enhanced Overlays */}
                      <div className="relative h-64 overflow-hidden">
                        {villa.images && villa.images.length > 0 ? (
                          <img 
                            src={getVillaImageUrlWithFallback(villa.images)}
                            alt={villa.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-villa.svg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                              <span className="text-gray-400 text-sm">No Image Available</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        
                        {/* Top Action Buttons */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <div className="flex gap-2">
                            {isAdminPricing(villa, checkIn || '') && (
                              <Badge className="bg-green-500 text-white border-0 shadow-lg">
                                <Award className="w-3 h-3 mr-1" />
                                Special Rate
                              </Badge>
                            )}
                            {villa.googleDriveLink && (
                              <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                                <ImageIcon className="w-3 h-3 mr-1" />
                                Photos
                              </Badge>
                            )}
                          </div>
                          
                          <button
                            onClick={() => toggleFavorite(villa.id)}
                            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                          >
                            <Heart 
                              className={`w-5 h-5 ${favoriteVillas.includes(villa.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                            />
                          </button>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3">
                          <div className="bg-white rounded-lg shadow-2xl px-3 py-2">
                            <div className="text-xs text-gray-600 font-medium">Starting from</div>
                            <div className="text-xl font-bold" style={{ color: '#2673a5' }}>
                              ₹{checkIn ? getPriceForDate(villa, checkIn).toLocaleString() : villa.pricePerNight.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              per night {checkIn && `• ${getDayName(checkIn)}`}
                            </div>
                          </div>
                        </div>

                        {/* Selection Checkbox */}
                        <div className="absolute bottom-3 left-3">
                          <button
                            onClick={() => toggleVillaSelection(villa.id)}
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all shadow-lg ${
                              selectedVillas.includes(villa.id)
                                ? 'bg-blue-600 border-blue-600 text-white scale-110'
                                : 'bg-white/90 backdrop-blur-sm border-white hover:bg-white'
                            }`}
                          >
                            {selectedVillas.includes(villa.id) ? (
                              <Check className="w-6 h-6" />
                            ) : (
                              <div className="text-gray-600 font-bold text-xs">SELECT</div>
                            )}
                          </button>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Villa Name and Location */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2 line-clamp-1">
                              {villa.name}
                            </h3>
                            <Badge variant="outline" className="font-semibold whitespace-nowrap">
                              {villa.bedrooms}BHK
                            </Badge>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-sm">{villa.location} • {villa.address}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`text-sm text-gray-600 mb-4 ${expandedVilla === villa.id ? '' : 'line-clamp-2'}`}>
                          {villa.description}
                        </p>
                        {villa.description.length > 100 && (
                          <button
                            onClick={() => setExpandedVilla(expandedVilla === villa.id ? null : villa.id)}
                            className="text-sm font-medium mb-4"
                            style={{ color: '#2673a5' }}
                          >
                            {expandedVilla === villa.id ? 'Show less' : 'Read more'}
                          </button>
                        )}

                        {/* Capacity Icons */}
                        <div className="flex items-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center text-gray-700">
                            <Users className="w-5 h-5 mr-2" style={{ color: '#2673a5' }} />
                            <span className="font-semibold">{villa.maxGuests}</span>
                            <span className="text-xs ml-1 text-gray-500">guests</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Bed className="w-5 h-5 mr-2" style={{ color: '#2673a5' }} />
                            <span className="font-semibold">{villa.bedrooms}</span>
                            <span className="text-xs ml-1 text-gray-500">beds</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Bath className="w-5 h-5 mr-2" style={{ color: '#2673a5' }} />
                            <span className="font-semibold">{villa.bathrooms}</span>
                            <span className="text-xs ml-1 text-gray-500">baths</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(villa.amenities) && villa.amenities.slice(0, 4).map(amenity => (
                            <Badge key={amenity} variant="secondary" className="text-xs font-medium">
                              {amenity === 'Swimming Pool' && <Waves className="w-3 h-3 mr-1" />}
                              {amenity === 'WiFi' && <Wifi className="w-3 h-3 mr-1" />}
                              {amenity === 'Parking' && <Car className="w-3 h-3 mr-1" />}
                              {amenity === 'Kitchen' && <Utensils className="w-3 h-3 mr-1" />}
                              {amenity}
                            </Badge>
                          ))}
                          {Array.isArray(villa.amenities) && villa.amenities.length > 4 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                              +{villa.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>

                        {/* Enhanced Pricing Summary */}
                        <div className="border-t pt-4 mt-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Daily Pricing
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white rounded p-2 flex justify-between items-center">
                              <span className="text-gray-600">Mon-Thu:</span>
                              <span className="font-bold" style={{ color: '#2673a5' }}>
                                ₹{(villa.adminWeekdayPrice || villa.weekdayPrice || villa.pricePerNight).toLocaleString()}
                                {villa.adminWeekdayPrice && <span className="text-green-500 ml-1">★</span>}
                              </span>
                            </div>
                            <div className="bg-white rounded p-2 flex justify-between items-center">
                              <span className="text-gray-600">Friday:</span>
                              <span className="font-bold" style={{ color: '#2673a5' }}>
                                ₹{(villa.adminSaturdayPrice || villa.fridayPrice || villa.pricePerNight).toLocaleString()}
                                {villa.adminSaturdayPrice && <span className="text-green-500 ml-1">★</span>}
                              </span>
                            </div>
                            <div className="bg-white rounded p-2 flex justify-between items-center">
                              <span className="text-gray-600">Saturday:</span>
                              <span className="font-bold" style={{ color: '#2673a5' }}>
                                ₹{(villa.adminSaturdayPrice || villa.saturdayPrice || villa.pricePerNight).toLocaleString()}
                                {villa.adminSaturdayPrice && <span className="text-green-500 ml-1">★</span>}
                              </span>
                            </div>
                            <div className="bg-white rounded p-2 flex justify-between items-center">
                              <span className="text-gray-600">Sunday:</span>
                              <span className="font-bold" style={{ color: '#2673a5' }}>
                                ₹{(villa.adminSundayPrice || villa.sundayPrice || villa.pricePerNight).toLocaleString()}
                                {villa.adminSundayPrice && <span className="text-green-500 ml-1">★</span>}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-green-600" />
                            <span className="text-green-600 font-medium">★ Special rate</span> applied by Namaha Stays
                          </div>
                        </div>

                        {/* Action Buttons for Individual Villa */}
                        <div className="flex gap-2 mt-4">
                          {villa.googleDriveLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(villa.googleDriveLink, '_blank')}
                              className="flex-1 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Photos
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              const message = `Hi! I'm interested in ${villa.name} in ${villa.location} for ${format(new Date(checkIn!), 'MMM dd, yyyy')} to ${format(new Date(checkOut!), 'MMM dd, yyyy')} for ${guests} guest(s). Price: ₹${getPriceForDate(villa, checkIn!).toLocaleString()}/night. Can you share availability and booking details?`
                              const whatsappUrl = `https://wa.me/919270355968?text=${encodeURIComponent(message)}`
                              window.open(whatsappUrl, '_blank')
                            }}
                            className="flex-1 text-xs text-white"
                            style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Inquire Now
                          </Button>
                        </div>

                        <div className="mt-3 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Shield className="w-3 h-3" />
                          By Namaha Stays • Verified Property
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Why Book With Us?</h3>
                    <p className="text-sm text-gray-600">Join 1000+ happy guests who found their perfect villa</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-6 h-6" style={{ color: '#2673a5' }} />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">Verified</div>
                      <div className="text-xs text-gray-600">100% Authentic</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="w-6 h-6" style={{ color: '#2673a5' }} />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">Best Price</div>
                      <div className="text-xs text-gray-600">Guaranteed</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6" style={{ color: '#2673a5' }} />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">24/7 Support</div>
                      <div className="text-xs text-gray-600">Always Available</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-amber-500 fill-current" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">4.9★ Rating</div>
                      <div className="text-xs text-gray-600">500+ Reviews</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Enhanced Floating Action Bar */}
        {selectedVillas.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}>
                    {selectedVillas.length}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {selectedVillas.length} {selectedVillas.length === 1 ? 'Villa' : 'Villas'} Selected
                    </div>
                    <div className="text-xs text-gray-600">
                      Estimated total: ₹{filteredVillas
                        .filter(v => selectedVillas.includes(v.id))
                        .reduce((sum, v) => sum + (checkIn ? getPriceForDate(v, checkIn) : v.pricePerNight), 0)
                        .toLocaleString()}/night
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedVillas([])}
                    size="sm"
                    className="flex-1 md:flex-none"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button 
                    onClick={handleBookNow} 
                    size="sm"
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Button 
                    onClick={generateWhatsAppMessage} 
                    size="sm"
                    className="flex-1 md:flex-none text-white"
                    style={{ background: 'linear-gradient(to right, #2673a5, #1e5a8a)' }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading search results...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
