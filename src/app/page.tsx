'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { POPULAR_LOCATIONS } from '@/lib/validations'

export default function HomePage() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const handleSearch = () => {
    if (!searchData.location || !searchData.checkIn || !searchData.checkOut) {
      alert('Please fill in all required fields')
      return
    }

    const searchParams = new URLSearchParams({
      location: searchData.location,
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: searchData.guests.toString()
    })

    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">VillaRent</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Villa Owner Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Register Your Villa</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-indigo-600"> Villa Getaway</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover premium villas in beautiful locations. Easy booking, transparent pricing, 
            and unforgettable experiences await you.
          </p>
        </div>

        {/* Enhanced Search Card */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardHeader>
            <CardTitle>Search Villas</CardTitle>
            <CardDescription>Find the perfect villa for your next vacation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </Label>
                <Select onValueChange={(value) => setSearchData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in *
                </Label>
                <Input
                  id="checkIn"
                  type="date" 
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkIn: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out *
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkOut: e.target.value }))}
                  min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Guests *
                </Label>
                <Select onValueChange={(value) => setSearchData(prev => ({ ...prev, guests: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="1 Guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,15,20].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSearch} className="w-full md:w-auto px-8 py-3 text-lg">
                View Villas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Locations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {POPULAR_LOCATIONS.slice(0, 5).map(location => (
              <button
                key={location}
                onClick={() => {
                  setSearchData(prev => ({ ...prev, location }))
                }}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-sm font-medium text-gray-900">{location}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🏡 Premium Villas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Handpicked luxury villas with modern amenities and stunning views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🗓️ Easy Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Villa owners can easily manage bookings with our intuitive calendar system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                ⚡ No Registration Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Browse and book villas without creating an account. Your privacy matters to us.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
