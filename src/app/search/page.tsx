'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Users, Bed, Bath, MapPin, Phone, MessageCircle, DollarSign } from 'lucide-react'
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
  const [villas, setVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVillas, setSelectedVillas] = useState<string[]>([])
  const [filters, setFilters] = useState({
    bhk: [] as string[], // 3BHK, 4BHK filter
    priceRange: 'all' as string,
    amenities: [] as string[]
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

  const filteredVillas = villas.filter(villa => {
    // BHK filter
    if (filters.bhk.length > 0) {
      const villasBHK = `${villa.bedrooms}BHK`
      if (!filters.bhk.includes(villasBHK)) return false
    }
    return true
  })

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Search
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">VillaRent</h1>
            </div>
            <div className="text-sm text-gray-600">
              {filteredVillas.length} villa(s) found in {location}
            </div>
          </div>
        </div>
      </header>

      {/* Search Summary */}
      <div className="bg-indigo-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Badge variant="secondary">📍 {location}</Badge>
            <Badge variant="secondary">📅 {format(new Date(checkIn!), 'MMM dd')} - {format(new Date(checkOut!), 'MMM dd')}</Badge>
            <Badge variant="secondary">👥 {guests} guest(s)</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="flex flex-wrap gap-6">
            {/* BHK Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Room Type</h4>
              <div className="flex gap-2">
                {['3BHK', '4BHK'].map(bhk => (
                  <label key={bhk} className="flex items-center">
                    <Checkbox 
                      checked={filters.bhk.includes(bhk)}
                      onCheckedChange={() => toggleBHKFilter(bhk)}
                      className="mr-2"
                    />
                    <span className="text-sm">{bhk}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        {filteredVillas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏡</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No villas found</h3>
            <p className="text-gray-500 mb-6">
              No villas match your filters. Try adjusting your search criteria.
            </p>
            <Button onClick={() => setFilters({ bhk: [], priceRange: 'all', amenities: [] })}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Villa Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredVillas.map((villa) => (
                <Card key={villa.id} className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedVillas.includes(villa.id) ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                }`}>
                  {/* Villa Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {villa.images && villa.images.length > 0 ? (
                      <img 
                        src={getVillaImageUrlWithFallback(villa.images)}
                        alt={villa.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = '/placeholder-villa.svg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    {/* Price badge overlay with dynamic pricing */}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                      ₹{checkIn ? getPriceForDate(villa, checkIn).toLocaleString() : villa.pricePerNight.toLocaleString()}/night
                      {checkIn && (
                        <div className="text-xs opacity-75 flex items-center gap-1">
                          {getDayName(checkIn)}
                          {isAdminPricing(villa, checkIn) && (
                            <span className="bg-green-500 text-white px-1 rounded text-xs">★</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{villa.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {villa.location}
                        </CardDescription>
                      </div>
                      <button
                        onClick={() => toggleVillaSelection(villa.id)}
                        className={`ml-2 w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedVillas.includes(villa.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedVillas.includes(villa.id) && '✓'}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {villa.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {villa.maxGuests}
                      </div>
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {villa.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {villa.bathrooms}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {Array.isArray(villa.amenities) && villa.amenities.slice(0, 3).map(amenity => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {Array.isArray(villa.amenities) && villa.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{villa.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Pricing Summary */}
                    <div className="border-t pt-3 mt-3">
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        Pricing by day:
                        <span className="text-green-600">★ = Special rate</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span>Mon-Thu:</span>
                          <span className="font-medium flex items-center gap-1">
                            ₹{(villa.adminWeekdayPrice || villa.weekdayPrice || villa.pricePerNight).toLocaleString()}
                            {villa.adminWeekdayPrice && <span className="text-green-500">★</span>}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Friday:</span>
                          <span className="font-medium flex items-center gap-1">
                            ₹{(villa.adminSaturdayPrice || villa.fridayPrice || villa.pricePerNight).toLocaleString()}
                            {villa.adminSaturdayPrice && <span className="text-green-500">★</span>}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Saturday:</span>
                          <span className="font-medium flex items-center gap-1">
                            ₹{(villa.adminSaturdayPrice || villa.saturdayPrice || villa.pricePerNight).toLocaleString()}
                            {villa.adminSaturdayPrice && <span className="text-green-500">★</span>}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sunday:</span>
                          <span className="font-medium flex items-center gap-1">
                            ₹{(villa.adminSundayPrice || villa.sundayPrice || villa.pricePerNight).toLocaleString()}
                            {villa.adminSundayPrice && <span className="text-green-500">★</span>}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      By Namaha Stays
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            {selectedVillas.length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedVillas.length} villa(s) selected
                  </span>
                  <Button onClick={handleBookNow} className="flex items-center bg-green-600 hover:bg-green-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Button onClick={generateWhatsAppMessage} className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Book via WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedVillas([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </>
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
